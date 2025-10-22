import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, Clock, ArrowRight, ArrowLeft, Play, Pause, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WorkflowStageRecord } from "@shared/schema";

const stages = [
  { 
    id: 'DISCOVERY', 
    label: 'Discovery', 
    description: 'Research & idea generation',
    statusField: 'discoveryStatus' as const
  },
  { 
    id: 'ANALYSIS', 
    label: 'Analysis', 
    description: 'Deep dive & modeling',
    statusField: 'analysisStatus' as const
  },
  { 
    id: 'IC_MEETING', 
    label: 'IC Meeting', 
    description: 'Committee review',
    statusField: 'icMeetingStatus' as const
  },
  { 
    id: 'EXECUTION', 
    label: 'Execution', 
    description: 'Trade implementation',
    statusField: 'executionStatus' as const
  },
  { 
    id: 'MONITORING', 
    label: 'Monitoring', 
    description: 'Ongoing tracking',
    statusField: 'monitoringStatus' as const
  },
];

interface WorkflowStageNavigatorProps {
  proposalId?: string;
  className?: string;
}

export function WorkflowStageNavigator({ proposalId, className }: WorkflowStageNavigatorProps) {
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false);
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [revertReason, setRevertReason] = useState("");
  const { toast } = useToast();

  const { data: workflowStages = [] } = useQuery<WorkflowStageRecord[]>({
    queryKey: proposalId ? ["/api/workflow-stages", proposalId] : ["/api/workflow-stages"],
  });

  const currentWorkflow = workflowStages[0];
  const currentStageIndex = stages.findIndex(s => s.id === currentWorkflow?.currentStage);
  const currentStageStatus = currentWorkflow && currentStageIndex >= 0
    ? currentWorkflow[stages[currentStageIndex].statusField]
    : null;

  const advanceMutation = useMutation({
    mutationFn: async () => {
      if (!currentWorkflow?.id) throw new Error("No active workflow");
      const response = await fetch(`/api/workflow-stages/${currentWorkflow.id}/advance`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to advance stage");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-stages"] });
      toast({
        title: "Stage Advanced",
        description: "Workflow moved to next stage successfully",
      });
      setShowAdvanceDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Advance",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revertMutation = useMutation({
    mutationFn: async () => {
      if (!currentWorkflow?.id) throw new Error("No active workflow");
      const response = await fetch(`/api/workflow-stages/${currentWorkflow.id}/revert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: revertReason }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to revert stage");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-stages"] });
      toast({
        title: "Stage Reverted",
        description: "Workflow moved to previous stage",
      });
      setShowRevertDialog(false);
      setRevertReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Revert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canAdvance = currentStageIndex < stages.length - 1 && currentStageStatus === "IN_PROGRESS";
  const canRevert = currentStageIndex > 0 && currentStageStatus === "IN_PROGRESS";

  if (!currentWorkflow) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No active workflow stage</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Workflow Progress</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Current: {stages[currentStageIndex]?.label}
              </p>
            </div>
            <Badge 
              variant={currentStageStatus === "IN_PROGRESS" ? "default" : "secondary"}
              data-testid="badge-stage-status"
            >
              {currentStageStatus?.replace("_", " ") || "PENDING"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timeline */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {stages.map((stage, index) => {
                const stageStatus = currentWorkflow[stage.statusField];
                const isCompleted = stageStatus === "COMPLETED";
                const isCurrent = index === currentStageIndex && stageStatus === "IN_PROGRESS";
                const isPending = stageStatus === "PENDING" || stageStatus === "pending";

                return (
                  <div key={stage.id} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      {index > 0 && (
                        <div
                          className={cn(
                            'h-1 flex-1 transition-all duration-300',
                            isCompleted || (index <= currentStageIndex && !isPending) ? 'bg-primary' : 'bg-border'
                          )}
                        />
                      )}
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                          isCompleted && 'border-primary bg-primary text-primary-foreground shadow-lg',
                          isCurrent && 'border-primary bg-background text-primary ring-4 ring-primary/20',
                          isPending && 'border-border bg-background text-muted-foreground'
                        )}
                        data-testid={`stage-indicator-${stage.id}`}
                      >
                        {isCompleted && <CheckCircle2 className="h-6 w-6" />}
                        {isCurrent && <Clock className="h-6 w-6 animate-pulse" />}
                        {isPending && <Circle className="h-6 w-6" />}
                      </div>
                      {index < stages.length - 1 && (
                        <div
                          className={cn(
                            'h-1 flex-1 transition-all duration-300',
                            isCompleted || (index < currentStageIndex && !isPending) ? 'bg-primary' : 'bg-border'
                          )}
                        />
                      )}
                    </div>
                    <div className="mt-3 text-center max-w-[100px]">
                      <p
                        className={cn(
                          'text-xs font-medium truncate',
                          isCurrent ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {stage.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{stage.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevertDialog(true)}
              disabled={!canRevert || revertMutation.isPending}
              data-testid="button-revert-stage"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Revert Stage
            </Button>
            
            <div className="flex items-center gap-2">
              {currentWorkflow.lastAdvancedBy && (
                <span className="text-xs text-muted-foreground">
                  Last updated by {currentWorkflow.lastAdvancedBy}
                </span>
              )}
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowAdvanceDialog(true)}
              disabled={!canAdvance || advanceMutation.isPending}
              data-testid="button-advance-stage"
            >
              Advance Stage
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advance Confirmation Dialog */}
      <Dialog open={showAdvanceDialog} onOpenChange={setShowAdvanceDialog}>
        <DialogContent data-testid="dialog-advance-stage">
          <DialogHeader>
            <DialogTitle>Advance Workflow Stage?</DialogTitle>
            <DialogDescription>
              This will move the workflow from <strong>{stages[currentStageIndex]?.label}</strong> to{" "}
              <strong>{stages[currentStageIndex + 1]?.label}</strong>. This action will notify all relevant stakeholders.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdvanceDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => advanceMutation.mutate()}
              disabled={advanceMutation.isPending}
              data-testid="button-confirm-advance"
            >
              {advanceMutation.isPending ? (
                <>
                  <Play className="h-4 w-4 mr-2 animate-spin" />
                  Advancing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Confirm Advance
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revert Confirmation Dialog */}
      <Dialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
        <DialogContent data-testid="dialog-revert-stage">
          <DialogHeader>
            <DialogTitle>Revert Workflow Stage?</DialogTitle>
            <DialogDescription>
              This will move the workflow back from <strong>{stages[currentStageIndex]?.label}</strong> to{" "}
              <strong>{stages[currentStageIndex - 1]?.label}</strong>. Please provide a reason for reverting.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Explain why this workflow needs to be reverted..."
            value={revertReason}
            onChange={(e) => setRevertReason(e.target.value)}
            className="min-h-[100px]"
            data-testid="input-revert-reason"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRevertDialog(false);
              setRevertReason("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => revertMutation.mutate()}
              disabled={!revertReason.trim() || revertMutation.isPending}
              data-testid="button-confirm-revert"
            >
              {revertMutation.isPending ? (
                <>
                  <Pause className="h-4 w-4 mr-2 animate-spin" />
                  Reverting...
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Confirm Revert
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
