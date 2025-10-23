import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, TrendingDown, TrendingUp, Newspaper, Users, Activity, Clock, Plus, Loader2, AlertTriangle } from "lucide-react";
import type { AgentResponse } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PriceMovement {
  current: number;
  change: number;
  changePercent: number;
  trigger: string;
}

interface MarketEventReport {
  ticker: string;
  priceMovement: PriceMovement;
  newsEvents: string[];
  analystChanges: string[];
  technicalAlerts: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

function validateMarketEventReport(response: unknown): MarketEventReport | null {
  if (!response || typeof response !== 'object') return null;
  
  const data = response as Partial<MarketEventReport>;
  
  const toNumber = (value: unknown): number | null => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/%/g, '').replace(/,/g, '').replace(/\$/g, '').trim();
      const num = Number(cleaned);
      return isNaN(num) ? null : num;
    }
    return null;
  };
  
  if (
    typeof data.ticker !== 'string' ||
    !data.priceMovement || typeof data.priceMovement !== 'object' ||
    !Array.isArray(data.newsEvents) ||
    !Array.isArray(data.analystChanges) ||
    !Array.isArray(data.technicalAlerts) ||
    (data.severity !== 'LOW' && data.severity !== 'MEDIUM' && data.severity !== 'HIGH' && data.severity !== 'CRITICAL') ||
    typeof data.recommendation !== 'string'
  ) {
    return null;
  }

  const price = data.priceMovement as Partial<PriceMovement>;

  return {
    ticker: data.ticker,
    priceMovement: {
      current: toNumber(price.current) ?? 0,
      change: toNumber(price.change) ?? 0,
      changePercent: toNumber(price.changePercent) ?? 0,
      trigger: price.trigger || 'Unknown',
    },
    newsEvents: data.newsEvents,
    analystChanges: data.analystChanges,
    technicalAlerts: data.technicalAlerts,
    severity: data.severity,
    recommendation: data.recommendation,
  };
}

export default function MarketEventsPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const { toast } = useToast();

  const { data: agentResponses = [] } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  const marketEvents = agentResponses
    .filter(response => response.agentType === "MARKET_MONITOR")
    .filter(response => validateMarketEventReport(response.response) !== null);

  const selectedEvent = selectedEventId
    ? marketEvents.find(e => e.id === selectedEventId)
    : null;

  const eventData = selectedEvent ? validateMarketEventReport(selectedEvent.response) : null;

  const formatDate = (dateValue: string | Date | null | undefined, formatStr: string): string => {
    if (!dateValue) return 'N/A';
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, formatStr);
    } catch {
      return 'N/A';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-chart-3 border-chart-3 text-white";
      case "HIGH": return "bg-destructive border-destructive text-white";
      case "MEDIUM": return "bg-chart-4 border-chart-4 text-white";
      case "LOW": return "bg-chart-1 border-chart-1 text-white";
      default: return "bg-muted border-muted text-foreground";
    }
  };

  const eventMutation = useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiRequest('POST', '/api/agents/market-monitor', { ticker });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-responses'] });
      setIsGenerateDialogOpen(false);
      setTicker("");
      toast({
        title: "Success",
        description: "Market event report generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate market event report",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      eventMutation.mutate(ticker.trim().toUpperCase());
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Events List */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-chart-1" />
                Market Events
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {marketEvents.length} {marketEvents.length === 1 ? 'event' : 'events'}
              </p>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(true)}
              data-testid="button-generate-event"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-3">
          <ScrollArea className="h-full">
            {marketEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No market events available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate a new market event report
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-3">
                {marketEvents.map((event) => {
                  const data = validateMarketEventReport(event.response);
                  if (!data) return null;
                  
                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className={`w-full text-left rounded-md p-3 border transition-colors ${
                        selectedEventId === event.id
                          ? "bg-primary/10 border-primary"
                          : "hover-elevate"
                      }`}
                      data-testid={`button-event-${event.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">{data.ticker}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {data.priceMovement.changePercent >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-chart-2" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-chart-3" />
                            )}
                            {data.priceMovement.changePercent.toFixed(2)}%
                          </div>
                        </div>
                        <Badge
                          variant="default"
                          className={`text-xs shrink-0 ${getSeverityColor(data.severity)}`}
                        >
                          {data.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(event.generatedAt, 'MMM d, yyyy')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Event Details */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {!selectedEvent || !eventData ? (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bell className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Select a market event</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose an event from the sidebar to view details
              </p>
            </div>
          </Card>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-6 pr-4">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl font-bold">{eventData.ticker}</CardTitle>
                        <Badge
                          variant="default"
                          className={`text-sm ${getSeverityColor(eventData.severity)}`}
                        >
                          {eventData.severity}
                        </Badge>
                      </div>
                      <p className="text-lg text-foreground">Market Event Report</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="h-4 w-4" />
                        <span>Generated {formatDate(selectedEvent.generatedAt, 'MMMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Price Movement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-chart-1" />
                    Price Movement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-2xl font-bold">${eventData.priceMovement.current.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Change</p>
                      <p className={`text-2xl font-bold flex items-center gap-2 ${
                        eventData.priceMovement.changePercent >= 0 ? 'text-chart-2' : 'text-chart-3'
                      }`}>
                        {eventData.priceMovement.changePercent >= 0 ? (
                          <TrendingUp className="h-6 w-6" />
                        ) : (
                          <TrendingDown className="h-6 w-6" />
                        )}
                        {eventData.priceMovement.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Trigger Event</p>
                    <p className="text-foreground">{eventData.priceMovement.trigger}</p>
                  </div>
                </CardContent>
              </Card>

              {/* News Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-chart-1" />
                    News Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventData.newsEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No news events reported</p>
                  ) : (
                    <ul className="space-y-3">
                      {eventData.newsEvents.map((news, idx) => (
                        <li key={idx} className="flex gap-3">
                          <div className="h-2 w-2 rounded-full bg-chart-1 mt-2 shrink-0" />
                          <span className="text-foreground">{news}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Analyst Changes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-chart-1" />
                    Analyst Changes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventData.analystChanges.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No analyst changes reported</p>
                  ) : (
                    <ul className="space-y-3">
                      {eventData.analystChanges.map((change, idx) => (
                        <li key={idx} className="flex gap-3">
                          <div className="h-2 w-2 rounded-full bg-chart-4 mt-2 shrink-0" />
                          <span className="text-foreground">{change}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Technical Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-chart-1" />
                    Technical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventData.technicalAlerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No technical alerts reported</p>
                  ) : (
                    <ul className="space-y-3">
                      {eventData.technicalAlerts.map((alert, idx) => (
                        <li key={idx} className="flex gap-3">
                          <div className="h-2 w-2 rounded-full bg-chart-3 mt-2 shrink-0" />
                          <span className="text-foreground">{alert}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{eventData.recommendation}</p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Generate Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent data-testid="dialog-generate-event">
          <form onSubmit={handleGenerate}>
            <DialogHeader>
              <DialogTitle>Generate Market Event Report</DialogTitle>
              <DialogDescription>
                Enter a ticker symbol to monitor market events and price movements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker Symbol</Label>
                <Input
                  id="ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  required
                  data-testid="input-ticker"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGenerateDialogOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={eventMutation.isPending}
                data-testid="button-submit"
              >
                {eventMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
