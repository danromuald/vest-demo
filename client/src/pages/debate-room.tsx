import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, MessageSquare, Bot, User } from "lucide-react";
import type { DebateSession, DebateMessage } from "@shared/schema";

export default function DebateRoom() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: sessions } = useQuery<DebateSession[]>({
    queryKey: ["/api/debate-sessions"],
  });

  useEffect(() => {
    if (!selectedSession) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const websocket = new WebSocket(`${protocol}//${window.location.host}/ws`);

    websocket.onopen = () => {
      console.log("WebSocket connected");
      websocket.send(JSON.stringify({
        type: "join_debate",
        sessionId: selectedSession,
        userName: "Current User",
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
          break;
        case "participant_joined":
          toast({
            title: "Participant Joined",
            description: `${data.userName} joined the debate`,
          });
          break;
        case "participant_left":
          toast({
            title: "Participant Left",
            description: `${data.userName} left the debate`,
          });
          break;
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to debate room",
        variant: "destructive",
      });
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: "leave_debate",
          sessionId: selectedSession,
          userName: "Current User",
        }));
      }
      websocket.close();
    };
  }, [selectedSession, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim() || !ws || !selectedSession) return;

    ws.send(JSON.stringify({
      type: "send_debate_message",
      sessionId: selectedSession,
      senderId: "user-1",
      senderName: "Current User",
      content: messageInput,
      messageType: "TEXT",
    }));

    setMessageInput("");
  };

  const invokeAgent = (agentType: string, ticker: string) => {
    if (!ws || !selectedSession) return;

    ws.send(JSON.stringify({
      type: "invoke_agent_in_debate",
      sessionId: selectedSession,
      agentType,
      ticker,
    }));

    toast({
      title: "AI Agent Invoked",
      description: `${agentType} is analyzing ${ticker}...`,
    });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isAgentMessage = (senderId: string) => {
    return senderId.includes("_") || senderId.toLowerCase().includes("agent");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Debate Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {!sessions || sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No active debate sessions</p>
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
                      <span className="font-medium text-sm">{session.topic}</span>
                      <Badge variant={session.status === "ACTIVE" ? "default" : "secondary"}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{session.participantCount || 0} participants</span>
                      <span>•</span>
                      <span>{session.messageCount || 0} messages</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Select a debate session</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a session from the sidebar to join the discussion
              </p>
            </div>
          </div>
        ) : (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {sessions?.find(s => s.id === selectedSession)?.topic}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => invokeAgent("contrarian", "NVDA")}
                    data-testid="button-invoke-contrarian"
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    Invoke Contrarian
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => invokeAgent("research_synthesizer", "NVDA")}
                    data-testid="button-invoke-researcher"
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    Invoke Researcher
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-6">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isAgent = isAgentMessage(message.senderId);
                    return (
                      <div
                        key={index}
                        className={`flex gap-3 ${isAgent ? "bg-primary/5 -mx-6 px-6 py-3" : ""}`}
                        data-testid={`message-${index}`}
                      >
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className={isAgent ? "bg-primary" : "bg-muted"}>
                            {isAgent ? (
                              <Bot className="h-4 w-4 text-primary-foreground" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.senderName}</span>
                            {message.messageType !== "TEXT" && (
                              <Badge variant="outline" className="text-xs">
                                {message.messageType}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.timestamp!)}
                            </span>
                          </div>
                          <div className="text-sm text-foreground">
                            {message.messageType === "ANALYSIS" ? (
                              <pre className="whitespace-pre-wrap font-sans text-xs bg-muted/50 p-3 rounded-md">
                                {message.content}
                              </pre>
                            ) : (
                              <p>{message.content}</p>
                            )}
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
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  data-testid="input-message"
                />
                <Button onClick={sendMessage} disabled={!messageInput.trim()} data-testid="button-send">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
