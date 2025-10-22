import {
  type Company, type InsertCompany,
  type Position, type InsertPosition,
  type Proposal, type InsertProposal,
  type ICMeeting, type InsertICMeeting,
  type Vote, type InsertVote,
  type AgentResponse, type InsertAgentResponse,
  type FinancialModel, type InsertFinancialModel,
  type ThesisMonitor, type InsertThesisMonitor,
  type MarketEvent, type InsertMarketEvent,
  type Notification, type InsertNotification,
  type UserProfile, type InsertUserProfile,
  type RolePermission, type InsertRolePermission,
  type ResearchRequest, type InsertResearchRequest,
  type WorkflowStageRecord, type InsertWorkflowStage,
  type MeetingParticipant, type InsertMeetingParticipant,
  type DebateSession, type InsertDebateSession,
  type DebateMessage, type InsertDebateMessage,
  type PortfolioImpact, type InsertPortfolioImpact,
  type RiskComplianceAction, type InsertRiskComplianceAction,
  companies, positions, proposals, icMeetings, votes,
  agentResponses, financialModels, thesisMonitors, marketEvents, notifications,
  userProfiles, rolePermissions, researchRequests, workflowStages,
  meetingParticipants, debateSessions, debateMessages,
  portfolioImpacts, riskComplianceActions,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
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
  
  // IC Meetings
  getICMeetings(): Promise<ICMeeting[]>;
  getICMeeting(id: string): Promise<ICMeeting | undefined>;
  createICMeeting(meeting: InsertICMeeting): Promise<ICMeeting>;
  updateICMeeting(id: string, meeting: Partial<ICMeeting>): Promise<ICMeeting | undefined>;
  
  // Votes
  getVotes(proposalId: string): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  
  // Agent Responses
  getAgentResponses(ticker?: string): Promise<AgentResponse[]>;
  createAgentResponse(response: InsertAgentResponse): Promise<AgentResponse>;
  
  // Financial Models
  getFinancialModels(ticker?: string): Promise<FinancialModel[]>;
  createFinancialModel(model: InsertFinancialModel): Promise<FinancialModel>;
  
  // Thesis Monitors
  getThesisMonitors(): Promise<ThesisMonitor[]>;
  getThesisMonitor(ticker: string): Promise<ThesisMonitor | undefined>;
  createThesisMonitor(monitor: InsertThesisMonitor): Promise<ThesisMonitor>;
  updateThesisMonitor(id: string, monitor: Partial<ThesisMonitor>): Promise<ThesisMonitor | undefined>;
  
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
  
  // Workflow Stages
  getWorkflowStages(entityType?: string, entityId?: string): Promise<WorkflowStageRecord[]>;
  getWorkflowStage(id: string): Promise<WorkflowStageRecord | undefined>;
  getWorkflowStageByEntity(entityType: string, entityId: string): Promise<WorkflowStageRecord | undefined>;
  createWorkflowStage(stage: InsertWorkflowStage): Promise<WorkflowStageRecord>;
  updateWorkflowStage(id: string, stage: Partial<WorkflowStageRecord>): Promise<WorkflowStageRecord | undefined>;
  
  // Meeting Participants
  getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]>;
  createMeetingParticipant(participant: InsertMeetingParticipant): Promise<MeetingParticipant>;
  updateMeetingParticipant(id: string, participant: Partial<MeetingParticipant>): Promise<MeetingParticipant | undefined>;
  
  // Debate Sessions
  getDebateSessions(meetingId?: string): Promise<DebateSession[]>;
  getDebateSession(id: string): Promise<DebateSession | undefined>;
  createDebateSession(session: InsertDebateSession): Promise<DebateSession>;
  updateDebateSession(id: string, session: Partial<DebateSession>): Promise<DebateSession | undefined>;
  
  // Debate Messages
  getDebateMessages(sessionId: string): Promise<DebateMessage[]>;
  createDebateMessage(message: InsertDebateMessage): Promise<DebateMessage>;
  
  // Portfolio Impacts
  getPortfolioImpacts(proposalId?: string): Promise<PortfolioImpact[]>;
  createPortfolioImpact(impact: InsertPortfolioImpact): Promise<PortfolioImpact>;
  updatePortfolioImpact(id: string, impact: Partial<PortfolioImpact>): Promise<PortfolioImpact | undefined>;
  
  // Risk Compliance Actions
  getRiskComplianceActions(filters?: { entityType?: string, entityId?: string, status?: string }): Promise<RiskComplianceAction[]>;
  getRiskComplianceAction(id: string): Promise<RiskComplianceAction | undefined>;
  createRiskComplianceAction(action: InsertRiskComplianceAction): Promise<RiskComplianceAction>;
  updateRiskComplianceAction(id: string, action: Partial<RiskComplianceAction>): Promise<RiskComplianceAction | undefined>;
}

