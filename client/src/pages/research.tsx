import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AgentPanel } from "@/components/agent-panel";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Calculator, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const researchFormSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").max(10, "Ticker must be 10 characters or less").regex(/^[A-Z]+$/, "Ticker must contain only uppercase letters"),
});

type ResearchFormValues = z.infer<typeof researchFormSchema>;

export default function Research() {
  const [researchBrief, setResearchBrief] = useState<any>(null);
  const [dcfModel, setDcfModel] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<ResearchFormValues>({
    resolver: zodResolver(researchFormSchema),
    defaultValues: {
      ticker: "NVDA",
    },
  });

  const researchMutation = useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiRequest('POST', '/api/agents/research-synthesizer', { ticker });
      return response;
    },
    onSuccess: (data) => {
      setResearchBrief(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate research brief",
        variant: "destructive",
      });
    },
  });

  const dcfMutation = useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiRequest('POST', '/api/agents/financial-modeler', { ticker });
      return response;
    },
    onSuccess: (data) => {
      setDcfModel(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate DCF model",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ResearchFormValues) => {
    researchMutation.mutate(values.ticker);
    dcfMutation.mutate(values.ticker);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
          Research & Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered investment research and financial modeling
        </p>
      </div>

      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Select Company for Analysis</CardTitle>
          <CardDescription>Enter a ticker symbol to begin AI-powered research</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
              <FormField
                control={form.control}
                name="ticker"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Ticker Symbol
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="NVDA"
                        className="font-mono uppercase"
                        data-testid="input-ticker"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={researchMutation.isPending || dcfMutation.isPending}
                  data-testid="button-analyze"
                >
                  <Search className="h-4 w-4" />
                  Analyze Company
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* AI Agents */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AgentPanel
          agentName="Research Synthesizer"
          description="Generates comprehensive investment briefs from SEC filings, earnings transcripts, and market data"
          isGenerating={researchMutation.isPending}
          response={researchBrief}
          onInvoke={() => {
            const ticker = form.getValues('ticker');
            if (ticker) researchMutation.mutate(ticker);
          }}
        />

        <AgentPanel
          agentName="Financial Modeler"
          description="Builds DCF models with bull/base/bear scenarios and valuation analysis"
          isGenerating={dcfMutation.isPending}
          response={dcfModel}
          onInvoke={() => {
            const ticker = form.getValues('ticker');
            if (ticker) dcfMutation.mutate(ticker);
          }}
        />
      </div>

      {/* Research Brief Display */}
      {researchBrief && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Investment Brief: {researchBrief.ticker}
            </CardTitle>
            <CardDescription>{researchBrief.companyName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Executive Summary
              </h3>
              <p className="text-sm text-foreground">{researchBrief.summary}</p>
            </div>

            {researchBrief.keyMetrics && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
                  Key Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {Object.entries(researchBrief.keyMetrics).map(([key, value]) => (
                    <div key={key} className="rounded-md bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                      <p className="text-sm font-mono font-medium text-foreground mt-1">{value as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {researchBrief.strengths && (
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    Strengths
                  </h3>
                  <ul className="space-y-1.5">
                    {researchBrief.strengths.map((strength: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-chart-2 mt-0.5">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {researchBrief.risks && (
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    Key Risks
                  </h3>
                  <ul className="space-y-1.5">
                    {researchBrief.risks.map((risk: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-chart-4 mt-0.5" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {researchBrief.recommendation && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm font-medium text-muted-foreground">Recommendation:</span>
                <Badge variant="default">{researchBrief.recommendation}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* DCF Model Display */}
      {dcfModel && dcfModel.scenarios && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              DCF Valuation Model: {dcfModel.ticker}
            </CardTitle>
            <CardDescription>Three-scenario discounted cash flow analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Bull Case */}
              <div className="rounded-md border border-chart-2/20 bg-chart-2/5 p-4">
                <h3 className="text-xs font-medium uppercase tracking-wide text-chart-2 mb-3">
                  Bull Case
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Target Price</p>
                    <p className="text-2xl font-mono font-semibold text-chart-2">
                      ${dcfModel.scenarios.bull.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IRR</p>
                    <p className="text-sm font-mono font-medium text-foreground">
                      {dcfModel.scenarios.bull.irr}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assumptions</p>
                    <p className="text-xs text-foreground">{dcfModel.scenarios.bull.assumptions}</p>
                  </div>
                </div>
              </div>

              {/* Base Case */}
              <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                <h3 className="text-xs font-medium uppercase tracking-wide text-primary mb-3">
                  Base Case
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Target Price</p>
                    <p className="text-2xl font-mono font-semibold text-primary">
                      ${dcfModel.scenarios.base.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IRR</p>
                    <p className="text-sm font-mono font-medium text-foreground">
                      {dcfModel.scenarios.base.irr}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assumptions</p>
                    <p className="text-xs text-foreground">{dcfModel.scenarios.base.assumptions}</p>
                  </div>
                </div>
              </div>

              {/* Bear Case */}
              <div className="rounded-md border border-chart-3/20 bg-chart-3/5 p-4">
                <h3 className="text-xs font-medium uppercase tracking-wide text-chart-3 mb-3">
                  Bear Case
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Target Price</p>
                    <p className="text-2xl font-mono font-semibold text-chart-3">
                      ${dcfModel.scenarios.bear.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IRR</p>
                    <p className="text-sm font-mono font-medium text-foreground">
                      {dcfModel.scenarios.bear.irr}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assumptions</p>
                    <p className="text-xs text-foreground">{dcfModel.scenarios.bear.assumptions}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 rounded-md bg-muted/50 p-3 text-sm">
              <div>
                <span className="text-muted-foreground">WACC:</span>
                <span className="ml-2 font-mono font-medium text-foreground">{dcfModel.wacc}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Terminal Growth:</span>
                <span className="ml-2 font-mono font-medium text-foreground">{dcfModel.terminalGrowth}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
