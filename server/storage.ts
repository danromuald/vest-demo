import {
  type Company, type InsertCompany,
  type Position, type InsertPosition,
  type Proposal, type InsertProposal,
  type ICMeeting, type InsertICMeeting,
  type Vote, type InsertVote,
  type AgentResponse, type InsertAgentResponse,
  type FinancialModel, type InsertFinancialModel,
  type ThesisHealthMetric, type InsertThesisHealthMetric,
  type MarketEvent, type InsertMarketEvent,
  type MonitoringEvent, type InsertMonitoringEvent,
  type MarketAlert, type InsertMarketAlert,
  type Notification, type InsertNotification,
  type UserProfile, type InsertUserProfile,
  type RolePermission, type InsertRolePermission,
  type ResearchRequest, type InsertResearchRequest,
  type WorkflowStage, type InsertWorkflowStage,
  type MeetingParticipant, type InsertMeetingParticipant,
  type DebateSession, type InsertDebateSession,
  type DebateMessage, type InsertDebateMessage,
  type PortfolioImpact, type InsertPortfolioImpact,
  type User, type UpsertUser,
  type Workflow, type InsertWorkflow,
  type WorkflowArtifact, type InsertWorkflowArtifact,
  type TradeOrder, type InsertTradeOrder,
  type ComplianceCheck, type InsertComplianceCheck,
  type RiskAssessment, type InsertRiskAssessment,
  companies, positions, proposals, icMeetings, votes,
  agentResponses, financialModels, thesisHealthMetrics, monitoringEvents, marketAlerts, marketEvents, notifications,
  userProfiles, rolePermissions, researchRequests, workflowStages,
  meetingParticipants, debateSessions, debateMessages,
  portfolioImpacts, users,
  workflows, workflowArtifacts, tradeOrders, complianceChecks, riskAssessments,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // ============= USER OPERATIONS (Required for Replit Auth) =============
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // ============= WORKFLOW CORE =============
  // Workflows - Central workflow management
  getWorkflows(filters?: { stage?: string, owner?: string, ticker?: string }): Promise<Workflow[]>;
  getWorkflow(id: string): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: string): Promise<void>;
  
  // Workflow Stages - Stage tracking per workflow
  getWorkflowStages(workflowId: string): Promise<WorkflowStage[]>;
  getCurrentStage(workflowId: string): Promise<WorkflowStage | undefined>;
  createWorkflowStage(stage: InsertWorkflowStage): Promise<WorkflowStage>;
  updateWorkflowStage(id: string, stage: Partial<WorkflowStage>): Promise<WorkflowStage | undefined>;
  transitionStage(workflowId: string, toStage: string, transitionedBy: string): Promise<WorkflowStage>;
  
  // Workflow Artifacts - Versioned artifacts (research, models, decks)
  getWorkflowArtifacts(workflowId: string, artifactType?: string): Promise<WorkflowArtifact[]>;
  getWorkflowArtifact(id: string): Promise<WorkflowArtifact | undefined>;
  createWorkflowArtifact(artifact: InsertWorkflowArtifact): Promise<WorkflowArtifact>;
  updateWorkflowArtifact(id: string, artifact: Partial<WorkflowArtifact>): Promise<WorkflowArtifact | undefined>;
  
  // ============= IC MEETING COLLABORATION =============
  // IC Meetings
  getICMeetings(): Promise<ICMeeting[]>;
  getICMeeting(id: string): Promise<ICMeeting | undefined>;
  getICMeetingByWorkflow(workflowId: string): Promise<ICMeeting | undefined>;
  createICMeeting(meeting: InsertICMeeting): Promise<ICMeeting>;
  updateICMeeting(id: string, meeting: Partial<ICMeeting>): Promise<ICMeeting | undefined>;
  deleteICMeeting(id: string): Promise<void>;
  
  // Debate Sessions
  getDebateSessions(meetingId: string): Promise<DebateSession[]>;
  getDebateSession(id: string): Promise<DebateSession | undefined>;
  createDebateSession(session: InsertDebateSession): Promise<DebateSession>;
  updateDebateSession(id: string, session: Partial<DebateSession>): Promise<DebateSession | undefined>;
  
  // Debate Messages
  getDebateMessages(meetingId: string): Promise<DebateMessage[]>;
  createDebateMessage(message: InsertDebateMessage): Promise<DebateMessage>;
  
  // Votes
  getVotes(proposalId: string): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  
  // Meeting Participants
  getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]>;
  createMeetingParticipant(participant: InsertMeetingParticipant): Promise<MeetingParticipant>;
  updateMeetingParticipant(id: string, participant: Partial<MeetingParticipant>): Promise<MeetingParticipant | undefined>;
  
  // ============= MONITORING =============
  // Thesis Health Metrics
  getThesisHealthMetrics(workflowId: string): Promise<ThesisHealthMetric[]>;
  getLatestThesisHealth(workflowId: string): Promise<ThesisHealthMetric | undefined>;
  createThesisHealthMetric(metric: InsertThesisHealthMetric): Promise<ThesisHealthMetric>;
  
  // Monitoring Events
  getMonitoringEvents(workflowId: string): Promise<MonitoringEvent[]>;
  createMonitoringEvent(event: InsertMonitoringEvent): Promise<MonitoringEvent>;
  resolveMonitoringEvent(id: string, actionTaken: string): Promise<MonitoringEvent | undefined>;
  
  // Market Alerts
  getMarketAlerts(filters?: { ticker?: string, read?: boolean }): Promise<MarketAlert[]>;
  createMarketAlert(alert: InsertMarketAlert): Promise<MarketAlert>;
  markAlertRead(id: string): Promise<MarketAlert | undefined>;
  
  // ============= EXECUTION =============
  // Trade Orders
  getTradeOrders(workflowId: string): Promise<TradeOrder[]>;
  getTradeOrder(id: string): Promise<TradeOrder | undefined>;
  createTradeOrder(order: InsertTradeOrder): Promise<TradeOrder>;
  updateTradeOrder(id: string, order: Partial<TradeOrder>): Promise<TradeOrder | undefined>;
  
  // Compliance Checks
  getComplianceChecks(workflowId: string): Promise<ComplianceCheck[]>;
  createComplianceCheck(check: InsertComplianceCheck): Promise<ComplianceCheck>;
  updateComplianceCheck(id: string, check: Partial<ComplianceCheck>): Promise<ComplianceCheck | undefined>;
  
  // Risk Assessments
  getRiskAssessments(workflowId: string): Promise<RiskAssessment[]>;
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  
  // ============= LEGACY ENTITIES (Preserved for existing routes) =============
  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByTicker(ticker: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Positions
  getPositions(): Promise<Position[]>;
  getPosition(id: string): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: string, position: Partial<Position>): Promise<Position | undefined>;
  
  // Proposals
  getProposals(): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, proposal: Partial<Proposal>): Promise<Proposal | undefined>;
  
  // Agent Responses
  getAgentResponses(ticker?: string): Promise<AgentResponse[]>;
  createAgentResponse(response: InsertAgentResponse): Promise<AgentResponse>;
  
  // Financial Models
  getFinancialModels(ticker?: string): Promise<FinancialModel[]>;
  createFinancialModel(model: InsertFinancialModel): Promise<FinancialModel>;
  
  // Market Events
  getMarketEvents(limit?: number): Promise<MarketEvent[]>;
  createMarketEvent(event: InsertMarketEvent): Promise<MarketEvent>;
  
  // Notifications
  getNotifications(limit?: number): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsRead(): Promise<void>;
  
  // User Profiles
  getUserProfiles(): Promise<UserProfile[]>;
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  getUserProfileByEmail(email: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: string, profile: Partial<UserProfile>): Promise<UserProfile | undefined>;
  deleteUserProfile(id: string): Promise<void>;
  
  // Role Permissions
  getRolePermissions(role?: string): Promise<RolePermission[]>;
  createRolePermission(permission: InsertRolePermission): Promise<RolePermission>;
  
  // Research Requests
  getResearchRequests(filters?: { status?: string, assignedTo?: string }): Promise<ResearchRequest[]>;
  getResearchRequest(id: string): Promise<ResearchRequest | undefined>;
  createResearchRequest(request: InsertResearchRequest): Promise<ResearchRequest>;
  updateResearchRequest(id: string, request: Partial<ResearchRequest>): Promise<ResearchRequest | undefined>;
  deleteResearchRequest(id: string): Promise<void>;
  
  // Portfolio Impacts
  getPortfolioImpacts(proposalId?: string): Promise<PortfolioImpact[]>;
  createPortfolioImpact(impact: InsertPortfolioImpact): Promise<PortfolioImpact>;
  updatePortfolioImpact(id: string, impact: Partial<PortfolioImpact>): Promise<PortfolioImpact | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: Mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // ============= WORKFLOW CORE METHODS =============
  
  // Workflows
  async getWorkflows(filters?: { stage?: string, owner?: string, ticker?: string }): Promise<Workflow[]> {
    const conditions = [];
    
    if (filters?.stage) {
      conditions.push(eq(workflows.currentStage, filters.stage));
    }
    if (filters?.owner) {
      conditions.push(eq(workflows.owner, filters.owner));
    }
    if (filters?.ticker) {
      conditions.push(eq(workflows.ticker, filters.ticker));
    }
    
    let query = db.select().from(workflows);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(workflows.createdAt));
  }

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow || undefined;
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db
      .insert(workflows)
      .values({ ...insertWorkflow, id: randomUUID() })
      .returning();
    return workflow;
  }

  async updateWorkflow(id: string, updateData: Partial<Workflow>): Promise<Workflow | undefined> {
    const [workflow] = await db
      .update(workflows)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(workflows.id, id))
      .returning();
    return workflow || undefined;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await db.delete(workflows).where(eq(workflows.id, id));
  }

  // Workflow Stages
  async getWorkflowStages(workflowId: string): Promise<WorkflowStage[]> {
    return await db.select().from(workflowStages)
      .where(eq(workflowStages.workflowId, workflowId))
      .orderBy(desc(workflowStages.createdAt));
  }

  async getCurrentStage(workflowId: string): Promise<WorkflowStage | undefined> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) return undefined;
    
    const stages = await db.select().from(workflowStages)
      .where(and(
        eq(workflowStages.workflowId, workflowId),
        eq(workflowStages.stage, workflow.currentStage)
      ))
      .orderBy(desc(workflowStages.createdAt))
      .limit(1);
    
    return stages[0] || undefined;
  }

  async createWorkflowStage(insertStage: InsertWorkflowStage): Promise<WorkflowStage> {
    const [stage] = await db
      .insert(workflowStages)
      .values({ ...insertStage, id: randomUUID() })
      .returning();
    return stage;
  }

  async updateWorkflowStage(id: string, updateData: Partial<WorkflowStage>): Promise<WorkflowStage | undefined> {
    const [stage] = await db
      .update(workflowStages)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(workflowStages.id, id))
      .returning();
    return stage || undefined;
  }

  async transitionStage(workflowId: string, toStage: string, transitionedBy: string): Promise<WorkflowStage> {
    // Update workflow's current stage
    await this.updateWorkflow(workflowId, { currentStage: toStage });
    
    // Create new workflow stage record
    const newStage = await this.createWorkflowStage({
      workflowId,
      stage: toStage,
      status: 'IN_PROGRESS',
      owner: transitionedBy,
      startedAt: new Date(),
    });
    
    return newStage;
  }

  // Workflow Artifacts
  async getWorkflowArtifacts(workflowId: string, artifactType?: string): Promise<WorkflowArtifact[]> {
    const conditions = [eq(workflowArtifacts.workflowId, workflowId)];
    
    if (artifactType) {
      conditions.push(eq(workflowArtifacts.artifactType, artifactType));
    }
    
    return await db.select().from(workflowArtifacts)
      .where(and(...conditions))
      .orderBy(desc(workflowArtifacts.createdAt));
  }

  async getWorkflowArtifact(id: string): Promise<WorkflowArtifact | undefined> {
    const [artifact] = await db.select().from(workflowArtifacts).where(eq(workflowArtifacts.id, id));
    return artifact || undefined;
  }

  async createWorkflowArtifact(insertArtifact: InsertWorkflowArtifact): Promise<WorkflowArtifact> {
    const [artifact] = await db
      .insert(workflowArtifacts)
      .values({ ...insertArtifact, id: randomUUID() })
      .returning();
    return artifact;
  }

  async updateWorkflowArtifact(id: string, updateData: Partial<WorkflowArtifact>): Promise<WorkflowArtifact | undefined> {
    const [artifact] = await db
      .update(workflowArtifacts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(workflowArtifacts.id, id))
      .returning();
    return artifact || undefined;
  }

  // ============= IC MEETING COLLABORATION METHODS =============
  
  async getICMeetingByWorkflow(workflowId: string): Promise<ICMeeting | undefined> {
    const [meeting] = await db.select().from(icMeetings)
      .where(eq(icMeetings.workflowId, workflowId))
      .orderBy(desc(icMeetings.meetingDate))
      .limit(1);
    return meeting || undefined;
  }

  // ============= MONITORING METHODS =============
  
  async getThesisHealthMetrics(workflowId: string): Promise<ThesisHealthMetric[]> {
    return await db.select().from(thesisHealthMetrics)
      .where(eq(thesisHealthMetrics.workflowId, workflowId))
      .orderBy(desc(thesisHealthMetrics.lastCheck));
  }

  async getLatestThesisHealth(workflowId: string): Promise<ThesisHealthMetric | undefined> {
    const [metric] = await db.select().from(thesisHealthMetrics)
      .where(eq(thesisHealthMetrics.workflowId, workflowId))
      .orderBy(desc(thesisHealthMetrics.lastCheck))
      .limit(1);
    return metric || undefined;
  }

  async createThesisHealthMetric(insertMetric: InsertThesisHealthMetric): Promise<ThesisHealthMetric> {
    const [metric] = await db
      .insert(thesisHealthMetrics)
      .values({ ...insertMetric, id: randomUUID() })
      .returning();
    return metric;
  }

  async getMonitoringEvents(workflowId: string): Promise<MonitoringEvent[]> {
    return await db.select().from(monitoringEvents)
      .where(eq(monitoringEvents.workflowId, workflowId))
      .orderBy(desc(monitoringEvents.createdAt));
  }

  async createMonitoringEvent(insertEvent: InsertMonitoringEvent): Promise<MonitoringEvent> {
    const [event] = await db
      .insert(monitoringEvents)
      .values({ ...insertEvent, id: randomUUID() })
      .returning();
    return event;
  }

  async resolveMonitoringEvent(id: string, actionTaken: string): Promise<MonitoringEvent | undefined> {
    const [event] = await db
      .update(monitoringEvents)
      .set({ 
        actionTaken,
        resolvedAt: new Date()
      })
      .where(eq(monitoringEvents.id, id))
      .returning();
    return event || undefined;
  }

  async getMarketAlerts(filters?: { ticker?: string, read?: boolean }): Promise<MarketAlert[]> {
    const conditions = [];
    
    if (filters?.ticker) {
      conditions.push(eq(marketAlerts.ticker, filters.ticker));
    }
    if (filters?.read !== undefined) {
      conditions.push(eq(marketAlerts.read, filters.read));
    }
    
    let query = db.select().from(marketAlerts);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(marketAlerts.detectedAt));
  }

  async createMarketAlert(insertAlert: InsertMarketAlert): Promise<MarketAlert> {
    const [alert] = await db
      .insert(marketAlerts)
      .values({ ...insertAlert, id: randomUUID() })
      .returning();
    return alert;
  }

  async markAlertRead(id: string): Promise<MarketAlert | undefined> {
    const [alert] = await db
      .update(marketAlerts)
      .set({ read: true })
      .where(eq(marketAlerts.id, id))
      .returning();
    return alert || undefined;
  }

  // ============= EXECUTION METHODS =============
  
  async getTradeOrders(workflowId: string): Promise<TradeOrder[]> {
    return await db.select().from(tradeOrders)
      .where(eq(tradeOrders.workflowId, workflowId))
      .orderBy(desc(tradeOrders.createdAt));
  }

  async getTradeOrder(id: string): Promise<TradeOrder | undefined> {
    const [order] = await db.select().from(tradeOrders).where(eq(tradeOrders.id, id));
    return order || undefined;
  }

  async createTradeOrder(insertOrder: InsertTradeOrder): Promise<TradeOrder> {
    const [order] = await db
      .insert(tradeOrders)
      .values({ ...insertOrder, id: randomUUID() })
      .returning();
    return order;
  }

  async updateTradeOrder(id: string, updateData: Partial<TradeOrder>): Promise<TradeOrder | undefined> {
    const [order] = await db
      .update(tradeOrders)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(tradeOrders.id, id))
      .returning();
    return order || undefined;
  }

  async getComplianceChecks(workflowId: string): Promise<ComplianceCheck[]> {
    return await db.select().from(complianceChecks)
      .where(eq(complianceChecks.workflowId, workflowId))
      .orderBy(desc(complianceChecks.createdAt));
  }

  async createComplianceCheck(insertCheck: InsertComplianceCheck): Promise<ComplianceCheck> {
    const [check] = await db
      .insert(complianceChecks)
      .values({ ...insertCheck, id: randomUUID() })
      .returning();
    return check;
  }

  async updateComplianceCheck(id: string, updateData: Partial<ComplianceCheck>): Promise<ComplianceCheck | undefined> {
    const [check] = await db
      .update(complianceChecks)
      .set(updateData)
      .where(eq(complianceChecks.id, id))
      .returning();
    return check || undefined;
  }

  async getRiskAssessments(workflowId: string): Promise<RiskAssessment[]> {
    return await db.select().from(riskAssessments)
      .where(eq(riskAssessments.workflowId, workflowId))
      .orderBy(desc(riskAssessments.createdAt));
  }

  async createRiskAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [assessment] = await db
      .insert(riskAssessments)
      .values({ ...insertAssessment, id: randomUUID() })
      .returning();
    return assessment;
  }

  // ============= LEGACY METHODS (Preserved) =============
  
  // Companies
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanyByTicker(ticker: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.ticker, ticker));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values({ ...insertCompany, id: randomUUID() })
      .returning();
    return company;
  }

  // Positions
  async getPositions(): Promise<Position[]> {
    return await db.select().from(positions);
  }

  async getPosition(id: string): Promise<Position | undefined> {
    const [position] = await db.select().from(positions).where(eq(positions.id, id));
    return position || undefined;
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const [position] = await db
      .insert(positions)
      .values({ ...insertPosition, id: randomUUID() })
      .returning();
    return position;
  }

  async updatePosition(id: string, updateData: Partial<Position>): Promise<Position | undefined> {
    const [position] = await db
      .update(positions)
      .set(updateData)
      .where(eq(positions.id, id))
      .returning();
    return position || undefined;
  }

  // Proposals
  async getProposals(): Promise<Proposal[]> {
    return await db.select().from(proposals).orderBy(desc(proposals.createdAt));
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal || undefined;
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const [proposal] = await db
      .insert(proposals)
      .values({ ...insertProposal, id: randomUUID() })
      .returning();
    return proposal;
  }

  async updateProposal(id: string, updateData: Partial<Proposal>): Promise<Proposal | undefined> {
    const [proposal] = await db
      .update(proposals)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();
    return proposal || undefined;
  }

  // IC Meetings
  async getICMeetings(): Promise<ICMeeting[]> {
    return await db.select().from(icMeetings).orderBy(desc(icMeetings.meetingDate));
  }

  async getICMeeting(id: string): Promise<ICMeeting | undefined> {
    const [meeting] = await db.select().from(icMeetings).where(eq(icMeetings.id, id));
    return meeting || undefined;
  }

  async createICMeeting(insertMeeting: InsertICMeeting): Promise<ICMeeting> {
    const [meeting] = await db
      .insert(icMeetings)
      .values({ ...insertMeeting, id: randomUUID() })
      .returning();
    return meeting;
  }

  async updateICMeeting(id: string, updateData: Partial<ICMeeting>): Promise<ICMeeting | undefined> {
    const [meeting] = await db
      .update(icMeetings)
      .set(updateData)
      .where(eq(icMeetings.id, id))
      .returning();
    return meeting || undefined;
  }

  async deleteICMeeting(id: string): Promise<void> {
    await db.delete(icMeetings).where(eq(icMeetings.id, id));
  }

  // Votes
  async getVotes(proposalId: string): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.proposalId, proposalId));
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db
      .insert(votes)
      .values({ ...insertVote, id: randomUUID() })
      .returning();
    return vote;
  }

  // Agent Responses
  async getAgentResponses(ticker?: string): Promise<AgentResponse[]> {
    if (ticker) {
      return await db.select().from(agentResponses)
        .where(eq(agentResponses.ticker, ticker))
        .orderBy(desc(agentResponses.generatedAt));
    }
    return await db.select().from(agentResponses).orderBy(desc(agentResponses.generatedAt));
  }

  async createAgentResponse(insertResponse: InsertAgentResponse): Promise<AgentResponse> {
    const [response] = await db
      .insert(agentResponses)
      .values({ ...insertResponse, id: randomUUID() })
      .returning();
    return response;
  }

  // Financial Models
  async getFinancialModels(ticker?: string): Promise<FinancialModel[]> {
    if (ticker) {
      return await db.select().from(financialModels)
        .where(eq(financialModels.ticker, ticker))
        .orderBy(desc(financialModels.createdAt));
    }
    return await db.select().from(financialModels).orderBy(desc(financialModels.createdAt));
  }

  async createFinancialModel(insertModel: InsertFinancialModel): Promise<FinancialModel> {
    const [model] = await db
      .insert(financialModels)
      .values({ ...insertModel, id: randomUUID() })
      .returning();
    return model;
  }

  // LEGACY: Thesis Monitors - REMOVED (replaced by thesisHealthMetrics)
  // async getThesisMonitors(): Promise<ThesisMonitor[]> {
  //   return await db.select().from(thesisMonitors);
  // }

  // async getThesisMonitor(ticker: string): Promise<ThesisMonitor | undefined> {
  //   const [monitor] = await db.select().from(thesisMonitors).where(eq(thesisMonitors.ticker, ticker));
  //   return monitor || undefined;
  // }

  // async createThesisMonitor(insertMonitor: InsertThesisMonitor): Promise<ThesisMonitor> {
  //   const [monitor] = await db
  //     .insert(thesisMonitors)
  //     .values({ ...insertMonitor, id: randomUUID() })
  //     .returning();
  //   return monitor;
  // }

  // async updateThesisMonitor(id: string, updateData: Partial<ThesisMonitor>): Promise<ThesisMonitor | undefined> {
  //   const [monitor] = await db
  //     .update(thesisMonitors)
  //     .set(updateData)
  //     .where(eq(thesisMonitors.id, id))
  //     .returning();
  //   return monitor || undefined;
  // }

  // Market Events
  async getMarketEvents(limit: number = 50): Promise<MarketEvent[]> {
    return await db.select().from(marketEvents)
      .orderBy(desc(marketEvents.detectedAt))
      .limit(limit);
  }

  async createMarketEvent(insertEvent: InsertMarketEvent): Promise<MarketEvent> {
    const [event] = await db
      .insert(marketEvents)
      .values({ ...insertEvent, id: randomUUID() })
      .returning();
    return event;
  }

  // Notifications
  async getNotifications(limit: number = 50): Promise<Notification[]> {
    return await db.select().from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.isRead, false))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({ ...insertNotification, id: randomUUID() })
      .returning();
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification || undefined;
  }

  async markAllNotificationsRead(): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.isRead, false));
  }

  // User Profiles
  async getUserProfiles(): Promise<UserProfile[]> {
    return await db.select().from(userProfiles);
  }

  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
    return profile || undefined;
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.email, email));
    return profile || undefined;
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfiles)
      .values({ ...insertProfile, id: randomUUID() })
      .returning();
    return profile;
  }

  async updateUserProfile(id: string, updateData: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const [profile] = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.id, id))
      .returning();
    return profile || undefined;
  }

  async deleteUserProfile(id: string): Promise<void> {
    await db.delete(userProfiles).where(eq(userProfiles.id, id));
  }

  // Role Permissions
  async getRolePermissions(role?: string): Promise<RolePermission[]> {
    if (role) {
      return await db.select().from(rolePermissions).where(eq(rolePermissions.role, role));
    }
    return await db.select().from(rolePermissions);
  }

  async createRolePermission(insertPermission: InsertRolePermission): Promise<RolePermission> {
    const [permission] = await db
      .insert(rolePermissions)
      .values({ ...insertPermission, id: randomUUID() })
      .returning();
    return permission;
  }

  // Research Requests
  async getResearchRequests(filters?: { status?: string, assignedTo?: string }): Promise<ResearchRequest[]> {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(researchRequests.status, filters.status));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(researchRequests.assignedTo, filters.assignedTo));
    }
    
    let query = db.select().from(researchRequests);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(researchRequests.createdAt));
  }

  async getResearchRequest(id: string): Promise<ResearchRequest | undefined> {
    const [request] = await db.select().from(researchRequests).where(eq(researchRequests.id, id));
    return request || undefined;
  }

  async createResearchRequest(insertRequest: InsertResearchRequest): Promise<ResearchRequest> {
    const [request] = await db
      .insert(researchRequests)
      .values({ ...insertRequest, id: randomUUID() })
      .returning();
    return request;
  }

  async updateResearchRequest(id: string, updateData: Partial<ResearchRequest>): Promise<ResearchRequest | undefined> {
    const [request] = await db
      .update(researchRequests)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(researchRequests.id, id))
      .returning();
    return request || undefined;
  }

  async deleteResearchRequest(id: string): Promise<void> {
    await db.delete(researchRequests).where(eq(researchRequests.id, id));
  }

  // LEGACY: Old Workflow Stages implementation - REMOVED (replaced by new workflow-centric methods)
  // async getWorkflowStages(entityType?: string, entityId?: string): Promise<WorkflowStageRecord[]> {
  //   const conditions = [];
  //   
  //   if (entityType) {
  //     conditions.push(eq(workflowStages.entityType, entityType));
  //   }
  //   if (entityId) {
  //     conditions.push(eq(workflowStages.entityId, entityId));
  //   }
  //   
  //   let query = db.select().from(workflowStages);
  //   if (conditions.length > 0) {
  //     query = query.where(and(...conditions)) as any;
  //   }
  //   
  //   return await query;
  // }

  // async getWorkflowStage(id: string): Promise<WorkflowStageRecord | undefined> {
  //   const [stage] = await db.select().from(workflowStages).where(eq(workflowStages.id, id));
  //   return stage || undefined;
  // }

  // async getWorkflowStageByEntity(entityType: string, entityId: string): Promise<WorkflowStageRecord | undefined> {
  //   const stages = await db.select().from(workflowStages)
  //     .where(and(
  //       eq(workflowStages.entityType, entityType),
  //       eq(workflowStages.entityId, entityId)
  //     ));
  //   return stages[0] || undefined;
  // }

  // async createWorkflowStage(insertStage: InsertWorkflowStage): Promise<WorkflowStageRecord> {
  //   const [stage] = await db
  //     .insert(workflowStages)
  //     .values({ ...insertStage, id: randomUUID() })
  //     .returning();
  //   return stage;
  // }

  // async updateWorkflowStage(id: string, updateData: Partial<WorkflowStageRecord>): Promise<WorkflowStageRecord | undefined> {
  //   const [stage] = await db
  //     .update(workflowStages)
  //     .set({ ...updateData, updatedAt: new Date() })
  //     .where(eq(workflowStages.id, id))
  //     .returning();
  //   return stage || undefined;
  // }

  // Meeting Participants
  async getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]> {
    return await db.select().from(meetingParticipants).where(eq(meetingParticipants.meetingId, meetingId));
  }

  async createMeetingParticipant(insertParticipant: InsertMeetingParticipant): Promise<MeetingParticipant> {
    const [participant] = await db
      .insert(meetingParticipants)
      .values({ ...insertParticipant, id: randomUUID() })
      .returning();
    return participant;
  }

  async updateMeetingParticipant(id: string, updateData: Partial<MeetingParticipant>): Promise<MeetingParticipant | undefined> {
    const [participant] = await db
      .update(meetingParticipants)
      .set(updateData)
      .where(eq(meetingParticipants.id, id))
      .returning();
    return participant || undefined;
  }

  // Debate Sessions
  async getDebateSessions(meetingId?: string): Promise<DebateSession[]> {
    if (meetingId) {
      return await db.select().from(debateSessions)
        .where(eq(debateSessions.meetingId, meetingId))
        .orderBy(desc(debateSessions.startedAt));
    }
    return await db.select().from(debateSessions).orderBy(desc(debateSessions.startedAt));
  }

  async getDebateSession(id: string): Promise<DebateSession | undefined> {
    const [session] = await db.select().from(debateSessions).where(eq(debateSessions.id, id));
    return session || undefined;
  }

  async createDebateSession(insertSession: InsertDebateSession): Promise<DebateSession> {
    const [session] = await db
      .insert(debateSessions)
      .values({ ...insertSession, id: randomUUID() })
      .returning();
    return session;
  }

  async updateDebateSession(id: string, updateData: Partial<DebateSession>): Promise<DebateSession | undefined> {
    const [session] = await db
      .update(debateSessions)
      .set(updateData)
      .where(eq(debateSessions.id, id))
      .returning();
    return session || undefined;
  }

  // Debate Messages
  async getDebateMessages(meetingId: string): Promise<DebateMessage[]> {
    return await db.select().from(debateMessages)
      .where(eq(debateMessages.meetingId, meetingId))
      .orderBy(debateMessages.createdAt);
  }

  async createDebateMessage(insertMessage: InsertDebateMessage): Promise<DebateMessage> {
    const [message] = await db
      .insert(debateMessages)
      .values({ ...insertMessage, id: randomUUID() })
      .returning();
    return message;
  }

  // Portfolio Impacts
  async getPortfolioImpacts(proposalId?: string): Promise<PortfolioImpact[]> {
    if (proposalId) {
      return await db.select().from(portfolioImpacts).where(eq(portfolioImpacts.proposalId, proposalId));
    }
    return await db.select().from(portfolioImpacts);
  }

  async createPortfolioImpact(insertImpact: InsertPortfolioImpact): Promise<PortfolioImpact> {
    const [impact] = await db
      .insert(portfolioImpacts)
      .values({ ...insertImpact, id: randomUUID() })
      .returning();
    return impact;
  }

  async updatePortfolioImpact(id: string, updateData: Partial<PortfolioImpact>): Promise<PortfolioImpact | undefined> {
    const [impact] = await db
      .update(portfolioImpacts)
      .set(updateData)
      .where(eq(portfolioImpacts.id, id))
      .returning();
    return impact || undefined;
  }

  // LEGACY: Risk Compliance Actions - REMOVED (replaced by complianceChecks and riskAssessments)
  // async getRiskComplianceActions(filters?: { entityType?: string, entityId?: string, status?: string }): Promise<RiskComplianceAction[]> {
  //   const conditions = [];
  //   
  //   if (filters?.entityType) {
  //     conditions.push(eq(riskComplianceActions.entityType, filters.entityType));
  //   }
  //   if (filters?.entityId) {
  //     conditions.push(eq(riskComplianceActions.entityId, filters.entityId));
  //   }
  //   if (filters?.status) {
  //     conditions.push(eq(riskComplianceActions.status, filters.status));
  //   }
  //   
  //   let query = db.select().from(riskComplianceActions);
  //   if (conditions.length > 0) {
  //     query = query.where(and(...conditions)) as any;
  //   }
  //   
  //   return await query.orderBy(desc(riskComplianceActions.createdAt));
  // }

  // async getRiskComplianceAction(id: string): Promise<RiskComplianceAction | undefined> {
  //   const [action] = await db.select().from(riskComplianceActions).where(eq(riskComplianceActions.id, id));
  //   return action || undefined;
  // }

  // async createRiskComplianceAction(insertAction: InsertRiskComplianceAction): Promise<RiskComplianceAction> {
  //   const [action] = await db
  //     .insert(riskComplianceActions)
  //     .values({ ...insertAction, id: randomUUID() })
  //     .returning();
  //   return action;
  // }

  // async updateRiskComplianceAction(id: string, updateData: Partial<RiskComplianceAction>): Promise<RiskComplianceAction | undefined> {
  //   const [action] = await db
  //     .update(riskComplianceActions)
  //     .set({ ...updateData, updatedAt: new Date() })
  //     .where(eq(riskComplianceActions.id, id))
  //     .returning();
  //   return action || undefined;
  // }
}

export const storage = new DatabaseStorage();
