import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Search, BarChart3, Eye } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Position, ThesisMonitor, MarketEvent } from "@shared/schema";

export default function MonitoringHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const { data: positions = [] } = useQuery<Position[]>({
    queryKey: ['/api/positions'],
  });

  const { data: thesisMonitors = [] } = useQuery<ThesisMonitor[]>({
    queryKey: ['/api/thesis-monitors'],
  });

  const { data: marketEvents = [] } = useQuery<MarketEvent[]>({
    queryKey: ['/api/market-events'],
  });

  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.ticker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         position.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHealth = healthFilter === "all" || position.thesisHealth === healthFilter;
    return matchesSearch && matchesHealth;
  });

  const selectedPositionData = selectedPosition
    ? positions.find(p => p.id === selectedPosition)
    : null;

  const positionMonitors = selectedPositionData
    ? thesisMonitors.filter(tm => tm.positionId === selectedPosition)
    : [];

  const positionEvents = selectedPositionData
    ? marketEvents.filter(me => me.ticker === selectedPositionData.ticker)
    : [];

  const getHealthColor = (health: string) => {
    switch (health) {
      case "HEALTHY": return "text-green-500";
      case "CHALLENGED": return "text-yellow-500";
      case "AT_RISK": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "HEALTHY": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CHALLENGED": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "AT_RISK": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const healthStats = {
    total: positions.length,
    healthy: positions.filter(p => p.thesisHealth === "HEALTHY").length,
    challenged: positions.filter(p => p.thesisHealth === "CHALLENGED").length,
    atRisk: positions.filter(p => p.thesisHealth === "AT_RISK").length,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
          Portfolio Monitoring Hub
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track thesis health and portfolio performance in real-time
        </p>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Positions</p>
                <p className="text-2xl font-semibold text-foreground">{healthStats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Healthy</p>
                <p className="text-2xl font-semibold text-green-500">{healthStats.healthy}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Challenged</p>
                <p className="text-2xl font-semibold text-yellow-500">{healthStats.challenged}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-semibold text-destructive">{healthStats.atRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search positions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-positions"
          />
        </div>
        <Select value={healthFilter} onValueChange={setHealthFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-health-filter">
            <SelectValue placeholder="Filter by health" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            <SelectItem value="HEALTHY">Healthy</SelectItem>
            <SelectItem value="CHALLENGED">Challenged</SelectItem>
            <SelectItem value="AT_RISK">At Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Positions Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredPositions.map((position) => {
          const gainLoss = parseFloat(position.gainLoss);
          const gainLossPercent = parseFloat(position.gainLossPercent);
          const positionMonitorCount = thesisMonitors.filter(tm => tm.positionId === position.id).length;
          const criticalAlerts = thesisMonitors.filter(
            tm => tm.positionId === position.id && tm.healthStatus === "ALERT"
          ).length;

          return (
            <Card 
              key={position.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedPosition(position.id)}
              data-testid={`card-position-${position.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {position.ticker}
                      {getHealthIcon(position.thesisHealth)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{position.companyName}</p>
                  </div>
                  <Badge variant={position.thesisHealth === "HEALTHY" ? "default" : 
                                 position.thesisHealth === "CHALLENGED" ? "secondary" : "destructive"}>
                    {position.thesisHealth}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Market Value</p>
                    <p className="text-sm font-semibold text-foreground">
                      ${(parseFloat(position.marketValue) / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">P&L</p>
                    <p className={`text-sm font-semibold ${gainLoss >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                      {gainLoss >= 0 ? '+' : ''}{(gainLoss / 1000).toFixed(1)}K ({gainLossPercent > 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{positionMonitorCount} monitors</span>
                  </div>
                  {criticalAlerts > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {criticalAlerts} alerts
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Position Detail Modal/Sidebar (placeholder for detail view) */}
      {selectedPositionData && (
        <Card className="mt-6">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                {selectedPositionData.ticker} - {selectedPositionData.companyName}
                {getHealthIcon(selectedPositionData.thesisHealth)}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPosition(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="monitors">
              <TabsList>
                <TabsTrigger value="monitors">Thesis Monitors ({positionMonitors.length})</TabsTrigger>
                <TabsTrigger value="events">Market Events ({positionEvents.length})</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="monitors" className="space-y-4 mt-6">
                {positionMonitors.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No active monitors for this position</p>
                ) : (
                  positionMonitors.map((monitor) => (
                    <Card key={monitor.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{monitor.ticker} - Thesis Monitor</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Last checked: {format(new Date(monitor.lastCheck), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <Badge variant={monitor.healthStatus === "HEALTHY" ? "default" : 
                                       monitor.healthStatus === "WARNING" ? "secondary" : "destructive"}>
                            {monitor.healthStatus}
                          </Badge>
                        </div>
                        {monitor.recommendations && (
                          <div className="text-sm text-foreground bg-muted/50 p-3 rounded mt-3">
                            {monitor.recommendations}
                          </div>
                        )}
                        {monitor.alerts && (
                          <div className="mt-3">
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">
                              {JSON.stringify(monitor.alerts, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="events" className="space-y-4 mt-6">
                {positionEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No recent market events</p>
                ) : (
                  positionEvents.map((event) => (
                    <Card key={event.id} className="border-l-4" style={{
                      borderLeftColor: event.severity === "CRITICAL" ? "rgb(239 68 68)" :
                                      event.severity === "HIGH" ? "rgb(234 179 8)" : "rgb(59 130 246)"
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-foreground">{event.eventType}</p>
                          <Badge variant={event.severity === "CRITICAL" ? "destructive" : "secondary"}>
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        {event.impact && (
                          <p className="text-sm text-foreground mt-2 bg-muted/50 p-2 rounded">
                            Impact: {event.impact}
                          </p>
                        )}
                        {event.portfolioImpact && (
                          <p className="text-sm text-foreground mt-2 bg-muted/50 p-2 rounded">
                            Portfolio Impact: {event.portfolioImpact}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="performance" className="mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Position Details</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Current Price</dt>
                        <dd className="font-medium text-foreground">${parseFloat(selectedPositionData.currentPrice).toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Shares</dt>
                        <dd className="font-medium text-foreground">{selectedPositionData.shares.toLocaleString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Market Value</dt>
                        <dd className="font-medium text-foreground">${(parseFloat(selectedPositionData.marketValue) / 1000).toFixed(1)}K</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Weight</dt>
                        <dd className="font-medium text-foreground">{parseFloat(selectedPositionData.portfolioWeight).toFixed(2)}%</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Performance</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Avg Cost</dt>
                        <dd className="font-medium text-foreground">${parseFloat(selectedPositionData.avgCost).toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Total P&L</dt>
                        <dd className={`font-medium ${parseFloat(selectedPositionData.gainLoss) >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                          ${(parseFloat(selectedPositionData.gainLoss) / 1000).toFixed(1)}K
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">% Return</dt>
                        <dd className={`font-medium ${parseFloat(selectedPositionData.gainLossPercent) >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                          {parseFloat(selectedPositionData.gainLossPercent) > 0 ? '+' : ''}{parseFloat(selectedPositionData.gainLossPercent).toFixed(2)}%
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
