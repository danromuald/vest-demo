import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentPanel } from "@/components/agent-panel";
import { ThesisHealthBadge } from "@/components/thesis-health-badge";
import { Bell, AlertTriangle, TrendingDown, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Monitoring() {
  const [thesisReport, setThesisReport] = useState<any>(null);

  const thesisMonitorMutation = useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiRequest('POST', '/api/agents/thesis-monitor', { ticker });
      return response;
    },
    onSuccess: (data) => {
      setThesisReport(data);
    },
  });

  const mockAlerts = [
    {
      id: '1',
      ticker: 'MSFT',
      severity: 'MEDIUM',
      type: 'PRICE_DROP',
      description: 'Stock down 2.1% on Microsoft CFO comments about AI capex timing',
      impact: 'Customer concentration risk in NVDA position',
      time: '10 minutes ago',
    },
    {
      id: '2',
      ticker: 'AAPL',
      severity: 'LOW',
      type: 'EARNINGS',
      description: 'Q4 earnings beat expectations, services revenue +15% YoY',
      impact: 'Positive for technology sector exposure',
      time: '2 hours ago',
    },
    {
      id: '3',
      ticker: 'NVDA',
      severity: 'HIGH',
      type: 'NEWS',
      description: 'New export restrictions on advanced AI chips to certain markets',
      impact: 'Potential 8-12% revenue headwind, monitoring regulatory developments',
      time: '4 hours ago',
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
            Thesis Monitoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time alerts and automated thesis health tracking
          </p>
        </div>
        <Button variant="outline" data-testid="button-refresh-monitoring">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-chart-3/20 bg-chart-3/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold font-mono text-chart-3">1</p>
          </CardContent>
        </Card>
        <Card className="border-chart-4/20 bg-chart-4/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold font-mono text-chart-4">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Positions Monitored
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold font-mono text-foreground">1</p>
          </CardContent>
        </Card>
      </div>

      {/* Thesis Monitor Agent */}
      <AgentPanel
        agentName="Thesis Monitor"
        description="Analyzes position health, compares actual vs expected performance, identifies thesis drift"
        isGenerating={thesisMonitorMutation.isPending}
        response={thesisReport}
        onInvoke={() => thesisMonitorMutation.mutate('MSFT')}
      />

      {/* Thesis Health Report */}
      {thesisReport && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  Thesis Health Report: {thesisReport.ticker}
                </CardTitle>
                <CardDescription>Comprehensive position health assessment</CardDescription>
              </div>
              <ThesisHealthBadge status={thesisReport.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Summary
              </h4>
              <p className="text-sm text-foreground">{thesisReport.summary}</p>
            </div>

            {thesisReport.keyConcerns && thesisReport.keyConcerns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Key Concerns
                </h4>
                <ul className="space-y-1.5">
                  {thesisReport.keyConcerns.map((concern: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <AlertTriangle className="h-4 w-4 text-chart-4 mt-0.5" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Thesis Drift Score</p>
                <p className="text-2xl font-mono font-semibold text-foreground">
                  {thesisReport.thesisDrift}%
                </p>
              </div>
              <div className="rounded-md bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Recommendation</p>
                <Badge variant="outline" className="mt-1">
                  {thesisReport.recommendation}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Events & Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-xl font-semibold">Market Events & Alerts</CardTitle>
            <CardDescription>Real-time monitoring of material developments</CardDescription>
          </div>
          <Bell className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-4 rounded-md border border-border p-4 hover-elevate"
                data-testid={`alert-${alert.ticker}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-3/10">
                  {alert.severity === 'HIGH' ? (
                    <AlertTriangle className="h-5 w-5 text-chart-3" />
                  ) : alert.severity === 'MEDIUM' ? (
                    <TrendingDown className="h-5 w-5 text-chart-4" />
                  ) : (
                    <Bell className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-foreground">{alert.ticker}</span>
                      <Badge
                        variant="outline"
                        className={
                          alert.severity === 'HIGH'
                            ? 'bg-chart-3/10 text-chart-3 border-chart-3/20'
                            : alert.severity === 'MEDIUM'
                            ? 'bg-chart-4/10 text-chart-4 border-chart-4/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }
                      >
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline">{alert.type}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{alert.description}</p>
                  <p className="text-sm text-muted-foreground">{alert.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
