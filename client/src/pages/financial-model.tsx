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
import { TrendingUp, TrendingDown, Minus, DollarSign, Clock, Percent, Target, Plus, Loader2 } from "lucide-react";
import type { AgentResponse } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Scenario {
  price: number;
  irr: number;
  assumptions: string;
}

interface DCFModel {
  ticker: string;
  scenarios: {
    bull: Scenario;
    base: Scenario;
    bear: Scenario;
  };
  wacc: number;
  terminalGrowth: number;
}

function validateDCFModel(response: unknown): DCFModel | null {
  if (!response || typeof response !== 'object') return null;
  
  const data = response as Partial<DCFModel>;
  
  const toNumber = (value: unknown): number | null => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Handle percentage strings like "18.5%" or "18.5"
      const cleaned = value.replace(/%/g, '').replace(/,/g, '').trim();
      const num = Number(cleaned);
      return isNaN(num) ? null : num;
    }
    return null;
  };
  
  const validateScenario = (scenario: unknown): Scenario | null => {
    if (!scenario || typeof scenario !== 'object') return null;
    const s = scenario as Partial<Scenario>;
    
    const price = toNumber(s.price);
    const irr = toNumber(s.irr);
    
    if (price === null || irr === null || typeof s.assumptions !== 'string') {
      return null;
    }
    
    return { price, irr, assumptions: s.assumptions };
  };
  
  const wacc = toNumber(data.wacc);
  const terminalGrowth = toNumber(data.terminalGrowth);
  
  if (
    typeof data.ticker !== 'string' ||
    !data.scenarios ||
    typeof data.scenarios !== 'object' ||
    !validateScenario(data.scenarios.bull) ||
    !validateScenario(data.scenarios.base) ||
    !validateScenario(data.scenarios.bear) ||
    wacc === null ||
    terminalGrowth === null
  ) {
    return null;
  }

  return {
    ticker: data.ticker,
    scenarios: {
      bull: validateScenario(data.scenarios.bull)!,
      base: validateScenario(data.scenarios.base)!,
      bear: validateScenario(data.scenarios.bear)!,
    },
    wacc,
    terminalGrowth,
  };
}

