import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BarChart3, TrendingUp, TrendingDown, Plus, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { AgentResponse } from "@shared/schema";

interface ScenarioAnalysis {
  proposedWeight: number;
  currentPortfolio: {
    trackingError: number;
    concentration: number;
    factorExposures: Record<string, number>;
  };
  projectedPortfolio: {
    trackingError: number;
    concentration: number;
    factorExposures: Record<string, number>;
  };
  riskMetrics: {
    withinLimits: boolean;
    warnings: string[];
  };
}

export default function ScenarioSimulator() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [proposedWeight, setProposedWeight] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<AgentResponse | null>(null);

  const { data: agentResponses = [], isLoading, isError, error, refetch } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  const scenarioResponses = agentResponses.filter(r => r.agentType === 'SCENARIO_SIMULATOR');

  const generateMutation = useMutation({
    mutationFn: async () => {
      const weight = parseFloat(proposedWeight);
      if (isNaN(weight) || weight <= 0 || weight > 100) {
        throw new Error("Weight must be between 0 and 100");
      }
      const response = await apiRequest('POST', '/api/agents/scenario-simulator', {
        ticker: ticker.toUpperCase(),
        proposedWeight: weight,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-responses'] });
      toast({
        title: "Scenario Generated",
        description: `Portfolio impact analysis for ${ticker.toUpperCase()} complete`,
      });
      setDialogOpen(false);
      setTicker("");
      setProposedWeight("");
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!ticker || !proposedWeight) {
      toast({
        title: "Missing Information",
        description: "Please provide both ticker and proposed weight",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  const toNumber = (val: any): number => {
    return typeof val === 'number' ? val : parseFloat(val) || 0;
  };

  const formatDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return 'N/A';
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return format(date, 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading scenario analyses...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <p className="text-lg font-medium text-foreground">Failed to load scenarios</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
              data-testid="button-retry"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Scenario Simulator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Portfolio impact analysis and risk assessment
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-generate-scenario">
              <Plus className="h-4 w-4 mr-2" />
              Generate Scenario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Scenario Analysis</DialogTitle>
              <DialogDescription>
                Simulate the portfolio impact of adding a new position
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker Symbol</Label>
                <Input
                  id="ticker"
                  placeholder="e.g., AAPL"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  data-testid="input-ticker"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Proposed Weight (%)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g., 5.0"
                  min="0"
                  max="100"
                  step="0.1"
                  value={proposedWeight}
                  onChange={(e) => setProposedWeight(e.target.value)}
                  data-testid="input-weight"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                data-testid="button-submit"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Scenario List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Scenario Analyses</CardTitle>
            <CardDescription>
              {scenarioResponses.length} simulation{scenarioResponses.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {scenarioResponses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No scenario analyses yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate a scenario to simulate portfolio impact
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {scenarioResponses.map((scenario) => {
                  const analysis = scenario.response as ScenarioAnalysis;
                  const withinLimits = analysis?.riskMetrics?.withinLimits ?? true;
                  
                  return (
                    <div
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario)}
                      className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                        selectedScenario?.id === scenario.id
                          ? 'border-primary bg-primary/5'
                          : 'hover-elevate'
                      }`}
                      data-testid={`card-scenario-${scenario.ticker}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-foreground">
                            {scenario.ticker}
                          </p>
                          {withinLimits ? (
                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-chart-3" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {toNumber(analysis?.proposedWeight).toFixed(1)}% weight
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(scenario.generatedAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scenario Details */}
        {selectedScenario ? (
          <div className="lg:col-span-2 space-y-4 overflow-y-auto">
            {(() => {
              const analysis = selectedScenario.response as ScenarioAnalysis;
              const current = analysis?.currentPortfolio;
              const projected = analysis?.projectedPortfolio;
              const riskMetrics = analysis?.riskMetrics;

              return (
                <>
                  {/* Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            {selectedScenario.ticker} Portfolio Impact
                          </CardTitle>
                          <CardDescription>
                            Proposed Weight: {toNumber(analysis?.proposedWeight).toFixed(1)}%
                          </CardDescription>
                        </div>
                        {riskMetrics && (
                          <Badge
                            variant={riskMetrics.withinLimits ? 'default' : 'destructive'}
                            className={
                              riskMetrics.withinLimits
                                ? 'bg-chart-2/10 text-chart-2 border-chart-2/20'
                                : ''
                            }
                          >
                            {riskMetrics.withinLimits ? 'Within Limits' : 'Risk Warning'}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Portfolio Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Portfolio */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Current Portfolio
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tracking Error</p>
                          <p className="text-lg font-mono font-semibold text-foreground">
                            {toNumber(current?.trackingError).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Concentration</p>
                          <p className="text-lg font-mono font-semibold text-foreground">
                            {toNumber(current?.concentration).toFixed(1)}%
                          </p>
                        </div>
                        {current?.factorExposures && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Factor Exposures</p>
                            <div className="space-y-2">
                              {Object.entries(current.factorExposures).map(([factor, value]) => (
                                <div key={factor} className="flex items-center justify-between">
                                  <span className="text-xs text-foreground capitalize">{factor}</span>
                                  <span className="text-xs font-mono text-foreground">
                                    {toNumber(value).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Projected Portfolio */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-chart-1" />
                          Projected Portfolio
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tracking Error</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-mono font-semibold text-foreground">
                              {toNumber(projected?.trackingError).toFixed(2)}%
                            </p>
                            {projected && current && (
                              <Badge
                                variant="outline"
                                className={
                                  toNumber(projected.trackingError) > toNumber(current.trackingError)
                                    ? 'text-chart-3 border-chart-3/20'
                                    : 'text-chart-2 border-chart-2/20'
                                }
                              >
                                {toNumber(projected.trackingError) > toNumber(current.trackingError) ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {Math.abs(
                                  toNumber(projected.trackingError) - toNumber(current.trackingError)
                                ).toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Concentration</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-mono font-semibold text-foreground">
                              {toNumber(projected?.concentration).toFixed(1)}%
                            </p>
                            {projected && current && (
                              <Badge
                                variant="outline"
                                className={
                                  toNumber(projected.concentration) > toNumber(current.concentration)
                                    ? 'text-chart-3 border-chart-3/20'
                                    : 'text-chart-2 border-chart-2/20'
                                }
                              >
                                {toNumber(projected.concentration) > toNumber(current.concentration) ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {Math.abs(
                                  toNumber(projected.concentration) - toNumber(current.concentration)
                                ).toFixed(1)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {projected?.factorExposures && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Factor Exposures</p>
                            <div className="space-y-2">
                              {Object.entries(projected.factorExposures).map(([factor, value]) => {
                                const currentValue = current?.factorExposures?.[factor] ?? 0;
                                const change = toNumber(value) - toNumber(currentValue);
                                
                                return (
                                  <div key={factor} className="flex items-center justify-between">
                                    <span className="text-xs text-foreground capitalize">{factor}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-mono text-foreground">
                                        {toNumber(value).toFixed(2)}
                                      </span>
                                      <span
                                        className={`text-xs font-mono ${
                                          change > 0 ? 'text-chart-2' : change < 0 ? 'text-chart-3' : 'text-muted-foreground'
                                        }`}
                                      >
                                        {change > 0 ? '+' : ''}
                                        {change.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Risk Warnings */}
                  {riskMetrics && riskMetrics.warnings && riskMetrics.warnings.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-chart-3">
                          <AlertTriangle className="h-4 w-4" />
                          Risk Warnings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {riskMetrics.warnings.map((warning: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                              <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Metadata */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Generated: {formatDate(selectedScenario.generatedAt)}</span>
                        <span>Analysis ID: {selectedScenario.id.slice(0, 8)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center">
            <Card className="max-w-md w-full">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">No scenario selected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a scenario from the list to view portfolio impact analysis
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
