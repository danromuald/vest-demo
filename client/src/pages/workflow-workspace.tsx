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
import type { Workflow } from "@shared/schema";

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

// IC Meeting Tab (Placeholder)
function ICMeetingTab({ workflowId }: { workflowId: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>IC Meeting Room</CardTitle>
          <CardDescription>
            Real-time collaborative investment committee meeting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            IC Meeting Room implementation coming in next task...
          </p>
        </CardContent>
      </Card>
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
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Center</CardTitle>
          <CardDescription>
            Thesis monitoring, market events, and portfolio tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Monitoring Center implementation coming in next task...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
