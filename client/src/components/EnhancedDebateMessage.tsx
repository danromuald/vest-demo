import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Volume2, Sparkles, FileText, User } from "lucide-react";
import { AI_AGENTS, getAgentInfo } from "@/lib/ai-agents";

interface EnhancedDebateMessageProps {
  messageId: string;
  author: string;
  role?: string;
  agentRole?: string | null;
  timestamp: string;
  message: string;
  type: "human" | "ai";
  stance?: "BULL" | "BEAR" | "NEUTRAL" | null;
  artifact?: { type: string; title: string };
  canSpeak?: boolean;
  onSpeak?: (messageId: string, content: string) => void;
  isSpeaking?: boolean;
}

export function EnhancedDebateMessage({
  messageId,
  author,
  role,
  agentRole,
  timestamp,
  message,
  type,
  stance,
  artifact,
  canSpeak = true,
  onSpeak,
  isSpeaking = false,
}: EnhancedDebateMessageProps) {
  // Find agent configuration if this is an AI message
  const agent = getAgentInfo(agentRole);
  const AgentIcon = agent?.icon || Sparkles;

  // Get stance badge styling
  const getStanceBadge = () => {
    if (!stance) return null;
    const colors = {
      BULL: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      BEAR: "bg-destructive/10 text-destructive border-destructive/20",
      NEUTRAL: "bg-muted text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={colors[stance] || colors.NEUTRAL}>
        {stance.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div
      className={`p-4 rounded-md transition-all ${
        type === "ai"
          ? "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20"
          : "bg-muted/50 border border-border"
      } ${isSpeaking ? "ring-2 ring-primary/50" : ""}`}
      data-testid={`debate-message-${type}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback
              className={type === "ai" ? "bg-yellow-500/20" : "bg-primary/20"}
            >
              {type === "ai" ? (
                <AgentIcon className={`h-4 w-4 ${agent?.color || "text-yellow-500"}`} />
              ) : (
                <User className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>

          {/* Author Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{author}</span>
              {type === "ai" ? (
                <Badge variant="outline" className="text-xs gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Agent
                </Badge>
              ) : (
                role && (
                  <Badge variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                )
              )}
              {getStanceBadge()}
            </div>
            {agent && (
              <p className="text-xs text-muted-foreground mt-0.5">{agent.specialty}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {type === "ai" && canSpeak && onSpeak && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => onSpeak(messageId, message)}
              data-testid="button-speak-message"
            >
              <Volume2
                className={`h-3 w-3 ${isSpeaking ? "text-green-500 animate-pulse" : ""}`}
              />
            </Button>
          )}
          <span className="text-xs text-muted-foreground whitespace-nowrap">{timestamp}</span>
        </div>
      </div>

      {/* Message Content */}
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>

      {/* Artifact Attachment */}
      {artifact && (
        <div className="mt-3 p-2 rounded-md bg-background border border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs font-medium">{artifact.title}</p>
              <p className="text-xs text-muted-foreground">{artifact.type}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              View
            </Button>
          </div>
        </div>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="mt-2 flex items-center gap-2 text-xs text-green-500">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-green-500 animate-pulse" />
            <div className="w-1 h-3 bg-green-500 animate-pulse delay-75" />
            <div className="w-1 h-3 bg-green-500 animate-pulse delay-150" />
          </div>
          <span>Speaking...</span>
        </div>
      )}
    </div>
  );
}
