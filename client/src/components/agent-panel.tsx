import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  ResearchBriefDisplay, 
  DCFModelDisplay, 
  QuantAnalysisDisplay, 
  RiskAnalysisDisplay,
  ComplianceReportDisplay 
} from "@/components/agent-formatters";

interface AgentPanelProps {
  agentName: string;
  agentType?: 'RESEARCH_SYNTHESIZER' | 'DCF_MODELER' | 'QUANT_ANALYST' | 'CONTRARIAN' | 'COMPLIANCE_MONITOR';
  description: string;
  isGenerating?: boolean;
  response?: any;
  onInvoke?: () => void;
  className?: string;
}

export function AgentPanel({
  agentName,
  agentType,
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
      {isGenerating && (
        <CardContent className="pt-0">
          <div className="rounded-md bg-muted/50 p-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is analyzing...</span>
          </div>
        </CardContent>
      )}
      {!isGenerating && response && (
        <CardContent className="pt-0">
          <div className="rounded-md bg-muted/50 p-4">
            <div data-testid="agent-response">
              {renderAgentResponse(response, agentType)}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function renderAgentResponse(response: any, agentType?: string) {
  // If response has a response field (nested), use that
  const actualResponse = response.response || response;
  
  // Use formatted components based on agent type
  if (agentType === 'RESEARCH_SYNTHESIZER') {
    return <ResearchBriefDisplay data={actualResponse} />;
  }
  
  if (agentType === 'DCF_MODELER') {
    return <DCFModelDisplay data={actualResponse} />;
  }
  
  if (agentType === 'QUANT_ANALYST') {
    return <QuantAnalysisDisplay data={actualResponse} />;
  }
  
  if (agentType === 'CONTRARIAN') {
    return <RiskAnalysisDisplay data={actualResponse} />;
  }
  
  if (agentType === 'COMPLIANCE_MONITOR') {
    return <ComplianceReportDisplay data={actualResponse} />;
  }
  
  // Fallback to basic rendering
  if (typeof actualResponse === 'string') {
    return <p className="text-sm text-foreground">{actualResponse}</p>;
  }
  
  // Try to detect the type from response structure
  if (actualResponse.summary && actualResponse.keyMetrics) {
    return <ResearchBriefDisplay data={actualResponse} />;
  }
  
  if (actualResponse.scenarios || (actualResponse.bullCase && actualResponse.baseCase)) {
    return <DCFModelDisplay data={actualResponse} />;
  }
  
  if (actualResponse.factorExposures) {
    return <QuantAnalysisDisplay data={actualResponse} />;
  }
  
  if (actualResponse.bearCase || actualResponse.keyRisks) {
    return <RiskAnalysisDisplay data={actualResponse} />;
  }
  
  if (actualResponse.complianceChecks || actualResponse.violations) {
    return <ComplianceReportDisplay data={actualResponse} />;
  }
  
  // Final fallback
  return <pre className="text-xs text-foreground overflow-auto">{JSON.stringify(actualResponse, null, 2)}</pre>;
}
