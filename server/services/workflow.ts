import { storage } from "../storage";
import { notificationService } from "./notifications";
import type { InsertWorkflowStage } from "@shared/schema";

type WorkflowStage = "DISCOVERY" | "ANALYSIS" | "IC_MEETING" | "EXECUTION" | "MONITORING";
type StageStatus = "pending" | "in_progress" | "completed" | "blocked";

export class WorkflowService {
  private stageOrder: WorkflowStage[] = [
    "DISCOVERY",
    "ANALYSIS",
    "IC_MEETING",
    "EXECUTION",
    "MONITORING"
  ];

  async advanceStage(
    entityType: string,
    entityId: string,
    userId: string
  ): Promise<any> {
    const currentStage = await storage.getWorkflowStageByEntity(entityType, entityId);
    
    if (!currentStage) {
      throw new Error("No workflow stage found for this entity");
    }

    const currentIndex = this.stageOrder.indexOf(currentStage.currentStage as WorkflowStage);
    
    if (currentIndex === -1 || currentIndex >= this.stageOrder.length - 1) {
      throw new Error("Cannot advance beyond final stage");
    }

    const nextStage = this.stageOrder[currentIndex + 1];
    
    const updates: Partial<InsertWorkflowStage> = {
      currentStage: nextStage,
      lastAdvancedBy: userId,
      lastAdvancedAt: new Date(),
    };

    switch (currentStage.currentStage) {
      case "DISCOVERY":
        updates.discoveryStatus = "completed";
        updates.analysisStatus = "in_progress";
        break;
      case "ANALYSIS":
        updates.analysisStatus = "completed";
        updates.icMeetingStatus = "pending";
        break;
      case "IC_MEETING":
        updates.icMeetingStatus = "completed";
        updates.executionStatus = "in_progress";
        break;
      case "EXECUTION":
        updates.executionStatus = "completed";
        updates.monitoringStatus = "in_progress";
        break;
    }

    const updated = await storage.updateWorkflowStage(currentStage.id, updates);

    await notificationService.createWorkflowAdvancedNotification(
      entityType,
      entityId,
      currentStage.currentStage,
      nextStage
    );

    return updated;
  }

  async revertStage(
    entityType: string,
    entityId: string,
    userId: string,
    reason: string
  ): Promise<any> {
    const currentStage = await storage.getWorkflowStageByEntity(entityType, entityId);
    
    if (!currentStage) {
      throw new Error("No workflow stage found for this entity");
    }

    const currentIndex = this.stageOrder.indexOf(currentStage.currentStage as WorkflowStage);
    
    if (currentIndex === -1 || currentIndex === 0) {
      throw new Error("Cannot revert from first stage");
    }

    const previousStage = this.stageOrder[currentIndex - 1];
    
    const updates: Partial<InsertWorkflowStage> = {
      currentStage: previousStage,
      lastRevertedBy: userId,
      lastRevertedAt: new Date(),
      revertReason: reason,
    };

    switch (currentStage.currentStage) {
      case "ANALYSIS":
        updates.analysisStatus = "pending";
        updates.discoveryStatus = "in_progress";
        break;
      case "IC_MEETING":
        updates.icMeetingStatus = "pending";
        updates.analysisStatus = "in_progress";
        break;
      case "EXECUTION":
        updates.executionStatus = "pending";
        updates.icMeetingStatus = "in_progress";
        break;
      case "MONITORING":
        updates.monitoringStatus = "pending";
        updates.executionStatus = "in_progress";
        break;
    }

    const updated = await storage.updateWorkflowStage(currentStage.id, updates);

    await notificationService.createWorkflowRevertedNotification(
      entityType,
      entityId,
      currentStage.currentStage,
      previousStage,
      reason
    );

    return updated;
  }

  async updateStageStatus(
    entityType: string,
    entityId: string,
    stage: WorkflowStage,
    status: StageStatus
  ): Promise<any> {
    const currentStage = await storage.getWorkflowStageByEntity(entityType, entityId);
    
    if (!currentStage) {
      throw new Error("No workflow stage found for this entity");
    }

    const updates: Partial<InsertWorkflowStage> = {};

    switch (stage) {
      case "DISCOVERY":
        updates.discoveryStatus = status;
        break;
      case "ANALYSIS":
        updates.analysisStatus = status;
        break;
      case "IC_MEETING":
        updates.icMeetingStatus = status;
        break;
      case "EXECUTION":
        updates.executionStatus = status;
        break;
      case "MONITORING":
        updates.monitoringStatus = status;
        break;
    }

    return await storage.updateWorkflowStage(currentStage.id, updates);
  }

  async getStageProgress(entityType: string, entityId: string): Promise<{
    currentStage: WorkflowStage;
    currentIndex: number;
    totalStages: number;
    percentComplete: number;
    stageHistory: Array<{
      stage: WorkflowStage;
      status: StageStatus;
      completedAt?: string;
    }>;
  }> {
    const stage = await storage.getWorkflowStageByEntity(entityType, entityId);
    
    if (!stage) {
      throw new Error("No workflow stage found for this entity");
    }

    const currentIndex = this.stageOrder.indexOf(stage.currentStage as WorkflowStage);
    const percentComplete = ((currentIndex + 1) / this.stageOrder.length) * 100;

    const stageHistory = this.stageOrder.map((s, idx) => ({
      stage: s,
      status: this.getStageStatus(stage, s),
      completedAt: idx < currentIndex && stage.lastAdvancedAt 
        ? stage.lastAdvancedAt.toISOString() 
        : undefined,
    }));

    return {
      currentStage: stage.currentStage as WorkflowStage,
      currentIndex,
      totalStages: this.stageOrder.length,
      percentComplete,
      stageHistory,
    };
  }

  private getStageStatus(stage: any, targetStage: WorkflowStage): StageStatus {
    switch (targetStage) {
      case "DISCOVERY":
        return (stage.discoveryStatus as StageStatus) || "pending";
      case "ANALYSIS":
        return (stage.analysisStatus as StageStatus) || "pending";
      case "IC_MEETING":
        return (stage.icMeetingStatus as StageStatus) || "pending";
      case "EXECUTION":
        return (stage.executionStatus as StageStatus) || "pending";
      case "MONITORING":
        return (stage.monitoringStatus as StageStatus) || "pending";
      default:
        return "pending";
    }
  }
}

export const workflowService = new WorkflowService();
