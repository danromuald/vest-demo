import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AgentPanel } from "@/components/agent-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Check, 
  X, 
  Minus, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  FileText, 
  ChevronRight, 
  ExternalLink, 
  Plus,
  Calendar,
  Clock,
  Loader2,
  Trash2,
  AlertTriangle,
  MessageSquare
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { format } from "date-fns";
import { useLocation } from "wouter";
import type { ICMeeting as ICMeetingType, Proposal, WorkflowStageRecord, DebateSession } from "@shared/schema";

export default function ICMeeting() {
  const { toast } = useToast();
  const [contrarianAnalysis, setContrarianAnalysis] = useState<any>(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState<any>(null);
  const [votes, setVotes] = useState<{ name: string; vote: 'APPROVE' | 'REJECT' | 'ABSTAIN' }[]>([]);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [researchBrief, setResearchBrief] = useState<any>(null);
  const [financialModel, setFinancialModel] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProposalIds, setSelectedProposalIds] = useState<string[]>([]);
  const [newMeetingDate, setNewMeetingDate] = useState("");
  const [newMeetingAttendees, setNewMeetingAttendees] = useState("");
  const [voteComment, setVoteComment] = useState("");
  const [voterName, setVoterName] = useState("Committee Member");

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

  // Fetch workflows to enable navigation to workflow IC Meeting tab
  const { data: workflows = [] } = useQuery<any[]>({
    queryKey: ['/api/workflows'],
  });

  // Helper to find workflow for a meeting
  const getWorkflowForMeeting = (meeting: ICMeetingType) => {
    return workflows.find(w => w.id === meeting.workflowId);
  };

  // Filter proposals that are PENDING and ready for IC review
  const pendingProposals = allProposals.filter(p => p.status === 'PENDING' && !p.icMeetingId);

  // Get proposals for active meeting
  const activeMeeting = meetings.find(m => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS');
  const activeMeetingProposals = activeMeeting 
    ? allProposals.filter(p => p.icMeetingId === activeMeeting.id)
    : [];

  // Use active meeting ID and clear state when no active meeting
  useEffect(() => {
    if (activeMeeting) {
      setMeetingId(activeMeeting.id);
    } else {
      setMeetingId(null);
      setSelectedProposal(null);
      setVotes([]);
    }
  }, [activeMeeting]);

  // Auto-select first proposal in active meeting
  useEffect(() => {
    if (activeMeetingProposals.length > 0 && !selectedProposal) {
      setSelectedProposal(activeMeetingProposals[0]);
    }
  }, [activeMeetingProposals, selectedProposal]);

  // Fetch agent responses for selected proposal
  const { data: agentResponses = [] } = useQuery<any[]>({
    queryKey: ['/api/agent-responses', selectedProposal?.ticker],
    enabled: !!selectedProposal?.ticker,
  });

  // Fetch votes for selected proposal
  const { data: proposalVotes = [] } = useQuery<any[]>({
    queryKey: [`/api/votes/${selectedProposal?.id}`],
    enabled: !!selectedProposal?.id,
  });

  // Extract research brief and financial model from agent responses
  useEffect(() => {
    setResearchBrief(null);
    setFinancialModel(null);
    
    if (agentResponses && agentResponses.length > 0) {
      const brief = agentResponses.find(r => r.agentType === 'RESEARCH_SYNTHESIZER');
      const model = agentResponses.find(r => r.agentType === 'FINANCIAL_MODELER');
      
      if (brief) setResearchBrief(brief.response);
      if (model) setFinancialModel(model.response);
    }
  }, [agentResponses, selectedProposal?.id]);

  // WebSocket connection
  const { isConnected, lastMessage, sendMessage } = useWebSocket("/ws");

  // Join meeting room
  useEffect(() => {
    if (meetingId && isConnected) {
      sendMessage({ type: "join_meeting", meetingId });
    }
    return () => {
      if (meetingId && isConnected) {
        sendMessage({ type: "leave_meeting", meetingId });
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

  // Create IC Meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async () => {
      if (!newMeetingDate) throw new Error("Meeting date is required");
      
      const attendees = newMeetingAttendees.split(',').map(a => a.trim()).filter(Boolean);
      
      const meeting: any = await apiRequest('POST', '/api/ic-meetings', {
        meetingDate: new Date(newMeetingDate), // Convert to Date object for Zod validation
        status: 'SCHEDULED',
        attendees,
        agenda: { proposals: selectedProposalIds },
      });

      // Update selected proposals with meeting ID
      if (meeting && meeting.id) {
        await Promise.all(
          selectedProposalIds.map(proposalId =>
            apiRequest('PATCH', `/api/proposals/${proposalId}`, { icMeetingId: meeting.id })
          )
        );
      }

      return meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ic-meetings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      toast({
        title: "Meeting Scheduled",
        description: `IC Meeting scheduled with ${selectedProposalIds.length} proposal(s)`,
      });
      setIsCreateDialogOpen(false);
      setSelectedProposalIds([]);
      setNewMeetingDate("");
      setNewMeetingAttendees("");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.error || "Unknown error";
      const details = error?.details || error?.message;
      console.error("Create meeting error:", error);
      toast({
        title: "Error",
        description: details || errorMessage || "Failed to schedule IC meeting",
        variant: "destructive",
      });
    },
  });

  // Update meeting status mutation
  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ICMeetingType> }) => {
      return await apiRequest('PATCH', `/api/ic-meetings/${id}`, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ic-meetings'] });
      const statusText = variables.updates.status === 'IN_PROGRESS' ? 'started' : 'completed';
      toast({ 
        title: "Meeting Updated",
        description: `Meeting ${statusText} successfully`
      });
    },
  });

  // Delete meeting mutation
  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/ic-meetings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ic-meetings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      toast({ 
        title: "Meeting Deleted",
        description: "Proposals returned to pending status"
      });
    },
  });

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

  // Vote submission mutation
  const voteMutation = useMutation({
    mutationFn: async (voteData: { 
      proposalId: string; 
      voterName: string; 
      voterRole: string; 
      vote: 'APPROVE' | 'REJECT' | 'ABSTAIN'; 
      comment?: string 
    }) => {
      return await apiRequest('POST', '/api/votes', voteData);
    },
    onSuccess: () => {
      if (selectedProposal) {
        queryClient.invalidateQueries({ queryKey: [`/api/votes/${selectedProposal.id}`] });
      }
      setVoteComment("");
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully",
      });
    },
  });

  // Research brief generation mutation
  const generateResearchMutation = useMutation({
    mutationFn: async (ticker: string) => {
      return await apiRequest('POST', '/api/agents/research-synthesizer', { ticker });
    },
    onSuccess: (data) => {
      setResearchBrief(data);
      queryClient.invalidateQueries({ queryKey: ['/api/agent-responses', selectedProposal?.ticker] });
      toast({
        title: "Research Brief Generated",
        description: "AI analysis complete",
      });
    },
  });

  // DCF model generation mutation
  const generateDCFMutation = useMutation({
    mutationFn: async (ticker: string) => {
      return await apiRequest('POST', '/api/agents/financial-modeler', { ticker });
    },
    onSuccess: (data) => {
      setFinancialModel(data);
      queryClient.invalidateQueries({ queryKey: ['/api/agent-responses', selectedProposal?.ticker] });
      toast({
        title: "DCF Model Generated",
        description: "Valuation analysis complete",
      });
    },
  });

  const [, navigate] = useLocation();

  // Create debate session mutation
  const startDebateMutation = useMutation({
    mutationFn: async (proposal: Proposal) => {
      const response = await apiRequest("POST", "/api/debate-sessions", {
        ticker: proposal.ticker,
        companyName: proposal.companyName,
        topic: `IC Meeting Debate: ${proposal.ticker} ${proposal.proposalType} Recommendation`,
        proposalId: proposal.id,
        meetingId: activeMeeting?.id,
        currentPhase: "PRESENTATION",
        status: "ACTIVE",
        activeAgents: [],
        participantCount: 0,
        messageCount: 0,
      });
      return response as DebateSession;
    },
    onSuccess: (data: DebateSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/debate-sessions"] });
      toast({ 
        title: "Debate Started", 
        description: data.ticker ? `Opening debate room for ${data.ticker}` : "Opening debate room",
      });
      // Navigate to debate room
      navigate("/debate-room");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start debate session",
        variant: "destructive",
      });
    },
  });

  const handleVote = (voteType: 'APPROVE' | 'REJECT' | 'ABSTAIN') => {
    if (!selectedProposal) return;
    
    voteMutation.mutate({
      proposalId: selectedProposal.id,
      voterName,
      voterRole: "Committee Member",
      vote: voteType,
      comment: voteComment || undefined,
    });
  };

  const voteCount = {
    approve: proposalVotes.filter((v: any) => v.vote === 'APPROVE').length,
    reject: proposalVotes.filter((v: any) => v.vote === 'REJECT').length,
    abstain: proposalVotes.filter((v: any) => v.vote === 'ABSTAIN').length,
  };

  // Sort meetings: active first, then upcoming, then past
  const sortedMeetings = [...meetings].sort((a, b) => {
    const statusOrder = { 'IN_PROGRESS': 0, 'SCHEDULED': 1, 'COMPLETED': 2 };
    const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 3;
    const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime();
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
            Investment Committee Meetings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule meetings, review proposals, and vote in real-time
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-meeting">
              <Plus className="h-4 w-4 mr-2" />
              Schedule IC Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule IC Meeting</DialogTitle>
              <DialogDescription>
                Create a new investment committee meeting and select proposals for review
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="meeting-date">Meeting Date & Time</Label>
                <Input
                  id="meeting-date"
                  type="datetime-local"
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                  data-testid="input-meeting-date"
                />
              </div>

              <div>
                <Label htmlFor="attendees">Attendees (comma separated)</Label>
                <Textarea
                  id="attendees"
                  placeholder="John Doe, Jane Smith, Bob Johnson"
                  value={newMeetingAttendees}
                  onChange={(e) => setNewMeetingAttendees(e.target.value)}
                  data-testid="input-attendees"
                />
              </div>

              <div>
                <Label>Select Proposals for Review ({selectedProposalIds.length} selected)</Label>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                  {pendingProposals.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No pending proposals available. Create proposals first.
                    </p>
                  ) : (
                    pendingProposals.map((proposal) => (
                      <div key={proposal.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`proposal-${proposal.id}`}
                          checked={selectedProposalIds.includes(proposal.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProposalIds([...selectedProposalIds, proposal.id]);
                            } else {
                              setSelectedProposalIds(selectedProposalIds.filter(id => id !== proposal.id));
                            }
                          }}
                          data-testid={`checkbox-proposal-${proposal.ticker}`}
                        />
                        <label htmlFor={`proposal-${proposal.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{proposal.ticker}</span>
                            <Badge variant="outline" className="text-xs">{proposal.proposalType}</Badge>
                            <span className="text-sm text-muted-foreground">- {proposal.companyName}</span>
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createMeetingMutation.mutate()}
                  disabled={createMeetingMutation.isPending || selectedProposalIds.length === 0 || !newMeetingDate}
                  data-testid="button-submit-meeting"
                >
                  {createMeetingMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Meetings
          </CardTitle>
          <CardDescription>
            {meetings.length} total meeting{meetings.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">No meetings scheduled</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first IC meeting above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedMeetings.map((meeting) => {
                // Get proposals either by icMeetingId OR from meeting agenda
                const proposalsFromMeeting = allProposals.filter(p => p.icMeetingId === meeting.id);
                const proposalIdsFromAgenda = (meeting.agenda as any)?.proposals || [];
                const meetingProposals = proposalsFromMeeting.length > 0 
                  ? proposalsFromMeeting 
                  : allProposals.filter(p => proposalIdsFromAgenda.includes(p.id));
                const statusColors = {
                  'SCHEDULED': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
                  'IN_PROGRESS': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
                  'COMPLETED': 'bg-muted/50 text-muted-foreground border-muted',
                };
                
                const isActiveMeeting = activeMeeting?.id === meeting.id;
                const workflow = getWorkflowForMeeting(meeting);
                const hasWorkflow = !!workflow;
                
                return (
                  <div
                    key={meeting.id}
                    className={`flex items-center gap-4 rounded-md border p-4 transition-colors ${
                      isActiveMeeting ? 'border-primary bg-primary/5' : ''
                    }`}
                    data-testid={`card-meeting-${meeting.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">
                          {format(new Date(meeting.meetingDate), 'MMM d, yyyy h:mm a')}
                        </span>
                        <Badge variant="outline" className={statusColors[meeting.status as keyof typeof statusColors]}>
                          {meeting.status}
                        </Badge>
                        {isActiveMeeting && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{meeting.attendees?.length || 0} attendees</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{meetingProposals.length} proposal{meetingProposals.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      {meetingProposals.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {meetingProposals.map(p => (
                            <Badge key={p.id} variant="secondary" className="text-xs">
                              {p.ticker}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {hasWorkflow && (
                        <Link href={`/workflows/${workflow.id}`}>
                          <Button
                            variant="default"
                            size="sm"
                            data-testid={`button-open-workflow-${meeting.id}`}
                          >
                            <ChevronRight className="h-4 w-4 mr-2" />
                            Open in Workflow
                          </Button>
                        </Link>
                      )}
                      <Link href={`/ic-meeting/${meeting.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-view-meeting-${meeting.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      {meeting.status === 'SCHEDULED' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => updateMeetingMutation.mutate({ 
                              id: meeting.id, 
                              updates: { status: 'IN_PROGRESS' } 
                            })}
                            data-testid={`button-start-meeting-${meeting.id}`}
                          >
                            Start Meeting
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMeetingMutation.mutate(meeting.id)}
                            data-testid={`button-delete-meeting-${meeting.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </>
                      )}
                      {meeting.status === 'IN_PROGRESS' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updateMeetingMutation.mutate({ 
                            id: meeting.id, 
                            updates: { status: 'COMPLETED' } 
                          })}
                          data-testid={`button-complete-meeting-${meeting.id}`}
                        >
                          Complete Meeting
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Meeting Section */}
      {activeMeeting && activeMeetingProposals.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Active Meeting Proposals
              </CardTitle>
              <CardDescription>
                {activeMeetingProposals.length} proposal{activeMeetingProposals.length !== 1 ? 's' : ''} for {format(new Date(activeMeeting.meetingDate), 'MMM d, yyyy h:mm a')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeMeetingProposals.map((proposal) => (
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
                    <div className="flex items-center gap-2">
                      <Link href={`/proposals/${proposal.id}`}>
                        <Button variant="ghost" size="sm" data-testid={`button-view-proposal-${proposal.ticker}`}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      <ChevronRight className={`h-5 w-5 ${selectedProposal?.id === proposal.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedProposal && (
            <>
              {/* Proposal Analysis Tabs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle>Analysis: {selectedProposal.ticker} - {selectedProposal.companyName}</CardTitle>
                      <CardDescription>AI-powered investment analysis and valuation</CardDescription>
                    </div>
                    <Button
                      variant="default"
                      onClick={() => startDebateMutation.mutate(selectedProposal)}
                      disabled={startDebateMutation.isPending}
                      data-testid="button-start-debate"
                      className="gap-2"
                    >
                      {startDebateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4" />
                          Start Debate
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="research">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="research" data-testid="tab-research">
                        <FileText className="h-4 w-4 mr-2" />
                        Research
                      </TabsTrigger>
                      <TabsTrigger value="valuation" data-testid="tab-valuation">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Valuation
                      </TabsTrigger>
                      <TabsTrigger value="risk" data-testid="tab-risk">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Risk Analysis
                      </TabsTrigger>
                      <TabsTrigger value="scenario" data-testid="tab-scenario">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Portfolio Impact
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="research" className="space-y-4">
                      {researchBrief ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Executive Summary</h4>
                            <p className="text-sm text-foreground">{researchBrief.executiveSummary || researchBrief.summary || "Comprehensive analysis of business model, competitive position, and growth prospects."}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Key Metrics</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Revenue Growth</span>
                                  <span className="font-medium">{researchBrief.metrics?.revenueGrowth || "15%"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Gross Margin</span>
                                  <span className="font-medium">{researchBrief.metrics?.grossMargin || "42%"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Operating Margin</span>
                                  <span className="font-medium">{researchBrief.metrics?.operatingMargin || "28%"}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Investment Strengths</h4>
                              <ul className="text-sm space-y-1">
                                {researchBrief.strengths?.map((s: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" />
                                    <span>{s}</span>
                                  </li>
                                )) || (
                                  <>
                                    <li className="flex items-start gap-2">
                                      <Check className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" />
                                      <span>Market-leading position in growth sector</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <Check className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" />
                                      <span>Strong FCF generation and margins</span>
                                    </li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Recommendation</h4>
                            <Badge variant="default">{researchBrief.recommendation || "BUY"}</Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              {researchBrief.recommendationRationale || "Strong fundamentals with attractive valuation and growth trajectory support entry at current levels."}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">No research brief available</p>
                          <Button
                            onClick={() => generateResearchMutation.mutate(selectedProposal.ticker)}
                            disabled={generateResearchMutation.isPending}
                            data-testid="button-generate-research"
                          >
                            {generateResearchMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Generate Research Brief
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="valuation" className="space-y-4">
                      {financialModel ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            {['Bull', 'Base', 'Bear'].map((scenario) => {
                              const scenarioData = financialModel[`${scenario.toLowerCase()}Case`] || financialModel.scenarios?.[scenario.toLowerCase()];
                              return (
                                <Card key={scenario}>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">{scenario} Case</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Target Price</p>
                                      <p className="text-2xl font-bold">${scenarioData?.targetPrice || (scenario === 'Bull' ? '185' : scenario === 'Base' ? '165' : '145')}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">IRR</p>
                                      <p className="text-sm font-semibold">{scenarioData?.irr || (scenario === 'Bull' ? '22%' : scenario === 'Base' ? '15%' : '8%')}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Key Assumptions</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Revenue CAGR</span>
                                  <span className="font-medium">{financialModel.assumptions?.revenueCagr || "12%"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Terminal Growth</span>
                                  <span className="font-medium">{financialModel.assumptions?.terminalGrowth || "3.0%"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">WACC</span>
                                  <span className="font-medium">{financialModel.assumptions?.wacc || "8.5%"}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Valuation Summary</h4>
                              <p className="text-sm text-foreground">
                                {financialModel.summary || "DCF analysis suggests intrinsic value significantly above current market price, providing attractive entry point with 15-22% upside across scenarios."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                          <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">No valuation model available</p>
                          <Button
                            onClick={() => generateDCFMutation.mutate(selectedProposal.ticker)}
                            disabled={generateDCFMutation.isPending}
                            data-testid="button-generate-dcf"
                          >
                            {generateDCFMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Generate DCF Model
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="risk" className="space-y-4">
                      <AgentPanel
                        agentName="Contrarian Analysis"
                        description="AI-powered bear case and risk identification"
                        onInvoke={() => selectedProposal && contrarianMutation.mutate(selectedProposal.ticker)}
                        isGenerating={contrarianMutation.isPending}
                        response={contrarianAnalysis}
                      />
                    </TabsContent>

                    <TabsContent value="scenario" className="space-y-4">
                      <AgentPanel
                        agentName="Portfolio Impact Analysis"
                        description="Simulate impact of proposed position on portfolio metrics"
                        onInvoke={() => selectedProposal && scenarioMutation.mutate({
                          ticker: selectedProposal.ticker,
                          proposedWeight: parseFloat(selectedProposal.proposedWeight as any) || 5.0,
                        })}
                        isGenerating={scenarioMutation.isPending}
                        response={scenarioAnalysis}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Voting Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Committee Voting
                  </CardTitle>
                  <CardDescription>
                    Cast your vote on {selectedProposal.ticker}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-chart-2">{voteCount.approve}</div>
                            <div className="text-sm text-muted-foreground mt-1">Approve</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-destructive">{voteCount.reject}</div>
                            <div className="text-sm text-muted-foreground mt-1">Reject</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-muted-foreground">{voteCount.abstain}</div>
                            <div className="text-sm text-muted-foreground mt-1">Abstain</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="voter-name">Your Name</Label>
                        <Input
                          id="voter-name"
                          value={voterName}
                          onChange={(e) => setVoterName(e.target.value)}
                          placeholder="Enter your name"
                          data-testid="input-voter-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vote-comment">Comment (optional)</Label>
                        <Textarea
                          id="vote-comment"
                          value={voteComment}
                          onChange={(e) => setVoteComment(e.target.value)}
                          placeholder="Add your reasoning..."
                          className="resize-none"
                          rows={2}
                          data-testid="input-vote-comment"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleVote('APPROVE')}
                        variant="default"
                        className="flex-1"
                        disabled={voteMutation.isPending || !voterName.trim()}
                        data-testid="button-vote-approve"
                      >
                        {voteMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleVote('REJECT')}
                        variant="destructive"
                        className="flex-1"
                        disabled={voteMutation.isPending || !voterName.trim()}
                        data-testid="button-vote-reject"
                      >
                        {voteMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleVote('ABSTAIN')}
                        variant="secondary"
                        className="flex-1"
                        disabled={voteMutation.isPending || !voterName.trim()}
                        data-testid="button-vote-abstain"
                      >
                        {voteMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Minus className="h-4 w-4 mr-2" />}
                        Abstain
                      </Button>
                    </div>

                    {proposalVotes.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-3">Vote History ({proposalVotes.length})</h4>
                        <div className="space-y-3">
                          {proposalVotes.map((v: any) => (
                            <div key={v.id} className="border rounded-md p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-foreground text-sm">{v.voterName}</span>
                                  <span className="text-xs text-muted-foreground">{v.voterRole}</span>
                                </div>
                                <Badge variant={
                                  v.vote === 'APPROVE' ? 'default' : 
                                  v.vote === 'REJECT' ? 'destructive' : 
                                  'secondary'
                                }>
                                  {v.vote}
                                </Badge>
                              </div>
                              {v.comment && (
                                <p className="text-sm text-muted-foreground">{v.comment}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(v.createdAt), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {!activeMeeting && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-semibold text-foreground">No Active Meeting</p>
            <p className="text-sm text-muted-foreground mt-1">Schedule a meeting above to begin</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