export class DatabaseStorage implements IStorage {
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

  // Thesis Monitors
  async getThesisMonitors(): Promise<ThesisMonitor[]> {
    return await db.select().from(thesisMonitors);
  }

  async getThesisMonitor(ticker: string): Promise<ThesisMonitor | undefined> {
    const [monitor] = await db.select().from(thesisMonitors).where(eq(thesisMonitors.ticker, ticker));
    return monitor || undefined;
  }

  async createThesisMonitor(insertMonitor: InsertThesisMonitor): Promise<ThesisMonitor> {
    const [monitor] = await db
      .insert(thesisMonitors)
      .values({ ...insertMonitor, id: randomUUID() })
      .returning();
    return monitor;
  }

  async updateThesisMonitor(id: string, updateData: Partial<ThesisMonitor>): Promise<ThesisMonitor | undefined> {
    const [monitor] = await db
      .update(thesisMonitors)
      .set(updateData)
      .where(eq(thesisMonitors.id, id))
      .returning();
    return monitor || undefined;
  }

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

  // Workflow Stages
  async getWorkflowStages(entityType?: string, entityId?: string): Promise<WorkflowStageRecord[]> {
    const conditions = [];
    
    if (entityType) {
      conditions.push(eq(workflowStages.entityType, entityType));
    }
    if (entityId) {
      conditions.push(eq(workflowStages.entityId, entityId));
    }
    
    let query = db.select().from(workflowStages);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getWorkflowStage(id: string): Promise<WorkflowStageRecord | undefined> {
    const [stage] = await db.select().from(workflowStages).where(eq(workflowStages.id, id));
    return stage || undefined;
  }

  async getWorkflowStageByEntity(entityType: string, entityId: string): Promise<WorkflowStageRecord | undefined> {
    const stages = await db.select().from(workflowStages)
      .where(and(
        eq(workflowStages.entityType, entityType),
        eq(workflowStages.entityId, entityId)
      ));
    return stages[0] || undefined;
  }

  async createWorkflowStage(insertStage: InsertWorkflowStage): Promise<WorkflowStageRecord> {
    const [stage] = await db
      .insert(workflowStages)
      .values({ ...insertStage, id: randomUUID() })
      .returning();
    return stage;
  }

  async updateWorkflowStage(id: string, updateData: Partial<WorkflowStageRecord>): Promise<WorkflowStageRecord | undefined> {
    const [stage] = await db
      .update(workflowStages)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(workflowStages.id, id))
      .returning();
    return stage || undefined;
  }

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
  async getDebateMessages(sessionId: string): Promise<DebateMessage[]> {
    return await db.select().from(debateMessages)
      .where(eq(debateMessages.sessionId, sessionId))
      .orderBy(debateMessages.timestamp);
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

  // Risk Compliance Actions
  async getRiskComplianceActions(filters?: { entityType?: string, entityId?: string, status?: string }): Promise<RiskComplianceAction[]> {
    const conditions = [];
    
    if (filters?.entityType) {
      conditions.push(eq(riskComplianceActions.entityType, filters.entityType));
    }
    if (filters?.entityId) {
      conditions.push(eq(riskComplianceActions.entityId, filters.entityId));
    }
    if (filters?.status) {
      conditions.push(eq(riskComplianceActions.status, filters.status));
    }
    
    let query = db.select().from(riskComplianceActions);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(riskComplianceActions.createdAt));
  }

  async getRiskComplianceAction(id: string): Promise<RiskComplianceAction | undefined> {
    const [action] = await db.select().from(riskComplianceActions).where(eq(riskComplianceActions.id, id));
    return action || undefined;
  }

  async createRiskComplianceAction(insertAction: InsertRiskComplianceAction): Promise<RiskComplianceAction> {
    const [action] = await db
      .insert(riskComplianceActions)
      .values({ ...insertAction, id: randomUUID() })
      .returning();
    return action;
  }

  async updateRiskComplianceAction(id: string, updateData: Partial<RiskComplianceAction>): Promise<RiskComplianceAction | undefined> {
    const [action] = await db
      .update(riskComplianceActions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(riskComplianceActions.id, id))
      .returning();
    return action || undefined;
  }
}

export const storage = new DatabaseStorage();
