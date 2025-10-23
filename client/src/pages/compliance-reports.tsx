import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Plus, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ComplianceReport } from "@shared/schema";

export default function ComplianceReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [ticker, setTicker] = useState("");
  const [proposalId, setProposalId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: agentResponses, isLoading } = useQuery<any[]>({
    queryKey: ["/api/agent-responses"],
  });

  const complianceReports = (agentResponses || [])
    .filter((r) => r.agentType === "COMPLIANCE_MONITOR")
    .map((r) => ({
      ...r.response,
      id: r.id,
      createdAt: r.createdAt,
    })) as (ComplianceReport & { id: string; createdAt: string })[];

  const generateMutation = useMutation({
    mutationFn: async (data: { ticker: string; proposalId: string }) =>
      apiRequest("/api/agents/compliance-monitor", "POST", data),
    onSuccess: (data: ComplianceReport) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-responses"] });
      setSelectedReport(data);
      setIsDialogOpen(false);
      setTicker("");
      setProposalId("");
      toast({
        title: "Compliance Report Generated",
        description: `Successfully generated compliance report for ${data.ticker}`,
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate compliance report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!ticker.trim() || !proposalId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both ticker and proposal ID",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate({ ticker: ticker.toUpperCase(), proposalId });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "destructive";
      case "HIGH": return "destructive";
      case "MEDIUM": return "default";
      case "LOW": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Reports
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" data-testid="button-generate-compliance">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-generate-compliance">
              <DialogHeader>
                <DialogTitle>Generate Compliance Report</DialogTitle>
                <DialogDescription>
                  Enter ticker symbol and proposal ID to generate a compliance check
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="ticker">Ticker Symbol</Label>
                  <Input
                    id="ticker"
                    placeholder="AAPL"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    data-testid="input-ticker"
                  />
                </div>
                <div>
                  <Label htmlFor="proposalId">Proposal ID</Label>
                  <Input
                    id="proposalId"
                    placeholder="prop-123"
                    value={proposalId}
                    onChange={(e) => setProposalId(e.target.value)}
                    data-testid="input-proposal-id"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  data-testid="button-submit-compliance"
                >
                  {generateMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : complianceReports.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No compliance reports yet</p>
              <p className="mt-1">Generate your first report to get started</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {complianceReports.map((report) => (
                <button
                  key={(report as any).id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-3 rounded-md border transition-colors hover-elevate ${
                    (selectedReport as any)?.id === (report as any).id ? "bg-accent" : ""
                  }`}
                  data-testid={`card-compliance-${(report as any).id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-sm">{report.ticker}</span>
                    <Badge variant={getSeverityColor(report.severity)} className="text-xs">
                      {report.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {report.violations.length === 0 ? "No violations" : `${report.violations.length} violation(s)`}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedReport ? (
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">{selectedReport.ticker} Compliance Check</h1>
                <Badge variant={getSeverityColor(selectedReport.severity)}>
                  {selectedReport.severity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Proposal ID: {selectedReport.proposalId}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(selectedReport.complianceChecks).map(([key, check]) => (
                  <div key={key} className="flex items-start gap-3 p-3 rounded-lg border">
                    {check.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">
                        {key.split(/(?=[A-Z])/).join(" ").toUpperCase()}
                      </h4>
                      <p className="text-sm text-muted-foreground">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedReport.violations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Violations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedReport.violations.map((violation, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-destructive">•</span>
                        <span>{violation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {selectedReport.remediation.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Remediation Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {selectedReport.remediation.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="font-medium text-muted-foreground">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{selectedReport.recommendation}</p>
                {selectedReport.approvalRequired && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                      ⚠️ Additional approval required before execution
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Select a compliance report to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
