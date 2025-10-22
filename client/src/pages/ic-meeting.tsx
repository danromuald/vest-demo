import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentPanel } from "@/components/agent-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Check, X, Minus, TrendingUp, Shield, BarChart3, FileText, ChevronRight } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import type { ICMeeting as ICMeetingType, Proposal, WorkflowStageRecord } from "@shared/schema";

export default function ICMeeting() {
  const { toast } = useToast();
  const [contrarianAnalysis, setContrarianAnalysis] = useState<any>(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState<any>(null);
  const [votes, setVotes] = useState<{ name: string; vote: 'APPROVE' | 'REJECT' | 'ABSTAIN' }[]>([]);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Fetch IC meetings
  const { data: meetings = [] } = useQuery<ICMeetingType[]>({
    queryKey: ['/api/ic-meetings'],
  });

  // Fetch proposals
  const { data: allProposals = [] } = useQuery<Proposal[]>({
    queryKey: ['/api/proposals'],
  });

  // Fetch workflow stages to find proposals at IC_MEETING stage
  const { data: workflowStages = [] } = useQuery<WorkflowStageRecord[]>({
    queryKey: ['/api/workflow-stages'],
  });

  // Filter proposals at IC_MEETING stage
  const icProposals = allProposals.filter(proposal => {
    const stage = workflowStages.find(s => 
      s.entityId === proposal.id && 
      s.entityType === 'PROPOSAL' && 
      s.currentStage === 'IC_MEETING'
    );
    return stage !== undefined;
  });

  // Use first scheduled or in-progress meeting
  useEffect(() => {
    const activeMeeting = meetings.find(m => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS');
    if (activeMeeting) {
      setMeetingId(activeMeeting.id);
    }
  }, [meetings]);

  // Auto-select first IC proposal if none selected
  useEffect(() => {
    if (icProposals.length > 0 && !selectedProposal) {
      setSelectedProposal(icProposals[0]);
    }
  }, [icProposals, selectedProposal]);

  // WebSocket connection for real-time collaboration
  const { isConnected, lastMessage, sendMessage } = useWebSocket("/ws");

  // Join meeting room when meeting ID is available
  useEffect(() => {
    if (meetingId && isConnected) {
      sendMessage({
        type: "join_meeting",
        meetingId,
      });
    }

    return () => {
      if (meetingId && isConnected) {
        sendMessage({
          type: "leave_meeting",
          meetingId,
        });
      }
    };
  }, [meetingId, isConnected, sendMessage]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "vote_cast":
        const vote = lastMessage.vote;
        setVotes(prev => {
          const filtered = prev.filter(v => v.name !== vote.voterName);
          return [...filtered, { name: vote.voterName, vote: vote.vote }];
        });
        toast({
          title: "Vote Cast",
          description: `${vote.voterName} voted ${vote.vote}`,
        });
        break;

      case "agent_response":
        if (lastMessage.agentType === "contrarian") {
          setContrarianAnalysis(lastMessage.result);
        }
        break;

      case "agent_started":
        toast({
          title: "Agent Started",
          description: `${lastMessage.agentType} analysis in progress...`,
        });
        break;
    }
  }, [lastMessage, toast]);

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
    if (meetingId && isConnected) {
      // Send vote via WebSocket for real-time updates
      sendMessage({
        type: "cast_vote",
        meetingId,
        vote: {
          proposalId: "mock-proposal-id", // In real app, would be from selected proposal
          voterName,
          voterRole: "Committee Member",
          vote,
        },
      });
    } else {
      // Fallback to local state if WebSocket not connected
      setVotes(prev => {
        const filtered = prev.filter(v => v.name !== voterName);
        return [...filtered, { name: voterName, vote }];
      });
    }
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

      {/* Proposals Under Consideration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposals for Review
          </CardTitle>
          <CardDescription>
            {icProposals.length} proposal{icProposals.length !== 1 ? 's' : ''} scheduled for IC review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {icProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">No proposals under review</p>
              <p className="text-xs text-muted-foreground mt-1">Proposals will appear here when advanced to IC Meeting stage</p>
            </div>
          ) : (
            <div className="space-y-2">
              {icProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  onClick={() => setSelectedProposal(proposal)}
                  className={`flex items-center gap-4 rounded-md border p-4 cursor-pointer transition-colors ${
                    selectedProposal?.id === proposal.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover-elevate'
                  }`}
                  data-testid={`card-proposal-${proposal.ticker}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold text-foreground">{proposal.ticker}</span>
                      <Badge variant={proposal.proposalType === 'BUY' ? 'default' : proposal.proposalType === 'SELL' ? 'destructive' : 'secondary'}>
                        {proposal.proposalType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {proposal.proposedWeight}% Weight
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{proposal.companyName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Analyst: {proposal.analyst}</p>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${selectedProposal?.id === proposal.id ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Proposal */}
      {selectedProposal && (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-xl font-semibold">
              {selectedProposal.ticker} {selectedProposal.proposalType} Recommendation
            </CardTitle>
            <CardDescription>{selectedProposal.analyst} • {selectedProposal.companyName}</CardDescription>
          </div>
          <Badge variant={selectedProposal.status === 'PENDING' ? 'default' : 'outline'} className="bg-chart-4/10 text-chart-4 border-chart-4/20">
            {selectedProposal.status}
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
                  {selectedProposal.proposalType} {selectedProposal.companyName} at {selectedProposal.proposedWeight}% portfolio weight
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Investment Thesis</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedProposal.thesis}
                </p>
              </div>
              {selectedProposal.targetPrice && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Target Price</h4>
                  <div className="rounded-md bg-muted/50 p-3 inline-block">
                    <p className="text-xs text-muted-foreground">Price Target</p>
                    <p className="text-lg font-mono font-semibold text-primary">${selectedProposal.targetPrice}</p>
                  </div>
                </div>
              )}
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
              {selectedProposal.risks && selectedProposal.risks.length > 0 ? (
                <ul className="space-y-2">
                  {selectedProposal.risks.map((risk: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <Shield className="h-4 w-4 text-chart-3 mt-0.5" />
                      {risk}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No risks specified</p>
              )}
            </TabsContent>
            <TabsContent value="catalysts" className="pt-4">
              {selectedProposal.catalysts && selectedProposal.catalysts.length > 0 ? (
                <ul className="space-y-2">
                  {selectedProposal.catalysts.map((catalyst: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <TrendingUp className="h-4 w-4 text-chart-2 mt-0.5" />
                      {catalyst}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No catalysts specified</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      )}

      {/* In-Session AI Agents */}
      {selectedProposal && (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AgentPanel
          agentName="Contrarian Agent"
          description="Generates structured bear case analysis and identifies potential downside scenarios"
          isGenerating={contrarianMutation.isPending}
          response={contrarianAnalysis}
          onInvoke={() => contrarianMutation.mutate(selectedProposal.ticker)}
        />

        <AgentPanel
          agentName="Scenario Simulator"
          description="Analyzes portfolio impact, risk metrics, and tracking error implications"
          isGenerating={scenarioMutation.isPending}
          response={scenarioAnalysis}
          onInvoke={() => scenarioMutation.mutate({ ticker: selectedProposal.ticker, proposedWeight: parseFloat(selectedProposal.proposedWeight) })}
        />
      </div>
      )}

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
