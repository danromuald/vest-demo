import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, Calendar, Users, FileText, Clock, CheckCircle2, XCircle, 
  MinusCircle, TrendingUp, AlertTriangle, Target, DollarSign, LineChart 
} from "lucide-react";
import { format } from "date-fns";
import type { ICMeeting, Proposal, Vote, AgentResponse } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { useState } from "react";

export default function ICMeetingDetailPage() {
  const [, params] = useRoute("/ic-meeting/:id");
  const meetingId = params?.id;
  const { toast } = useToast();
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const { data: meetings = [], isLoading: isLoadingMeetings } = useQuery<ICMeeting[]>({
    queryKey: ['/api/ic-meetings'],
  });

  const { data: allProposals = [] } = useQuery<Proposal[]>({
    queryKey: ['/api/proposals'],
  });

  const { data: agentResponses = [] } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  const meeting = meetings.find(m => m.id === meetingId);
  const meetingProposals = allProposals.filter(p => p.icMeetingId === meetingId);
  const selectedProposal = meetingProposals.find(p => p.id === selectedProposalId);
  
  // Fetch votes for selected proposal
  const { data: votes = [] } = useQuery<Vote[]>({
    queryKey: ['/api/votes', selectedProposalId],
    queryFn: selectedProposalId 
      ? async () => {
          const res = await fetch(`/api/votes/${selectedProposalId}`);
          if (!res.ok) throw new Error('Failed to fetch votes');
          return res.json();
        }
      : undefined,
    enabled: !!selectedProposalId,
  });

  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ICMeeting> }) => {
      const res = await fetch(`/api/ic-meetings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ic-meetings'] });
      // If meeting is completed, invalidate proposals to show updated statuses
      if (variables.updates.status === 'COMPLETED') {
        queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      }
      toast({
        title: "Meeting updated",
        description: "IC meeting status has been updated successfully.",
      });
    },
  });

  const castVoteMutation = useMutation({
    mutationFn: async (voteData: {
      proposalId: string;
      voterName: string;
      voterRole: string;
      vote: 'APPROVE' | 'REJECT' | 'ABSTAIN';
      comment?: string;
    }) => {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteData),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/votes', selectedProposalId] });
      toast({
        title: "Vote cast successfully",
        description: "Your vote has been recorded.",
      });
    },
  });

  if (isLoadingMeetings) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 animate-pulse rounded-full bg-primary/20 mb-4" />
            <p className="text-lg font-medium text-foreground">Loading meeting details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground">Meeting not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              The meeting you're looking for doesn't exist
            </p>
            <Link href="/ic-meeting">
              <Button variant="default" className="mt-4" data-testid="button-back-to-meetings">
                Back to IC Meetings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors = {
    'SCHEDULED': 'bg-chart-4 border-chart-4 text-white',
    'IN_PROGRESS': 'bg-chart-1 border-chart-1 text-white',
    'COMPLETED': 'bg-muted border-muted text-foreground',
  };

  const getVoteIcon = (vote: string) => {
    switch (vote) {
      case "APPROVE": return <CheckCircle2 className="h-4 w-4 text-chart-2" />;
      case "REJECT": return <XCircle className="h-4 w-4 text-chart-3" />;
      case "ABSTAIN": return <MinusCircle className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      <BreadcrumbNav 
        items={[
          { label: "IC Meeting", href: "/ic-meeting" },
          { label: format(new Date(meeting.meetingDate), 'MMM d, yyyy') }
        ]} 
      />
      
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ic-meeting">
          <Button variant="outline" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Investment Committee Meeting</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(meeting.meetingDate), 'MMMM d, yyyy h:mm a')}
          </p>
        </div>
        <Badge variant="outline" className={statusColors[meeting.status as keyof typeof statusColors]}>
          {meeting.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-1/10">
                <Calendar className="h-5 w-5 text-chart-1" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Meeting Date</div>
                <div className="font-semibold text-foreground">
                  {format(new Date(meeting.meetingDate), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10">
                <Users className="h-5 w-5 text-chart-2" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Attendees</div>
                <div className="font-semibold text-foreground">{meeting.attendees?.length || 0} members</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-3/10">
                <FileText className="h-5 w-5 text-chart-3" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Proposals</div>
                <div className="font-semibold text-foreground">{meetingProposals.length} items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {meeting.status === 'SCHEDULED' && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Meeting is scheduled</p>
                  <p className="text-sm text-muted-foreground">Start the meeting to begin voting and discussion</p>
                </div>
              </div>
              <Button
                variant="default"
                onClick={() => updateMeetingMutation.mutate({ 
                  id: meeting.id, 
                  updates: { status: 'IN_PROGRESS' } 
                })}
                data-testid="button-start-meeting"
              >
                Start Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {meeting.status === 'IN_PROGRESS' && (
        <Card className="mb-6 border-chart-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-chart-1 animate-pulse" />
                <div>
                  <p className="font-medium text-foreground">Meeting in progress</p>
                  <p className="text-sm text-muted-foreground">Cast your votes and complete when ready</p>
                </div>
              </div>
              <Button
                variant="default"
                onClick={() => updateMeetingMutation.mutate({ 
                  id: meeting.id, 
                  updates: { status: 'COMPLETED' } 
                })}
                data-testid="button-complete-meeting"
              >
                Complete Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposals Under Review
          </CardTitle>
          <CardDescription>
            {meetingProposals.length} proposal{meetingProposals.length !== 1 ? 's' : ''} scheduled for this meeting
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {meetingProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">No proposals scheduled</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add proposals to this meeting to begin review
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetingProposals.map((proposal) => {
                const proposalVotes = votes.filter(v => v.proposalId === proposal.id);
                const approveCount = proposalVotes.filter(v => v.vote === "APPROVE").length;
                const rejectCount = proposalVotes.filter(v => v.vote === "REJECT").length;
                const abstainCount = proposalVotes.filter(v => v.vote === "ABSTAIN").length;
                
                return (
                  <Card key={proposal.id} className="hover-elevate cursor-pointer" onClick={() => setSelectedProposalId(proposal.id)}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{proposal.ticker}</h3>
                            <Badge variant="outline" className={
                              proposal.proposalType === 'BUY' ? 'bg-chart-2 text-white border-chart-2' :
                              proposal.proposalType === 'SELL' ? 'bg-chart-3 text-white border-chart-3' :
                              'bg-chart-4 text-white border-chart-4'
                            }>
                              {proposal.proposalType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{proposal.companyName}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Target Price</div>
                          <div className="font-semibold text-chart-2">
                            {proposal.targetPrice ? `$${parseFloat(proposal.targetPrice as any).toFixed(2)}` : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Investment Thesis</div>
                          <p className="text-sm text-foreground line-clamp-2">{proposal.thesis}</p>
                        </div>

                        {proposalVotes.length > 0 && (
                          <div className="flex items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-chart-2" />
                              <span className="text-sm font-medium text-chart-2">{approveCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-chart-3" />
                              <span className="text-sm font-medium text-chart-3">{rejectCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MinusCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">{abstainCount}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inline Proposal Detail Dialog */}
      <Dialog open={!!selectedProposal} onOpenChange={(open) => !open && setSelectedProposalId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl font-bold">{selectedProposal?.ticker}</span>
              <Badge variant="outline" className={
                selectedProposal?.proposalType === 'BUY' ? 'bg-chart-2 text-white border-chart-2' :
                selectedProposal?.proposalType === 'SELL' ? 'bg-chart-3 text-white border-chart-3' :
                'bg-chart-4 text-white border-chart-4'
              }>
                {selectedProposal?.proposalType}
              </Badge>
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedProposal?.companyName}</p>
          </DialogHeader>

          {selectedProposal && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="research">Research</TabsTrigger>
                <TabsTrigger value="voting">Voting</TabsTrigger>
                <TabsTrigger value="action">Cast Vote</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-chart-1" />
                      Investment Thesis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">{selectedProposal.thesis}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-chart-2" />
                        Key Catalysts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(selectedProposal.catalysts || []).map((catalyst, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-chart-2 mt-1">•</span>
                            <span className="text-foreground flex-1">{catalyst}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-chart-3" />
                        Key Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(selectedProposal.risks || []).map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-chart-3 mt-1">•</span>
                            <span className="text-foreground flex-1">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-chart-1" />
                      Financial Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground">Target Price</div>
                        <div className="text-lg font-semibold text-chart-2">
                          {selectedProposal.targetPrice ? `$${parseFloat(selectedProposal.targetPrice as any).toFixed(2)}` : 'N/A'}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground">Proposed Weight</div>
                        <div className="text-lg font-semibold text-foreground">
                          {selectedProposal.proposedWeight ? `${parseFloat(selectedProposal.proposedWeight as any).toFixed(2)}%` : 'N/A'}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground">Analyst</div>
                        <div className="text-lg font-semibold text-foreground">
                          {selectedProposal.analyst || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="research" className="space-y-4 mt-4">
                {(() => {
                  const researchBrief = agentResponses
                    .filter(r => r.agentType === 'RESEARCH_SYNTHESIZER' && r.ticker === selectedProposal.ticker)
                    .sort((a, b) => new Date(b.generatedAt || 0).getTime() - new Date(a.generatedAt || 0).getTime())[0];
                  
                  if (!researchBrief) {
                    return (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                          <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                          <p className="text-lg font-medium text-foreground">No research available</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Generate a research brief for {selectedProposal.ticker}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  }

                  const briefData = researchBrief.response as any;
                  return (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-chart-1" />
                            Executive Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-foreground leading-relaxed">{briefData.summary}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <LineChart className="h-5 w-5 text-chart-1" />
                            Key Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-md bg-muted/50">
                              <div className="text-xs text-muted-foreground mb-1">Revenue</div>
                              <div className="font-semibold text-foreground">{briefData.keyMetrics?.revenue || 'N/A'}</div>
                            </div>
                            <div className="p-3 rounded-md bg-muted/50">
                              <div className="text-xs text-muted-foreground mb-1">Growth</div>
                              <div className="font-semibold text-foreground">{briefData.keyMetrics?.growth || 'N/A'}</div>
                            </div>
                            <div className="p-3 rounded-md bg-muted/50">
                              <div className="text-xs text-muted-foreground mb-1">Margins</div>
                              <div className="font-semibold text-foreground">{briefData.keyMetrics?.margins || 'N/A'}</div>
                            </div>
                            <div className="p-3 rounded-md bg-muted/50">
                              <div className="text-xs text-muted-foreground mb-1">Valuation</div>
                              <div className="font-semibold text-foreground">{briefData.keyMetrics?.valuation || 'N/A'}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </TabsContent>

              <TabsContent value="voting" className="space-y-4 mt-4">
                {(() => {
                  const proposalVotes = votes.filter(v => v.proposalId === selectedProposal.id);
                  
                  if (proposalVotes.length === 0) {
                    return (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                          <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                          <p className="text-lg font-medium text-foreground">No votes cast yet</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Be the first to vote on this proposal
                          </p>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {proposalVotes.map((vote) => (
                        <Card key={vote.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              {getVoteIcon(vote.vote)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-foreground">{vote.voterName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {vote.voterRole}
                                  </Badge>
                                  <Badge variant="outline" className={
                                    vote.vote === 'APPROVE' ? 'bg-chart-2/10 text-chart-2 border-chart-2/20' :
                                    vote.vote === 'REJECT' ? 'bg-chart-3/10 text-chart-3 border-chart-3/20' :
                                    'bg-muted text-muted-foreground'
                                  }>
                                    {vote.vote}
                                  </Badge>
                                </div>
                                {vote.comment && (
                                  <p className="text-sm text-muted-foreground mt-2">{vote.comment}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()}
              </TabsContent>

              <TabsContent value="action" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cast Your Vote</CardTitle>
                    <CardDescription>Vote on this investment proposal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto flex-col gap-2 py-4 hover:bg-chart-2/10 hover:border-chart-2"
                        onClick={() => castVoteMutation.mutate({
                          proposalId: selectedProposal.id,
                          voterName: 'Sarah Chen',
                          voterRole: 'Technology Analyst',
                          vote: 'APPROVE',
                          comment: 'Strong fundamental thesis with clear catalysts'
                        })}
                        data-testid="button-vote-approve"
                      >
                        <CheckCircle2 className="h-6 w-6 text-chart-2" />
                        <span className="font-medium">Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col gap-2 py-4 hover:bg-chart-3/10 hover:border-chart-3"
                        onClick={() => castVoteMutation.mutate({
                          proposalId: selectedProposal.id,
                          voterName: 'Sarah Chen',
                          voterRole: 'Technology Analyst',
                          vote: 'REJECT',
                          comment: 'Concerns about valuation and market timing'
                        })}
                        data-testid="button-vote-reject"
                      >
                        <XCircle className="h-6 w-6 text-chart-3" />
                        <span className="font-medium">Reject</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col gap-2 py-4 hover:bg-muted/50"
                        onClick={() => castVoteMutation.mutate({
                          proposalId: selectedProposal.id,
                          voterName: 'Sarah Chen',
                          voterRole: 'Technology Analyst',
                          vote: 'ABSTAIN',
                          comment: 'Require additional analysis before voting'
                        })}
                        data-testid="button-vote-abstain"
                      >
                        <MinusCircle className="h-6 w-6 text-muted-foreground" />
                        <span className="font-medium">Abstain</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
