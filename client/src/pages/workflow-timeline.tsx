import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, AlertCircle, FileText, Users, TrendingUp, Target, Activity } from "lucide-react";
import { Link } from "wouter";
import type { Workflow } from "@shared/schema";

interface StageData {
  name: string;
  stage: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  workflows: Workflow[];
}

export default function WorkflowTimeline() {
  // Fetch all workflows
  const { data: workflows = [], isLoading } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });

  const stages: Omit<StageData, "workflows">[] = [
    {
      name: "Discovery",
      stage: "DISCOVERY",
      icon: FileText,
      description: "Initial research requests and information gathering",
      color: "text-chart-1",
    },
    {
      name: "Analysis",
      stage: "ANALYSIS",
      icon: TrendingUp,
      description: "Research completed, ready for proposal creation",
      color: "text-chart-2",
    },
    {
      name: "IC Meeting",
      stage: "IC_MEETING",
      icon: Users,
      description: "Investment committee review and voting",
      color: "text-chart-3",
    },
    {
      name: "Execution",
      stage: "EXECUTION",
      icon: Target,
      description: "Approved proposals being executed",
      color: "text-chart-4",
    },
    {
      name: "Monitoring",
      stage: "MONITORING",
      icon: Activity,
      description: "Active positions with thesis tracking",
      color: "text-chart-5",
    },
  ];

  // Group workflows by current stage
  const stagesWithData: StageData[] = stages.map(stage => ({
    ...stage,
    workflows: workflows.filter(w => w.currentStage === stage.stage),
  }));

  const getStageStatus = (stage: StageData) => {
    const count = stage.workflows.length;
    if (count === 0) return { icon: Clock, text: "Empty", variant: "outline" as const };
    if (count >= 2) return { icon: AlertCircle, text: "Active", variant: "default" as const };
    return { icon: CheckCircle2, text: "In Progress", variant: "secondary" as const };
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
          IC Workflow Timeline
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track investments through the complete workflow from discovery to monitoring
        </p>
      </div>

      {/* Workflow Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Overview</CardTitle>
          <CardDescription>
            {workflows.length} active {workflows.length === 1 ? 'workflow' : 'workflows'} across all stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {stagesWithData.map((stage, index) => {
              const count = stage.workflows.length;
              return (
                <div key={stage.stage} className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      {stage.name}
                    </Badge>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  {index < stagesWithData.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stage Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {stagesWithData.map((stage) => {
          const Icon = stage.icon;
          const status = getStageStatus(stage);
          const StatusIcon = status.icon;
          const count = stage.workflows.length;

          return (
            <Card key={stage.stage} className="hover-elevate" data-testid={`card-stage-${stage.stage}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${stage.color}`} />
                    <CardTitle className="text-lg">{stage.name}</CardTitle>
                  </div>
                  <Badge variant={status.variant} className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {status.text}
                  </Badge>
                </div>
                <CardDescription>{stage.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Count Summary */}
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">Active Workflows</span>
                  <span className="text-2xl font-semibold text-foreground">{count}</span>
                </div>

                {/* Workflows at this stage */}
                <div className="space-y-3">
                  {stage.workflows.length > 0 ? (
                    <div className="space-y-2">
                      {stage.workflows.map((workflow) => (
                        <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
                          <div
                            className="text-xs p-3 rounded border flex items-center justify-between hover-elevate cursor-pointer"
                            data-testid={`workflow-${workflow.ticker}`}
                          >
                            <div className="flex-1">
                              <div className="font-mono font-semibold text-sm">{workflow.ticker}</div>
                              <div className="text-muted-foreground mt-0.5">{workflow.companyName}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{workflow.sector}</Badge>
                              <Badge variant={workflow.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                                {workflow.status}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No workflows at this stage</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
