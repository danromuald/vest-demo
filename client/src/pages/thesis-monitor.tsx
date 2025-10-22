import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Activity, AlertTriangle, CheckCircle2, Plus, Loader2, TrendingDown, Eye } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThesisHealthBadge } from "@/components/thesis-health-badge";
import { format } from "date-fns";
import type { AgentResponse } from "@shared/schema";

interface ThesisHealthReport {
  ticker: string;
  status: 'HEALTHY' | 'WARNING' | 'ALERT';
  summary: string;
  keyConcerns: string[];
  thesisDrift: number;
  recommendation: 'HOLD' | 'REVIEW' | 'SELL';
}

export default function ThesisMonitor() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [selectedReport, setSelectedReport] = useState<AgentResponse | null>(null);

  const { data: agentResponses = [], isLoading, isError, error, refetch } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  const thesisReports = agentResponses.filter(r => r.agentType === 'THESIS_MONITOR');

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/agents/thesis-monitor', {
        ticker: ticker.toUpperCase(),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-responses'] });
      toast({
        title: "Health Report Generated",
        description: `Thesis health analysis for ${ticker.toUpperCase()} complete`,
      });
      setDialogOpen(false);
      setTicker("");
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
    if (!ticker) {
      toast({
        title: "Missing Information",
        description: "Please provide a ticker symbol",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  const toNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/%/g, '').replace(/,/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Convert drift value to 0-100 scale if needed
  const normalizeDrift = (drift: number): number => {
    // If drift is between 0-1, convert to 0-100
    if (drift >= 0 && drift <= 1) {
      return drift * 100;
    }
    // If already in 0-100 range, return as-is
    if (drift >= 0 && drift <= 100) {
      return drift;
    }
    // Clamp out-of-range values
    return Math.max(0, Math.min(100, drift));
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

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'HOLD':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'REVIEW':
        return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      case 'SELL':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      default:
        return '';
    }
  };

  const getDriftColor = (drift: number) => {
    if (drift < 25) return 'bg-chart-2';
    if (drift < 50) return 'bg-chart-4';
    return 'bg-chart-3';
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading thesis health reports...</p>
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
            <p className="text-lg font-medium text-foreground">Failed to load reports</p>
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
          <h1 className="text-3xl font-semibold text-foreground">Thesis Monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track investment thesis health and drift over time
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-generate-health-report">
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Health Report</DialogTitle>
              <DialogDescription>
                Analyze the current health of an investment thesis
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
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Reports List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Health Reports</CardTitle>
            <CardDescription>
              {thesisReports.length} report{thesisReports.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {thesisReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No health reports yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate a report to monitor thesis health
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {thesisReports.map((report) => {
                  const healthData = report.response as ThesisHealthReport;
                  const drift = normalizeDrift(toNumber(healthData?.thesisDrift));
                  
                  return (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? 'border-primary bg-primary/5'
                          : 'hover-elevate'
                      }`}
                      data-testid={`card-report-${report.ticker}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-foreground">
                            {report.ticker}
                          </p>
                          {healthData?.status && (
                            <ThesisHealthBadge status={healthData.status} />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">Drift:</span>
                          <div className="flex-1 max-w-[80px]">
                            <Progress 
                              value={drift} 
                              className="h-1.5"
                              data-testid={`progress-drift-${report.ticker}`}
                            />
                          </div>
                          <span className="text-xs font-mono text-foreground">{drift}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(report.generatedAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Details */}
        {selectedReport ? (
          <div className="lg:col-span-2 space-y-4 overflow-y-auto">
            {(() => {
              const healthData = selectedReport.response as ThesisHealthReport;
              const drift = normalizeDrift(toNumber(healthData?.thesisDrift));

              return (
                <>
                  {/* Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {selectedReport.ticker} Thesis Health
                            {healthData?.status && (
                              <ThesisHealthBadge status={healthData.status} />
                            )}
                          </CardTitle>
                          <CardDescription>
                            Last checked: {formatDate(selectedReport.generatedAt)}
                          </CardDescription>
                        </div>
                        {healthData?.recommendation && (
                          <Badge
                            variant="outline"
                            className={getRecommendationColor(healthData.recommendation)}
                          >
                            {healthData.recommendation}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Thesis Drift */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Thesis Drift Score
                      </CardTitle>
                      <CardDescription>
                        Measures deviation from original investment thesis (0 = on track, 100 = complete deviation)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Current Drift</span>
                          <span className="font-mono font-semibold text-foreground text-lg">
                            {drift}%
                          </span>
                        </div>
                        <Progress 
                          value={drift} 
                          className="h-3"
                          data-testid="progress-drift-detail"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>On Track</span>
                          <span>Complete Deviation</span>
                        </div>
                      </div>
                      {drift < 25 && (
                        <div className="flex items-start gap-2 p-3 rounded-md bg-chart-2/10 border border-chart-2/20">
                          <CheckCircle2 className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-foreground">
                            Thesis remains on track with minimal deviation from original assumptions
                          </p>
                        </div>
                      )}
                      {drift >= 25 && drift < 50 && (
                        <div className="flex items-start gap-2 p-3 rounded-md bg-chart-4/10 border border-chart-4/20">
                          <Eye className="h-4 w-4 text-chart-4 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-foreground">
                            Moderate drift detected. Review recommended to assess continued validity
                          </p>
                        </div>
                      )}
                      {drift >= 50 && (
                        <div className="flex items-start gap-2 p-3 rounded-md bg-chart-3/10 border border-chart-3/20">
                          <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-foreground">
                            Significant drift from original thesis. Immediate review required
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Health Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {healthData?.summary || 'No summary available'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Key Concerns */}
                  {healthData?.keyConcerns && healthData.keyConcerns.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-chart-3">
                          <AlertTriangle className="h-4 w-4" />
                          Key Concerns
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {healthData.keyConcerns.map((concern: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                              <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                              {concern}
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
                        <span>Generated: {formatDate(selectedReport.generatedAt)}</span>
                        <span>Report ID: {selectedReport.id.slice(0, 8)}</span>
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
                <Activity className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">No report selected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a health report from the list to view detailed analysis
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
