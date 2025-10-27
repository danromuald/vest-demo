import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech, useSpeechToText } from "@/hooks/use-voice";
import {
  Send,
  Users,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  Download,
  Share2,
  AlertTriangle,
} from "lucide-react";
import type { DebateSession, DebateMessage, Proposal } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AI_AGENTS, getAgentInfo, getAgentVoiceSettings } from "@/lib/ai-agents";
import { EnhancedDebateMessage } from "@/components/EnhancedDebateMessage";

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
    // Check if this is an AI agent (senderRole contains _AGENT)
    const isAgent = lastMessage && lastMessage.senderRole?.includes('_AGENT');
    if (isAgent) {
      // Get agent-specific voice settings
      const voiceSettings = getAgentVoiceSettings(lastMessage.senderRole);
      
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
  
  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  // Handle text-to-speech for a message
  const handleSpeak = (messageId: string, content: string) => {
    // Already speaking this message - stop it
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    // Find the message to get agent role for voice settings
    const message = messages.find(m => m.id === messageId);
    const voiceSettings = message?.senderRole ? getAgentVoiceSettings(message.senderRole) : {};
    
    // Speak with agent-specific voice
    speak(content, voiceSettings);
  };

  // Export debate session
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Generating debate transcript PDF...",
    });
    // In production, this would generate a PDF export
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Debate transcript downloaded successfully",
      });
    }, 1500);
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {selectedSessionData?.currentPhase}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExport}
                    data-testid="button-export-debate"
                    className="gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid="button-share-debate"
                    className="gap-2"
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </Button>
                </div>
              </div>

              {/* AI Agent Panel */}
              <div className="mt-4 p-3 rounded-md bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">AI Agents (click to invoke)</span>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Sparkles className="h-3 w-3" />
                    {AI_AGENTS.length} available
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {AI_AGENTS.map((agent) => {
                    const Icon = agent.icon;
                    return (
                      <Button
                        key={agent.id}
                        size="sm"
                        variant="outline"
                        onClick={() => invokeAgentMutation.mutate(agent.role)}
                        disabled={invokeAgentMutation.isPending}
                        data-testid={`button-invoke-${agent.id}`}
                        className="gap-2"
                      >
                        <Icon className={`h-3 w-3 ${agent.color}`} />
                        <span>{agent.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-6">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No messages yet</p>
                      <p className="text-xs mt-1">Start the conversation or invoke an AI agent</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      // Check if this is an AI agent (senderRole contains _AGENT)
                      const isAgent = message.senderRole?.includes('_AGENT') || false;
                      const isLastMessage = index === messages.length - 1;
                      const isSpeakingThis = isLastMessage && isSpeaking && isAgent;
                      
                      return (
                        <EnhancedDebateMessage
                          key={message.id || index}
                          messageId={message.id || `msg-${index}`}
                          author={message.senderName || "Unknown"}
                          role={!isAgent ? message.senderRole : undefined}
                          agentRole={isAgent ? message.senderRole : undefined}
                          timestamp={formatTime(message.createdAt || new Date())}
                          message={message.content || ""}
                          type={isAgent ? "ai" : "human"}
                          onSpeak={handleSpeak}
                          isSpeaking={isSpeakingThis}
                        />
                      );
                    })
                  )}
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
                    data-testid="button-toggle-tts"
                    aria-label={voiceEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
                    aria-pressed={voiceEnabled}
                    className="gap-2"
                  >
                    {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span className="text-xs">TTS</span>
                  </Button>
                  <Button
                    variant={autoSpeak ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    disabled={!ttsSupported || !voiceEnabled}
                    data-testid="button-auto-speak"
                    aria-pressed={autoSpeak}
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
                  {isListening && (
                    <Badge variant="destructive" className="animate-pulse gap-2" data-testid="badge-recording">
                      <Mic className="h-3 w-3" />
                      Recording...
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
                    data-testid="button-voice-recording"
                    aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
                    aria-pressed={isListening}
                    className={isListening ? "animate-pulse" : ""}
                    title={isListening ? "Recording... Click to stop" : "Click to start voice recording"}
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
                      {AI_AGENTS.map((agent) => {
                        const Icon = agent.icon;
                        const isActive = selectedSessionData?.activeAgents?.includes(agent.role);
                        return (
                          <div key={agent.id} className="border rounded-md p-3">
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
                                  {agent.specialty}
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
