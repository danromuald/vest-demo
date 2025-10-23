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
import { FileText, Target, AlertTriangle, TrendingUp, Clock, Plus, Loader2, Calendar } from "lucide-react";
import type { AgentResponse } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  action: 'BUY' | 'SELL' | 'HOLD';
  targetPrice: number;
  timeframe: string;
  conviction: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface InvestmentMemo {
  ticker: string;
  title: string;
  executiveSummary: string;
  investmentThesis: string;
  valuationAnalysis: string;
  riskFactors: string[];
  recommendation: Recommendation;
  preparedBy: string;
  date: string;
}

function validateInvestmentMemo(response: unknown): InvestmentMemo | null {
  if (!response || typeof response !== 'object') return null;
  
  const data = response as Partial<InvestmentMemo>;
  
  if (
    typeof data.ticker !== 'string' ||
    typeof data.title !== 'string' ||
    typeof data.executiveSummary !== 'string' ||
    typeof data.investmentThesis !== 'string' ||
    typeof data.valuationAnalysis !== 'string' ||
    !Array.isArray(data.riskFactors) ||
    !data.recommendation || typeof data.recommendation !== 'object' ||
    typeof data.preparedBy !== 'string' ||
    typeof data.date !== 'string'
  ) {
    return null;
  }

  const rec = data.recommendation as Partial<Recommendation>;
  
  if (
    (rec.action !== 'BUY' && rec.action !== 'SELL' && rec.action !== 'HOLD') ||
    typeof rec.targetPrice !== 'number' ||
    typeof rec.timeframe !== 'string' ||
    (rec.conviction !== 'LOW' && rec.conviction !== 'MEDIUM' && rec.conviction !== 'HIGH')
  ) {
    return null;
  }

  return {
    ticker: data.ticker,
    title: data.title,
    executiveSummary: data.executiveSummary,
    investmentThesis: data.investmentThesis,
    valuationAnalysis: data.valuationAnalysis,
    riskFactors: data.riskFactors,
    recommendation: rec as Recommendation,
    preparedBy: data.preparedBy,
    date: data.date,
  };
}

export default function InvestmentMemosPage() {
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const { toast } = useToast();

  const { data: agentResponses = [] } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  const investmentMemos = agentResponses
    .filter(response => response.agentType === "DOCUMENT_GENERATOR")
    .filter(response => validateInvestmentMemo(response.response) !== null);

  const selectedMemo = selectedMemoId
    ? investmentMemos.find(m => m.id === selectedMemoId)
    : null;

  const memoData = selectedMemo ? validateInvestmentMemo(selectedMemo.response) : null;

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

  const getActionColor = (action: string) => {
    switch (action) {
      case "BUY": return "bg-chart-2 border-chart-2 text-white";
      case "SELL": return "bg-chart-3 border-chart-3 text-white";
      case "HOLD": return "bg-chart-4 border-chart-4 text-white";
      default: return "bg-muted border-muted text-foreground";
    }
  };

  const getConvictionColor = (conviction: string) => {
    switch (conviction) {
      case "HIGH": return "text-chart-2";
      case "MEDIUM": return "text-chart-4";
      case "LOW": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  const memoMutation = useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiRequest('POST', '/api/agents/document-generator', { ticker });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-responses'] });
      setIsGenerateDialogOpen(false);
      setTicker("");
      toast({
        title: "Success",
        description: "Investment memo generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate investment memo",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      memoMutation.mutate(ticker.trim().toUpperCase());
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Memos List */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-chart-1" />
                Investment Memos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {investmentMemos.length} {investmentMemos.length === 1 ? 'memo' : 'memos'}
              </p>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(true)}
              data-testid="button-generate-memo"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-3">
          <ScrollArea className="h-full">
            {investmentMemos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No investment memos available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate a new investment memo
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-3">
                {investmentMemos.map((memo) => {
                  const data = validateInvestmentMemo(memo.response);
                  if (!data) return null;
                  
                  return (
                    <button
                      key={memo.id}
                      onClick={() => setSelectedMemoId(memo.id)}
                      className={`w-full text-left rounded-md p-3 border transition-colors ${
                        selectedMemoId === memo.id
                          ? "bg-primary/10 border-primary"
                          : "hover-elevate"
                      }`}
                      data-testid={`button-memo-${memo.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">{data.ticker}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {data.title}
                          </div>
                        </div>
                        <Badge
                          variant="default"
                          className={`text-xs shrink-0 ${getActionColor(data.recommendation.action)}`}
                        >
                          {data.recommendation.action}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(data.date, 'MMM d, yyyy')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Memo Details */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {!selectedMemo || !memoData ? (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Select an investment memo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a memo from the sidebar to view details
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
                        <CardTitle className="text-2xl font-bold">{memoData.ticker}</CardTitle>
                        <Badge
                          variant="default"
                          className={`text-sm ${getActionColor(memoData.recommendation.action)}`}
                        >
                          {memoData.recommendation.action}
                        </Badge>
                      </div>
                      <p className="text-lg text-foreground mb-2">{memoData.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(memoData.date, 'MMMM d, yyyy')}</span>
                        </div>
                        <div>Prepared by: {memoData.preparedBy}</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Executive Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-chart-1" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{memoData.executiveSummary}</p>
                </CardContent>
              </Card>

              {/* Investment Thesis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-chart-1" />
                    Investment Thesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{memoData.investmentThesis}</p>
                </CardContent>
              </Card>

              {/* Valuation Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-chart-1" />
                    Valuation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{memoData.valuationAnalysis}</p>
                </CardContent>
              </Card>

              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-chart-1" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {memoData.riskFactors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No risk factors identified</p>
                  ) : (
                    <ul className="space-y-3">
                      {memoData.riskFactors.map((risk, idx) => (
                        <li key={idx} className="flex gap-3">
                          <div className="h-2 w-2 rounded-full bg-chart-3 mt-2 shrink-0" />
                          <span className="text-foreground">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Investment Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Action</p>
                      <Badge
                        variant="default"
                        className={`text-lg ${getActionColor(memoData.recommendation.action)}`}
                      >
                        {memoData.recommendation.action}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Target Price</p>
                      <p className="text-2xl font-bold">${memoData.recommendation.targetPrice.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Timeframe</p>
                      <p className="text-lg font-medium">{memoData.recommendation.timeframe}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Conviction</p>
                      <p className={`text-lg font-bold ${getConvictionColor(memoData.recommendation.conviction)}`}>
                        {memoData.recommendation.conviction}
                      </p>
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
        <DialogContent data-testid="dialog-generate-memo">
          <form onSubmit={handleGenerate}>
            <DialogHeader>
              <DialogTitle>Generate Investment Memo</DialogTitle>
              <DialogDescription>
                Enter a ticker symbol to generate a comprehensive investment memorandum
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
                disabled={memoMutation.isPending}
                data-testid="button-submit"
              >
                {memoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
