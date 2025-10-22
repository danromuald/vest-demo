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
import { AlertTriangle, Clock, TrendingDown, FileWarning, Percent, Target, Plus, Loader2 } from "lucide-react";
import type { AgentResponse } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContrarianAnalysis {
  ticker: string;
  bearCase: string;
  historicalPrecedents: string[];
  quantifiedDownside: string;
  probabilityAssessment: string;
  keyRisks: string[];
}

function validateContrarianAnalysis(response: unknown): ContrarianAnalysis | null {
  if (!response || typeof response !== 'object') return null;
  
  const data = response as Partial<ContrarianAnalysis>;
  
  if (
    typeof data.ticker !== 'string' ||
    typeof data.bearCase !== 'string' ||
    !Array.isArray(data.historicalPrecedents) ||
    typeof data.quantifiedDownside !== 'string' ||
    typeof data.probabilityAssessment !== 'string' ||
    !Array.isArray(data.keyRisks)
  ) {
    return null;
  }

  return {
    ticker: data.ticker,
    bearCase: data.bearCase,
    historicalPrecedents: data.historicalPrecedents,
    quantifiedDownside: data.quantifiedDownside,
    probabilityAssessment: data.probabilityAssessment,
    keyRisks: data.keyRisks,
  };
}

export default function RiskAnalysisPage() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const { toast } = useToast();

  const { data: agentResponses = [] } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  const riskAnalyses = agentResponses
    .filter(response => response.agentType === "CONTRARIAN")
    .filter(response => validateContrarianAnalysis(response.response) !== null);

  const selectedAnalysis = selectedAnalysisId
    ? riskAnalyses.find(a => a.id === selectedAnalysisId)
    : null;

  const analysisData = selectedAnalysis ? validateContrarianAnalysis(selectedAnalysis.response) : null;

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

  const contrarianMutation = useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiRequest('POST', '/api/agents/contrarian', { ticker });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-responses'] });
      setIsGenerateDialogOpen(false);
      setTicker("");
      toast({
        title: "Success",
        description: "Risk analysis generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate risk analysis",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      contrarianMutation.mutate(ticker.trim().toUpperCase());
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Risk Analyses List */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-chart-3" />
                Risk Analyses
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {riskAnalyses.length} bear case {riskAnalyses.length === 1 ? 'analysis' : 'analyses'}
              </p>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(true)}
              title="Generate new risk analysis"
              data-testid="button-generate-risk"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-3">
          <ScrollArea className="h-full">
            {riskAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No risk analyses available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate a bear case analysis from the IC Meeting page
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-3">
                {riskAnalyses.map((analysis) => {
                  const data = validateContrarianAnalysis(analysis.response);
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
                            Downside: {data.quantifiedDownside}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0 bg-chart-3/10 border-chart-3 text-chart-3">
                          RISK
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

      {/* Risk Analysis Details */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {!selectedAnalysis || !analysisData ? (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Select a risk analysis</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose an analysis from the sidebar to view bear case details
              </p>
            </div>
          </Card>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-6 pr-4">
              {/* Header */}
              <Card className="border-2 border-chart-3/20">
                <CardHeader className="bg-chart-3/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl font-bold">{analysisData.ticker}</CardTitle>
                        <Badge variant="default" className="bg-chart-3 border-chart-3 text-white">
                          Bear Case
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Contrarian Analysis - Risk Assessment
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="h-4 w-4" />
                        <span>Generated {formatDate(selectedAnalysis.generatedAt, 'MMMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Downside Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 border-chart-3/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <TrendingDown className="h-4 w-4" />
                      Quantified Downside
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-3">
                      {analysisData.quantifiedDownside}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-chart-3/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Percent className="h-4 w-4" />
                      Probability Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-3">
                      {analysisData.probabilityAssessment}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bear Case Narrative */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileWarning className="h-5 w-5 text-chart-3" />
                    Bear Case Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{analysisData.bearCase}</p>
                </CardContent>
              </Card>

              {/* Key Risks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-chart-3" />
                    Key Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisData.keyRisks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 rounded-md bg-chart-3/5 border border-chart-3/20">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-3/20 shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-chart-3">{index + 1}</span>
                        </div>
                        <span className="text-sm text-foreground leading-relaxed flex-1">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Historical Precedents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-chart-1" />
                    Historical Precedents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.historicalPrecedents.map((precedent, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed flex-1">{precedent}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Raw Data Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Raw Analysis Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                      {JSON.stringify(analysisData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Generate Risk Analysis Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Risk Analysis</DialogTitle>
            <DialogDescription>
              Enter a ticker symbol to generate a contrarian bear case analysis using AI
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerate}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticker">Ticker Symbol</Label>
                <Input
                  id="ticker"
                  placeholder="AAPL"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  className="mt-1 font-mono uppercase"
                  data-testid="input-risk-ticker"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGenerateDialogOpen(false)}
                disabled={contrarianMutation.isPending}
                data-testid="button-cancel-risk"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!ticker.trim() || contrarianMutation.isPending}
                data-testid="button-submit-risk"
              >
                {contrarianMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Analysis
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
