import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (IMPORTANT: Mandatory for Replit Auth, don't drop it)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (IMPORTANT: Mandatory for Replit Auth, don't drop it)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("ANALYST"), // ANALYST, PM, COMPLIANCE, ADMIN
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

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

// Workflows - Core workflow tracking entity
export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey(),
  ticker: text("ticker").notNull(),
  companyName: text("company_name").notNull(),
  sector: text("sector"),
  currentStage: text("current_stage").notNull().default("DISCOVERY"), // DISCOVERY, ANALYSIS, IC_MEETING, EXECUTION, MONITORING
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, COMPLETED, ARCHIVED
  owner: varchar("owner").notNull(), // User ID
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

// Workflow Stages - Track completion and metadata for each stage
export const workflowStages = pgTable("workflow_stages", {
  id: varchar("id").primaryKey(),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(), // DISCOVERY, ANALYSIS, IC_MEETING, EXECUTION, MONITORING
  status: text("status").notNull().default("PENDING"), // PENDING, IN_PROGRESS, COMPLETED, SKIPPED
  owner: varchar("owner"), // User ID assigned to this stage
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  metadata: jsonb("metadata"), // Stage-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkflowStageSchema = createInsertSchema(workflowStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WorkflowStage = typeof workflowStages.$inferSelect;
export type InsertWorkflowStage = z.infer<typeof insertWorkflowStageSchema>;

// Workflow Assignments - User roles and assignments per workflow
export const workflowAssignments = pgTable("workflow_assignments", {
  id: varchar("id").primaryKey(),
  workflowId: varchar("workflow_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(), // ANALYST, PM, COMPLIANCE, ADMIN
  stage: text("stage"), // Optional: assignment for specific stage
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const insertWorkflowAssignmentSchema = createInsertSchema(workflowAssignments).omit({
  id: true,
  assignedAt: true,
});

export type WorkflowAssignment = typeof workflowAssignments.$inferSelect;
export type InsertWorkflowAssignment = z.infer<typeof insertWorkflowAssignmentSchema>;

// Workflow Artifacts - Versioned outputs from each stage
export const workflowArtifacts = pgTable("workflow_artifacts", {
  id: varchar("id").primaryKey(),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  artifactType: text("artifact_type").notNull(), // RESEARCH_BRIEF, FINANCIAL_MODEL, RISK_ANALYSIS, THESIS, IC_DECK, TRADE_PACKET, MEETING_MINUTES
  stage: text("stage").notNull(), // Which stage produced this
  version: integer("version").notNull().default(1),
  title: text("title").notNull(),
  content: jsonb("content").notNull(), // Structured content
  metadata: jsonb("metadata"), // Additional metadata
  createdBy: varchar("created_by").notNull(),
  status: text("status").notNull().default("DRAFT"), // DRAFT, REVIEW, APPROVED, ARCHIVED
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkflowArtifactSchema = createInsertSchema(workflowArtifacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WorkflowArtifact = typeof workflowArtifacts.$inferSelect;
export type InsertWorkflowArtifact = z.infer<typeof insertWorkflowArtifactSchema>;

// Artifact Revisions - Track changes to artifacts
export const artifactRevisions = pgTable("artifact_revisions", {
  id: varchar("id").primaryKey(),
  artifactId: varchar("artifact_id").notNull().references(() => workflowArtifacts.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  content: jsonb("content").notNull(),
  changeDescription: text("change_description"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertArtifactRevisionSchema = createInsertSchema(artifactRevisions).omit({
  id: true,
  createdAt: true,
});

export type ArtifactRevision = typeof artifactRevisions.$inferSelect;
export type InsertArtifactRevision = z.infer<typeof insertArtifactRevisionSchema>;

// Investment Proposals - Now linked to workflows
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey(),
  workflowId: varchar("workflow_id").references(() => workflows.id, { onDelete: "set null" }), // Link to workflow
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
  icMeetingId: varchar("ic_meeting_id").references(() => icMeetings.id, { onDelete: "set null" }),
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

// IC Meetings - Extended for real-time collaboration
export const icMeetings = pgTable("ic_meetings", {
  id: varchar("id").primaryKey(),
  workflowId: varchar("workflow_id").references(() => workflows.id, { onDelete: "set null" }), // Link to workflow
  meetingDate: timestamp("meeting_date").notNull(),
  status: text("status").notNull(), // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  title: text("title").notNull(),
  description: text("description"),
  attendees: text("attendees").array(),
  agenda: jsonb("agenda"),
  decisions: jsonb("decisions"),
  minutes: text("minutes"),
  recordingUrl: text("recording_url"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertICMeetingSchema = createInsertSchema(icMeetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  meetingDate: z.coerce.date(), // Accept string or Date and coerce to Date
});

export type ICMeeting = typeof icMeetings.$inferSelect;
export type InsertICMeeting = z.infer<typeof insertICMeetingSchema>;

// Meeting Sessions - Track real-time session state
export const meetingSessions = pgTable("meeting_sessions", {
  id: varchar("id").primaryKey(),
  meetingId: varchar("meeting_id").notNull().references(() => icMeetings.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, PAUSED, ENDED
  currentPhase: text("current_phase").notNull().default("PRESENTATION"), // PRESENTATION, QUESTIONING, DELIBERATION, VOTING, CONCLUDED
  activeParticipants: integer("active_participants").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  metadata: jsonb("metadata"), // Session state data
});

export const insertMeetingSessionSchema = createInsertSchema(meetingSessions).omit({
  id: true,
  startedAt: true,
});

export type MeetingSession = typeof meetingSessions.$inferSelect;
export type InsertMeetingSession = z.infer<typeof insertMeetingSessionSchema>;

// Debate Messages - Real-time chat/discussion during IC meetings
export const debateMessages = pgTable("debate_messages", {
  id: varchar("id").primaryKey(),
  meetingId: varchar("meeting_id").notNull().references(() => icMeetings.id, { onDelete: "cascade" }),
  debateSessionId: varchar("debate_session_id").references(() => debateSessions.id, { onDelete: "set null" }),
  userId: varchar("user_id"), // null for AI agents
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(), // ANALYST, PM, COMPLIANCE, BULL_AGENT, BEAR_AGENT, MODERATOR
  messageType: text("message_type").notNull().default("COMMENT"), // COMMENT, QUESTION, ANSWER, VOTE_CALL, DECISION
  content: text("content").notNull(),
  replyTo: varchar("reply_to"), // ID of message being replied to
  reactions: jsonb("reactions"), // Emoji reactions {emoji: count}
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDebateMessageSchema = createInsertSchema(debateMessages).omit({
  id: true,
  createdAt: true,
});

export type DebateMessage = typeof debateMessages.$inferSelect;
export type InsertDebateMessage = z.infer<typeof insertDebateMessageSchema>;

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

// Thesis Health Metrics - Track investment thesis health over time
export const thesisHealthMetrics = pgTable("thesis_health_metrics", {
  id: varchar("id").primaryKey(),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  positionId: varchar("position_id"), // null if not yet executed
  ticker: text("ticker").notNull(),
  healthStatus: text("health_status").notNull(), // HEALTHY, WARNING, ALERT, CRITICAL
  healthScore: integer("health_score").notNull(), // 0-100
  catalystsStatus: jsonb("catalysts_status"), // Status of each catalyst
  risksStatus: jsonb("risks_status"), // Status of each risk
  keyMetrics: jsonb("key_metrics"), // Current vs expected metrics
  deviation: jsonb("deviation"), // How far from thesis
  lastCheck: timestamp("last_check").notNull(),
  nextCheck: timestamp("next_check"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertThesisHealthMetricSchema = createInsertSchema(thesisHealthMetrics).omit({
  id: true,
  createdAt: true,
});

export type ThesisHealthMetric = typeof thesisHealthMetrics.$inferSelect;
export type InsertThesisHealthMetric = z.infer<typeof insertThesisHealthMetricSchema>;

// Monitoring Events - Track all monitoring events
export const monitoringEvents = pgTable("monitoring_events", {
  id: varchar("id").primaryKey(),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // THESIS_CHECK, MARKET_EVENT, PRICE_ALERT, METRIC_DEVIATION, CATALYST_UPDATE, RISK_MATERIALIZED
  severity: text("severity").notNull(), // INFO, WARNING, ALERT, CRITICAL
  ticker: text("ticker"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  details: jsonb("details"),
  actionRequired: boolean("action_required").default(false),
  actionTaken: text("action_taken"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMonitoringEventSchema = createInsertSchema(monitoringEvents).omit({
  id: true,
  createdAt: true,
});

export type MonitoringEvent = typeof monitoringEvents.$inferSelect;
export type InsertMonitoringEvent = z.infer<typeof insertMonitoringEventSchema>;

// Market Alerts - Track market events that may impact positions
export const marketAlerts = pgTable("market_alerts", {
  id: varchar("id").primaryKey(),
  ticker: text("ticker"),
  sector: text("sector"),
  alertType: text("alert_type").notNull(), // PRICE_MOVE, EARNINGS, NEWS, ANALYST_RATING, MACRO, COMPETITOR
  severity: text("severity").notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  title: text("title").notNull(),
  description: text("description").notNull(),
  source: text("source"),
  sourceUrl: text("source_url"),
  impact: text("impact"), // Assessment of impact
  affectedWorkflows: text("affected_workflows").array(), // Workflow IDs affected
  read: boolean("read").default(false),
  detectedAt: timestamp("detected_at").defaultNow(),
});

export const insertMarketAlertSchema = createInsertSchema(marketAlerts).omit({
  id: true,
  detectedAt: true,
});

export type MarketAlert = typeof marketAlerts.$inferSelect;
export type InsertMarketAlert = z.infer<typeof insertMarketAlertSchema>;

// Notification Rules - User-defined rules for alerts
export const notificationRules = pgTable("notification_rules", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  workflowId: varchar("workflow_id"), // null for global rules
  ruleType: text("rule_type").notNull(), // PRICE_CHANGE, THESIS_HEALTH, MARKET_EVENT, CATALYST, RISK
  condition: jsonb("condition").notNull(), // Rule condition (e.g., price change > 5%)
  channels: text("channels").array().notNull(), // EMAIL, IN_APP, SLACK
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationRuleSchema = createInsertSchema(notificationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NotificationRule = typeof notificationRules.$inferSelect;
export type InsertNotificationRule = z.infer<typeof insertNotificationRuleSchema>;

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


// Meeting Participants
export const meetingParticipants = pgTable("meeting_participants", {
  id: varchar("id").primaryKey(),
  meetingId: varchar("meeting_id").notNull().references(() => icMeetings.id, { onDelete: "cascade" }),
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
  meetingId: varchar("meeting_id").notNull().references(() => icMeetings.id, { onDelete: "cascade" }),
  proposalId: varchar("proposal_id").notNull(),
  ticker: text("ticker").notNull(),
  topic: text("topic").notNull(),
  status: text("status").notNull(), // ACTIVE, PAUSED, COMPLETED
  currentPhase: text("current_phase").notNull().default("PRESENTATION"), // PRESENTATION, QUESTIONING, DELIBERATION, VOTING, CONCLUDED
  leadModerator: text("lead_moderator").notNull().default("Meeting Secretary"),
  activeAgents: text("active_agents").array().notNull().default(sql`ARRAY[]::text[]`), // Array of active agent types
  decision: text("decision"), // APPROVED, REJECTED, DEFERRED
  voteCount: jsonb("vote_count"), // { approve: number, reject: number, abstain: number }
  summary: text("summary"), // AI-generated summary of debate
  keyPoints: text("key_points").array(), // Key points from the debate
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

// Trade Orders - Execution stage trade preparation
export const tradeOrders = pgTable("trade_orders", {
  id: varchar("id").primaryKey(),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  proposalId: varchar("proposal_id"),
  ticker: text("ticker").notNull(),
  orderType: text("order_type").notNull(), // MARKET, LIMIT, STOP_LOSS, ICEBERG
  side: text("side").notNull(), // BUY, SELL
  quantity: integer("quantity").notNull(),
  limitPrice: decimal("limit_price", { precision: 10, scale: 2 }),
  estimatedCost: decimal("estimated_cost", { precision: 20, scale: 2 }),
  transactionCost: decimal("transaction_cost", { precision: 20, scale: 2 }), // TCA estimate
  urgency: text("urgency").notNull(), // LOW, NORMAL, HIGH, IMMEDIATE
  status: text("status").notNull(), // DRAFT, PENDING_APPROVAL, APPROVED, SENT, FILLED, PARTIALLY_FILLED, CANCELLED, REJECTED
  brokerOrderId: text("broker_order_id"),
  executionDetails: jsonb("execution_details"),
  createdBy: varchar("created_by").notNull(),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  sentAt: timestamp("sent_at"),
  filledAt: timestamp("filled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTradeOrderSchema = createInsertSchema(tradeOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TradeOrder = typeof tradeOrders.$inferSelect;
export type InsertTradeOrder = z.infer<typeof insertTradeOrderSchema>;

// Compliance Checks - Pre-trade and post-trade compliance
export const complianceChecks = pgTable("compliance_checks", {
  id: varchar("id").primaryKey(),
  workflowId: varchar("workflow_id").references(() => workflows.id, { onDelete: "set null" }),
  tradeOrderId: varchar("trade_order_id").references(() => tradeOrders.id, { onDelete: "cascade" }),
  proposalId: varchar("proposal_id"),
  checkType: text("check_type").notNull(), // PRE_TRADE, POST_TRADE, POSITION_LIMIT, CONCENTRATION, RESTRICTED_LIST, WASH_SALE
  status: text("status").notNull(), // PENDING, PASSED, FAILED, WARNING, OVERRIDE
  ticker: text("ticker"),
  findings: jsonb("findings"), // Detailed check results
  violations: text("violations").array(),
  warnings: text("warnings").array(),
  recommendation: text("recommendation"),
  assignedTo: varchar("assigned_to"), // Compliance officer
  overrideReason: text("override_reason"),
  overrideBy: varchar("override_by"),
  overrideAt: timestamp("override_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertComplianceCheckSchema = createInsertSchema(complianceChecks).omit({
  id: true,
  createdAt: true,
});

export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;

// Risk Assessments - Portfolio risk analysis
export const riskAssessments = pgTable("risk_assessments", {
  id: varchar("id").primaryKey(),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  proposalId: varchar("proposal_id"),
  assessmentType: text("assessment_type").notNull(), // PRE_IC, PRE_EXECUTION, POST_EXECUTION, PERIODIC
  ticker: text("ticker"),
  riskMetrics: jsonb("risk_metrics").notNull(), // VaR, beta, correlation, etc.
  concentration: jsonb("concentration"), // Sector, single name concentration
  stressTests: jsonb("stress_tests"), // Scenario analysis results
  riskScore: integer("risk_score"), // 0-100
  riskRating: text("risk_rating"), // LOW, MEDIUM, HIGH, EXTREME
  recommendations: text("recommendations").array(),
  limitBreaches: text("limit_breaches").array(),
  approvalRequired: boolean("approval_required").default(false),
  assessedBy: varchar("assessed_by").notNull(),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  createdAt: true,
});

export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;

// Workflow Stages Type (for interfaces)
export type WorkflowStageName = 'discovery' | 'analysis' | 'ic_meeting' | 'execution' | 'monitoring';

export interface WorkflowProgress {
  currentStage: WorkflowStageName;
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
