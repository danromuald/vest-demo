import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies/Stocks
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey(),
  ticker: text("ticker").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  industry: text("industry").notNull(),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

// Portfolio Positions
export const positions = pgTable("positions", {
  id: varchar("id").primaryKey(),
  ticker: text("ticker").notNull(),
  companyName: text("company_name").notNull(),
  shares: integer("shares").notNull(),
  avgCost: decimal("avg_cost", { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  marketValue: decimal("market_value", { precision: 20, scale: 2 }).notNull(),
  portfolioWeight: decimal("portfolio_weight", { precision: 5, scale: 2 }).notNull(),
  gainLoss: decimal("gain_loss", { precision: 20, scale: 2 }).notNull(),
  gainLossPercent: decimal("gain_loss_percent", { precision: 5, scale: 2 }).notNull(),
  sector: text("sector").notNull(),
  analyst: text("analyst").notNull(),
  thesisHealth: text("thesis_health").notNull(), // HEALTHY, WARNING, ALERT
  purchaseDate: timestamp("purchase_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  createdAt: true,
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;

// Investment Proposals
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey(),
  ticker: text("ticker").notNull(),
  companyName: text("company_name").notNull(),
  analyst: text("analyst").notNull(),
  proposalType: text("proposal_type").notNull(), // BUY, SELL, HOLD
  proposedWeight: decimal("proposed_weight", { precision: 5, scale: 2 }).notNull(),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }),
  thesis: text("thesis").notNull(),
  catalysts: text("catalysts").array(),
  risks: text("risks").array(),
  status: text("status").notNull(), // DRAFT, PENDING, APPROVED, REJECTED
  icMeetingId: varchar("ic_meeting_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

// IC Meetings
export const icMeetings = pgTable("ic_meetings", {
  id: varchar("id").primaryKey(),
  meetingDate: timestamp("meeting_date").notNull(),
  status: text("status").notNull(), // SCHEDULED, IN_PROGRESS, COMPLETED
  attendees: text("attendees").array(),
  agenda: jsonb("agenda"),
  decisions: jsonb("decisions"),
  minutes: text("minutes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertICMeetingSchema = createInsertSchema(icMeetings).omit({
  id: true,
  createdAt: true,
}).extend({
  meetingDate: z.coerce.date(), // Accept string or Date and coerce to Date
});

export type ICMeeting = typeof icMeetings.$inferSelect;
export type InsertICMeeting = z.infer<typeof insertICMeetingSchema>;

// Votes
export const votes = pgTable("votes", {
  id: varchar("id").primaryKey(),
  proposalId: varchar("proposal_id").notNull(),
  voterName: text("voter_name").notNull(),
  voterRole: text("voter_role").notNull(),
  vote: text("vote").notNull(), // APPROVE, REJECT, ABSTAIN
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

// Agent Types and Responses
export const agentResponses = pgTable("agent_responses", {
  id: varchar("id").primaryKey(),
  agentType: text("agent_type").notNull(), // RESEARCH_SYNTHESIZER, FINANCIAL_MODELER, CONTRARIAN, SCENARIO_SIMULATOR, THESIS_MONITOR
  ticker: text("ticker"),
  prompt: text("prompt").notNull(),
  response: jsonb("response").notNull(),
  metadata: jsonb("metadata"),
  generatedAt: timestamp("generated_at").defaultNow(),
});

export const insertAgentResponseSchema = createInsertSchema(agentResponses).omit({
  id: true,
  generatedAt: true,
});

export type AgentResponse = typeof agentResponses.$inferSelect;
export type InsertAgentResponse = z.infer<typeof insertAgentResponseSchema>;

// Financial Models (DCF, scenarios)
export const financialModels = pgTable("financial_models", {
  id: varchar("id").primaryKey(),
  ticker: text("ticker").notNull(),
  modelType: text("model_type").notNull(), // DCF, MULTIPLES, SCENARIO
  bullCase: jsonb("bull_case"),
  baseCase: jsonb("base_case"),
  bearCase: jsonb("bear_case"),
  assumptions: jsonb("assumptions"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFinancialModelSchema = createInsertSchema(financialModels).omit({
  id: true,
  createdAt: true,
});

export type FinancialModel = typeof financialModels.$inferSelect;
export type InsertFinancialModel = z.infer<typeof insertFinancialModelSchema>;

// Thesis Monitors (tracking alerts)
export const thesisMonitors = pgTable("thesis_monitors", {
  id: varchar("id").primaryKey(),
  ticker: text("ticker").notNull(),
  positionId: varchar("position_id").notNull(),
  healthStatus: text("health_status").notNull(), // HEALTHY, WARNING, ALERT
  lastCheck: timestamp("last_check").notNull(),
  alerts: jsonb("alerts"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertThesisMonitorSchema = createInsertSchema(thesisMonitors).omit({
  id: true,
  createdAt: true,
});

export type ThesisMonitor = typeof thesisMonitors.$inferSelect;
export type InsertThesisMonitor = z.infer<typeof insertThesisMonitorSchema>;

// Market Events
export const marketEvents = pgTable("market_events", {
  id: varchar("id").primaryKey(),
  ticker: text("ticker"),
  eventType: text("event_type").notNull(), // PRICE_DROP, EARNINGS, NEWS, MACRO
  severity: text("severity").notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  description: text("description").notNull(),
  impact: text("impact"),
  portfolioImpact: decimal("portfolio_impact", { precision: 20, scale: 2 }),
  detectedAt: timestamp("detected_at").defaultNow(),
});

export const insertMarketEventSchema = createInsertSchema(marketEvents).omit({
  id: true,
  detectedAt: true,
});

export type MarketEvent = typeof marketEvents.$inferSelect;
export type InsertMarketEvent = z.infer<typeof insertMarketEventSchema>;

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey(),
  type: text("type").notNull(), // THESIS_ALERT, MARKET_EVENT, IC_VOTE, SYSTEM
  severity: text("severity").notNull(), // INFO, WARNING, CRITICAL
  title: text("title").notNull(),
  message: text("message").notNull(),
  ticker: text("ticker"),
  relatedId: varchar("related_id"), // Related position, proposal, meeting, etc.
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// User Profiles and Roles
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // ANALYST, PORTFOLIO_MANAGER, RISK_OFFICER, COMPLIANCE, TRADER, ADMIN
  department: text("department"),
  permissions: jsonb("permissions"), // array of permission strings
  preferences: jsonb("preferences"), // UI preferences, notification settings
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

// Role Permissions Lookup
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey(),
  role: text("role").notNull(),
  resource: text("resource").notNull(), // PROPOSAL, MEETING, PORTFOLIO, RESEARCH, DEBATE
  action: text("action").notNull(), // CREATE, READ, UPDATE, DELETE, APPROVE, VOTE
  granted: boolean("granted").notNull().default(true),
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
});

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

// Research Requests
export const researchRequests = pgTable("research_requests", {
  id: varchar("id").primaryKey(),
  ticker: text("ticker").notNull(),
  companyName: text("company_name").notNull(),
  requestedBy: varchar("requested_by").notNull(), // user profile id
  assignedTo: varchar("assigned_to"), // user profile id
  status: text("status").notNull(), // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  priority: text("priority").notNull(), // LOW, MEDIUM, HIGH, URGENT
  description: text("description"),
  researchType: text("research_type").notNull(), // INITIAL, UPDATE, DEEP_DIVE
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  proposalId: varchar("proposal_id"), // linked proposal if created
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertResearchRequestSchema = createInsertSchema(researchRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ResearchRequest = typeof researchRequests.$inferSelect;
export type InsertResearchRequest = z.infer<typeof insertResearchRequestSchema>;

// Workflow Stages (persisted instances)
export const workflowStages = pgTable("workflow_stages", {
  id: varchar("id").primaryKey(),
  entityType: text("entity_type").notNull(), // PROPOSAL, MEETING, RESEARCH
  entityId: varchar("entity_id").notNull(),
  currentStage: text("current_stage").notNull(), // DISCOVERY, ANALYSIS, IC_MEETING, EXECUTION, MONITORING
  discoveryStatus: text("discovery_status").notNull().default('pending'), // PENDING, IN_PROGRESS, COMPLETED
  discoveryCompletedAt: timestamp("discovery_completed_at"),
  analysisStatus: text("analysis_status").notNull().default('pending'),
  analysisCompletedAt: timestamp("analysis_completed_at"),
  icMeetingStatus: text("ic_meeting_status").notNull().default('pending'),
  icMeetingCompletedAt: timestamp("ic_meeting_completed_at"),
  executionStatus: text("execution_status").notNull().default('pending'),
  executionCompletedAt: timestamp("execution_completed_at"),
  monitoringStatus: text("monitoring_status").notNull().default('pending'),
  monitoringCompletedAt: timestamp("monitoring_completed_at"),
  lastAdvancedBy: varchar("last_advanced_by"), // user id who advanced
  lastAdvancedAt: timestamp("last_advanced_at"),
  lastRevertedBy: varchar("last_reverted_by"), // user id who reverted
  lastRevertedAt: timestamp("last_reverted_at"),
  revertReason: text("revert_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkflowStageSchema = createInsertSchema(workflowStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WorkflowStageRecord = typeof workflowStages.$inferSelect;
export type InsertWorkflowStage = z.infer<typeof insertWorkflowStageSchema>;

// Meeting Participants
export const meetingParticipants = pgTable("meeting_participants", {
  id: varchar("id").primaryKey(),
  meetingId: varchar("meeting_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(), // CHAIR, VOTING_MEMBER, OBSERVER, PRESENTER
  attended: boolean("attended").default(false),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
});

export const insertMeetingParticipantSchema = createInsertSchema(meetingParticipants).omit({
  id: true,
});

export type MeetingParticipant = typeof meetingParticipants.$inferSelect;
export type InsertMeetingParticipant = z.infer<typeof insertMeetingParticipantSchema>;

// Debate Sessions
export const debateSessions = pgTable("debate_sessions", {
  id: varchar("id").primaryKey(),
  meetingId: varchar("meeting_id").notNull(),
  proposalId: varchar("proposal_id").notNull(),
  ticker: text("ticker").notNull(),
  topic: text("topic").notNull(),
  status: text("status").notNull(), // ACTIVE, PAUSED, COMPLETED
  currentPhase: text("current_phase").notNull().default("PRESENTATION"), // PRESENTATION, QUESTIONING, DELIBERATION, VOTING, CONCLUDED
  leadModerator: text("lead_moderator").notNull().default("Meeting Secretary"),
  activeAgents: text("active_agents").array().notNull().default(sql`ARRAY[]::text[]`), // Array of active agent types
  decision: text("decision"), // APPROVED, REJECTED, DEFERRED
  voteCount: jsonb("vote_count"), // { approve: number, reject: number, abstain: number }
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  participantCount: integer("participant_count").default(0),
  messageCount: integer("message_count").default(0),
  artifacts: jsonb("artifacts"), // Research briefs, DCF models, charts displayed
  metadata: jsonb("metadata"),
});

export const insertDebateSessionSchema = createInsertSchema(debateSessions).omit({
  id: true,
  startedAt: true,
});

export type DebateSession = typeof debateSessions.$inferSelect;
export type InsertDebateSession = z.infer<typeof insertDebateSessionSchema>;

// Debate Messages
export const debateMessages = pgTable("debate_messages", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").notNull(),
  senderType: text("sender_type").notNull(), // HUMAN, AI_AGENT
  senderId: varchar("sender_id").notNull(), // user id or agent type
  senderName: text("sender_name").notNull(),
  agentRole: text("agent_role"), // CONTRARIAN, DEFENDER, SECRETARY, LEAD_PM, RESEARCH_ANALYST, CIO
  content: text("content").notNull(),
  messageType: text("message_type").notNull(), // TEXT, ANALYSIS, QUESTION, RESPONSE, ARGUMENT, COUNTERARGUMENT, SUMMARY, DECISION
  stance: text("stance"), // BULL, BEAR, NEUTRAL
  artifact: jsonb("artifact"), // Embedded charts, data, analysis
  metadata: jsonb("metadata"), // Citations, data sources, confidence scores
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertDebateMessageSchema = createInsertSchema(debateMessages).omit({
  id: true,
  timestamp: true,
});

export type DebateMessage = typeof debateMessages.$inferSelect;
export type InsertDebateMessage = z.infer<typeof insertDebateMessageSchema>;

// Portfolio Impacts (proposal to position relationships)
export const portfolioImpacts = pgTable("portfolio_impacts", {
  id: varchar("id").primaryKey(),
  proposalId: varchar("proposal_id").notNull(),
  positionId: varchar("position_id"), // null for new positions
  ticker: text("ticker").notNull(),
  impactType: text("impact_type").notNull(), // NEW_POSITION, INCREASE, DECREASE, EXIT
  proposedShares: integer("proposed_shares"),
  proposedWeight: decimal("proposed_weight", { precision: 5, scale: 2 }),
  expectedCost: decimal("expected_cost", { precision: 20, scale: 2 }),
  riskImpact: text("risk_impact"),
  complianceStatus: text("compliance_status").notNull(), // APPROVED, PENDING, FLAGGED
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPortfolioImpactSchema = createInsertSchema(portfolioImpacts).omit({
  id: true,
  createdAt: true,
});

export type PortfolioImpact = typeof portfolioImpacts.$inferSelect;
export type InsertPortfolioImpact = z.infer<typeof insertPortfolioImpactSchema>;

// Risk and Compliance Actions
export const riskComplianceActions = pgTable("risk_compliance_actions", {
  id: varchar("id").primaryKey(),
  entityType: text("entity_type").notNull(), // PROPOSAL, POSITION, MEETING
  entityId: varchar("entity_id").notNull(),
  actionType: text("action_type").notNull(), // RISK_REVIEW, COMPLIANCE_CHECK, LIMIT_MONITORING, APPROVAL
  status: text("status").notNull(), // PENDING, IN_REVIEW, APPROVED, REJECTED, FLAGGED
  assignedTo: varchar("assigned_to"), // risk officer or compliance user id
  findings: text("findings"),
  recommendation: text("recommendation"),
  priority: text("priority").notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRiskComplianceActionSchema = createInsertSchema(riskComplianceActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RiskComplianceAction = typeof riskComplianceActions.$inferSelect;
export type InsertRiskComplianceAction = z.infer<typeof insertRiskComplianceActionSchema>;

// Workflow Stages Type (for interfaces)
export type WorkflowStage = 'discovery' | 'analysis' | 'ic_meeting' | 'execution' | 'monitoring';

export interface WorkflowProgress {
  currentStage: WorkflowStage;
  stages: {
    discovery: { status: 'completed' | 'in_progress' | 'pending'; completedAt?: string };
    analysis: { status: 'completed' | 'in_progress' | 'pending'; completedAt?: string };
    ic_meeting: { status: 'completed' | 'in_progress' | 'pending'; completedAt?: string };
    execution: { status: 'completed' | 'in_progress' | 'pending'; completedAt?: string };
    monitoring: { status: 'completed' | 'in_progress' | 'pending'; completedAt?: string };
  };
}

// Agent Request/Response Types
export interface AgentRequest {
  agentType: 'research_synthesizer' | 'financial_modeler' | 'contrarian' | 'scenario_simulator' | 'thesis_monitor';
  ticker?: string;
  prompt: string;
  context?: Record<string, any>;
}

export interface ResearchBrief {
  ticker: string;
  companyName: string;
  summary: string;
  keyMetrics: {
    revenue: string;
    growth: string;
    margins: string;
    valuation: string;
  };
  strengths: string[];
  risks: string[];
  recommendation: string;
}

export interface DCFModel {
  ticker: string;
  scenarios: {
    bull: { price: number; irr: number; assumptions: string };
    base: { price: number; irr: number; assumptions: string };
    bear: { price: number; irr: number; assumptions: string };
  };
  wacc: number;
  terminalGrowth: number;
}

export interface ContrarianAnalysis {
  ticker: string;
  bearCase: string;
  historicalPrecedents: string[];
  quantifiedDownside: string;
  probabilityAssessment: string;
  keyRisks: string[];
}

export interface ScenarioAnalysis {
  proposedWeight: number;
  currentPortfolio: {
    trackingError: number;
    concentration: number;
    factorExposures: Record<string, number>;
  };
  projectedPortfolio: {
    trackingError: number;
    concentration: number;
    factorExposures: Record<string, number>;
  };
  riskMetrics: {
    withinLimits: boolean;
    warnings: string[];
  };
}

export interface ThesisHealthReport {
  ticker: string;
  status: 'HEALTHY' | 'WARNING' | 'ALERT';
  summary: string;
  keyConcerns: string[];
  thesisDrift: number;
  recommendation: 'HOLD' | 'REVIEW' | 'SELL';
}

export interface FactorAnalysis {
  ticker: string;
  factorExposures: {
    growth: number;
    value: number;
    momentum: number;
    quality: number;
    size: number;
    volatility: number;
  };
  statisticalMetrics: {
    sharpeRatio: number;
    beta: number;
    alpha: number;
    volatility: number;
  };
  portfolioCorrelation: number;
  riskAdjustedReturn: number;
  quantScore: number;
  summary: string;
}

export interface MarketEventReport {
  ticker: string;
  priceMovement: {
    current: number;
    change: number;
    changePercent: number;
    trigger: string;
  };
  newsEvents: string[];
  analystChanges: string[];
  technicalAlerts: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

export interface InvestmentMemo {
  ticker: string;
  title: string;
  executiveSummary: string;
  investmentThesis: string;
  valuationAnalysis: string;
  riskFactors: string[];
  recommendation: {
    action: 'BUY' | 'SELL' | 'HOLD';
    targetPrice: number;
    timeframe: string;
    conviction: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  preparedBy: string;
  date: string;
}

export interface ComplianceReport {
  ticker: string;
  proposalId: string;
  complianceChecks: {
    positionLimits: { passed: boolean; detail: string };
    sectorConcentration: { passed: boolean; detail: string };
    regulatoryRestrictions: { passed: boolean; detail: string };
    conflictOfInterest: { passed: boolean; detail: string };
  };
  violations: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  remediation: string[];
  approvalRequired: boolean;
  recommendation: string;
}

export interface MeetingMinutes {
  meetingId: string;
  date: string;
  attendees: string[];
  proposalsReviewed: {
    ticker: string;
    proposalId: string;
    decision: 'APPROVED' | 'REJECTED' | 'DEFERRED';
    voteSummary: { for: number; against: number; abstain: number };
  }[];
  keyDiscussionPoints: string[];
  actionItems: {
    description: string;
    assignedTo: string;
    dueDate: string;
  }[];
  nextMeetingDate: string;
}

export interface TradeOrder {
  ticker: string;
  proposalId: string;
  orderType: 'BUY' | 'SELL';
  shares: number;
  targetPrice: number;
  orderStrategy: 'MARKET' | 'LIMIT' | 'TWAP' | 'VWAP';
  timeframe: string;
  estimatedCost: number;
  riskParameters: {
    maxSlippage: number;
    stopLoss: number;
  };
  executionInstructions: string[];
  generatedAt: string;
}

export interface PreTradeRiskReport {
  ticker: string;
  proposalId: string;
  proposedShares: number;
  proposedWeight: number;
  portfolioImpact: {
    newPortfolioWeight: number;
    sectorConcentration: number;
    factorExposureChange: string;
    trackingErrorChange: number;
  };
  riskMetrics: {
    varImpact: number;
    betaContribution: number;
    correlationToPortfolio: number;
  };
  limitBreaches: string[];
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

export interface DataRetrievalReport {
  ticker: string;
  queryType: 'PRECEDENTS' | 'COMPARABLES' | 'HISTORICAL';
  results: {
    transaction: string;
    date: string;
    valuation: string;
    relevance: number;
  }[];
  summary: string;
  insights: string[];
}

export interface VoiceSummary {
  meetingId: string;
  ticker: string;
  audioUrl: string;
  transcriptSummary: string;
  keyPoints: string[];
  duration: string;
  generatedAt: string;
}

export interface AttributionReport {
  portfolioId: string;
  period: string;
  totalReturn: number;
  attribution: {
    assetAllocation: number;
    stockSelection: number;
    interaction: number;
    currency: number;
  };
  topContributors: {
    ticker: string;
    contribution: number;
    reason: string;
  }[];
  topDetractors: {
    ticker: string;
    contribution: number;
    reason: string;
  }[];
  summary: string;
}

export interface RiskRegimeReport {
  currentRegime: 'LOW_VOLATILITY' | 'MODERATE_VOLATILITY' | 'HIGH_VOLATILITY' | 'CRISIS';
  regimeConfidence: number;
  indicators: {
    vixLevel: number;
    marketVolatility: number;
    correlationBreakdown: boolean;
    liquidityStress: boolean;
  };
  recommendations: string[];
  portfolioAdjustments: string[];
  monitoringAlerts: string[];
}
