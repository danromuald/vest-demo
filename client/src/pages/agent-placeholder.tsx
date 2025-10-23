import { Bot, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AgentPlaceholderProps {
  agentName: string;
  description: string;
  endpoint: string;
  apiMethod: string;
}

export function AgentPlaceholder({ agentName, description, endpoint, apiMethod }: AgentPlaceholderProps) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{agentName}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">API Endpoint</h4>
            <code className="block rounded bg-background p-2 text-sm">
              {apiMethod} {endpoint}
            </code>
          </div>
          
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              This agent is fully operational and accessible via the API endpoint above.
            </p>
            <p>
              A dedicated UI page is coming soon. In the meantime, you can test this agent using
              the API endpoint or integrate it directly into your workflow automation.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" asChild className="flex-1">
              <a href="/agent-outputs" data-testid="link-agent-outputs">
                <ExternalLink className="mr-2 h-4 w-4" />
                View All Agent Outputs
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
