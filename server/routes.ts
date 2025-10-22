import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { agentService } from "./services/agents";
import { pdfService } from "./services/pdf";
import { notificationService } from "./services/notifications";
import {
  insertPositionSchema,
  insertProposalSchema,
  insertICMeetingSchema,
  insertVoteSchema,
  insertNotificationSchema,
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
      const validated = insertICMeetingSchema.parse(req.body);
      const meeting = await storage.createICMeeting(validated);
      res.json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create IC meeting" });
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

  const httpServer = createServer(app);

  // WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Track active IC meeting rooms
  const icMeetingRooms = new Map<string, Set<any>>();

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
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return httpServer;
}
