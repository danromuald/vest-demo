import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, Clock, CheckCircle2, AlertCircle, TrendingUp, Bot, Loader2 } from "lucide-react";
import { AgentPanel } from "@/components/agent-panel";
import type { ResearchRequest } from "@shared/schema";

const researchRequestFormSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").max(10).regex(/^[A-Z]+$/, "Invalid ticker"),
  companyName: z.string().min(1, "Company name is required"),
  requestedBy: z.string().min(1, "Requester is required"),
  assignedTo: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  description: z.string().optional(),
  researchType: z.enum(["INITIAL", "UPDATE", "DEEP_DIVE"]),
});

type ResearchRequestFormValues = z.infer<typeof researchRequestFormSchema>;

const proposalFormSchema = z.object({
  ticker: z.string().min(1, "Ticker is required"),
  companyName: z.string().min(1, "Company name is required"),
  analyst: z.string().min(1, "Analyst is required"),
  proposalType: z.enum(["BUY", "SELL", "HOLD"]),
  proposedWeight: z.string().min(1, "Weight is required"),
  targetPrice: z.string().optional(),
  thesis: z.string().min(10, "Thesis must be at least 10 characters"),
  catalysts: z.string().optional(),
  risks: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

export default function Research() {
  const [selectedRequest, setSelectedRequest] = useState<ResearchRequest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
  const [showAIAgents, setShowAIAgents] = useState(false);
  const [researchBrief, setResearchBrief] = useState<any>(null);
  const [dcfModel, setDcfModel] = useState<any>(null);
  const { toast } = useToast();

  // Fetch agent responses for the selected research request's ticker
  const { data: agentResponses } = useQuery<any[]>({
    queryKey: ["/api/agent-responses", selectedRequest?.ticker],
    queryFn: selectedRequest?.ticker 
      ? () => fetch(`/api/agent-responses?ticker=${selectedRequest.ticker}`).then(res => res.json())
      : undefined,
    enabled: !!selectedRequest?.ticker,
  });

  // Helper to get research brief from either newly generated or saved data
  const getResearchBrief = () => {
    if (researchBrief) return researchBrief; // Newly generated takes precedence
    if (agentResponses && Array.isArray(agentResponses)) {
      const saved = agentResponses.find((r: any) => r.agentType === 'RESEARCH_SYNTHESIZER');
      return saved?.response || null;
    }
    return null;
  };

  // Helper to get DCF model from either newly generated or saved data
  const getDcfModel = () => {
    if (dcfModel) return dcfModel; // Newly generated takes precedence
    if (agentResponses && Array.isArray(agentResponses)) {
      const saved = agentResponses.find((r: any) => r.agentType === 'FINANCIAL_MODELER');
      return saved?.response || null;
    }
    return null;
  };

  // Check if both analyses are complete (either newly generated or saved)
  const hasBothAnalyses = () => {
    const brief = getResearchBrief();
    const dcf = getDcfModel();
    return !!(brief && dcf);
  };

  const form = useForm<ResearchRequestFormValues>({
    resolver: zodResolver(researchRequestFormSchema),
    defaultValues: {
      ticker: "",
      companyName: "",
      requestedBy: "user-1",
      status: "PENDING",
      priority: "MEDIUM",
      researchType: "INITIAL",
    },
  });

  const editForm = useForm<ResearchRequestFormValues>({
    resolver: zodResolver(researchRequestFormSchema),
  });

  const proposalForm = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      analyst: "Sarah Chen",
      proposalType: "BUY",
      status: "DRAFT",
    },
  });

  const { data: researchRequests, isLoading } = useQuery<ResearchRequest[]>({
    queryKey: ["/api/research-requests"],
  });

  const { data: workflowStages } = useQuery({
    queryKey: ["/api/workflow-stages"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ResearchRequestFormValues) => {
      return await apiRequest("POST", "/api/research-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-stages"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Research request created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create research request",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ResearchRequestFormValues> }) => {
      return await apiRequest("PATCH", `/api/research-requests/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-requests"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Research request updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update research request",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/research-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-stages"] });
      toast({
        title: "Success",
        description: "Research request deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete research request",
        variant: "destructive",
      });
    },
  });

  const researchMutation = useMutation({
    mutationFn: async (ticker: string) => {
      return await apiRequest("POST", "/api/agents/research-synthesizer", { ticker });
    },
    onSuccess: async (data) => {
      setResearchBrief(data);
      // After both analyses complete, advance workflow to ANALYSIS stage
      if (selectedRequest && dcfModel) {
        await advanceWorkflowToAnalysis();
      }
    },
  });

  const dcfMutation = useMutation({
    mutationFn: async (ticker: string) => {
      return await apiRequest("POST", "/api/agents/financial-modeler", { ticker });
    },
    onSuccess: async (data) => {
      setDcfModel(data);
      // After both analyses complete, advance workflow to ANALYSIS stage
      if (selectedRequest && researchBrief) {
        await advanceWorkflowToAnalysis();
      }
    },
  });

  const advanceWorkflowToAnalysis = async () => {
    if (!selectedRequest) return;
    
    try {
      await apiRequest("POST", `/api/workflow/RESEARCH/${selectedRequest.id}/advance`, {
        userId: "user-1",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-stages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/research-requests"] });
    } catch (error) {
      console.error("Failed to advance workflow stage:", error);
    }
  };

  const generateThesisMutation = useMutation({
    mutationFn: async ({ ticker, companyName, researchData, dcfData }: any) => {
      return await apiRequest("POST", "/api/agents/thesis-generator", {
        ticker,
        companyName,
        researchData,
        dcfData,
      });
    },
    onSuccess: (data: any) => {
      if (data.thesis) {
        proposalForm.setValue('thesis', data.thesis);
      }
      if (data.catalysts && data.catalysts.length > 0) {
        proposalForm.setValue('catalysts', data.catalysts.join('\n'));
      }
      if (data.risks && data.risks.length > 0) {
        proposalForm.setValue('risks', data.risks.join('\n'));
      }
      if (data.targetPrice) {
        proposalForm.setValue('targetPrice', data.targetPrice.toString());
      }
      toast({
        title: "Thesis Generated",
        description: "AI has drafted your investment thesis",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate thesis",
        variant: "destructive",
      });
    },
  });

  const createProposalMutation = useMutation({
    mutationFn: async (data: ProposalFormValues) => {
      // Guard: Ensure we have a selected research request
      if (!selectedRequest) {
        throw new Error("No research request selected");
      }

      const catalystsArray = data.catalysts ? data.catalysts.split('\n').filter(c => c.trim()) : [];
      const risksArray = data.risks ? data.risks.split('\n').filter(r => r.trim()) : [];
      
      // Create the proposal
      const proposal: any = await apiRequest("POST", "/api/proposals", {
        ...data,
        catalysts: catalystsArray,
        risks: risksArray,
        proposedWeight: data.proposedWeight,
        targetPrice: data.targetPrice || null,
      });

      // Update the research request to link to the proposal
      await apiRequest("PATCH", `/api/research-requests/${selectedRequest.id}`, {
        proposalId: proposal.id,
      });

      // Advance workflow stage from ANALYSIS to IC_MEETING
      // If workflow stage doesn't exist, this will fail and we'll surface the error
      await apiRequest("POST", `/api/workflow/RESEARCH/${selectedRequest.id}/advance`, {
        userId: "user-1",
      });

      return proposal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/research-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-stages"] });
      setIsProposalDialogOpen(false);
      proposalForm.reset();
      toast({
        title: "Success",
        description: "Investment proposal created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create proposal",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (values: ResearchRequestFormValues) => {
    createMutation.mutate(values);
  };

  const handleEditSubmit = (values: ResearchRequestFormValues) => {
    if (selectedRequest) {
      updateMutation.mutate({ id: selectedRequest.id, data: values });
    }
  };

  const handleEditClick = (request: ResearchRequest) => {
    setSelectedRequest(request);
    editForm.reset({
      ticker: request.ticker,
      companyName: request.companyName,
      requestedBy: request.requestedBy,
      assignedTo: request.assignedTo || undefined,
      status: request.status as any,
      priority: request.priority as any,
      description: request.description || undefined,
      researchType: request.researchType as any,
    });
    setIsEditDialogOpen(true);
  };

  const handleAIAnalysis = (request: ResearchRequest) => {
    setSelectedRequest(request);
    setShowAIAgents(true);
    // Reset previous newly-generated data to show clean loading state
    // (saved data will still be fetched via the query)
    setResearchBrief(null);
    setDcfModel(null);
    researchMutation.mutate(request.ticker);
    dcfMutation.mutate(request.ticker);
  };

  const handleViewAnalysis = (request: ResearchRequest) => {
    // First invalidate to force a fresh fetch
    queryClient.invalidateQueries({ queryKey: ["/api/agent-responses", request.ticker] });
    // Then set the selected request (this will trigger the query)
    setSelectedRequest(request);
    setShowAIAgents(true);
    // Don't reset local state - we want to show saved data
    
    // Scroll to AI section after a brief delay to let it render
    setTimeout(() => {
      const element = document.querySelector('[data-testid="ai-analysis-section"]');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCreateProposal = (request: ResearchRequest) => {
    proposalForm.reset({
      ticker: request.ticker,
      companyName: request.companyName,
      analyst: "Sarah Chen",
      proposalType: "BUY",
      proposedWeight: "",
      targetPrice: "",
      thesis: "",
      catalysts: "",
      risks: "",
      status: "DRAFT",
    });
    setSelectedRequest(request);
    setIsProposalDialogOpen(true);
  };

  const handleProposalSubmit = (values: ProposalFormValues) => {
    createProposalMutation.mutate(values);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-chart-2" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-primary" />;
      case "BLOCKED":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "default";
      case "MEDIUM":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getWorkflowStage = (entityId: string) => {
    if (!workflowStages) return null;
    return (workflowStages as any[]).find((s: any) => s.entityId === entityId && s.entityType === "RESEARCH");
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
            Research Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage research requests and AI-powered investment analysis
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-request">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Research Request</DialogTitle>
              <DialogDescription>
                Submit a new research request for investment analysis
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ticker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticker Symbol</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="NVDA"
                            className="font-mono uppercase"
                            data-testid="input-ticker"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nvidia Corporation"
                            data-testid="input-company-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="researchType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Research Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INITIAL">Initial</SelectItem>
                            <SelectItem value="UPDATE">Update</SelectItem>
                            <SelectItem value="DEEP_DIVE">Deep Dive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Additional context or requirements..."
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-request"
                  >
                    Create Request
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Research Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Research Requests</CardTitle>
          <CardDescription>Track and manage ongoing investment research</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Loading research requests...
            </div>
          ) : !researchRequests || researchRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">No research requests found</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first request to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {researchRequests.map((request) => {
                const workflowStage = getWorkflowStage(request.id);
                return (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 rounded-md border p-4 hover-elevate"
                    data-testid={`card-request-${request.ticker}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-foreground">{request.ticker}</span>
                        <Badge variant={getPriorityColor(request.priority)} className="text-xs">
                          {request.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {request.researchType}
                        </Badge>
                      </div>
                      {request.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {request.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          <span>{request.status}</span>
                        </div>
                        {workflowStage && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span className="capitalize">{workflowStage.currentStage.toLowerCase()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!request.proposalId && (() => {
                        const workflowStage = getWorkflowStage(request.id);
                        const isAnalysisStage = workflowStage?.currentStage === "ANALYSIS" || 
                                              workflowStage?.currentStage === "IC_PREP" ||
                                              workflowStage?.currentStage === "IC_MEETING";
                        
                        // Show button if workflow is at analysis stage or later
                        if (isAnalysisStage) {
                          return (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCreateProposal(request)}
                              data-testid={`button-create-proposal-${request.ticker}`}
                            >
                              <Plus className="h-3 w-3" />
                              Create Proposal
                            </Button>
                          );
                        }
                        return null;
                      })()}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIAnalysis(request)}
                        data-testid={`button-analyze-${request.ticker}`}
                      >
                        <Bot className="h-3 w-3" />
                        {workflowStage && workflowStage.currentStage === "ANALYSIS" ? "Regenerate" : "AI Analysis"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAnalysis(request)}
                        data-testid={`button-view-analysis-${request.ticker}`}
                      >
                        <Search className="h-3 w-3" />
                        View Analysis
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(request)}
                        data-testid={`button-edit-${request.ticker}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(request.id)}
                        data-testid={`button-delete-${request.ticker}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Research Request</DialogTitle>
            <DialogDescription>Update research request details</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  Update Request
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Proposal Dialog */}
      <Dialog open={isProposalDialogOpen} onOpenChange={setIsProposalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Investment Proposal</DialogTitle>
            <DialogDescription>
              Submit an investment proposal based on completed research
            </DialogDescription>
          </DialogHeader>
          <Form {...proposalForm}>
            <form onSubmit={proposalForm.handleSubmit(handleProposalSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={proposalForm.control}
                  name="ticker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticker Symbol</FormLabel>
                      <FormControl>
                        <Input {...field} className="font-mono" disabled data-testid="input-proposal-ticker" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={proposalForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled data-testid="input-proposal-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={proposalForm.control}
                  name="analyst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analyst</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-proposal-analyst" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={proposalForm.control}
                  name="proposalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recommendation</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-proposal-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BUY">Buy</SelectItem>
                          <SelectItem value="SELL">Sell</SelectItem>
                          <SelectItem value="HOLD">Hold</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={proposalForm.control}
                  name="proposedWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposed Weight (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="5.00" data-testid="input-proposal-weight" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={proposalForm.control}
                  name="targetPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Price (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="150.00" data-testid="input-proposal-target-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={proposalForm.control}
                name="thesis"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel>Investment Thesis</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedRequest) {
                            // Use helper functions to get data from saved responses or local state
                            const researchData = getResearchBrief();
                            const dcfData = getDcfModel();
                            
                            generateThesisMutation.mutate({
                              ticker: selectedRequest.ticker,
                              companyName: selectedRequest.companyName,
                              researchData,
                              dcfData,
                            });
                          }
                        }}
                        disabled={generateThesisMutation.isPending || !selectedRequest}
                        data-testid="button-generate-thesis"
                      >
                        {generateThesisMutation.isPending ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Bot className="h-3 w-3 mr-1" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe the core investment thesis and why this is a compelling opportunity..."
                        className="min-h-[100px]"
                        data-testid="input-proposal-thesis"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={proposalForm.control}
                name="catalysts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catalysts (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Product launch in Q2&#10;New market expansion&#10;Regulatory approval expected"
                        className="min-h-[80px]"
                        data-testid="input-proposal-catalysts"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={proposalForm.control}
                name="risks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risks (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Competition from larger players&#10;Regulatory uncertainty&#10;Execution risk on new products"
                        className="min-h-[80px]"
                        data-testid="input-proposal-risks"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={proposalForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-proposal-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createProposalMutation.isPending}
                  data-testid="button-submit-proposal"
                >
                  {createProposalMutation.isPending ? "Creating..." : "Create Proposal"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AI Agents */}
      {showAIAgents && selectedRequest && (
        <Card data-testid="ai-analysis-section">
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
            <CardDescription>
              Analysis for {selectedRequest.ticker} - {selectedRequest.companyName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <AgentPanel
                agentName="Research Synthesizer"
                agentType="RESEARCH_SYNTHESIZER"
                description="Comprehensive investment briefs from SEC filings and market data"
                isGenerating={researchMutation.isPending}
                response={getResearchBrief()}
                onInvoke={() => {
                  if (selectedRequest) researchMutation.mutate(selectedRequest.ticker);
                }}
              />

              <AgentPanel
                agentName="Financial Modeler"
                agentType="FINANCIAL_MODELER"
                description="DCF models with bull/base/bear scenarios"
                isGenerating={dcfMutation.isPending}
                response={getDcfModel()}
                onInvoke={() => {
                  if (selectedRequest) dcfMutation.mutate(selectedRequest.ticker);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
