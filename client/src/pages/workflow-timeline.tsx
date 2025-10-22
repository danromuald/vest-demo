import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, AlertCircle, FileText, Users, TrendingUp, Target, Activity } from "lucide-react";
import { Link } from "wouter";
import type { WorkflowStageRecord, ResearchRequest, Proposal, ICMeeting, Position } from "@shared/schema";

interface StageData {
  name: string;
  stage: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  entities: {
    research?: ResearchRequest[];
    proposals?: Proposal[];
    meetings?: ICMeeting[];
    positions?: Position[];
  };
}

export default function WorkflowTimeline() {
  const { data: workflowStages } = useQuery<WorkflowStageRecord[]>({
    queryKey: ["/api/workflow-stages"],
  });

  const { data: researchRequests } = useQuery<ResearchRequest[]>({
    queryKey: ["/api/research-requests"],
  });

  const { data: proposals } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });

  const { data: icMeetings } = useQuery<ICMeeting[]>({
    queryKey: ["/api/ic-meetings"],
  });

  const { data: positions } = useQuery<Position[]>({
    queryKey: ["/api/positions"],
  });

  const getEntitiesAtStage = (stageName: string): StageData["entities"] => {
    const stagesAtThisStage = workflowStages?.filter(s => s.currentStage === stageName) || [];
    const entityIds = stagesAtThisStage.map(s => s.entityId);

    const result: StageData["entities"] = {};

    switch (stageName) {
      case "DISCOVERY":
      case "ANALYSIS":
        result.research = researchRequests?.filter(r => 
          stagesAtThisStage.some(s => s.entityType === "RESEARCH" && s.entityId === r.id)
        );
        break;
      case "IC_MEETING":
        result.proposals = proposals?.filter(p => 
          stagesAtThisStage.some(s => s.entityType === "PROPOSAL" && s.entityId === p.id)
        );
        result.meetings = icMeetings?.filter(m => 
          stagesAtThisStage.some(s => s.entityType === "MEETING" && s.entityId === m.id)
        );
        break;
      case "EXECUTION":
        result.proposals = proposals?.filter(p => 
          p.status === "APPROVED" && 
          stagesAtThisStage.some(s => s.entityType === "PROPOSAL" && s.entityId === p.id)
        );
        break;
      case "MONITORING":
        result.positions = positions?.filter(p => 
          stagesAtThisStage.some(s => s.entityType === "POSITION" && s.entityId === p.id)
        );
        break;
    }

    return result;
  };

  const stages: Omit<StageData, "entities">[] = [
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

  const stagesWithData: StageData[] = stages.map(stage => ({
    ...stage,
    entities: getEntitiesAtStage(stage.stage),
  }));

  const getTotalEntitiesCount = (entities: StageData["entities"]): number => {
    return (
      (entities.research?.length || 0) +
      (entities.proposals?.length || 0) +
      (entities.meetings?.length || 0) +
      (entities.positions?.length || 0)
    );
  };

  const getStageStatus = (stage: StageData) => {
    const count = getTotalEntitiesCount(stage.entities);
    if (count === 0) return { icon: Clock, text: "Empty", variant: "outline" as const };
    if (count >= 3) return { icon: AlertCircle, text: "Active", variant: "default" as const };
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
          <CardDescription>Current pipeline status across all stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {stagesWithData.map((stage, index) => {
              const count = getTotalEntitiesCount(stage.entities);
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
          const count = getTotalEntitiesCount(stage.entities);

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
                  <span className="text-sm text-muted-foreground">Total Entities</span>
                  <span className="text-2xl font-semibold text-foreground">{count}</span>
                </div>

                {/* Entity Lists */}
                <div className="space-y-3">
                  {/* Research Requests */}
                  {stage.entities.research && stage.entities.research.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Research Requests</span>
                        <Badge variant="outline" className="text-xs">{stage.entities.research.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {stage.entities.research.slice(0, 3).map((r) => (
                          <div
                            key={r.id}
                            className="text-xs p-2 rounded border flex items-center justify-between"
                            data-testid={`research-${r.ticker}`}
                          >
                            <span className="font-mono font-semibold">{r.ticker}</span>
                            <Badge variant="outline" className="text-xs">{r.status}</Badge>
                          </div>
                        ))}
                        {stage.entities.research.length > 3 && (
                          <p className="text-xs text-muted-foreground pl-2">
                            +{stage.entities.research.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Proposals */}
                  {stage.entities.proposals && stage.entities.proposals.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Proposals</span>
                        <Badge variant="outline" className="text-xs">{stage.entities.proposals.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {stage.entities.proposals.slice(0, 3).map((p) => (
                          <div
                            key={p.id}
                            className="text-xs p-2 rounded border flex items-center justify-between"
                            data-testid={`proposal-${p.ticker}`}
                          >
                            <span className="font-mono font-semibold">{p.ticker}</span>
                            <Badge variant="outline" className="text-xs">{p.proposalType}</Badge>
                          </div>
                        ))}
                        {stage.entities.proposals.length > 3 && (
                          <p className="text-xs text-muted-foreground pl-2">
                            +{stage.entities.proposals.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* IC Meetings */}
                  {stage.entities.meetings && stage.entities.meetings.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">IC Meetings</span>
                        <Badge variant="outline" className="text-xs">{stage.entities.meetings.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {stage.entities.meetings.slice(0, 3).map((m) => (
                          <div
                            key={m.id}
                            className="text-xs p-2 rounded border flex items-center justify-between"
                            data-testid={`meeting-${m.id}`}
                          >
                            <span>{new Date(m.meetingDate).toLocaleDateString()}</span>
                            <Badge variant="outline" className="text-xs">{m.status}</Badge>
                          </div>
                        ))}
                        {stage.entities.meetings.length > 3 && (
                          <p className="text-xs text-muted-foreground pl-2">
                            +{stage.entities.meetings.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Positions */}
                  {stage.entities.positions && stage.entities.positions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Active Positions</span>
                        <Badge variant="outline" className="text-xs">{stage.entities.positions.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {stage.entities.positions.slice(0, 3).map((p) => (
                          <div
                            key={p.id}
                            className="text-xs p-2 rounded border flex items-center justify-between"
                            data-testid={`position-${p.ticker}`}
                          >
                            <span className="font-mono font-semibold">{p.ticker}</span>
                            <Badge variant="outline" className="text-xs">
                              {p.portfolioWeight}%
                            </Badge>
                          </div>
                        ))}
                        {stage.entities.positions.length > 3 && (
                          <p className="text-xs text-muted-foreground pl-2">
                            +{stage.entities.positions.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {count === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No entities at this stage</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t">
                  {stage.stage === "DISCOVERY" && (
                    <Link href="/research">
                      <Button variant="outline" size="sm" className="w-full" data-testid="button-goto-research">
                        View Research Pipeline
                      </Button>
                    </Link>
                  )}
                  {stage.stage === "IC_MEETING" && (
                    <Link href="/ic-meeting">
                      <Button variant="outline" size="sm" className="w-full" data-testid="button-goto-ic">
                        View IC Meeting
                      </Button>
                    </Link>
                  )}
                  {stage.stage === "MONITORING" && (
                    <Link href="/monitoring-hub">
                      <Button variant="outline" size="sm" className="w-full" data-testid="button-goto-monitoring">
                        View Monitoring Hub
                      </Button>
                    </Link>
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
