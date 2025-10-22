import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentPanel } from "@/components/agent-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Check, X, Minus, TrendingUp, Shield, BarChart3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ICMeeting() {
  const [contrarianAnalysis, setContrarianAnalysis] = useState<any>(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState<any>(null);
  const [votes, setVotes] = useState<{ name: string; vote: 'APPROVE' | 'REJECT' | 'ABSTAIN' }[]>([]);

  const contrarianMutation = useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiRequest('POST', '/api/agents/contrarian', { ticker });
      return response;
    },
    onSuccess: (data) => {
      setContrarianAnalysis(data);
    },
  });

  const scenarioMutation = useMutation({
    mutationFn: async (data: { ticker: string; proposedWeight: number }) => {
      const response = await apiRequest('POST', '/api/agents/scenario-simulator', data);
      return response;
    },
    onSuccess: (data) => {
      setScenarioAnalysis(data);
    },
  });

  const handleVote = (voterName: string, vote: 'APPROVE' | 'REJECT' | 'ABSTAIN') => {
    setVotes(prev => {
      const filtered = prev.filter(v => v.name !== voterName);
      return [...filtered, { name: voterName, vote }];
    });
  };

  const voteCount = {
    approve: votes.filter(v => v.vote === 'APPROVE').length,
    reject: votes.filter(v => v.vote === 'REJECT').length,
    abstain: votes.filter(v => v.vote === 'ABSTAIN').length,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
          Investment Committee Meeting
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time proposal review, analysis, and voting
        </p>
      </div>

      {/* Current Proposal */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-xl font-semibold">Active Proposal: NVDA Buy Recommendation</CardTitle>
            <CardDescription>Sarah Chen • Technology Sector • February 22, 2025</CardDescription>
          </div>
          <Badge variant="default" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
            Under Review
          </Badge>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="thesis" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="thesis" data-testid="tab-thesis">Investment Thesis</TabsTrigger>
              <TabsTrigger value="financials" data-testid="tab-financials">Financials</TabsTrigger>
              <TabsTrigger value="risks" data-testid="tab-risks">Risks</TabsTrigger>
              <TabsTrigger value="catalysts" data-testid="tab-catalysts">Catalysts</TabsTrigger>
            </TabsList>
            <TabsContent value="thesis" className="space-y-3 pt-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Proposed Action</h4>
                <p className="text-sm text-muted-foreground">
                  Buy 137,450 shares of NVIDIA at 3.0% portfolio weight
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Investment Thesis</h4>
                <p className="text-sm text-muted-foreground">
                  NVIDIA is the dominant player in AI computing infrastructure with 85% market share in datacenter GPUs. 
                  The company is experiencing explosive growth driven by generative AI adoption across enterprises. 
                  H100/H200 GPUs remain supply-constrained with 6-9 month lead times, indicating robust demand.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Valuation</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Current Price</p>
                    <p className="text-lg font-mono font-semibold text-foreground">$875.50</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Base Target</p>
                    <p className="text-lg font-mono font-semibold text-primary">$1,050</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Upside</p>
                    <p className="text-lg font-mono font-semibold text-chart-2">+19.9%</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="financials" className="pt-4">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Revenue Growth</p>
                  <p className="text-lg font-mono font-semibold text-foreground">+126% YoY</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Gross Margin</p>
                  <p className="text-lg font-mono font-semibold text-foreground">74.0%</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">P/E Ratio</p>
                  <p className="text-lg font-mono font-semibold text-foreground">32.1x</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">FCF Yield</p>
                  <p className="text-lg font-mono font-semibold text-foreground">2.8%</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="risks" className="pt-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-foreground">
                  <Shield className="h-4 w-4 text-chart-3 mt-0.5" />
                  Customer concentration risk (Microsoft, Meta, Google represent 55% of datacenter revenue)
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground">
                  <Shield className="h-4 w-4 text-chart-3 mt-0.5" />
                  Competition from AMD, Intel, and custom silicon from hyperscalers
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground">
                  <Shield className="h-4 w-4 text-chart-3 mt-0.5" />
                  Valuation multiple compression if AI investment cycle decelerates
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="catalysts" className="pt-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-foreground">
                  <TrendingUp className="h-4 w-4 text-chart-2 mt-0.5" />
                  Blackwell GPU architecture launch (Q2 2025) with 2.5x performance improvement
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground">
                  <TrendingUp className="h-4 w-4 text-chart-2 mt-0.5" />
                  Sovereign AI infrastructure buildout across Europe and Asia
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground">
                  <TrendingUp className="h-4 w-4 text-chart-2 mt-0.5" />
                  Expanding software and services revenue (CUDA ecosystem)
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* In-Session AI Agents */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AgentPanel
          agentName="Contrarian Agent"
          description="Generates structured bear case analysis and identifies potential downside scenarios"
          isGenerating={contrarianMutation.isPending}
          response={contrarianAnalysis}
          onInvoke={() => contrarianMutation.mutate('NVDA')}
        />

        <AgentPanel
          agentName="Scenario Simulator"
          description="Analyzes portfolio impact, risk metrics, and tracking error implications"
          isGenerating={scenarioMutation.isPending}
          response={scenarioAnalysis}
          onInvoke={() => scenarioMutation.mutate({ ticker: 'NVDA', proposedWeight: 3.0 })}
        />
      </div>

      {/* Contrarian Analysis Display */}
      {contrarianAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-chart-3" />
              Bear Case Analysis
            </CardTitle>
            <CardDescription>Alternative perspectives and downside scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Bear Case Summary</h4>
              <p className="text-sm text-foreground">{contrarianAnalysis.bearCase}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Historical Precedents</h4>
              <ul className="space-y-1">
                {contrarianAnalysis.historicalPrecedents?.map((precedent: string, i: number) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    {precedent}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-chart-3/5 p-3 border border-chart-3/20">
                <p className="text-xs text-muted-foreground">Downside Price</p>
                <p className="text-xl font-mono font-semibold text-chart-3">{contrarianAnalysis.quantifiedDownside}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Probability</p>
                <p className="text-xl font-mono font-semibold text-foreground">{contrarianAnalysis.probabilityAssessment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Analysis Display */}
      {scenarioAnalysis && scenarioAnalysis.currentPortfolio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Portfolio Impact Analysis
            </CardTitle>
            <CardDescription>Before and after risk metrics comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-md border border-border p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Current Portfolio</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tracking Error</span>
                    <span className="text-sm font-mono font-medium text-foreground">
                      {scenarioAnalysis.currentPortfolio.trackingError}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Concentration</span>
                    <span className="text-sm font-mono font-medium text-foreground">
                      {scenarioAnalysis.currentPortfolio.concentration}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                <h4 className="text-sm font-medium text-primary mb-3">Projected Portfolio (with NVDA @ 3.0%)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tracking Error</span>
                    <span className="text-sm font-mono font-medium text-foreground">
                      {scenarioAnalysis.projectedPortfolio.trackingError}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Concentration</span>
                    <span className="text-sm font-mono font-medium text-foreground">
                      {scenarioAnalysis.projectedPortfolio.concentration}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {scenarioAnalysis.riskMetrics && (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-muted/50 p-3">
                {scenarioAnalysis.riskMetrics.withinLimits ? (
                  <>
                    <Check className="h-4 w-4 text-chart-2" />
                    <span className="text-sm font-medium text-chart-2">Within Risk Limits</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-chart-3" />
                    <span className="text-sm font-medium text-chart-3">Risk Limit Exceeded</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Voting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Committee Vote
          </CardTitle>
          <CardDescription>Investment Committee members cast their votes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { name: 'Michael Torres', role: 'CIO' },
              { name: 'Rebecca Zhang', role: 'Growth PM' },
              { name: 'Jonathan Price', role: 'Value PM' },
              { name: 'Katherine Lee', role: 'IC Admin' },
            ].map((member) => {
              const memberVote = votes.find(v => v.name === member.name);
              return (
                <div key={member.name} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={memberVote?.vote === 'APPROVE' ? 'default' : 'outline'}
                      onClick={() => handleVote(member.name, 'APPROVE')}
                      className={memberVote?.vote === 'APPROVE' ? 'bg-chart-2 hover:bg-chart-2/90 text-white border-chart-2' : ''}
                      data-testid={`button-vote-approve-${member.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant={memberVote?.vote === 'REJECT' ? 'default' : 'outline'}
                      onClick={() => handleVote(member.name, 'REJECT')}
                      className={memberVote?.vote === 'REJECT' ? 'bg-chart-3 hover:bg-chart-3/90 text-white border-chart-3' : ''}
                      data-testid={`button-vote-reject-${member.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant={memberVote?.vote === 'ABSTAIN' ? 'default' : 'outline'}
                      onClick={() => handleVote(member.name, 'ABSTAIN')}
                      data-testid={`button-vote-abstain-${member.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <Minus className="h-4 w-4" />
                      Abstain
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {votes.length === 4 && (
            <div className="rounded-md bg-primary/5 border border-primary/20 p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Vote Tally</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-chart-2 text-white border-chart-2">
                    {voteCount.approve} Approve
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-chart-3 text-white border-chart-3">
                    {voteCount.reject} Reject
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {voteCount.abstain} Abstain
                  </Badge>
                </div>
              </div>
              {voteCount.approve > voteCount.reject && (
                <p className="text-sm font-medium text-chart-2 mt-3">
                  ✓ Proposal APPROVED ({voteCount.approve}-{voteCount.reject}-{voteCount.abstain})
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
