import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, FileText, TrendingUp, AlertTriangle, Calendar, User, Target, 
  CheckCircle2, XCircle, MinusCircle, Search, LineChart, Shield, Send, DollarSign 
} from "lucide-react";
import type { Proposal, Vote, AgentResponse } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { 
  ResearchBriefDisplay, 
  DCFModelDisplay, 
  QuantAnalysisDisplay, 
  RiskAnalysisDisplay,
  ComplianceReportDisplay 
} from "@/components/agent-formatters";

export default function ProposalDetailPage() {
  const [, params] = useRoute("/proposals/:id");
  const proposalId = params?.id;

  const { data: proposals = [], isLoading: isLoadingProposals } = useQuery<Proposal[]>({
    queryKey: ['/api/proposals'],
  });

  const { data: votes = [], isLoading: isLoadingVotes } = useQuery<Vote[]>({
    queryKey: ['/api/votes'],
  });

  const { data: agentResponses = [] } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  const proposal = proposals.find(p => p.id === proposalId);
  const proposalVotes = votes.filter(v => v.proposalId === proposalId);
  const isLoading = isLoadingProposals || isLoadingVotes;

  // Filter agent responses for this ticker
  const ticker = proposal?.ticker || '';
  const researchBrief = agentResponses
    .filter(r => r.agentType === 'RESEARCH_SYNTHESIZER' && r.ticker === ticker)
    .sort((a, b) => new Date(b.generatedAt || 0).getTime() - new Date(a.generatedAt || 0).getTime())[0];
  
  const dcfModel = agentResponses
    .filter(r => r.agentType === 'FINANCIAL_MODELER' && r.ticker === ticker)
    .sort((a, b) => new Date(b.generatedAt || 0).getTime() - new Date(a.generatedAt || 0).getTime())[0];
  
  const quantAnalysis = agentResponses
    .filter(r => r.agentType === 'QUANT_ANALYST' && r.ticker === ticker)
    .sort((a, b) => new Date(b.generatedAt || 0).getTime() - new Date(a.generatedAt || 0).getTime())[0];
  
  const riskAnalysis = agentResponses
    .filter(r => r.agentType === 'CONTRARIAN' && r.ticker === ticker)
    .sort((a, b) => new Date(b.generatedAt || 0).getTime() - new Date(a.generatedAt || 0).getTime())[0];
  
  const complianceCheck = agentResponses
    .filter(r => r.agentType === 'COMPLIANCE_MONITOR' && r.ticker === ticker)
    .sort((a, b) => new Date(b.generatedAt || 0).getTime() - new Date(a.generatedAt || 0).getTime())[0];

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BUY": return "bg-chart-2 border-chart-2 text-white";
      case "SELL": return "bg-chart-3 border-chart-3 text-white";
      case "HOLD": return "bg-chart-4 border-chart-4 text-white";
      default: return "bg-muted border-muted text-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-chart-2 border-chart-2 text-white";
      case "REJECTED": return "bg-chart-3 border-chart-3 text-white";
      case "PENDING": return "bg-chart-4 border-chart-4 text-white";
      case "DRAFT": return "bg-muted border-muted text-foreground";
      default: return "bg-muted border-muted text-foreground";
    }
  };

  const getVoteIcon = (vote: string) => {
    switch (vote) {
      case "APPROVE": return <CheckCircle2 className="h-4 w-4 text-chart-2" />;
      case "REJECT": return <XCircle className="h-4 w-4 text-chart-3" />;
      case "ABSTAIN": return <MinusCircle className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const approveCount = proposalVotes.filter(v => v.vote === "APPROVE").length;
  const rejectCount = proposalVotes.filter(v => v.vote === "REJECT").length;
  const abstainCount = proposalVotes.filter(v => v.vote === "ABSTAIN").length;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 animate-pulse rounded-full bg-primary/20 mb-4" />
            <p className="text-lg font-medium text-foreground">Loading proposal...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground">Proposal not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              The proposal you're looking for doesn't exist
            </p>
            <Link href="/proposals">
              <Button variant="outline" className="mt-4" data-testid="button-back-proposals">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Proposals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      <BreadcrumbNav 
        items={[
          { label: "Proposals", href: "/proposals" },
          { label: `${proposal.ticker} - ${proposal.companyName}` }
        ]} 
      />
      
      <div className="flex items-center gap-4 mb-6">
        <Link href="/proposals">
          <Button variant="outline" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Investment Proposal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {proposal.ticker} - {proposal.companyName}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5" data-testid="proposal-tabs">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="research" data-testid="tab-research">Research</TabsTrigger>
          <TabsTrigger value="valuation" data-testid="tab-valuation">Valuation</TabsTrigger>
          <TabsTrigger value="risk" data-testid="tab-risk">Risk & Compliance</TabsTrigger>
          <TabsTrigger value="execution" data-testid="tab-execution">Execution</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 mt-4">
          <div className="pr-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              {/* Header Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl font-bold">{proposal.ticker}</CardTitle>
                        <Badge variant="default" className={`text-sm ${getTypeColor(proposal.proposalType)}`}>
                          {proposal.proposalType}
                        </Badge>
                        <Badge variant="default" className={`text-sm ${getStatusColor(proposal.status)}`}>
                          {proposal.status}
                        </Badge>
                      </div>
                      <p className="text-lg text-foreground">{proposal.companyName}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{proposal.analyst}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatDate(proposal.createdAt, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      Proposed Weight
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                      {proposal.proposedWeight}%
                    </div>
                  </CardContent>
                </Card>

                {proposal.targetPrice && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        Target Price
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-chart-1">
                        ${parseFloat(proposal.targetPrice).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Investment Thesis, Catalysts, Risks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Investment Thesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proposal.thesis ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {proposal.thesis}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No thesis provided</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-chart-2" />
                    Key Catalysts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proposal.catalysts && proposal.catalysts.length > 0 ? (
                    <ul className="space-y-3">
                      {proposal.catalysts.map((catalyst, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 rounded-md bg-chart-2/5 border border-chart-2/20">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-2/20 shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-chart-2">{index + 1}</span>
                          </div>
                          <span className="text-sm text-foreground leading-relaxed flex-1">{catalyst}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No catalysts specified</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-chart-3" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proposal.risks && proposal.risks.length > 0 ? (
                    <ul className="space-y-3">
                      {proposal.risks.map((risk, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 rounded-md bg-chart-3/5 border border-chart-3/20">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-3/20 shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-chart-3">{index + 1}</span>
                          </div>
                          <span className="text-sm text-foreground leading-relaxed flex-1">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No risks specified</p>
                  )}
                </CardContent>
              </Card>

              {/* Voting Results */}
              {proposalVotes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Voting Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-6 p-4 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-chart-2" />
                          <span className="text-sm font-medium text-foreground">
                            {approveCount} Approve
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-chart-3" />
                          <span className="text-sm font-medium text-foreground">
                            {rejectCount} Reject
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MinusCircle className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {abstainCount} Abstain
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-foreground">Individual Votes</h5>
                        {proposalVotes.map((vote) => (
                          <div key={vote.id} className="flex items-start gap-3 p-3 rounded-md border">
                            <div className="shrink-0 mt-0.5">
                              {getVoteIcon(vote.vote)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-foreground">{vote.voterName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {vote.voterRole}
                                </Badge>
                              </div>
                              {vote.comment && (
                                <p className="text-xs text-muted-foreground">{vote.comment}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Research Tab */}
            <TabsContent value="research" className="space-y-6 mt-0">
              {researchBrief ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Search className="h-5 w-5" />
                          Research Brief
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Generated {formatDate(researchBrief.generatedAt, 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Link href="/research-brief">
                        <Button variant="outline" size="sm" data-testid="link-all-research">
                          View All Research
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResearchBriefDisplay data={researchBrief.response} />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium text-foreground">No research brief available</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Generate a research brief for {ticker} to see company analysis, key metrics, and investment recommendations
                    </p>
                    <Link href="/research-brief">
                      <Button className="mt-4" data-testid="button-generate-research">
                        Generate Research Brief
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {quantAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Quantitative Analysis
                    </CardTitle>
                    <CardDescription>
                      Generated {formatDate(quantAnalysis.generatedAt, 'MMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QuantAnalysisDisplay data={quantAnalysis.response} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Valuation Tab */}
            <TabsContent value="valuation" className="space-y-6 mt-0">
              {dcfModel ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          DCF Valuation Model
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Generated {formatDate(dcfModel.generatedAt, 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Link href="/financial-model">
                        <Button variant="outline" size="sm" data-testid="link-all-models">
                          View All Models
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DCFModelDisplay data={dcfModel.response} />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <DollarSign className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium text-foreground">No valuation model available</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Generate a DCF model for {ticker} to see Bull/Base/Bear scenarios, target prices, and key assumptions
                    </p>
                    <Link href="/financial-model">
                      <Button className="mt-4" data-testid="button-generate-dcf">
                        Generate DCF Model
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Risk & Compliance Tab */}
            <TabsContent value="risk" className="space-y-6 mt-0">
              {riskAnalysis ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-chart-3" />
                          Risk Analysis
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Generated {formatDate(riskAnalysis.generatedAt, 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Link href="/risk-analysis">
                        <Button variant="outline" size="sm" data-testid="link-all-risk">
                          View All Risk Reports
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RiskAnalysisDisplay data={riskAnalysis.response} />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium text-foreground">No risk analysis available</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Generate a contrarian risk analysis for {ticker} to see bear case arguments and key concerns
                    </p>
                    <Link href="/risk-analysis">
                      <Button className="mt-4" data-testid="button-generate-risk">
                        Generate Risk Analysis
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {complianceCheck && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Compliance Check
                    </CardTitle>
                    <CardDescription>
                      Generated {formatDate(complianceCheck.generatedAt, 'MMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ComplianceReportDisplay data={complianceCheck.response} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Execution Tab */}
            <TabsContent value="execution" className="space-y-6 mt-0">
              {proposal.status === 'APPROVED' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Execution Status
                    </CardTitle>
                    <CardDescription>
                      Trade execution and post-approval workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Execution tools available for approved proposals
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" data-testid="button-generate-trade-order">
                          Generate Trade Order
                        </Button>
                        <Button variant="outline" data-testid="button-generate-risk-report">
                          Generate Risk Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Send className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium text-foreground">Awaiting Approval</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Execution tools will be available after this proposal is approved
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
