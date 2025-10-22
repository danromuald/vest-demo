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

// Workflow Stages
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
