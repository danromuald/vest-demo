import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { agentService } from "./services/agents";
import { pdfService } from "./services/pdf";
import { notificationService } from "./services/notifications";
import { workflowService } from "./services/workflow";
import {
  insertPositionSchema,
  insertProposalSchema,
  insertICMeetingSchema,
  insertVoteSchema,
  insertNotificationSchema,
  insertUserProfileSchema,
  insertResearchRequestSchema,
  insertWorkflowStageSchema,
  insertMeetingParticipantSchema,
  insertDebateSessionSchema,
  insertDebateMessageSchema,
  insertPortfolioImpactSchema,
  insertRiskComplianceActionSchema,
} from "@shared/schema";
import { z } from "zod";

// Agent request validation schemas
const agentTickerSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").max(10).regex(/^[A-Z]+$/, "Invalid ticker format"),
});

const scenarioSchema = z.object({
  ticker: z.string().min(1).max(10).regex(/^[A-Z]+$/),
  proposedWeight: z.number().min(0).max(100),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Positions
  app.get("/api/positions", async (_req, res) => {
    try {
      const positions = await storage.getPositions();
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch positions" });
    }
  });

  app.post("/api/positions", async (req, res) => {
    try {
      const validated = insertPositionSchema.parse(req.body);
      const position = await storage.createPosition(validated);
      res.json(position);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create position" });
    }
  });

  // Companies
  app.get("/api/companies", async (_req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:ticker", async (req, res) => {
    try {
      const company = await storage.getCompanyByTicker(req.params.ticker);
      if (!company) {
        res.status(404).json({ error: "Company not found" });
        return;
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });

  // Proposals
  app.get("/api/proposals", async (_req, res) => {
    try {
      const proposals = await storage.getProposals();
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proposals" });
    }
  });

  app.post("/api/proposals", async (req, res) => {
    try {
      const validated = insertProposalSchema.parse(req.body);
      const proposal = await storage.createProposal(validated);
      res.json(proposal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create proposal" });
    }
  });

  app.patch("/api/proposals/:id", async (req, res) => {
    try {
      const validated = insertProposalSchema.partial().parse(req.body);
      const proposal = await storage.updateProposal(req.params.id, validated);
      if (!proposal) {
        res.status(404).json({ error: "Proposal not found" });
        return;
      }
      res.json(proposal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update proposal" });
    }
  });

  // IC Meetings
  app.get("/api/ic-meetings", async (_req, res) => {
    try {
      const meetings = await storage.getICMeetings();
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch IC meetings" });
    }
  });

  app.post("/api/ic-meetings", async (req, res) => {
    try {
      console.log("IC Meeting creation payload:", JSON.stringify(req.body, null, 2));
      const validated = insertICMeetingSchema.parse(req.body);
      const meeting = await storage.createICMeeting(validated);
      res.json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("IC Meeting validation errors:", error.errors);
        res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
        return;
      }
      console.error("IC Meeting creation error:", error);
      res.status(500).json({ error: "Failed to create IC meeting" });
    }
  });

  app.patch("/api/ic-meetings/:id", async (req, res) => {
    try {
      const meetingId = req.params.id;
      const updates = req.body;
      
      // Validate status if provided
      if (updates.status && !['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(updates.status)) {
        res.status(400).json({ error: "Invalid meeting status" });
        return;
      }
      
      const updated = await storage.updateICMeeting(meetingId, updates);
      res.json(updated);
    } catch (error) {
      console.error("IC Meeting update error:", error);
      res.status(500).json({ error: "Failed to update IC meeting" });
    }
  });

  app.delete("/api/ic-meetings/:id", async (req, res) => {
    try {
      const meetingId = req.params.id;
      
      // First, clear icMeetingId from all proposals linked to this meeting
      const allProposals = await storage.getProposals();
      const linkedProposals = allProposals.filter(p => p.icMeetingId === meetingId);
      
      await Promise.all(
        linkedProposals.map(p => storage.updateProposal(p.id, { icMeetingId: null }))
      );
      
      // Then delete the meeting
      await storage.deleteICMeeting(meetingId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete IC meeting" });
    }
  });

  // Votes
  app.get("/api/votes/:proposalId", async (req, res) => {
    try {
      const votes = await storage.getVotes(req.params.proposalId);
      res.json(votes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch votes" });
    }
  });

  app.post("/api/votes", async (req, res) => {
    try {
      const validated = insertVoteSchema.parse(req.body);
      const vote = await storage.createVote(validated);
      res.json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create vote" });
    }
  });

  // Market Events
  app.get("/api/market-events", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const events = await storage.getMarketEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market events" });
    }
  });

  // AI Agents
  app.post("/api/agents/research-synthesizer", async (req, res) => {
    try {
      const { ticker } = agentTickerSchema.parse(req.body);

      const brief = await agentService.generateResearchBrief(ticker);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "RESEARCH_SYNTHESIZER",
        ticker,
        prompt: `Generate research brief for ${ticker}`,
        response: brief,
        metadata: {},
      });

      res.json(brief);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      console.error("Research synthesizer error:", error);
      res.status(500).json({ error: "Failed to generate research brief" });
    }
  });

  app.post("/api/agents/financial-modeler", async (req, res) => {
    try {
      const { ticker } = agentTickerSchema.parse(req.body);

      const model = await agentService.generateDCFModel(ticker);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "FINANCIAL_MODELER",
        ticker,
        prompt: `Generate DCF model for ${ticker}`,
        response: model,
        metadata: {},
      });

      res.json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      console.error("Financial modeler error:", error);
      res.status(500).json({ error: "Failed to generate DCF model" });
    }
  });

  app.post("/api/agents/contrarian", async (req, res) => {
    try {
      const { ticker } = agentTickerSchema.parse(req.body);

      const analysis = await agentService.generateContrarianAnalysis(ticker);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "CONTRARIAN",
        ticker,
        prompt: `Generate contrarian analysis for ${ticker}`,
        response: analysis,
        metadata: {},
      });

      res.json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      console.error("Contrarian agent error:", error);
      res.status(500).json({ error: "Failed to generate contrarian analysis" });
    }
  });

  app.post("/api/agents/scenario-simulator", async (req, res) => {
    try {
      const { ticker, proposedWeight } = scenarioSchema.parse(req.body);

      const analysis = await agentService.generateScenarioAnalysis(ticker, proposedWeight);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "SCENARIO_SIMULATOR",
        ticker,
        prompt: `Simulate ${ticker} at ${proposedWeight}% weight`,
        response: analysis,
        metadata: { proposedWeight },
      });

      res.json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      console.error("Scenario simulator error:", error);
      res.status(500).json({ error: "Failed to generate scenario analysis" });
    }
  });

  app.post("/api/agents/thesis-generator", async (req, res) => {
    try {
      const { ticker, companyName, researchData, dcfData } = req.body;

      const thesis = await agentService.generateInvestmentThesis(
        ticker, 
        companyName, 
        researchData, 
        dcfData
      );
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "DOCUMENT_GENERATOR",
        ticker,
        prompt: `Generate investment thesis for ${ticker}`,
        response: thesis,
        metadata: { companyName },
      });

      res.json(thesis);
    } catch (error) {
      console.error("Thesis generator error:", error);
      res.status(500).json({ error: "Failed to generate investment thesis" });
    }
  });

  app.post("/api/agents/thesis-monitor", async (req, res) => {
    try {
      const { ticker } = agentTickerSchema.parse(req.body);

      const report = await agentService.generateThesisHealthReport(ticker);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "THESIS_MONITOR",
        ticker,
        prompt: `Monitor thesis health for ${ticker}`,
        response: report,
        metadata: {},
      });

      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      console.error("Thesis monitor error:", error);
      res.status(500).json({ error: "Failed to generate thesis health report" });
    }
  });

  app.post("/api/agents/quant-analyst", async (req, res) => {
    try {
      const { ticker } = agentTickerSchema.parse(req.body);

      const analysis = await agentService.generateFactorAnalysis(ticker);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "QUANT_ANALYST",
        ticker,
        prompt: `Generate factor analysis for ${ticker}`,
        response: analysis,
        metadata: {},
      });

      res.json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      console.error("Quant analyst error:", error);
      res.status(500).json({ error: "Failed to generate factor analysis" });
    }
  });

  app.post("/api/agents/market-monitor", async (req, res) => {
    try {
      const { ticker } = agentTickerSchema.parse(req.body);

      const report = await agentService.generateMarketEventReport(ticker);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "MARKET_MONITOR",
        ticker,
        prompt: `Monitor market events for ${ticker}`,
        response: report,
        metadata: {},
      });

      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      console.error("Market monitor error:", error);
      res.status(500).json({ error: "Failed to generate market event report" });
    }
  });

  app.post("/api/agents/document-generator", async (req, res) => {
    try {
      const { ticker, proposalData } = req.body;
      if (!ticker) {
        res.status(400).json({ error: "Ticker is required" });
        return;
      }

      const memo = await agentService.generateInvestmentMemo(ticker, proposalData);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "DOCUMENT_GENERATOR",
        ticker,
        prompt: `Generate investment memo for ${ticker}`,
        response: memo,
        metadata: { proposalData },
      });

      res.json(memo);
    } catch (error) {
      console.error("Document generator error:", error);
      res.status(500).json({ error: "Failed to generate investment memo" });
    }
  });

  app.post("/api/agents/compliance-monitor", async (req, res) => {
    try {
      const { ticker, proposalId } = req.body;
      if (!ticker || !proposalId) {
        res.status(400).json({ error: "Ticker and proposalId are required" });
        return;
      }

      const report = await agentService.generateComplianceReport(ticker, proposalId);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "COMPLIANCE_MONITOR",
        ticker,
        prompt: `Generate compliance report for ${ticker} (Proposal: ${proposalId})`,
        response: report,
        metadata: { proposalId },
      });

      res.json(report);
    } catch (error) {
      console.error("Compliance monitor error:", error);
      res.status(500).json({ error: "Failed to generate compliance report" });
    }
  });

  app.post("/api/agents/minutes-scribe", async (req, res) => {
    try {
      const { meetingId } = req.body;
      if (!meetingId) {
        res.status(400).json({ error: "Meeting ID is required" });
        return;
      }

      const minutes = await agentService.generateMeetingMinutes(meetingId);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "MINUTES_SCRIBE",
        ticker: "N/A",
        prompt: `Generate meeting minutes for meeting ${meetingId}`,
        response: minutes,
        metadata: { meetingId },
      });

      res.json(minutes);
    } catch (error) {
      console.error("Minutes scribe error:", error);
      res.status(500).json({ error: "Failed to generate meeting minutes" });
    }
  });

  app.post("/api/agents/trade-order-generator", async (req, res) => {
    try {
      const { ticker, proposalId, proposalData } = req.body;
      if (!ticker || !proposalId) {
        res.status(400).json({ error: "Ticker and proposalId are required" });
        return;
      }

      const order = await agentService.generateTradeOrder(ticker, proposalId, proposalData);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "TRADE_ORDER_GENERATOR",
        ticker,
        prompt: `Generate trade order for ${ticker} (Proposal: ${proposalId})`,
        response: order,
        metadata: { proposalId, proposalData },
      });

      res.json(order);
    } catch (error) {
      console.error("Trade order generator error:", error);
      res.status(500).json({ error: "Failed to generate trade order" });
    }
  });

  app.post("/api/agents/risk-reporter", async (req, res) => {
    try {
      const { ticker, proposalId, proposedShares } = req.body;
      if (!ticker || !proposalId || !proposedShares) {
        res.status(400).json({ error: "Ticker, proposalId, and proposedShares are required" });
        return;
      }

      const report = await agentService.generatePreTradeRisk(ticker, proposalId, proposedShares);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "RISK_REPORTER",
        ticker,
        prompt: `Generate pre-trade risk report for ${ticker} (Proposal: ${proposalId}, Shares: ${proposedShares})`,
        response: report,
        metadata: { proposalId, proposedShares },
      });

      res.json(report);
    } catch (error) {
      console.error("Risk reporter error:", error);
      res.status(500).json({ error: "Failed to generate pre-trade risk report" });
    }
  });

  app.post("/api/agents/data-retrieval", async (req, res) => {
    try {
      const { ticker, queryType } = req.body;
      if (!ticker || !queryType) {
        res.status(400).json({ error: "Ticker and queryType are required" });
        return;
      }

      const report = await agentService.generateDataRetrievalReport(ticker, queryType);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "DATA_RETRIEVAL",
        ticker,
        prompt: `Retrieve ${queryType} data for ${ticker}`,
        response: report,
        metadata: { queryType },
      });

      res.json(report);
    } catch (error) {
      console.error("Data retrieval error:", error);
      res.status(500).json({ error: "Failed to generate data retrieval report" });
    }
  });

  app.post("/api/agents/voice-synthesizer", async (req, res) => {
    try {
      const { meetingId, ticker } = req.body;
      if (!meetingId || !ticker) {
        res.status(400).json({ error: "Meeting ID and ticker are required" });
        return;
      }

      const summary = await agentService.generateVoiceSummary(meetingId, ticker);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "VOICE_SYNTHESIZER",
        ticker,
        prompt: `Generate voice summary for meeting ${meetingId} (${ticker})`,
        response: summary,
        metadata: { meetingId },
      });

      res.json(summary);
    } catch (error) {
      console.error("Voice synthesizer error:", error);
      res.status(500).json({ error: "Failed to generate voice summary" });
    }
  });

  app.post("/api/agents/attribution-analyst", async (req, res) => {
    try {
      const { portfolioId, period } = req.body;
      if (!portfolioId || !period) {
        res.status(400).json({ error: "Portfolio ID and period are required" });
        return;
      }

      const report = await agentService.generateAttributionReport(portfolioId, period);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "ATTRIBUTION_ANALYST",
        ticker: "N/A",
        prompt: `Generate attribution report for portfolio ${portfolioId} (${period})`,
        response: report,
        metadata: { portfolioId, period },
      });

      res.json(report);
    } catch (error) {
      console.error("Attribution analyst error:", error);
      res.status(500).json({ error: "Failed to generate attribution report" });
    }
  });

  app.post("/api/agents/risk-regime-monitor", async (req, res) => {
    try {
      const report = await agentService.generateRiskRegimeReport();
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "RISK_REGIME_MONITOR",
        ticker: "N/A",
        prompt: `Generate current risk regime assessment`,
        response: report,
        metadata: {},
      });

      res.json(report);
    } catch (error) {
      console.error("Risk regime monitor error:", error);
      res.status(500).json({ error: "Failed to generate risk regime report" });
    }
  });

  // Agent Responses (history)
  app.get("/api/agent-responses", async (req, res) => {
    try {
      const ticker = req.query.ticker as string | undefined;
      const responses = await storage.getAgentResponses(ticker);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent responses" });
    }
  });

  // Thesis Monitors
  app.get("/api/thesis-monitors", async (_req, res) => {
    try {
      const monitors = await storage.getThesisMonitors();
      res.json(monitors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch thesis monitors" });
    }
  });

  app.get("/api/thesis-monitors/:ticker", async (req, res) => {
    try {
      const monitor = await storage.getThesisMonitor(req.params.ticker);
      if (!monitor) {
        res.status(404).json({ error: "Thesis monitor not found" });
        return;
      }
      res.json(monitor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch thesis monitor" });
    }
  });

  // Financial Models
  app.get("/api/financial-models", async (req, res) => {
    try {
      const ticker = req.query.ticker as string | undefined;
      const models = await storage.getFinancialModels(ticker);
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch financial models" });
    }
  });

  // PDF Export Routes
  app.get("/api/export/investment-memo/:proposalId", async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.proposalId);
      if (!proposal) {
        res.status(404).json({ error: "Proposal not found" });
        return;
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="investment-memo-${proposal.ticker}-${Date.now()}.pdf"`
      );

      await pdfService.generateInvestmentMemo(proposal, res);
    } catch (error) {
      console.error("Investment memo export error:", error);
      res.status(500).json({ error: "Failed to generate investment memo" });
    }
  });

  app.get("/api/export/meeting-minutes/:meetingId", async (req, res) => {
    try {
      const meeting = await storage.getICMeeting(req.params.meetingId);
      if (!meeting) {
        res.status(404).json({ error: "Meeting not found" });
        return;
      }

      const proposals = await storage.getProposals();
      const meetingProposals = proposals.filter(
        (p) => p.icMeetingId === meeting.id
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="meeting-minutes-${meeting.meetingDate.toISOString().split("T")[0]}-${Date.now()}.pdf"`
      );

      await pdfService.generateMeetingMinutes(meeting, meetingProposals, res);
    } catch (error) {
      console.error("Meeting minutes export error:", error);
      res.status(500).json({ error: "Failed to generate meeting minutes" });
    }
  });

  app.get("/api/export/portfolio-summary", async (req, res) => {
    try {
      const positions = await storage.getPositions();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="portfolio-summary-${Date.now()}.pdf"`
      );

      await pdfService.generatePortfolioSummary(positions, res);
    } catch (error) {
      console.error("Portfolio summary export error:", error);
      res.status(500).json({ error: "Failed to generate portfolio summary" });
    }
  });

  // Notification Routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getNotifications(limit);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread", async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const validated = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validated);
      res.json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      if (!notification) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req, res) => {
    try {
      await storage.markAllNotificationsRead();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  // User Profiles Routes
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getUserProfiles();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUserProfile(req.params.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validated = insertUserProfileSchema.parse(req.body);
      const user = await storage.createUserProfile(validated);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const validated = insertUserProfileSchema.partial().parse(req.body);
      const user = await storage.updateUserProfile(req.params.id, validated);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUserProfile(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Research Requests Routes
  app.get("/api/research-requests", async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo as string;
      
      const requests = await storage.getResearchRequests(filters);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch research requests" });
    }
  });

  app.get("/api/research-requests/:id", async (req, res) => {
    try {
      const request = await storage.getResearchRequest(req.params.id);
      if (!request) {
        res.status(404).json({ error: "Research request not found" });
        return;
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch research request" });
    }
  });

  app.post("/api/research-requests", async (req, res) => {
    try {
      const validated = insertResearchRequestSchema.parse(req.body);
      const request = await storage.createResearchRequest(validated);
      
      // Create workflow stage for research request
      await storage.createWorkflowStage({
        entityType: "RESEARCH",
        entityId: request.id,
        currentStage: "DISCOVERY",
        discoveryStatus: "in_progress",
      });
      
      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create research request" });
    }
  });

  app.patch("/api/research-requests/:id", async (req, res) => {
    try {
      const validated = insertResearchRequestSchema.partial().parse(req.body);
      const request = await storage.updateResearchRequest(req.params.id, validated);
      if (!request) {
        res.status(404).json({ error: "Research request not found" });
        return;
      }

      // Auto-advance workflow to ANALYSIS when research is marked COMPLETED
      if (validated.status === "COMPLETED") {
        try {
          const workflowStage = await storage.getWorkflowStageByEntity("RESEARCH", req.params.id);
          if (workflowStage && workflowStage.currentStage === "DISCOVERY") {
            await workflowService.advanceStage("RESEARCH", req.params.id, "system");
          }
        } catch (error) {
          // Log but don't fail the request update
          console.warn("Failed to advance workflow stage:", error);
        }
      }

      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update research request" });
    }
  });

  app.delete("/api/research-requests/:id", async (req, res) => {
    try {
      await storage.deleteResearchRequest(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete research request" });
    }
  });

  // Workflow Stages Routes
  app.get("/api/workflow-stages", async (req, res) => {
    try {
      const entityType = req.query.entityType as string | undefined;
      const entityId = req.query.entityId as string | undefined;
      const stages = await storage.getWorkflowStages(entityType, entityId);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow stages" });
    }
  });

  app.get("/api/workflow-stages/:id", async (req, res) => {
    try {
      const stage = await storage.getWorkflowStage(req.params.id);
      if (!stage) {
        res.status(404).json({ error: "Workflow stage not found" });
        return;
      }
      res.json(stage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow stage" });
    }
  });

  app.get("/api/workflow-stages/entity/:entityType/:entityId", async (req, res) => {
    try {
      const stage = await storage.getWorkflowStageByEntity(req.params.entityType, req.params.entityId);
      if (!stage) {
        res.status(404).json({ error: "Workflow stage not found" });
        return;
      }
      res.json(stage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow stage" });
    }
  });

  app.post("/api/workflow-stages", async (req, res) => {
    try {
      const validated = insertWorkflowStageSchema.parse(req.body);
      const stage = await storage.createWorkflowStage(validated);
      res.json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create workflow stage" });
    }
  });

  app.patch("/api/workflow-stages/:id", async (req, res) => {
    try {
      const validated = insertWorkflowStageSchema.partial().parse(req.body);
      const stage = await storage.updateWorkflowStage(req.params.id, validated);
      if (!stage) {
        res.status(404).json({ error: "Workflow stage not found" });
        return;
      }
      res.json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update workflow stage" });
    }
  });

  // Workflow Service Routes
  app.post("/api/workflow/:entityType/:entityId/advance", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const userId = req.body.userId || "system"; // TODO: get from auth session
      
      const updated = await workflowService.advanceStage(entityType, entityId, userId);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to advance workflow" 
      });
    }
  });

  app.post("/api/workflow/:entityType/:entityId/revert", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const userId = req.body.userId || "system"; // TODO: get from auth session
      const reason = req.body.reason || "No reason provided";
      
      const updated = await workflowService.revertStage(entityType, entityId, userId, reason);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to revert workflow" 
      });
    }
  });

  app.get("/api/workflow/:entityType/:entityId/progress", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const progress = await workflowService.getStageProgress(entityType, entityId);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to get workflow progress" 
      });
    }
  });

  // Meeting Participants Routes
  app.get("/api/meetings/:meetingId/participants", async (req, res) => {
    try {
      const participants = await storage.getMeetingParticipants(req.params.meetingId);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meeting participants" });
    }
  });

  app.post("/api/meetings/:meetingId/participants", async (req, res) => {
    try {
      const validated = insertMeetingParticipantSchema.parse({
        ...req.body,
        meetingId: req.params.meetingId,
      });
      const participant = await storage.createMeetingParticipant(validated);
      res.json(participant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to add meeting participant" });
    }
  });

  // Debate Sessions Routes
  app.get("/api/debate-sessions", async (req, res) => {
    try {
      const meetingId = req.query.meetingId as string | undefined;
      const sessions = await storage.getDebateSessions(meetingId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debate sessions" });
    }
  });

  app.get("/api/debate-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getDebateSession(req.params.id);
      if (!session) {
        res.status(404).json({ error: "Debate session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debate session" });
    }
  });

  app.post("/api/debate-sessions", async (req, res) => {
    try {
      const validated = insertDebateSessionSchema.parse(req.body);
      const session = await storage.createDebateSession(validated);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create debate session" });
    }
  });

  app.patch("/api/debate-sessions/:id", async (req, res) => {
    try {
      const validated = insertDebateSessionSchema.partial().parse(req.body);
      const session = await storage.updateDebateSession(req.params.id, validated);
      if (!session) {
        res.status(404).json({ error: "Debate session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update debate session" });
    }
  });

  // Debate Messages Routes
  app.get("/api/debate-sessions/:sessionId/messages", async (req, res) => {
    try {
      const messages = await storage.getDebateMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debate messages" });
    }
  });

  app.post("/api/debate-sessions/:sessionId/messages", async (req, res) => {
    try {
      const validated = insertDebateMessageSchema.parse({
        ...req.body,
        sessionId: req.params.sessionId,
      });
      const message = await storage.createDebateMessage(validated);
      
      // Update session message count
      const session = await storage.getDebateSession(req.params.sessionId);
      if (session) {
        await storage.updateDebateSession(req.params.sessionId, {
          messageCount: (session.messageCount || 0) + 1,
        });
      }
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create debate message" });
    }
  });

  // Invoke debate agent endpoint
  app.post("/api/debate-sessions/:sessionId/invoke-agent", async (req, res) => {
    try {
      const { agentRole, proposalId, context } = req.body;
      const sessionId = req.params.sessionId;
      
      // Fetch session and proposal data
      const session = await storage.getDebateSession(sessionId);
      if (!session) {
        res.status(404).json({ error: "Debate session not found" });
        return;
      }

      const proposal = await storage.getProposal(proposalId || session.proposalId);
      if (!proposal) {
        res.status(404).json({ error: "Proposal not found" });
        return;
      }

      let agentResponse: string;
      let agentName: string;
      let messageType: string;
      let stance: string | null = null;

      // Invoke the appropriate agent based on role
      switch (agentRole) {
        case "CONTRARIAN":
          agentResponse = await agentService.generateDebateContrarianArgument(
            proposal.ticker,
            proposal,
            context || {}
          );
          agentName = "Contrarian Analyst";
          messageType = "ARGUMENT";
          stance = "BEAR";
          break;

        case "DEFENDER":
          // Get the contrarian's last argument for context
          const messages = await storage.getDebateMessages(sessionId);
          const lastContrarianMsg = messages.reverse().find(m => m.agentRole === "CONTRARIAN");
          agentResponse = await agentService.generateDebateDefenderArgument(
            proposal.ticker,
            proposal,
            lastContrarianMsg?.content || "Concerns raised about valuation and timing."
          );
          agentName = "Thesis Defender";
          messageType = "COUNTERARGUMENT";
          stance = "BULL";
          break;

        case "SECRETARY":
          const allMessages = await storage.getDebateMessages(sessionId);
          agentResponse = await agentService.generateDebateSecretarySummary({
            topic: session.topic,
            ticker: session.ticker,
            messageCount: session.messageCount || 0,
            keyPoints: allMessages.slice(-5).map(m => `${m.senderName}: ${m.content.substring(0, 100)}`),
          });
          agentName = "Meeting Secretary";
          messageType = "SUMMARY";
          stance = "NEUTRAL";
          break;

        case "LEAD_PM":
          const recentMessages = await storage.getDebateMessages(sessionId);
          agentResponse = await agentService.generateDebateLeadQuestion(
            proposal.ticker,
            proposal,
            {
              recentArguments: recentMessages.slice(-3).map(m => m.content).join("\n"),
            }
          );
          agentName = "Lead Portfolio Manager";
          messageType = "QUESTION";
          stance = "NEUTRAL";
          break;

        default:
          res.status(400).json({ error: "Invalid agent role" });
          return;
      }

      // Create the agent's message
      const agentMessage = await storage.createDebateMessage({
        sessionId,
        senderType: "AI_AGENT",
        senderId: agentRole,
        senderName: agentName,
        agentRole,
        content: agentResponse,
        messageType,
        stance,
        metadata: { invokedAt: new Date().toISOString(), proposalId: proposal.id },
      });

      // Update session
      await storage.updateDebateSession(sessionId, {
        messageCount: (session.messageCount || 0) + 1,
        activeAgents: Array.from(new Set([...(session.activeAgents || []), agentRole])),
      });

      res.json(agentMessage);
    } catch (error) {
      console.error("Debate agent invocation error:", error);
      res.status(500).json({ error: "Failed to invoke debate agent" });
    }
  });

  // Portfolio Impacts Routes
  app.get("/api/portfolio-impacts", async (req, res) => {
    try {
      const proposalId = req.query.proposalId as string | undefined;
      const impacts = await storage.getPortfolioImpacts(proposalId);
      res.json(impacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio impacts" });
    }
  });

  app.post("/api/portfolio-impacts", async (req, res) => {
    try {
      const validated = insertPortfolioImpactSchema.parse(req.body);
      const impact = await storage.createPortfolioImpact(validated);
      res.json(impact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create portfolio impact" });
    }
  });

  app.patch("/api/portfolio-impacts/:id", async (req, res) => {
    try {
      const validated = insertPortfolioImpactSchema.partial().parse(req.body);
      const impact = await storage.updatePortfolioImpact(req.params.id, validated);
      if (!impact) {
        res.status(404).json({ error: "Portfolio impact not found" });
        return;
      }
      res.json(impact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update portfolio impact" });
    }
  });

  // Risk/Compliance Actions Routes
  app.get("/api/risk-compliance-actions", async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.entityType) filters.entityType = req.query.entityType as string;
      if (req.query.entityId) filters.entityId = req.query.entityId as string;
      if (req.query.status) filters.status = req.query.status as string;
      
      const actions = await storage.getRiskComplianceActions(filters);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk/compliance actions" });
    }
  });

  app.get("/api/risk-compliance-actions/:id", async (req, res) => {
    try {
      const action = await storage.getRiskComplianceAction(req.params.id);
      if (!action) {
        res.status(404).json({ error: "Risk/compliance action not found" });
        return;
      }
      res.json(action);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk/compliance action" });
    }
  });

  app.post("/api/risk-compliance-actions", async (req, res) => {
    try {
      const validated = insertRiskComplianceActionSchema.parse(req.body);
      const action = await storage.createRiskComplianceAction(validated);
      res.json(action);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create risk/compliance action" });
    }
  });

  app.patch("/api/risk-compliance-actions/:id", async (req, res) => {
    try {
      const validated = insertRiskComplianceActionSchema.partial().parse(req.body);
      const action = await storage.updateRiskComplianceAction(req.params.id, validated);
      if (!action) {
        res.status(404).json({ error: "Risk/compliance action not found" });
        return;
      }
      res.json(action);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update risk/compliance action" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Track active IC meeting rooms
  const icMeetingRooms = new Map<string, Set<any>>();
  
  // Track active debate sessions
  const debateRooms = new Map<string, Set<any>>();

  wss.on("connection", (ws, req) => {
    console.log("WebSocket client connected");

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case "join_meeting":
            // Join IC meeting room
            const meetingId = message.meetingId;
            if (!icMeetingRooms.has(meetingId)) {
              icMeetingRooms.set(meetingId, new Set());
            }
            icMeetingRooms.get(meetingId)!.add(ws);
            
            // Send current meeting state
            const meeting = await storage.getICMeeting(meetingId);
            if (meeting) {
              ws.send(JSON.stringify({
                type: "meeting_state",
                meeting,
              }));
            }
            break;

          case "leave_meeting":
            // Leave IC meeting room
            icMeetingRooms.get(message.meetingId)?.delete(ws);
            break;

          case "cast_vote":
            // Broadcast vote to all meeting participants
            const vote = await storage.createVote(message.vote);
            const meetingClients = icMeetingRooms.get(message.meetingId);
            if (meetingClients) {
              const voteUpdate = JSON.stringify({
                type: "vote_cast",
                vote,
              });
              meetingClients.forEach(client => {
                if (client.readyState === 1) { // OPEN
                  client.send(voteUpdate);
                }
              });
            }
            break;

          case "update_meeting":
            // Broadcast meeting updates
            const updated = await storage.updateICMeeting(message.meetingId, message.updates);
            const clients = icMeetingRooms.get(message.meetingId);
            if (clients && updated) {
              const updateMsg = JSON.stringify({
                type: "meeting_updated",
                meeting: updated,
              });
              clients.forEach(client => {
                if (client.readyState === 1) {
                  client.send(updateMsg);
                }
              });
            }
            break;

          case "agent_invocation":
            // Stream agent responses in real-time
            ws.send(JSON.stringify({
              type: "agent_started",
              agentType: message.agentType,
            }));

            // Invoke agent and stream response
            let result;
            switch (message.agentType) {
              case "contrarian":
                result = await agentService.generateContrarianAnalysis(message.ticker);
                break;
              default:
                throw new Error(`Unknown agent type: ${message.agentType}`);
            }

            ws.send(JSON.stringify({
              type: "agent_response",
              agentType: message.agentType,
              result,
            }));
            break;

          case "join_debate":
            // Join debate session room
            const debateSessionId = message.sessionId;
            if (!debateRooms.has(debateSessionId)) {
              debateRooms.set(debateSessionId, new Set());
            }
            debateRooms.get(debateSessionId)!.add(ws);
            
            // Send current debate session state
            const debateSession = await storage.getDebateSession(debateSessionId);
            const debateMessages = await storage.getDebateMessages(debateSessionId);
            
            if (debateSession) {
              ws.send(JSON.stringify({
                type: "debate_state",
                session: debateSession,
                messages: debateMessages,
              }));
            }
            
            // Notify others that someone joined
            const debateParticipants = debateRooms.get(debateSessionId);
            if (debateParticipants) {
              const joinMsg = JSON.stringify({
                type: "participant_joined",
                userName: message.userName || "Unknown",
                timestamp: new Date().toISOString(),
              });
              debateParticipants.forEach(client => {
                if (client !== ws && client.readyState === 1) {
                  client.send(joinMsg);
                }
              });
            }
            break;

          case "leave_debate":
            // Leave debate session room
            debateRooms.get(message.sessionId)?.delete(ws);
            
            // Notify others that someone left
            const leavingParticipants = debateRooms.get(message.sessionId);
            if (leavingParticipants) {
              const leaveMsg = JSON.stringify({
                type: "participant_left",
                userName: message.userName || "Unknown",
                timestamp: new Date().toISOString(),
              });
              leavingParticipants.forEach(client => {
                if (client.readyState === 1) {
                  client.send(leaveMsg);
                }
              });
            }
            break;

          case "send_debate_message":
            // Save and broadcast debate message
            const newMessage = await storage.createDebateMessage({
              sessionId: message.sessionId,
              senderType: message.senderType || "USER",
              senderId: message.senderId,
              senderName: message.senderName,
              content: message.content,
              messageType: message.messageType || "TEXT",
              metadata: message.metadata || {},
            });

            // Update session message count
            const currentSession = await storage.getDebateSession(message.sessionId);
            if (currentSession) {
              await storage.updateDebateSession(message.sessionId, {
                messageCount: (currentSession.messageCount || 0) + 1,
              });
            }

            // Broadcast to all participants in the debate room
            const debateClients = debateRooms.get(message.sessionId);
            if (debateClients) {
              const broadcastMsg = JSON.stringify({
                type: "new_debate_message",
                message: newMessage,
              });
              debateClients.forEach(client => {
                if (client.readyState === 1) {
                  client.send(broadcastMsg);
                }
              });
            }
            break;

          case "invoke_agent_in_debate":
            // Invoke AI agent in debate and stream response
            ws.send(JSON.stringify({
              type: "agent_thinking",
              agentType: message.agentType,
            }));

            // Generate agent response
            let agentResult;
            switch (message.agentType) {
              case "contrarian":
                agentResult = await agentService.generateContrarianAnalysis(message.ticker);
                break;
              case "research_synthesizer":
                agentResult = await agentService.generateResearchBrief(message.ticker);
                break;
              case "financial_modeler":
                agentResult = await agentService.generateDCFModel(message.ticker);
                break;
              default:
                throw new Error(`Unknown agent type: ${message.agentType}`);
            }

            // Save agent message to debate
            const agentMessage = await storage.createDebateMessage({
              sessionId: message.sessionId,
              senderType: "AGENT",
              senderId: message.agentType,
              senderName: `${message.agentType} Agent`,
              content: JSON.stringify(agentResult),
              messageType: "ANALYSIS",
              metadata: { agentType: message.agentType, ticker: message.ticker },
            });

            // Broadcast agent response to all participants
            const agentDebateClients = debateRooms.get(message.sessionId);
            if (agentDebateClients) {
              const agentBroadcast = JSON.stringify({
                type: "agent_debate_response",
                message: agentMessage,
                agentType: message.agentType,
                result: agentResult,
              });
              agentDebateClients.forEach(client => {
                if (client.readyState === 1) {
                  client.send(agentBroadcast);
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    });

    ws.on("close", () => {
      // Clean up: remove client from all rooms
      icMeetingRooms.forEach((clients, meetingId) => {
        clients.delete(ws);
        if (clients.size === 0) {
          icMeetingRooms.delete(meetingId);
        }
      });
      
      debateRooms.forEach((clients, sessionId) => {
        clients.delete(ws);
        if (clients.size === 0) {
          debateRooms.delete(sessionId);
        }
      });
      
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return httpServer;
}
