import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { ThesisHealthBadge } from "@/components/thesis-health-badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getPermissions } from "@/lib/permissions";
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  ArrowRight,
  FileText,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  Activity,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  Download,
  Eye,
  Sparkles,
  Target,
  TrendingDown,
  Shield,
  GitBranch
} from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Workflow, MonitoringEvent as MonitoringEventType, ThesisHealthMetric } from "@shared/schema";

export default function WorkflowWorkspace() {
  const params = useParams<{ id: string }>();
  const workflowId = params.id;

  // Fetch workflow data
  const { data: workflow, isLoading: workflowLoading } = useQuery<Workflow>({
    queryKey: [`/api/workflows/${workflowId}`],
    enabled: !!workflowId,
  });

  // Fetch workflow stages
  const { data: stages, isLoading: stagesLoading } = useQuery<any[]>({
    queryKey: [`/api/workflows/${workflowId}/stages`],
    enabled: !!workflowId,
  });

  // Fetch artifacts for this workflow
  const { data: artifacts, isLoading: artifactsLoading } = useQuery<any[]>({
    queryKey: [`/api/workflows/${workflowId}/artifacts`],
    enabled: !!workflowId,
  });

  const isLoading = workflowLoading || stagesLoading || artifactsLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Workflow Not Found
            </CardTitle>
            <CardDescription>
              The workflow you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Determine which tabs to show based on workflow stage
  const currentStage = workflow.currentStage;
  const showAnalysis = ["DISCOVERY", "ANALYSIS", "IC_MEETING", "EXECUTION", "MONITORING"].includes(currentStage);
  const showICMeeting = ["IC_MEETING", "EXECUTION", "MONITORING"].includes(currentStage);
  const showExecution = ["EXECUTION", "MONITORING"].includes(currentStage);
  const showMonitoring = currentStage === "MONITORING";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-6 space-y-4">
          <BreadcrumbNav 
            items={[
              { label: "Workflows", href: "/" },
              { label: workflow.ticker }
            ]}
          />
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold" data-testid="text-workflow-title">
                  {workflow.ticker}
                </h1>
                <Badge variant="outline" data-testid="badge-workflow-stage">
                  {workflow.currentStage.replace("_", " ")}
                </Badge>
                <Badge 
                  variant={workflow.status === "ACTIVE" ? "default" : "secondary"}
                  data-testid="badge-workflow-status"
                >
                  {workflow.status}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground" data-testid="text-company-name">
                {workflow.companyName}
              </p>
              {workflow.description && (
                <p className="text-sm text-muted-foreground max-w-2xl" data-testid="text-description">
                  {workflow.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" data-testid="button-export">
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" data-testid="button-advance-stage">
                <ArrowRight className="h-4 w-4 mr-2" />
                Advance Stage
              </Button>
            </div>
          </div>

          {/* Workflow Stage Progress */}
          <StageProgressBar currentStage={workflow.currentStage} stages={stages} />
        </div>
      </div>

      {/* Stage-Aware Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <div className="border-b border-border px-6">
            <TabsList className="bg-transparent border-0 h-12">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <FileText className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              
              {showAnalysis && (
                <TabsTrigger value="analysis" data-testid="tab-analysis">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analysis Hub
                </TabsTrigger>
              )}
              
              {showICMeeting && (
                <TabsTrigger value="ic-meeting" data-testid="tab-ic-meeting">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  IC Meeting
                </TabsTrigger>
              )}
              
              {showExecution && (
                <TabsTrigger value="execution" data-testid="tab-execution">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Execution
                </TabsTrigger>
              )}
              
              {showMonitoring && (
                <TabsTrigger value="monitoring" data-testid="tab-monitoring">
                  <Activity className="h-4 w-4 mr-2" />
                  Monitoring
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6 m-0">
              <OverviewTab workflow={workflow} stages={stages} artifacts={artifacts} />
            </TabsContent>

            {/* Analysis Hub Tab */}
            {showAnalysis && (
              <TabsContent value="analysis" className="p-6 space-y-6 m-0">
                <AnalysisHubTab workflowId={workflowId!} artifacts={artifacts} />
              </TabsContent>
            )}

            {/* IC Meeting Tab */}
            {showICMeeting && (
              <TabsContent value="ic-meeting" className="p-6 space-y-6 m-0">
                <ICMeetingTab workflowId={workflowId!} />
              </TabsContent>
            )}

            {/* Execution Tab */}
            {showExecution && (
              <TabsContent value="execution" className="p-6 space-y-6 m-0">
                <ExecutionTab workflowId={workflowId!} />
              </TabsContent>
            )}

            {/* Monitoring Tab */}
            {showMonitoring && (
              <TabsContent value="monitoring" className="p-6 space-y-6 m-0">
                <MonitoringTab workflowId={workflowId!} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// Simple Stage Progress Bar Component
function StageProgressBar({ currentStage, stages }: { currentStage: string; stages: any[] | undefined }) {
  const stageOrder = ["DISCOVERY", "ANALYSIS", "IC_MEETING", "EXECUTION", "MONITORING"];
  const stageLabels = {
    DISCOVERY: "Discovery",
    ANALYSIS: "Analysis", 
    IC_MEETING: "IC Meeting",
    EXECUTION: "Execution",
    MONITORING: "Monitoring"
  };

  const currentIndex = stageOrder.indexOf(currentStage);
  const completedStages = stages?.filter(s => s.status === "COMPLETED").map(s => s.stage) || [];

  return (
    <div className="flex items-center gap-2" data-testid="stage-progress-bar">
      {stageOrder.map((stage, index) => {
        const isCompleted = completedStages.includes(stage);
        const isCurrent = stage === currentStage;
        const isPast = index < currentIndex;

        return (
          <div key={stage} className="flex items-center flex-1">
            <div className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary ring-2 ring-primary/20",
                  !isCompleted && !isCurrent && "border-border bg-background text-muted-foreground"
                )}
                data-testid={`stage-${stage}`}
              >
                {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                {isCurrent && <Clock className="h-4 w-4" />}
                {!isCompleted && !isCurrent && <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
              </div>
              <span 
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isCurrent && "text-foreground",
                  !isCurrent && "text-muted-foreground"
                )}
              >
                {stageLabels[stage as keyof typeof stageLabels]}
              </span>
            </div>
            {index < stageOrder.length - 1 && (
              <div 
                className={cn(
                  "h-0.5 flex-1 mx-2",
                  (isPast || isCompleted) ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ workflow, stages, artifacts }: { 
  workflow: Workflow; 
  stages: any[] | undefined; 
  artifacts: any[] | undefined;
}) {
  const completedStages = stages?.filter(s => s.status === "COMPLETED").length || 0;
  const totalArtifacts = artifacts?.length || 0;
  const latestUpdate = workflow.updatedAt ? new Date(workflow.updatedAt).toLocaleDateString() : "N/A";

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-metric-stage">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Current Stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">
              {workflow.currentStage.replace("_", " ")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedStages} of 5 stages completed
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-owner">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Owner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="text-lg font-medium">
                {workflow.owner}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lead analyst
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-artifacts">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Artifacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">
              {totalArtifacts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Research outputs
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-updated">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Last Updated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="text-lg font-medium">
                {latestUpdate}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Activity timestamp
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Details */}
      <Card data-testid="card-workflow-details">
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
          <CardDescription>
            Investment opportunity information and metadata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ticker</p>
              <p className="text-base font-mono mt-1">{workflow.ticker}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company</p>
              <p className="text-base mt-1">{workflow.companyName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sector</p>
              <p className="text-base mt-1">{workflow.sector || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={workflow.status === "ACTIVE" ? "default" : "secondary"} className="mt-1">
                {workflow.status}
              </Badge>
            </div>
          </div>
          
          {workflow.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{workflow.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Artifacts */}
      {artifacts && artifacts.length > 0 && (
        <Card data-testid="card-recent-artifacts">
          <CardHeader>
            <CardTitle>Recent Artifacts</CardTitle>
            <CardDescription>
              Latest research outputs and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {artifacts.slice(0, 5).map((artifact: any) => (
                <div 
                  key={artifact.id} 
                  className="flex items-center justify-between p-3 rounded-md border border-border hover-elevate"
                  data-testid={`artifact-${artifact.id}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{artifact.artifactType}</p>
                      <p className="text-xs text-muted-foreground">
                        Version {artifact.version} • {new Date(artifact.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-view-artifact-${artifact.id}`}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Analysis Hub Tab - Comprehensive research and analysis workspace
function AnalysisHubTab({ workflowId, artifacts }: { workflowId: string; artifacts: any[] | undefined }) {
  // Group artifacts by type
  const artifactsByType = artifacts?.reduce((acc: Record<string, any[]>, artifact) => {
    const type = artifact.artifactType || "OTHER";
    if (!acc[type]) acc[type] = [];
    acc[type].push(artifact);
    return acc;
  }, {}) || {};

  // Sort artifacts by creation date (newest first)
  Object.keys(artifactsByType).forEach(type => {
    artifactsByType[type].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  const sections = [
    {
      id: "fundamental",
      title: "Fundamental Analysis",
      description: "Core business research and valuation",
      icon: Target,
      color: "text-blue-500",
      artifacts: [
        { type: "RESEARCH_BRIEF", label: "Research Brief", icon: FileText },
        { type: "FINANCIAL_MODEL", label: "Financial Model", icon: BarChart3 },
        { type: "INVESTMENT_THESIS", label: "Investment Thesis", icon: Sparkles },
      ]
    },
    {
      id: "quantitative",
      title: "Quantitative & Technical",
      description: "Data-driven analysis and quant models",
      icon: TrendingUp,
      color: "text-green-500",
      artifacts: [
        { type: "QUANT_ANALYSIS", label: "Quant Analysis", icon: BarChart3 },
        { type: "TECHNICAL_ANALYSIS", label: "Technical Analysis", icon: TrendingDown },
      ]
    },
    {
      id: "risk",
      title: "Risk Assessment",
      description: "Risk factors and mitigation strategies",
      icon: Shield,
      color: "text-red-500",
      artifacts: [
        { type: "RISK_ANALYSIS", label: "Risk Analysis", icon: AlertCircle },
        { type: "SCENARIO_ANALYSIS", label: "Scenario Simulator", icon: GitBranch },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" data-testid="title-analysis-hub">Analysis Hub</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive research outputs and analysis tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-export-all">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Analysis Sections */}
      <div className="space-y-4">
        {sections.map(section => (
          <AnalysisSection
            key={section.id}
            section={section}
            artifacts={artifactsByType}
            workflowId={workflowId}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Generate new research outputs or refresh existing analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start" data-testid="button-generate-brief">
              <Plus className="h-4 w-4 mr-2" />
              Research Brief
            </Button>
            <Button variant="outline" className="justify-start" data-testid="button-generate-model">
              <Plus className="h-4 w-4 mr-2" />
              Financial Model
            </Button>
            <Button variant="outline" className="justify-start" data-testid="button-generate-quant">
              <Plus className="h-4 w-4 mr-2" />
              Quant Analysis
            </Button>
            <Button variant="outline" className="justify-start" data-testid="button-generate-risk">
              <Plus className="h-4 w-4 mr-2" />
              Risk Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Analysis Section Component with collapsible artifact list
function AnalysisSection({ 
  section, 
  artifacts,
  workflowId 
}: { 
  section: any; 
  artifacts: Record<string, any[]>;
  workflowId: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const SectionIcon = section.icon;

  // Count total artifacts in this section
  const totalCount = section.artifacts.reduce((sum: number, art: any) => {
    return sum + (artifacts[art.type]?.length || 0);
  }, 0);

  return (
    <Card data-testid={`section-${section.id}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover-elevate active-elevate-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md bg-muted ${section.color}`}>
                  <SectionIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" data-testid={`badge-count-${section.id}`}>
                  {totalCount} {totalCount === 1 ? "artifact" : "artifacts"}
                </Badge>
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {section.artifacts.map((artifactDef: any) => {
              const artifactList = artifacts[artifactDef.type] || [];
              const ArtifactIcon = artifactDef.icon;
              const latestArtifact = artifactList[0];

              return (
                <div 
                  key={artifactDef.type} 
                  className="border border-border rounded-md p-4 space-y-3"
                  data-testid={`artifact-group-${artifactDef.type}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArtifactIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{artifactDef.label}</span>
                      {artifactList.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {artifactList.length} version{artifactList.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-generate-${artifactDef.type}`}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  </div>

                  {artifactList.length > 0 ? (
                    <div className="space-y-2">
                      {/* Latest Artifact */}
                      <div 
                        className="p-3 rounded-md bg-muted/50 border border-border"
                        data-testid={`latest-${artifactDef.type}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="default" className="text-xs">Latest</Badge>
                              <span className="text-xs text-muted-foreground">
                                v{latestArtifact.version}
                              </span>
                            </div>
                            {latestArtifact.summary && (
                              <p className="text-sm line-clamp-2">{latestArtifact.summary}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(latestArtifact.createdAt).toLocaleDateString()} • 
                              {latestArtifact.generatedBy && ` Generated by ${latestArtifact.generatedBy}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              data-testid={`button-view-${latestArtifact.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              data-testid={`button-download-${latestArtifact.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Version History (collapsed) */}
                      {artifactList.length > 1 && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground px-2">
                            View {artifactList.length - 1} older version{artifactList.length > 2 ? "s" : ""}
                          </summary>
                          <div className="mt-2 space-y-1">
                            {artifactList.slice(1).map((artifact: any) => (
                              <div 
                                key={artifact.id}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                                data-testid={`artifact-${artifact.id}`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-xs font-mono text-muted-foreground">
                                    v{artifact.version}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {new Date(artifact.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-6 w-6"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-6 w-6"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No {artifactDef.label.toLowerCase()} generated yet</p>
                      <p className="text-xs mt-1">Click Generate to create one</p>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// IC Meeting Tab - Real-time collaborative meeting room
function ICMeetingTab({ workflowId }: { workflowId: string }) {
  const { user } = useAuth();
  const permissions = getPermissions(user);
  const [selectedVote, setSelectedVote] = useState<"APPROVE" | "REJECT" | "ABSTAIN" | null>(null);
  const [debateMessage, setDebateMessage] = useState("");

  // Fetch IC meetings for this workflow
  const { data: meetings, isLoading: meetingsLoading } = useQuery<any[]>({
    queryKey: [`/api/workflows/${workflowId}/ic-meetings`],
    enabled: !!workflowId,
  });

  const activeMeeting = meetings?.find(m => m.status === "IN_PROGRESS") || meetings?.[0];

  // Fetch debate messages for the active meeting
  const { data: debateMessages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: [`/api/ic-meetings`, activeMeeting?.id, "debate-messages"],
    queryFn: () => fetch(`/api/ic-meetings/${activeMeeting?.id}/debate-messages`).then(res => res.json()),
    enabled: !!activeMeeting?.id,
  });

  // Fetch votes for the active meeting
  const { data: votes = [], isLoading: votesLoading } = useQuery<any[]>({
    queryKey: [`/api/ic-meetings`, activeMeeting?.id, "votes"],
    queryFn: () => fetch(`/api/ic-meetings/${activeMeeting?.id}/votes`).then(res => res.json()),
    enabled: !!activeMeeting?.id,
  });

  // Calculate vote tallies from real data
  const votesByType = votes.reduce((acc, vote) => {
    acc[vote.vote] = (acc[vote.vote] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const voteTally = {
    APPROVE: votesByType.APPROVE || 0,
    REJECT: votesByType.REJECT || 0,
    ABSTAIN: votesByType.ABSTAIN || 0,
  };

  return (
    <div className="space-y-6">
      {/* Meeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" data-testid="title-ic-meeting">
            IC Meeting Room
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeMeeting ? `Meeting #${activeMeeting.id}` : "No active meeting"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeMeeting?.status === "IN_PROGRESS" ? (
            <Badge variant="default" className="gap-2" data-testid="badge-meeting-live">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </Badge>
          ) : (
            <Button data-testid="button-start-meeting">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Meeting
            </Button>
          )}
        </div>
      </div>

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Defender View (Bull Case) */}
        <Card data-testid="card-bull-case">
          <CardHeader className="bg-green-500/10 border-b border-green-500/20">
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              Bull Case
            </CardTitle>
            <CardDescription>Investment thesis and supporting arguments</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Investment Thesis</h4>
              <p className="text-sm text-muted-foreground">
                Strong secular growth in AI infrastructure spending driven by increasing enterprise adoption.
                Best-in-class margins and market position provide durable competitive moat.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Key Catalysts</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Next-gen product cycle launching Q2 with 40% performance improvement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Expanding TAM in automotive and edge computing markets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Strong pricing power with 65%+ gross margins sustainable</span>
                </li>
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Valuation</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Price Target</p>
                  <p className="text-lg font-mono font-semibold text-green-600 dark:text-green-400">$145</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Upside</p>
                  <p className="text-lg font-mono font-semibold text-green-600 dark:text-green-400">+22%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Contrarian View (Bear Case) */}
        <Card data-testid="card-bear-case">
          <CardHeader className="bg-red-500/10 border-b border-red-500/20">
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <TrendingDown className="h-5 w-5" />
              Bear Case
            </CardTitle>
            <CardDescription>AI-generated contrarian analysis and risks</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                AI Contrarian View
              </h4>
              <p className="text-sm text-muted-foreground">
                While growth narrative is compelling, valuation already reflects near-perfect execution.
                Competition intensifying from hyperscalers developing in-house solutions. Cyclical risks understated.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Key Risks</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Customer concentration: Top 3 customers represent 45% of revenue</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Geopolitical headwinds: Export restrictions to China impact 25% of TAM</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Valuation: Trading at 35x NTM P/E vs 5-year avg of 22x</span>
                </li>
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Alternative Scenario</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Downside Target</p>
                  <p className="text-lg font-mono font-semibold text-red-600 dark:text-red-400">$95</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Risk</p>
                  <p className="text-lg font-mono font-semibold text-red-600 dark:text-red-400">-20%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voting Section */}
      <Card data-testid="card-voting">
        <CardHeader>
          <CardTitle>Committee Vote</CardTitle>
          <CardDescription>
            {permissions.canVoteInMeeting 
              ? "Cast your vote and view committee consensus"
              : "View committee vote results (voting restricted to PM and Admin roles)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!permissions.canVoteInMeeting && (
            <div className="p-3 rounded-md bg-muted border border-muted-foreground/20 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Your role ({user?.role}) can participate in discussions but cannot vote. Only Portfolio Managers and Administrators can vote.</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={selectedVote === "APPROVE" ? "default" : "outline"}
              className={selectedVote === "APPROVE" ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setSelectedVote("APPROVE")}
              disabled={!permissions.canVoteInMeeting}
              data-testid="button-vote-approve"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve ({voteTally.APPROVE})
            </Button>
            <Button
              variant={selectedVote === "REJECT" ? "default" : "outline"}
              className={selectedVote === "REJECT" ? "bg-red-600 hover:bg-red-700" : ""}
              onClick={() => setSelectedVote("REJECT")}
              disabled={!permissions.canVoteInMeeting}
              data-testid="button-vote-reject"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Reject ({voteTally.REJECT})
            </Button>
            <Button
              variant={selectedVote === "ABSTAIN" ? "default" : "outline"}
              onClick={() => setSelectedVote("ABSTAIN")}
              disabled={!permissions.canVoteInMeeting}
              data-testid="button-vote-abstain"
            >
              Abstain ({voteTally.ABSTAIN})
            </Button>
          </div>

          {/* Vote Tally */}
          <div className="p-4 rounded-md bg-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Vote Tally</span>
              <span className="text-sm text-muted-foreground">{votes.length} members voted</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-8 rounded bg-green-600 flex items-center justify-center text-white text-sm font-medium">
                {voteTally.APPROVE}
              </div>
              <div className="flex-1 h-8 rounded bg-red-600 flex items-center justify-center text-white text-sm font-medium">
                {voteTally.REJECT}
              </div>
              <div className="flex-1 h-8 rounded bg-muted-foreground flex items-center justify-center text-white text-sm font-medium">
                {voteTally.ABSTAIN}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debate & Discussion */}
      <Card data-testid="card-debate">
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
          <CardDescription>
            Live debate and Q&A with real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Real Debate Messages */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messagesLoading ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Loading discussion...
              </div>
            ) : debateMessages.length > 0 ? (
              debateMessages.map((msg: any, index: number) => {
                // Format timestamp
                const timestamp = msg.createdAt 
                  ? new Date(msg.createdAt).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })
                  : 'Just now';
                
                // Determine if this is an AI agent message
                const isAI = msg.senderRole?.includes('AGENT') || msg.senderRole === 'BULL_AGENT' || msg.senderRole === 'BEAR_AGENT';
                
                return (
                  <DebateMessage
                    key={msg.id || index}
                    author={`${msg.senderName} ${!isAI ? `(${msg.senderRole})` : ''}`}
                    timestamp={timestamp}
                    message={msg.content}
                    type={isAI ? "ai" : "comment"}
                  />
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No discussion yet</p>
                <p className="text-xs mt-1">Start the conversation below</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add to discussion..."
              className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
              value={debateMessage}
              onChange={(e) => setDebateMessage(e.target.value)}
              data-testid="input-debate-message"
            />
            <Button data-testid="button-send-message">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Debate Message Component
function DebateMessage({ 
  author, 
  timestamp, 
  message, 
  type 
}: { 
  author: string; 
  timestamp: string; 
  message: string; 
  type: "comment" | "ai";
}) {
  return (
    <div 
      className={`p-3 rounded-md ${type === "ai" ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-muted"}`}
      data-testid={`debate-message-${type}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{author}</span>
          {type === "ai" && (
            <Badge variant="outline" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{timestamp}</span>
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// Execution Tab (Placeholder)
function ExecutionTab({ workflowId }: { workflowId: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Execution Suite</CardTitle>
          <CardDescription>
            Trade preparation, compliance checks, and execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Execution Suite implementation coming in next task...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Monitoring Tab (Placeholder)
function MonitoringTab({ workflowId }: { workflowId: string }) {
  const [selectedMetric, setSelectedMetric] = useState<"all" | "price" | "fundamentals" | "market">("all");

  // Fetch monitoring events
  const { data: events, isLoading: eventsLoading } = useQuery<MonitoringEventType[]>({
    queryKey: [`/api/workflows/${workflowId}/monitoring/events`],
    enabled: !!workflowId,
  });

  // Fetch thesis health metrics
  const { data: healthMetric, isLoading: healthLoading } = useQuery<ThesisHealthMetric>({
    queryKey: [`/api/workflows/${workflowId}/monitoring/thesis-health`],
    enabled: !!workflowId,
  });

  // Use actual data or fallback to demo data if API not ready
  const displayEvents = events && events.length > 0 ? events : [
    {
      id: "demo-1",
      workflowId,
      ticker: "DEMO",
      eventType: "PRICE_ALERT",
      severity: "HIGH",
      title: "Price moved -8% below target",
      description: "Current price $132 vs target $145, triggering review threshold",
      eventData: {},
      status: "ACTIVE",
      triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolvedAt: null,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "demo-2",
      workflowId,
      ticker: "DEMO",
      eventType: "FUNDAMENTAL",
      severity: "MEDIUM",
      title: "Earnings beat expectations",
      description: "Q3 EPS $2.15 vs est. $1.98, revenue $14.2B vs $13.8B expected",
      eventData: {},
      status: "RESOLVED",
      triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: "demo-3",
      workflowId,
      ticker: "DEMO",
      eventType: "MARKET_EVENT",
      severity: "LOW",
      title: "Analyst upgrade from Morgan Stanley",
      description: "Upgraded to Overweight with $155 price target",
      eventData: {},
      status: "RESOLVED",
      triggeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  ] as MonitoringEventType[];

  // Map healthMetric to display format, with fallback for demo
  const displayHealth = healthMetric ? {
    overall: healthMetric.healthScore,
    catalyst: 85, // Would extract from catalystsStatus jsonb in production
    risk: 65, // Would extract from risksStatus jsonb in production
    valuation: 72 // Would extract from keyMetrics jsonb in production
  } : {
    overall: 78,
    catalyst: 85,
    risk: 65,
    valuation: 72
  };

  // Filter events based on selected metric
  const filteredEvents = selectedMetric === "all" 
    ? displayEvents 
    : displayEvents.filter((e) => {
        const type = e.eventType.toLowerCase();
        if (selectedMetric === "price") return type.includes("price");
        if (selectedMetric === "fundamentals") return type.includes("fundamental");
        if (selectedMetric === "market") return type.includes("market");
        return true;
      });

  // Show loading state
  if (eventsLoading || healthLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-20 w-64" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Thesis Health */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold" data-testid="title-monitoring">
            Monitoring Center
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track thesis health, market events, and automated alerts
          </p>
        </div>
        
        {/* Thesis Health Score */}
        <Card className="w-64" data-testid="card-thesis-health">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Thesis Health Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${displayHealth.overall * 2} ${200 - displayHealth.overall * 2}`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{displayHealth.overall}</span>
                </div>
              </div>
              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Catalysts</span>
                  <span className="font-mono">{displayHealth.catalyst}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Valuation</span>
                  <span className="font-mono">{displayHealth.valuation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Risk</span>
                  <span className="font-mono">{displayHealth.risk}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Rules */}
      <Card data-testid="card-alert-rules">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alert Rules</CardTitle>
              <CardDescription>Automated monitoring thresholds and notifications</CardDescription>
            </div>
            <Button size="sm" variant="outline" data-testid="button-add-rule">
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AlertRule
              name="Price threshold"
              condition="Price moves ±10% from target"
              status="ACTIVE"
              triggered={1}
            />
            <AlertRule
              name="Earnings release"
              condition="Notify 1 day before earnings"
              status="ACTIVE"
              triggered={0}
            />
            <AlertRule
              name="Insider trading"
              condition="Notify on Form 4 filings"
              status="ACTIVE"
              triggered={0}
            />
            <AlertRule
              name="Analyst rating change"
              condition="Major bank upgrades/downgrades"
              status="ACTIVE"
              triggered={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Stream */}
      <Card data-testid="card-event-stream">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event Stream</CardTitle>
              <CardDescription>Real-time monitoring events and market alerts</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedMetric === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("all")}
                data-testid="filter-all"
              >
                All
              </Button>
              <Button
                variant={selectedMetric === "price" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("price")}
                data-testid="filter-price"
              >
                Price
              </Button>
              <Button
                variant={selectedMetric === "fundamentals" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("fundamentals")}
                data-testid="filter-fundamentals"
              >
                Fundamentals
              </Button>
              <Button
                variant={selectedMetric === "market" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("market")}
                data-testid="filter-market"
              >
                Market
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvents.length > 0 ? (
            <div className="space-y-3">
              {filteredEvents.map(event => (
                <MonitoringEvent key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No events found</p>
              <p className="text-xs mt-1">Try adjusting your filters or check back later</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Timeline */}
      <Card data-testid="card-timeline">
        <CardHeader>
          <CardTitle>Performance Timeline</CardTitle>
          <CardDescription>Historical price movement and key milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chart visualization placeholder</p>
              <p className="text-xs mt-1">Would integrate with charting library (Recharts)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Alert Rule Component
function AlertRule({ 
  name, 
  condition, 
  status, 
  triggered 
}: { 
  name: string; 
  condition: string; 
  status: string; 
  triggered: number;
}) {
  return (
    <div 
      className="flex items-center justify-between p-3 rounded-md border border-border hover-elevate"
      data-testid={`alert-rule-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-2 h-2 rounded-full ${status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{condition}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {triggered > 0 && (
          <Badge variant="outline" className="text-xs">
            {triggered} trigger{triggered !== 1 ? "s" : ""}
          </Badge>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Monitoring Event Component
function MonitoringEvent({ event }: { event: MonitoringEventType }) {
  const severityColors = {
    HIGH: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
    MEDIUM: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    LOW: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"
  };

  const timeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div 
      className={`p-4 rounded-md border ${severityColors[event.severity as keyof typeof severityColors]}`}
      data-testid={`event-${event.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {event.eventType.replace(/_/g, " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">{timeAgo(event.triggeredAt)}</span>
            {event.status === "RESOLVED" && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
          <h4 className="font-medium text-sm mb-1">{event.title}</h4>
          <p className="text-sm text-muted-foreground">{event.description}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
