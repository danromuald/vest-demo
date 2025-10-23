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
import { BarChart3, TrendingUp, AlertCircle, Clock, Plus, Loader2, Activity } from "lucide-react";
import type { AgentResponse } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FactorExposures {
  growth: number;
  value: number;
  momentum: number;
  quality: number;
  size: number;
  volatility: number;
}

interface StatisticalMetrics {
  sharpeRatio: number;
  beta: number;
  alpha: number;
  volatility: number;
}

interface FactorAnalysis {
  ticker: string;
  factorExposures: FactorExposures;
  statisticalMetrics: StatisticalMetrics;
  portfolioCorrelation: number;
  riskAdjustedReturn: number;
  quantScore: number;
  summary: string;
}

function validateFactorAnalysis(response: unknown): FactorAnalysis | null {
  if (!response || typeof response !== 'object') return null;
  
  const data = response as Partial<FactorAnalysis>;
  
  const toNumber = (value: unknown): number | null => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/%/g, '').replace(/,/g, '').trim();
      const num = Number(cleaned);
      return isNaN(num) ? null : num;
    }
    return null;
  };
  
  if (
    typeof data.ticker !== 'string' ||
    !data.factorExposures || typeof data.factorExposures !== 'object' ||
    !data.statisticalMetrics || typeof data.statisticalMetrics !== 'object' ||
    toNumber(data.portfolioCorrelation) === null ||
    toNumber(data.riskAdjustedReturn) === null ||
    toNumber(data.quantScore) === null ||
    typeof data.summary !== 'string'
  ) {
    return null;
  }

  const exposures = data.factorExposures as Partial<FactorExposures>;
  const metrics = data.statisticalMetrics as Partial<StatisticalMetrics>;

  return {
    ticker: data.ticker,
    factorExposures: {
      growth: toNumber(exposures.growth) ?? 0,
      value: toNumber(exposures.value) ?? 0,
      momentum: toNumber(exposures.momentum) ?? 0,
      quality: toNumber(exposures.quality) ?? 0,
      size: toNumber(exposures.size) ?? 0,
      volatility: toNumber(exposures.volatility) ?? 0,
    },
    statisticalMetrics: {
      sharpeRatio: toNumber(metrics.sharpeRatio) ?? 0,
      beta: toNumber(metrics.beta) ?? 0,
      alpha: toNumber(metrics.alpha) ?? 0,
      volatility: toNumber(metrics.volatility) ?? 0,
    },
    portfolioCorrelation: toNumber(data.portfolioCorrelation)!,
    riskAdjustedReturn: toNumber(data.riskAdjustedReturn)!,
    quantScore: toNumber(data.quantScore)!,
    summary: data.summary,
  };
}

export default function QuantAnalysisPage() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const { toast } = useToast();

  const { data: agentResponses = [] } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  const quantAnalyses = agentResponses
    .filter(response => response.agentType === "QUANT_ANALYST")
    .filter(response => validateFactorAnalysis(response.response) !== null);

  const selectedAnalysis = selectedAnalysisId
    ? quantAnalyses.find(a => a.id === selectedAnalysisId)
    : null;

  const analysisData = selectedAnalysis ? validateFactorAnalysis(selectedAnalysis.response) : null;

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-chart-2 border-chart-2 text-white";
    if (score >= 60) return "bg-chart-1 border-chart-1 text-white";
    if (score >= 40) return "bg-chart-4 border-chart-4 text-white";
    return "bg-chart-3 border-chart-3 text-white";
  };

  const quantMutation = useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiRequest('POST', '/api/agents/quant-analyst', { ticker });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-responses'] });
      setIsGenerateDialogOpen(false);
      setTicker("");
      toast({
        title: "Success",
        description: "Quantitative analysis generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate quantitative analysis",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      quantMutation.mutate(ticker.trim().toUpperCase());
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Analyses List */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-chart-1" />
                Quant Analyses
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {quantAnalyses.length} {quantAnalyses.length === 1 ? 'analysis' : 'analyses'}
              </p>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(true)}
              data-testid="button-generate-analysis"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-3">
          <ScrollArea className="h-full">
            {quantAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No analyses available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate a new quantitative analysis
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-3">
                {quantAnalyses.map((analysis) => {
                  const data = validateFactorAnalysis(analysis.response);
                  if (!data) return null;
                  
                  return (
                    <button
                      key={analysis.id}
                      onClick={() => setSelectedAnalysisId(analysis.id)}
                      className={`w-full text-left rounded-md p-3 border transition-colors ${
                        selectedAnalysisId === analysis.id
                          ? "bg-primary/10 border-primary"
                          : "hover-elevate"
                      }`}
                      data-testid={`button-analysis-${analysis.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">{data.ticker}</div>
                          <div className="text-xs text-muted-foreground">
                            Quant Score: {data.quantScore.toFixed(0)}
                          </div>
                        </div>
                        <Badge
                          variant="default"
                          className={`text-xs shrink-0 ${getScoreColor(data.quantScore)}`}
                        >
                          {data.quantScore.toFixed(0)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(analysis.generatedAt, 'MMM d, yyyy')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Analysis Details */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {!selectedAnalysis || !analysisData ? (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Select an analysis</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose an analysis from the sidebar to view details
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
                        <CardTitle className="text-2xl font-bold">{analysisData.ticker}</CardTitle>
                        <Badge
                          variant="default"
                          className={`text-sm ${getScoreColor(analysisData.quantScore)}`}
                        >
                          Quant Score: {analysisData.quantScore.toFixed(0)}
                        </Badge>
                      </div>
                      <p className="text-lg text-foreground">Quantitative Factor Analysis</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="h-4 w-4" />
                        <span>Generated {formatDate(selectedAnalysis.generatedAt, 'MMMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-chart-1" />
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{analysisData.summary}</p>
                </CardContent>
              </Card>

              {/* Factor Exposures */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-chart-1" />
                    Factor Exposures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analysisData.factorExposures).map(([factor, value]) => (
                      <div key={factor}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{factor}</span>
                          <span className="text-sm text-muted-foreground">{value.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              value > 0 ? 'bg-chart-2' : 'bg-chart-3'
                            }`}
                            style={{ width: `${Math.min(Math.abs(value) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Statistical Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-chart-1" />
                    Statistical Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                      <p className="text-2xl font-bold">{analysisData.statisticalMetrics.sharpeRatio.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Beta</p>
                      <p className="text-2xl font-bold">{analysisData.statisticalMetrics.beta.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Alpha</p>
                      <p className="text-2xl font-bold">{analysisData.statisticalMetrics.alpha.toFixed(2)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Volatility</p>
                      <p className="text-2xl font-bold">{analysisData.statisticalMetrics.volatility.toFixed(2)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-chart-1" />
                    Portfolio Fit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Portfolio Correlation</p>
                      <p className="text-2xl font-bold">{analysisData.portfolioCorrelation.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Risk-Adjusted Return</p>
                      <p className="text-2xl font-bold">{analysisData.riskAdjustedReturn.toFixed(2)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Generate Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent data-testid="dialog-generate-analysis">
          <form onSubmit={handleGenerate}>
            <DialogHeader>
              <DialogTitle>Generate Quantitative Analysis</DialogTitle>
              <DialogDescription>
                Enter a ticker symbol to generate factor analysis and statistical metrics
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
                disabled={quantMutation.isPending}
                data-testid="button-submit"
              >
                {quantMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