export default function FinancialModelPage() {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const { toast } = useToast();

  const { data: agentResponses = [] } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  const dcfModels = agentResponses
    .filter(response => response.agentType === "FINANCIAL_MODELER")
    .filter(response => validateDCFModel(response.response) !== null);

  const selectedModel = selectedModelId
    ? dcfModels.find(m => m.id === selectedModelId)
    : null;

  const modelData = selectedModel ? validateDCFModel(selectedModel.response) : null;

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

  const getScenarioIcon = (scenario: 'bull' | 'base' | 'bear') => {
    switch (scenario) {
      case 'bull': return <TrendingUp className="h-5 w-5" />;
      case 'bear': return <TrendingDown className="h-5 w-5" />;
      case 'base': return <Minus className="h-5 w-5" />;
    }
  };

  const getScenarioColor = (scenario: 'bull' | 'base' | 'bear') => {
    switch (scenario) {
      case 'bull': return { bg: 'bg-chart-2/10', border: 'border-chart-2/20', text: 'text-chart-2' };
      case 'base': return { bg: 'bg-chart-1/10', border: 'border-chart-1/20', text: 'text-chart-1' };
      case 'bear': return { bg: 'bg-chart-3/10', border: 'border-chart-3/20', text: 'text-chart-3' };
    }
  };

  const dcfMutation = useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiRequest('POST', '/api/agents/financial-modeler', { ticker });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-responses'] });
      setIsGenerateDialogOpen(false);
      setTicker("");
      toast({
        title: "Success",
        description: "DCF model generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate DCF model",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      dcfMutation.mutate(ticker.trim().toUpperCase());
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* DCF Models List */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-chart-1" />
                Financial Models
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {dcfModels.length} DCF {dcfModels.length === 1 ? 'model' : 'models'}
              </p>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(true)}
              title="Generate new DCF model"
              data-testid="button-generate-dcf"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-3">
          <ScrollArea className="h-full">
            {dcfModels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No financial models available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate a DCF model from the IC Meeting page
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-3">
                {dcfModels.map((model) => {
                  const data = validateDCFModel(model.response);
                  if (!data) return null;
                  
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      className={`w-full text-left rounded-md p-3 border transition-colors ${
                        selectedModelId === model.id
                          ? "bg-primary/10 border-primary"
                          : "hover-elevate"
                      }`}
                      data-testid={`button-model-${model.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">{data.ticker}</div>
                          <div className="text-xs text-muted-foreground">
                            Base: ${data.scenarios.base.price.toFixed(0)}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          DCF
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(model.generatedAt, 'MMM d, yyyy')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* DCF Model Details */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {!selectedModel || !modelData ? (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <DollarSign className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Select a financial model</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a model from the sidebar to view DCF analysis
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
                        <CardTitle className="text-2xl font-bold">{modelData.ticker}</CardTitle>
                        <Badge variant="outline" className="text-sm">DCF Valuation</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Discounted Cash Flow Analysis with Three Scenarios
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="h-4 w-4" />
                        <span>Generated {formatDate(selectedModel.generatedAt, 'MMMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Model Assumptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-chart-1" />
                    Model Assumptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-md bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-1/10 shrink-0">
                        <Percent className="h-5 w-5 text-chart-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">WACC</div>
                        <div className="text-xl font-bold text-foreground">{modelData.wacc.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground mt-1">Weighted Average Cost of Capital</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-md bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-4/10 shrink-0">
                        <TrendingUp className="h-5 w-5 text-chart-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Terminal Growth</div>
                        <div className="text-xl font-bold text-foreground">{modelData.terminalGrowth.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground mt-1">Perpetual Growth Rate</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scenario Analysis */}
              <div className="grid grid-cols-3 gap-4">
                {(['bull', 'base', 'bear'] as const).map((scenarioType) => {
                  const scenario = modelData.scenarios[scenarioType];
                  const colors = getScenarioColor(scenarioType);
                  
                  return (
                    <Card key={scenarioType} className={`border-2 ${colors.border}`}>
                      <CardHeader className={`${colors.bg} pb-4`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <CardTitle className="text-base font-semibold capitalize flex items-center gap-2">
                            <div className={colors.text}>
                              {getScenarioIcon(scenarioType)}
                            </div>
                            {scenarioType} Case
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Target Price</div>
                            <div className="text-2xl font-bold text-foreground">
                              ${scenario.price.toFixed(0)}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Expected IRR</div>
                            <div className={`text-xl font-semibold ${
                              scenario.irr > 15 ? 'text-chart-2' :
                              scenario.irr > 5 ? 'text-chart-1' :
                              'text-chart-3'
                            }`}>
                              {scenario.irr > 0 ? '+' : ''}{scenario.irr.toFixed(1)}%
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <div className="text-xs text-muted-foreground mb-2">Key Assumptions</div>
                            <p className="text-xs text-foreground leading-relaxed">
                              {scenario.assumptions}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Valuation Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Valuation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <span className="text-sm text-foreground">Price Range</span>
                      <span className="font-semibold text-foreground">
                        ${modelData.scenarios.bear.price.toFixed(0)} - ${modelData.scenarios.bull.price.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <span className="text-sm text-foreground">Base Case Price</span>
                      <span className="font-semibold text-chart-1">
                        ${modelData.scenarios.base.price.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <span className="text-sm text-foreground">IRR Range</span>
                      <span className="font-semibold text-foreground">
                        {modelData.scenarios.bear.irr.toFixed(1)}% - {modelData.scenarios.bull.irr.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Raw Data Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Raw Model Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                      {JSON.stringify(modelData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Generate DCF Model Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate DCF Model</DialogTitle>
            <DialogDescription>
              Enter a ticker symbol to generate a DCF valuation model using AI
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
                  data-testid="input-dcf-ticker"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGenerateDialogOpen(false)}
                disabled={dcfMutation.isPending}
                data-testid="button-cancel-dcf"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!ticker.trim() || dcfMutation.isPending}
                data-testid="button-submit-dcf"
              >
                {dcfMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Model
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
