import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech, useSpeechToText } from "@/hooks/use-voice";
import {
  Send,
  Users,
  MessageSquare,
  Bot,
  User,
  Shield,
  Sword,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BarChart3,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
} from "lucide-react";
import type { DebateSession, DebateMessage, Proposal } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AgentInfo {
  role: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

const DEBATE_AGENTS: Record<string, AgentInfo> = {
  CONTRARIAN: {
    role: "CONTRARIAN",
    name: "Contrarian Analyst",
    icon: Shield,
    color: "text-destructive",
    description: "Bear case defender, challenges the thesis",
  },
  DEFENDER: {
    role: "DEFENDER",
    name: "Thesis Defender",
    icon: Sword,
    color: "text-chart-2",
    description: "Bull case champion, supports the investment",
  },
  SECRETARY: {
    role: "SECRETARY",
    name: "Meeting Secretary",
    icon: FileText,
    color: "text-primary",
    description: "Moderates debate and provides summaries",
  },
  LEAD_PM: {
    role: "LEAD_PM",
    name: "Lead Portfolio Manager",
    icon: Users,
    color: "text-chart-1",
    description: "Asks penetrating questions to test the thesis",
  },
};

export default function DebateRoom() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [activePhase, setActivePhase] = useState("PRESENTATION");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Voice features
  const { speak, stop: stopSpeaking, isSpeaking, isSupported: ttsSupported, voices } = useTextToSpeech();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported: sttSupported 
  } = useSpeechToText();

  const { data: sessions = [] } = useQuery<DebateSession[]>({
    queryKey: ["/api/debate-sessions"],
  });

  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
    enabled: !selectedSession,
  });

  const selectedSessionData = sessions.find(s => s.id === selectedSession);
  const selectedProposal = proposals.find(p => p.id === selectedSessionData?.proposalId);

  // Fetch messages for selected session
  const { data: sessionMessages = [] } = useQuery<DebateMessage[]>({
    queryKey: ["/api/debate-sessions", selectedSession, "messages"],
    queryFn: () => fetch(`/api/debate-sessions/${selectedSession}/messages`).then(res => res.json()),
    enabled: !!selectedSession,
  });

  useEffect(() => {
    if (sessionMessages.length > 0) {
      setMessages(sessionMessages);
    }
  }, [sessionMessages]);

  // WebSocket connection
  useEffect(() => {
    if (!selectedSession) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const websocket = new WebSocket(`${protocol}//${window.location.host}/ws`);

    websocket.onopen = () => {
      websocket.send(JSON.stringify({
        type: "join_debate",
        sessionId: selectedSession,
        userName: "Committee Member",
      }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "debate_state":
          setMessages(data.messages || []);
          break;
        case "new_debate_message":
          setMessages(prev => [...prev, data.message]);
          break;
        case "agent_debate_response":
          setMessages(prev => [...prev, data.message]);
          toast({
            title: "AI Agent Responded",
            description: `${data.message.senderName} has contributed to the debate`,
          });
          break;
      }
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: "leave_debate",
          sessionId: selectedSession,
        }));
      }
      websocket.close();
    };
  }, [selectedSession, toast]);

  // Auto-speak new agent messages
  useEffect(() => {
    if (messages.length === 0 || !autoSpeak || !voiceEnabled || !ttsSupported) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.senderType === "AI_AGENT") {
      // Get agent-specific voice settings
      const agentInfo = getAgentInfo(lastMessage.agentRole);
      const voiceSettings = getAgentVoiceSettings(lastMessage.agentRole);
      
      // Speak the message with appropriate voice
      speak(lastMessage.content, voiceSettings);
    }
  }, [messages, autoSpeak, voiceEnabled, ttsSupported, speak]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle speech-to-text transcript
  useEffect(() => {
    if (transcript) {
      setMessageInput(transcript);
    }
  }, [transcript]);

  const sendMessage = () => {
    if (!messageInput.trim() || !ws || !selectedSession) return;

    ws.send(JSON.stringify({
      type: "send_debate_message",
      sessionId: selectedSession,
      senderId: "user-1",
      senderName: "Committee Member",
      content: messageInput,
      messageType: "TEXT",
    }));

    setMessageInput("");
  };

  const invokeAgentMutation = useMutation({
    mutationFn: async (agentRole: string) => {
      return await apiRequest("POST", `/api/debate-sessions/${selectedSession}/invoke-agent`, {
        agentRole,
        proposalId: selectedSessionData?.proposalId,
        context: {},
      });
    },
    onSuccess: (data: any) => {
      // Invalidate queries to refetch messages
      queryClient.invalidateQueries({ queryKey: ["/api/debate-sessions", selectedSession, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/debate-sessions"] });
      if (data && data.senderName) {
        toast({
          title: "Agent Response",
          description: `${data.senderName} has contributed`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to invoke agent",
        variant: "destructive",
      });
    },
  });

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAgentInfo = (agentRole: string | null): AgentInfo | null => {
    return agentRole ? DEBATE_AGENTS[agentRole] || null : null;
  };
  
  const getAgentVoiceSettings = (agentRole: string | null) => {
    // Different voice characteristics for each agent
    const settings: Record<string, { pitch: number; rate: number }> = {
      CONTRARIAN: { pitch: 0.9, rate: 1.1 }, // Lower, faster - urgent bear case
      DEFENDER: { pitch: 1.1, rate: 0.95 }, // Higher, slower - confident bull case
      SECRETARY: { pitch: 1.0, rate: 1.0 }, // Neutral - balanced moderator
      LEAD_PM: { pitch: 1.05, rate: 0.9 }, // Slightly higher, measured - thoughtful questions
    };
    
    return agentRole ? settings[agentRole] || {} : {};
  };
  
  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const renderAgentAvatar = (message: DebateMessage) => {
    const agentInfo = getAgentInfo(message.agentRole);
    const Icon = agentInfo?.icon || Bot;
    
    return (
      <Avatar className="h-9 w-9 mt-1">
        <AvatarFallback className={message.senderType === "AI_AGENT" ? "bg-primary/10" : "bg-muted"}>
          {message.senderType === "AI_AGENT" ? (
            <Icon className={`h-4 w-4 ${agentInfo?.color || "text-primary"}`} />
          ) : (
            <User className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
    );
  };

  const getStanceBadge = (stance: string | null) => {
    if (!stance) return null;
    const colors = {
      BULL: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      BEAR: "bg-destructive/10 text-destructive border-destructive/20",
      NEUTRAL: "bg-muted text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={colors[stance as keyof typeof colors] || colors.NEUTRAL}>
        {stance.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Sessions Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Active Debates
          </CardTitle>
          <CardDescription>IC Meeting debate sessions</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No active debate sessions</p>
                <p className="text-xs text-muted-foreground mt-1">Start a debate from an IC Meeting</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className={`w-full text-left rounded-md p-3 border transition-colors ${
                      selectedSession === session.id
                        ? "bg-primary/10 border-primary"
                        : "hover-elevate"
                    }`}
                    data-testid={`button-session-${session.id}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate">{session.topic}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={session.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                        {session.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {session.ticker}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{session.participantCount || 0}</span>
                      <span>•</span>
                      <MessageSquare className="h-3 w-3" />
                      <span>{session.messageCount || 0}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Debate Area */}
      {!selectedSession ? (
        <Card className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-16 w-16 text-primary/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Welcome to the Debate Room</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Select an active debate session from the sidebar, or start a new debate from an IC Meeting to engage in multi-agent investment discussions.
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex-1 flex gap-6">
          {/* Chat Panel */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {selectedSessionData?.topic}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <span className="font-mono text-sm">{selectedSessionData?.ticker}</span>
                    {" • "}
                    <span>{selectedProposal?.proposalType} recommendation</span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {selectedSessionData?.currentPhase}
                </Badge>
              </div>

              {/* Quick Agent Invoke Buttons */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {Object.values(DEBATE_AGENTS).map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <Button
                      key={agent.role}
                      size="sm"
                      variant="outline"
                      onClick={() => invokeAgentMutation.mutate(agent.role)}
                      disabled={invokeAgentMutation.isPending}
                      data-testid={`button-invoke-${agent.role.toLowerCase()}`}
                      className="gap-2"
                    >
                      <Icon className={`h-3 w-3 ${agent.color}`} />
                      <span>{agent.name}</span>
                    </Button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-6">
                <div className="space-y-6">
                  {messages.map((message, index) => {
                    const isAgent = message.senderType === "AI_AGENT";
                    const agentInfo = getAgentInfo(message.agentRole);
                    const isLastMessage = index === messages.length - 1;
                    const isSpeakingThis = isLastMessage && isSpeaking && isAgent;
                    
                    return (
                      <div
                        key={index}
                        className={`flex gap-3 ${isAgent ? "bg-muted/30 -mx-6 px-6 py-4 rounded-lg" : ""} ${isSpeakingThis ? "ring-2 ring-primary/50" : ""}`}
                        data-testid={`message-${index}`}
                      >
                        {renderAgentAvatar(message)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm">{message.senderName}</span>
                            {agentInfo && (
                              <Badge variant="outline" className="text-xs">
                                {agentInfo.name}
                              </Badge>
                            )}
                            {getStanceBadge(message.stance)}
                            {message.messageType !== "TEXT" && (
                              <Badge variant="secondary" className="text-xs">
                                {message.messageType}
                              </Badge>
                            )}
                            {isSpeakingThis && (
                              <Badge variant="default" className="text-xs animate-pulse gap-1">
                                <Volume2 className="h-3 w-3" />
                                Speaking
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatTime(message.timestamp!)}
                            </span>
                          </div>
                          <div className="text-sm text-foreground whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            <div className="border-t p-4">
              <div className="flex gap-2 mb-3">
                <div className="flex gap-2 flex-1 items-center">
                  <Button
                    variant={voiceEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    disabled={!ttsSupported}
                    data-testid="button-toggle-voice"
                    className="gap-2"
                  >
                    {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span className="text-xs">Voice</span>
                  </Button>
                  <Button
                    variant={autoSpeak ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    disabled={!ttsSupported || !voiceEnabled}
                    data-testid="button-auto-speak"
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="text-xs">Auto-speak</span>
                  </Button>
                  {isSpeaking && (
                    <Badge variant="default" className="animate-pulse gap-2">
                      <Volume2 className="h-3 w-3" />
                      Speaking...
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={isListening ? "Listening..." : "Share your thoughts on this proposal..."}
                  data-testid="input-message"
                  className={isListening ? "border-primary" : ""}
                />
                {sttSupported && (
                  <Button
                    variant={isListening ? "default" : "outline"}
                    onClick={toggleVoiceInput}
                    data-testid="button-voice-input"
                    className={isListening ? "animate-pulse" : ""}
                  >
                    {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                )}
                <Button onClick={sendMessage} disabled={!messageInput.trim()} data-testid="button-send">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Artifacts Panel */}
          <Card className="w-96 flex flex-col">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Debate Artifacts
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <Tabs defaultValue="proposal" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mx-4 my-2">
                  <TabsTrigger value="proposal" className="text-xs">Proposal</TabsTrigger>
                  <TabsTrigger value="agents" className="text-xs">Agents</TabsTrigger>
                  <TabsTrigger value="status" className="text-xs">Status</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                  <TabsContent value="proposal" className="px-4 pb-4 mt-0">
                    {selectedProposal ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Investment Thesis</h4>
                          <p className="text-xs text-foreground">
                            {selectedProposal.thesis?.substring(0, 300)}
                            {(selectedProposal.thesis?.length || 0) > 300 && "..."}
                          </p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground">Target Price</div>
                            <div className="text-sm font-semibold">${selectedProposal.targetPrice}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Proposed Weight</div>
                            <div className="text-sm font-semibold">{selectedProposal.proposedWeight}%</div>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Key Catalysts</h4>
                          <ul className="space-y-1">
                            {selectedProposal.catalysts?.slice(0, 3).map((catalyst, i) => (
                              <li key={i} className="text-xs flex gap-2">
                                <CheckCircle2 className="h-3 w-3 text-chart-2 mt-0.5 flex-shrink-0" />
                                <span>{catalyst}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Key Risks</h4>
                          <ul className="space-y-1">
                            {selectedProposal.risks?.slice(0, 3).map((risk, i) => (
                              <li key={i} className="text-xs flex gap-2">
                                <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No proposal data available</p>
                    )}
                  </TabsContent>

                  <TabsContent value="agents" className="px-4 pb-4 mt-0">
                    <div className="space-y-3">
                      {Object.values(DEBATE_AGENTS).map((agent) => {
                        const Icon = agent.icon;
                        const isActive = selectedSessionData?.activeAgents?.includes(agent.role);
                        return (
                          <div key={agent.role} className="border rounded-md p-3">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-md ${isActive ? "bg-primary/10" : "bg-muted"}`}>
                                <Icon className={`h-4 w-4 ${agent.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs flex items-center gap-2">
                                  {agent.name}
                                  {isActive && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                      ACTIVE
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {agent.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="status" className="px-4 pb-4 mt-0">
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Debate Phase</div>
                        <Badge variant="outline">{selectedSessionData?.currentPhase}</Badge>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Messages</div>
                        <div className="text-2xl font-bold">{selectedSessionData?.messageCount || 0}</div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Participants</div>
                        <div className="text-2xl font-bold">{selectedSessionData?.participantCount || 0}</div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Status</div>
                        <Badge variant={selectedSessionData?.status === "ACTIVE" ? "default" : "secondary"}>
                          {selectedSessionData?.status}
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
