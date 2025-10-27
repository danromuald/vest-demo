import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThesisHealthBadge } from "@/components/thesis-health-badge";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Position } from "@shared/schema";

export default function Portfolio() {
  const [, setLocation] = useLocation();
  
  const { data: positions = [], isLoading, isError } = useQuery<Position[]>({
    queryKey: ['/api/positions'],
  });

  // Fetch workflows to show workflow stage on positions
  const { data: workflows = [] } = useQuery<any[]>({
    queryKey: ['/api/workflows'],
  });

  // Helper to find workflow for a position by ticker
  const getWorkflowForPosition = (position: Position) => {
    return workflows.find(w => w.ticker === position.ticker);
  };

  // Helper to get workflow stage label
  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      DISCOVERY: "Discovery",
      ANALYSIS: "Analysis",
      IC_MEETING: "IC Meeting",
      EXECUTION: "Execution",
      MONITORING: "Monitoring"
    };
    return labels[stage] || stage;
  };

  // Helper to get workflow stage color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "DISCOVERY": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "ANALYSIS": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "IC_MEETING": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "EXECUTION": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "MONITORING": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      default: return "bg-muted/50 text-muted-foreground border-muted";
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-3xl font-semibold text-foreground">Portfolio Monitoring</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingDown className="h-12 w-12 text-chart-3 mb-3" />
            <p className="text-lg font-medium text-foreground">Failed to load portfolio data</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatPercent = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const totalValue = positions.reduce((sum, p) => sum + parseFloat(p.marketValue), 0);
  const totalGainLoss = positions.reduce((sum, p) => sum + parseFloat(p.gainLoss), 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
          Portfolio Monitoring
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time position tracking and thesis health monitoring
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold font-mono text-foreground">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-semibold font-mono ${totalGainLoss >= 0 ? 'text-chart-2' : 'text-chart-3'}`}>
              {formatCurrency(totalGainLoss)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Active Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold font-mono text-foreground">
              {positions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Holdings</CardTitle>
          <CardDescription>Current portfolio positions with thesis health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading positions...</div>
            </div>
          ) : positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">No positions yet</p>
              <p className="text-xs text-muted-foreground">Start building your portfolio</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-positions">
                <thead>
                  <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="pb-3 text-left">Ticker</th>
                    <th className="pb-3 text-left">Company</th>
                    <th className="pb-3 text-right">Shares</th>
                    <th className="pb-3 text-right">Avg Cost</th>
                    <th className="pb-3 text-right">Current</th>
                    <th className="pb-3 text-right">Market Value</th>
                    <th className="pb-3 text-right">Weight</th>
                    <th className="pb-3 text-right">P&L</th>
                    <th className="pb-3 text-center">Health</th>
                    <th className="pb-3 text-center">Workflow Stage</th>
                    <th className="pb-3 text-left">Analyst</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => {
                    const gainLoss = parseFloat(position.gainLoss);
                    const gainLossPercent = parseFloat(position.gainLossPercent);
                    const workflow = getWorkflowForPosition(position);
                    const hasWorkflow = !!workflow;
                    
                    return (
                      <tr
                        key={position.id}
                        className="border-b border-border hover-elevate cursor-pointer"
                        data-testid={`row-position-${position.ticker}`}
                        onClick={() => {
                          // Navigate to workflow workspace if workflow exists
                          if (hasWorkflow) {
                            setLocation(`/workflows/${workflow.id}`);
                          }
                        }}
                      >
                        <td className="py-3">
                          <span className="font-mono font-medium text-foreground">{position.ticker}</span>
                        </td>
                        <td className="py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{position.companyName}</p>
                            <p className="text-xs text-muted-foreground">{position.sector}</p>
                          </div>
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-foreground">
                          {position.shares.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-foreground">
                          ${parseFloat(position.avgCost).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-foreground">
                          ${parseFloat(position.currentPrice).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-foreground">
                          {formatCurrency(position.marketValue)}
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-foreground">
                          {position.portfolioWeight}%
                        </td>
                        <td className="py-3 text-right">
                          <div>
                            <div className="flex items-center justify-end gap-1">
                              {gainLoss >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-chart-2" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-chart-3" />
                              )}
                              <span className={`font-mono text-sm font-medium ${gainLoss >= 0 ? 'text-chart-2' : 'text-chart-3'}`}>
                                {formatCurrency(gainLoss)}
                              </span>
                            </div>
                            <p className={`text-xs font-mono ${gainLoss >= 0 ? 'text-chart-2' : 'text-chart-3'}`}>
                              {formatPercent(gainLossPercent)}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex justify-center">
                            <ThesisHealthBadge status={position.thesisHealth as 'HEALTHY' | 'WARNING' | 'ALERT'} />
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          {hasWorkflow ? (
                            <div className="flex justify-center">
                              <Badge 
                                variant="outline" 
                                className={getStageColor(workflow.currentStage)}
                                data-testid={`badge-workflow-stage-${position.ticker}`}
                              >
                                {getStageLabel(workflow.currentStage)}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <p className="text-sm text-foreground">{position.analyst}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sector Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Sector Allocation</CardTitle>
          <CardDescription>Portfolio exposure by sector</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(
              positions.reduce((acc, p) => {
                const weight = parseFloat(p.portfolioWeight);
                acc[p.sector] = (acc[p.sector] || 0) + weight;
                return acc;
              }, {} as Record<string, number>)
            )
              .sort(([, a], [, b]) => b - a)
              .map(([sector, weight]) => (
                <div key={sector} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-foreground">{sector}</div>
                  <div className="flex-1">
                    <div className="h-6 w-full rounded-md bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(weight / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right font-mono text-sm font-medium text-foreground">
                    {weight.toFixed(1)}%
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
