import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentPanelProps {
  agentName: string;
  description: string;
  isGenerating?: boolean;
  response?: any;
  onInvoke?: () => void;
  className?: string;
}

export function AgentPanel({
  agentName,
  description,
  isGenerating = false,
  response,
  onInvoke,
  className,
}: AgentPanelProps) {
  return (
    <Card className={cn('hover-elevate', className)} data-testid={`agent-panel-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{agentName}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
        {onInvoke && (
          <Button
            size="sm"
            onClick={onInvoke}
            disabled={isGenerating}
            data-testid={`button-invoke-${agentName.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Invoke Agent'
            )}
          </Button>
        )}
      </CardHeader>
      {response && (
        <CardContent className="pt-0">
          <div className="rounded-md bg-muted/50 p-4">
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI is analyzing...</span>
              </div>
            )}
            {!isGenerating && response && (
              <div className="space-y-3 text-sm" data-testid="agent-response">
                {renderAgentResponse(response)}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function renderAgentResponse(response: any) {
  if (typeof response === 'string') {
    return <p className="text-foreground">{response}</p>;
  }

  if (response.summary) {
    return (
      <div className="space-y-2">
        <p className="font-medium text-foreground">{response.summary}</p>
        {response.keyPoints && (
          <ul className="space-y-1 pl-4">
            {response.keyPoints.map((point: string, i: number) => (
              <li key={i} className="list-disc text-muted-foreground">{point}</li>
            ))}
          </ul>
        )}
        {response.recommendation && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recommendation:</span>
            <Badge variant="secondary">{response.recommendation}</Badge>
          </div>
        )}
      </div>
    );
  }

  return <pre className="text-xs text-foreground">{JSON.stringify(response, null, 2)}</pre>;
}
