import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  User,
  Calendar,
  Target,
  Loader2,
  Filter,
  CalendarPlus
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Proposal } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const proposalFormSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").max(10).regex(/^[A-Z]+$/, "Ticker must be uppercase letters"),
  companyName: z.string().min(1, "Company name is required"),
  analyst: z.string().min(1, "Analyst name is required"),
  proposalType: z.enum(["BUY", "SELL", "HOLD"]),
  proposedWeight: z.string().min(1, "Proposed weight is required"),
  targetPrice: z.string().optional(),
  thesis: z.string().min(10, "Thesis must be at least 10 characters"),
  catalysts: z.string().optional(),
  risks: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

export default function ProposalsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: proposals = [], isLoading, isError, error, refetch } = useQuery<Proposal[]>({
    queryKey: ['/api/proposals'],
  });

  // Fetch workflows to show workflow stage on proposal cards
  const { data: workflows = [] } = useQuery<any[]>({
    queryKey: ['/api/workflows'],
  });

  // Helper to find workflow for a proposal
  const getWorkflowForProposal = (proposal: Proposal) => {
    return workflows.find(w => w.id === proposal.workflowId);
  };

  // Helper to get workflow stage label
  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      DISCOVERY: "Discovery",
      ANALYSIS: "Analysis",
      IC_MEETING: "IC Meeting",
      EXECUTION: "Execution",
      MONITORING: "Monitoring"
    };
    return labels[stage] || stage;
  };

  // Helper to get workflow stage color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "DISCOVERY": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "ANALYSIS": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "IC_MEETING": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "EXECUTION": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "MONITORING": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      default: return "bg-muted/50 text-muted-foreground border-muted";
    }
  };

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      ticker: "",
      companyName: "",
      analyst: "Sarah Chen",
      proposalType: "BUY",
      proposedWeight: "",
      targetPrice: "",
      thesis: "",
      catalysts: "",
      risks: "",
      status: "DRAFT",
    },
  });

  const createProposalMutation = useMutation({
    mutationFn: async (values: ProposalFormValues) => {
      const catalystsArray = values.catalysts
        ? values.catalysts.split('\n').filter(c => c.trim())
        : [];
      const risksArray = values.risks
        ? values.risks.split('\n').filter(r => r.trim())
        : [];

      const payload = {
        ticker: values.ticker.toUpperCase(),
        companyName: values.companyName,
        analyst: values.analyst,
        proposalType: values.proposalType,
        proposedWeight: values.proposedWeight,
        targetPrice: values.targetPrice || undefined,
        thesis: values.thesis,
        catalysts: catalystsArray.length > 0 ? catalystsArray : undefined,
        risks: risksArray.length > 0 ? risksArray : undefined,
        status: values.status,
      };

      const response = await apiRequest('POST', '/api/proposals', payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Proposal Created",
        description: "Investment proposal has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: ProposalFormValues) => {
    createProposalMutation.mutate(values);
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.ticker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.analyst?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;
    const matchesType = typeFilter === "all" || proposal.proposalType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return 'N/A';
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BUY": return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "SELL": return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "HOLD": return "bg-chart-4/10 text-chart-4/10 border-chart-4/20";
      default: return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "REJECTED": return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "PENDING": return "bg-chart-4/10 text-chart-4 border-chart-4/20";
      case "DRAFT": return "bg-muted/50 text-muted-foreground border-muted";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading proposals...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <p className="text-lg font-medium text-foreground">Failed to load proposals</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
              data-testid="button-retry"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Investment Proposals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProposals.length} of {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-proposal">
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Investment Proposal</DialogTitle>
              <DialogDescription>
                Submit a new investment proposal for IC review
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                            placeholder="AAPL" 
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            data-testid="input-ticker"
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
                          <Input {...field} placeholder="Apple Inc." data-testid="input-company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="analyst"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Analyst</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Sarah Chen" data-testid="input-analyst" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proposalType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommendation Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BUY">BUY</SelectItem>
                            <SelectItem value="SELL">SELL</SelectItem>
                            <SelectItem value="HOLD">HOLD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="proposedWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Weight (%)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="5.00" data-testid="input-weight" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Price (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="150.00" data-testid="input-target-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="thesis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Thesis</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe the core investment thesis..."
                          className="min-h-[100px]"
                          data-testid="input-thesis"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="catalysts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catalysts (one per line)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Product launch in Q2&#10;New market expansion"
                          className="min-h-[80px]"
                          data-testid="input-catalysts"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="risks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risks (one per line)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Competition from larger players&#10;Regulatory uncertainty"
                          className="min-h-[80px]"
                          data-testid="input-risks"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PENDING">Pending Review</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProposalMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createProposalMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Proposal"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticker, company, or analyst..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]" data-testid="select-filter-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                  <SelectItem value="HOLD">HOLD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Grid */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground">
              {proposals.length === 0 ? "No proposals yet" : "No matching proposals"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {proposals.length === 0 
                ? "Create your first investment proposal to get started"
                : "Try adjusting your search or filters"}
            </p>
            {proposals.length === 0 && (
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Proposal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto">
          {filteredProposals.map((proposal) => {
            const workflow = getWorkflowForProposal(proposal);
            const hasWorkflow = !!workflow;
            
            return (
              <Card 
                key={proposal.id}
                className="hover-elevate cursor-pointer h-full flex flex-col" 
                data-testid={`card-proposal-${proposal.ticker}`}
                onClick={() => {
                  // Navigate to workflow workspace if workflow exists, otherwise proposal detail
                  if (hasWorkflow) {
                    setLocation(`/workflows/${workflow.id}`);
                  } else {
                    setLocation(`/proposals/${proposal.id}`);
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl font-bold">{proposal.ticker}</CardTitle>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className={getTypeColor(proposal.proposalType)}>
                        {proposal.proposalType}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(proposal.status)}>
                        {proposal.status}
                      </Badge>
                      {hasWorkflow && (
                        <Badge 
                          variant="outline" 
                          className={getStageColor(workflow.currentStage)}
                          data-testid={`badge-workflow-stage-${proposal.ticker}`}
                        >
                          {getStageLabel(workflow.currentStage)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{proposal.companyName}</p>
                </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{proposal.analyst}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>{proposal.proposedWeight}% weight</span>
                  </div>
                  {proposal.targetPrice && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>${parseFloat(proposal.targetPrice).toFixed(2)} target</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(proposal.createdAt)}</span>
                  </div>
                </div>
                {proposal.status === 'PENDING' && !proposal.icMeetingId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation('/ic-meeting');
                      toast({
                        title: "Navigate to IC Meetings",
                        description: `Schedule a meeting for ${proposal.ticker}`,
                      });
                    }}
                    data-testid={`button-schedule-${proposal.ticker}`}
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Schedule for IC Meeting
                  </Button>
                )}
                {proposal.icMeetingId && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-md">
                    <CalendarPlus className="h-3 w-3" />
                    <span>Scheduled for IC Meeting</span>
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
