import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, TrendingUp, AlertTriangle, CheckCircle2, Clock, DollarSign, BarChart3 } from "lucide-react";
import type { AgentResponse } from "@shared/schema";
import { format } from "date-fns";

interface ResearchBrief {
  ticker: string;
  companyName: string;
  summary: string;
  keyMetrics: {
    revenue: string;
    growth: string;
    margins: string;
    valuation: string;
  };
  strengths: string[];
  risks: string[];
  recommendation: "BUY" | "HOLD" | "SELL";
}

function validateResearchBrief(response: unknown): ResearchBrief | null {
  if (!response || typeof response !== 'object') return null;
  
  const data = response as Partial<ResearchBrief>;
  
  if (
    typeof data.ticker !== 'string' ||
    typeof data.companyName !== 'string' ||
    typeof data.summary !== 'string' ||
    !data.keyMetrics ||
    typeof data.keyMetrics !== 'object' ||
    !Array.isArray(data.strengths) ||
    !Array.isArray(data.risks) ||
    (data.recommendation !== 'BUY' && data.recommendation !== 'HOLD' && data.recommendation !== 'SELL')
  ) {
    return null;
  }

  return {
    ticker: data.ticker,
    companyName: data.companyName,
    summary: data.summary,
    keyMetrics: {
      revenue: data.keyMetrics.revenue || 'N/A',
      growth: data.keyMetrics.growth || 'N/A',
      margins: data.keyMetrics.margins || 'N/A',
      valuation: data.keyMetrics.valuation || 'N/A',
    },
    strengths: data.strengths,
    risks: data.risks,
    recommendation: data.recommendation,
  };
}

export default function ResearchBriefPage() {
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);

  const { data: agentResponses = [] } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  const researchBriefs = agentResponses
    .filter(response => response.agentType === "RESEARCH_SYNTHESIZER")
    .filter(response => validateResearchBrief(response.response) !== null);

  const selectedBrief = selectedBriefId
    ? researchBriefs.find(b => b.id === selectedBriefId)
    : null;

  const briefData = selectedBrief ? validateResearchBrief(selectedBrief.response) : null;

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "BUY": return "bg-chart-2 border-chart-2 text-white";
      case "SELL": return "bg-chart-3 border-chart-3 text-white";
      case "HOLD": return "bg-chart-4 border-chart-4 text-white";
      default: return "bg-muted border-muted text-foreground";
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Research Briefs List */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-chart-1" />
            Research Briefs
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {researchBriefs.length} research {researchBriefs.length === 1 ? 'brief' : 'briefs'}
          </p>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-3">
          <ScrollArea className="h-full">
            {researchBriefs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No research briefs available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate a research brief from the Research page
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-3">
                {researchBriefs.map((brief) => {
                  const data = validateResearchBrief(brief.response);
                  if (!data) return null;
                  
                  return (
                    <button
                      key={brief.id}
                      onClick={() => setSelectedBriefId(brief.id)}
                      className={`w-full text-left rounded-md p-3 border transition-colors ${
                        selectedBriefId === brief.id
                          ? "bg-primary/10 border-primary"
                          : "hover-elevate"
                      }`}
                      data-testid={`button-brief-${brief.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">{data.ticker}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {data.companyName}
                          </div>
                        </div>
                        <Badge
                          variant="default"
                          className={`text-xs shrink-0 ${getRecommendationColor(data.recommendation)}`}
                        >
                          {data.recommendation}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(brief.generatedAt!), 'MMM d, yyyy')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Research Brief Details */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {!selectedBrief || !briefData ? (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Select a research brief</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a brief from the sidebar to view details
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
                        <CardTitle className="text-2xl font-bold">{briefData.ticker}</CardTitle>
                        <Badge
                          variant="default"
                          className={`text-sm ${getRecommendationColor(briefData.recommendation)}`}
                        >
                          {briefData.recommendation}
                        </Badge>
                      </div>
                      <p className="text-lg text-foreground">{briefData.companyName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="h-4 w-4" />
                        <span>Generated {format(new Date(selectedBrief.generatedAt!), 'MMMM d, yyyy h:mm a')}</span>
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
                  <p className="text-foreground leading-relaxed">{briefData.summary}</p>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-chart-1" />
                    Key Financial Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-1/10 shrink-0">
                        <DollarSign className="h-5 w-5 text-chart-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Revenue</div>
                        <div className="font-semibold text-foreground">{briefData.keyMetrics.revenue}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10 shrink-0">
                        <TrendingUp className="h-5 w-5 text-chart-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Growth</div>
                        <div className="font-semibold text-foreground">{briefData.keyMetrics.growth}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-4/10 shrink-0">
                        <BarChart3 className="h-5 w-5 text-chart-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Margins</div>
                        <div className="font-semibold text-foreground">{briefData.keyMetrics.margins}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-5/10 shrink-0">
                        <DollarSign className="h-5 w-5 text-chart-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Valuation</div>
                        <div className="font-semibold text-foreground">{briefData.keyMetrics.valuation}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths and Risks */}
              <div className="grid grid-cols-2 gap-6">
                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-chart-2" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {briefData.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground leading-relaxed">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Risks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-chart-3" />
                      Key Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {briefData.risks.map((risk, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground leading-relaxed">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Raw Data Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Raw Response Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                      {JSON.stringify(briefData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
