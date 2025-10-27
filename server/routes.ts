import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getSession } from "./replitAuth";
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
  insertWorkflowSchema,
  insertWorkflowArtifactSchema,
  insertThesisHealthMetricSchema,
  insertMonitoringEventSchema,
  insertMarketAlertSchema,
  insertTradeOrderSchema,
  insertComplianceCheckSchema,
  insertRiskAssessmentSchema,
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

// Simple cookie parser utility (replaces need for 'cookie' package)
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key && valueParts.length > 0) {
      cookies[key] = valueParts.join('=');
    }
  });
  
  return cookies;
}

// Server-side role-based authorization helper
type UserRole = "ANALYST" | "PM" | "COMPLIANCE" | "ADMIN";

interface RoleCheck {
  canVote: boolean;
  canManageWorkflow: boolean;
  canApproveTrades: boolean;
}

function getRolePermissions(role: UserRole): RoleCheck {
  const permissions: Record<UserRole, RoleCheck> = {
    ANALYST: { canVote: false, canManageWorkflow: false, canApproveTrades: false },
    PM: { canVote: true, canManageWorkflow: true, canApproveTrades: true },
    COMPLIANCE: { canVote: false, canManageWorkflow: false, canApproveTrades: true },
    ADMIN: { canVote: true, canManageWorkflow: true, canApproveTrades: true },
  };
  return permissions[role] || permissions.ANALYST;
}

async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const user = await storage.getUser(userId);
    return (user?.role as UserRole) || "ANALYST";
  } catch {
    return "ANALYST";
  }
}

// Validate WebSocket session against express-session store
// This prevents identity spoofing by verifying the session from the HTTP handshake
async function validateWebSocketSession(
  req: any, 
  sessionMiddleware: any
): Promise<{ userId: string, email: string } | null> {
  // Development mode: Accept any connection if auth is disabled
  if (process.env.NODE_ENV === 'development') {
    console.log("[WebSocket Auth] Development mode - using mock user");
    return {
      userId: 'user-demo-1',
      email: 'dan@example.io',
    };
  }

  return new Promise((resolve) => {
    // Parse cookies from WebSocket handshake request
    const cookies = req.headers.cookie;
    if (!cookies) {
      console.log("[WebSocket Auth] No cookies in handshake");
      resolve(null);
      return;
    }
    
    const parsedCookies = parseCookies(cookies);
    const sessionId = parsedCookies['connect.sid'];
    
    if (!sessionId) {
      console.log("[WebSocket Auth] No session ID cookie found");
      resolve(null);
      return;
    }
    
    console.log("[WebSocket Auth] Session ID found, validating...");
    
    // Create fake request/response objects for session middleware
    // This allows us to reuse the express-session middleware for validation
    const fakeReq: any = {
      headers: { cookie: cookies },
      connection: {},
    };
    const fakeRes: any = {
      getHeader: () => {},
      setHeader: () => {},
      end: () => {},
    };
    
    // Run session middleware to populate fakeReq.session
    sessionMiddleware(fakeReq, fakeRes, () => {
      // Check if session has authenticated user (via Passport)
      if (fakeReq.session && fakeReq.session.passport && fakeReq.session.passport.user) {
        const user = fakeReq.session.passport.user;
        const claims = user.claims || {};
        
        const validatedUser = {
          userId: claims.sub || user.id || 'unknown',
          email: claims.email || 'unknown@example.com',
        };
        
        console.log(`[WebSocket Auth] Session validated for user: ${validatedUser.email}`);
        resolve(validatedUser);
      } else {
        console.log("[WebSocket Auth] No authenticated user in session");
        resolve(null);
      }
    });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - Replit Auth integration
  await setupAuth(app);

  // Demo signin route - allows instant access without credentials
  // In development mode, just set session and redirect - user will be created on first /api/auth/user call
  app.get('/api/demo-signin', async (req: any, res) => {
    console.log("Demo signin requested");
    
    try {
      // In development mode, just redirect and let /api/auth/user handle user creation
      if (process.env.NODE_ENV === 'development') {
        console.log("Development mode - redirecting to app");
        res.redirect('/');
        return;
      }
      
      // In production (shouldn't happen), fall back to regular auth
      console.log("Production mode - redirecting to /api/login");
      res.redirect('/api/login');
    } catch (error) {
      console.error("Demo signin error:", error);
      res.status(500).send("Failed to sign in. Please try again.");
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    // Development mode: return mock user if auth not configured
    if (process.env.NODE_ENV === 'development') {
      const mockUser = {
        id: "user-demo-1",
        email: "dan@example.io",
        firstName: "Dan",
        lastName: "Mbanga",
        profileImageUrl: null,
        role: "ANALYST",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // Ensure mock user exists in database
      await storage.upsertUser(mockUser);
      const user = await storage.getUser(mockUser.id);
      return res.json(user);
    }

    // Production: use real auth
    return isAuthenticated(req, res, async () => {
      try {
        const user = req.user as any;
        const userId = user.claims?.sub || user.id;
        const dbUser = await storage.getUser(userId);
        res.json(dbUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    });
  });

  app.patch('/api/auth/user/role', async (req: any, res) => {
    // Development mode: allow role changes without auth
    if (process.env.NODE_ENV === 'development') {
      const { role } = req.body;
      
      if (!['ANALYST', 'PM', 'COMPLIANCE', 'ADMIN'].includes(role)) {
        res.status(400).json({ message: "Invalid role" });
        return;
      }

      try {
        const user = await storage.updateUserRole("user-demo-1", role);
        return res.json(user);
      } catch (error) {
        console.error("Error updating role:", error);
        return res.status(500).json({ message: "Failed to update role" });
      }
    }

    // Production: use real auth
    return isAuthenticated(req, res, async () => {
      try {
        const user = req.user as any;
        const userId = user.claims?.sub || user.id;
        const { role } = req.body;
        
        if (!['ANALYST', 'PM', 'COMPLIANCE', 'ADMIN'].includes(role)) {
          res.status(400).json({ message: "Invalid role" });
          return;
        }

        const updatedUser = await storage.updateUserRole(userId, role);
        res.json(updatedUser);
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Failed to update role" });
      }
    });
  });

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

  // Get IC meetings for a specific workflow
  app.get("/api/workflows/:workflowId/ic-meetings", async (req, res) => {
    try {
      const workflowId = req.params.workflowId;
      const allMeetings = await storage.getICMeetings();
      const workflowMeetings = allMeetings.filter(m => m.workflowId === workflowId);
      res.json(workflowMeetings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow IC meetings" });
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
      
      // If meeting is being completed, update proposal statuses based on votes
      if (updates.status === 'COMPLETED') {
        console.log(`[IC Meeting Completion] Meeting ${meetingId} being marked as COMPLETED`);
        const allProposals = await storage.getProposals();
        const meetingProposals = allProposals.filter(p => p.icMeetingId === meetingId);
        console.log(`[IC Meeting Completion] Found ${meetingProposals.length} proposals linked to meeting`);
        
        for (const proposal of meetingProposals) {
          console.log(`[IC Meeting Completion] Processing proposal ${proposal.id} (${proposal.ticker})`);
          const proposalVotes = await storage.getVotes(proposal.id);
          console.log(`[IC Meeting Completion] Found ${proposalVotes.length} votes for proposal ${proposal.ticker}`);
          
          // Tally votes
          const approveCount = proposalVotes.filter(v => v.vote === 'APPROVE').length;
          const rejectCount = proposalVotes.filter(v => v.vote === 'REJECT').length;
          const abstainCount = proposalVotes.filter(v => v.vote === 'ABSTAIN').length;
          console.log(`[IC Meeting Completion] Vote tally for ${proposal.ticker}: ${approveCount} APPROVE, ${rejectCount} REJECT, ${abstainCount} ABSTAIN`);
          
          // Determine outcome (simple majority of non-abstain votes)
          let newStatus: 'APPROVED' | 'REJECTED' | 'PENDING' = 'PENDING';
          if (approveCount + rejectCount > 0) {
            if (approveCount > rejectCount) {
              newStatus = 'APPROVED';
            } else if (rejectCount > approveCount) {
              newStatus = 'REJECTED';
            }
            // If tie (approveCount === rejectCount), stays PENDING
          }
          console.log(`[IC Meeting Completion] Updating proposal ${proposal.ticker} status from ${proposal.status} to ${newStatus}`);
          
          // Update proposal status
          await storage.updateProposal(proposal.id, { status: newStatus });
        }
      }
      
      res.json(updated);
    } catch (error) {
      console.error("IC Meeting update error:", error);
      res.status(500).json({ error: "Failed to update IC meeting" });
    }
  });

  // IC Meeting Votes
  app.get("/api/ic-meetings/:id/votes", async (req, res) => {
    try {
      const meetingId = req.params.id;
      
      // Get the IC meeting to find its workflow
      const meetings = await storage.getICMeetings();
      const meeting = meetings.find(m => m.id === meetingId);
      
      if (!meeting || !meeting.workflowId) {
        return res.json([]); // No meeting or no workflow link, return empty array
      }
      
      // Get the workflow to find the ticker
      const allWorkflows = await storage.getWorkflows({});
      const workflow = allWorkflows.find(w => w.id === meeting.workflowId);
      
      if (!workflow) {
        return res.json([]); // No workflow found, return empty array
      }
      
      // Get proposals for this ticker
      const allProposals = await storage.getProposals();
      const workflowProposal = allProposals.find(p => p.ticker === workflow.ticker);
      
      if (!workflowProposal) {
        return res.json([]); // No proposal yet, return empty array
      }
      
      // Get votes for the proposal
      const votes = await storage.getVotes(workflowProposal.id);
      res.json(votes);
    } catch (error) {
      console.error("Failed to fetch IC meeting votes:", error);
      res.status(500).json({ error: "Failed to fetch IC meeting votes" });
    }
  });

  // IC Meeting Debate Messages  
  app.get("/api/ic-meetings/:id/debate-messages", async (req, res) => {
    try {
      const messages = await storage.getDebateMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch IC meeting debate messages" });
    }
  });

  app.post("/api/ic-meetings/:id/debate-messages", async (req: any, res) => {
    try {
      let userId: string;
      let userName: string;
      let userRole: string;
      
      // In development mode, always use mock user
      if (process.env.NODE_ENV === 'development') {
        userId = 'user-demo-1';
        const user = await storage.getUser(userId);
        userName = user ? `${user.firstName} ${user.lastName}` : 'Demo User';
        userRole = user?.role || 'ANALYST';
      } else {
        // In production, require authenticated session
        if (!req.user || !req.session) {
          res.status(401).json({ error: "Unauthorized - authentication required" });
          return;
        }
        userId = req.user.claims?.sub || req.user.id;
        if (!userId) {
          res.status(401).json({ error: "Unauthorized - invalid session" });
          return;
        }
        const user = await storage.getUser(userId);
        if (!user) {
          res.status(401).json({ error: "Unauthorized - user not found" });
          return;
        }
        userName = `${user.firstName} ${user.lastName}`;
        userRole = user.role;
      }

      const validated = insertDebateMessageSchema.parse({
        ...req.body,
        meetingId: req.params.id,
        userId,
        senderName: userName,
        senderRole: userRole,
      });
      const message = await storage.createDebateMessage(validated);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create debate message" });
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

  app.post("/api/votes", async (req: any, res) => {
    try {
      let userId: string;
      
      // In development mode, always use mock user
      if (process.env.NODE_ENV === 'development') {
        userId = 'user-demo-1';
      } else {
        // In production, require authenticated session
        if (!req.user || !req.session) {
          res.status(401).json({ error: "Unauthorized - authentication required" });
          return;
        }
        userId = req.user.claims?.sub || req.user.id;
        if (!userId) {
          res.status(401).json({ error: "Unauthorized - invalid session" });
          return;
        }
      }

      // Verify user exists in database
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(401).json({ error: "Unauthorized - user not found" });
        return;
      }

      // Check if user has permission to vote
      const userRole = (user.role || 'ANALYST') as UserRole;
      const permissions = getRolePermissions(userRole);
      
      if (!permissions.canVote) {
        res.status(403).json({ 
          error: "Forbidden - your role does not have voting permissions. Only PM and Admin roles can vote.",
          role: userRole
        });
        return;
      }

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

  app.post("/api/agents/thesis-generator", async (req, res) => {
    try {
      const { ticker, companyName, researchData, dcfData } = req.body;
      
      if (!ticker || !companyName) {
        res.status(400).json({ error: "Ticker and company name are required" });
        return;
      }

      const thesis = await agentService.generateInvestmentThesis(ticker, companyName, researchData, dcfData);
      
      // Store the agent response
      await storage.createAgentResponse({
        agentType: "THESIS_GENERATOR",
        ticker,
        prompt: `Generate investment thesis for ${companyName} (${ticker})`,
        response: thesis,
        metadata: { researchData, dcfData },
      });

      res.json(thesis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      console.error("Thesis generator error:", error);
      res.status(500).json({ error: "Failed to generate investment thesis" });
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

  // Thesis Monitors - DEPRECATED
  // These routes were replaced with workflow-centric thesis health metrics
  // Use /api/workflows/:workflowId/thesis-health instead
  // app.get("/api/thesis-monitors", async (_req, res) => {
  //   try {
  //     const monitors = await storage.getThesisMonitors();
  //     res.json(monitors);
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to fetch thesis monitors" });
  //   }
  // });

  // app.get("/api/thesis-monitors/:ticker", async (req, res) => {
  //   try {
  //     const monitor = await storage.getThesisMonitor(req.params.ticker);
  //     if (!monitor) {
  //       res.status(404).json({ error: "Thesis monitor not found" });
  //       return;
  //     }
  //     res.json(monitor);
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to fetch thesis monitor" });
  //   }
  // });

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
      
      // NOTE: Workflow stage creation removed - now handled at workflow level
      // Research requests are no longer directly linked to workflow stages
      // Create a workflow first, then link research requests to it
      
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

      // NOTE: Auto-advance workflow removed - now handled at workflow level
      // Research requests are no longer directly linked to workflow stages
      // Workflow advancement should be managed through the workflow entity itself

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
  // NOTE: These routes now use workflowId-based queries instead of entity-based
  app.get("/api/workflow-stages", async (req, res) => {
    try {
      const workflowId = req.query.workflowId as string | undefined;
      if (!workflowId) {
        res.status(400).json({ error: "workflowId query parameter is required" });
        return;
      }
      const stages = await storage.getWorkflowStages(workflowId);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow stages" });
    }
  });

  // DEPRECATED: Use /api/workflows/:workflowId/current-stage instead
  // app.get("/api/workflow-stages/:id", async (req, res) => {
  //   try {
  //     const stage = await storage.getWorkflowStage(req.params.id);
  //     if (!stage) {
  //       res.status(404).json({ error: "Workflow stage not found" });
  //       return;
  //     }
  //     res.json(stage);
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to fetch workflow stage" });
  //   }
  // });

  // DEPRECATED: Entity-based workflow tracking removed
  // Use /api/workflows/:workflowId/stages instead
  // app.get("/api/workflow-stages/entity/:entityType/:entityId", async (req, res) => {
  //   try {
  //     const stage = await storage.getWorkflowStageByEntity(req.params.entityType, req.params.entityId);
  //     if (!stage) {
  //       res.status(404).json({ error: "Workflow stage not found" });
  //       return;
  //     }
  //     res.json(stage);
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to fetch workflow stage" });
  //   }
  // });

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
          // NOTE: agentRole removed from DebateMessage schema - using senderRole and metadata instead
          const lastContrarianMsg = messages.reverse().find(m => 
            m.senderRole === "AI_AGENT" && m.metadata && (m.metadata as any).agentRole === "CONTRARIAN"
          );
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
      // NOTE: sessionId replaced with meetingId, agentRole and stance moved to metadata
      const agentMessage = await storage.createDebateMessage({
        meetingId: sessionId,
        debateSessionId: sessionId,
        senderRole: "AI_AGENT",
        userId: null,
        senderName: agentName,
        content: agentResponse,
        messageType,
        metadata: { 
          invokedAt: new Date().toISOString(), 
          proposalId: proposal.id,
          agentRole,
          stance
        },
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

  // End debate session
  app.patch("/api/debate-sessions/:id/end", async (req, res) => {
    try {
      const session = await storage.getDebateSession(req.params.id);
      if (!session) {
        res.status(404).json({ error: "Debate session not found" });
        return;
      }

      const updated = await storage.updateDebateSession(req.params.id, {
        status: "COMPLETED",
        currentPhase: "CONCLUDED",
        endedAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to end debate session" });
    }
  });

  // Summarize debate session using AI
  app.post("/api/debate-sessions/:id/summarize", async (req, res) => {
    try {
      const session = await storage.getDebateSession(req.params.id);
      if (!session) {
        res.status(404).json({ error: "Debate session not found" });
        return;
      }

      const messages = await storage.getDebateMessages(req.params.id);
      const proposal = await storage.getProposal(session.proposalId);
      
      if (!proposal) {
        res.status(404).json({ error: "Proposal not found" });
        return;
      }

      // Generate AI summary
      const summary = await agentService.generateDebateSummary({
        topic: session.topic,
        ticker: session.ticker,
        proposal,
        messages,
        participantCount: session.participantCount || 0,
        messageCount: session.messageCount || 0,
      });

      // Extract key points (first few sentences or bullet points)
      // NOTE: stance field removed from DebateMessage - now in metadata
      const keyPoints = messages
        .filter(m => m.messageType === "SUMMARY" || (m.metadata && (m.metadata as any).stance))
        .slice(-5)
        .map(m => `${m.senderName}: ${m.content.substring(0, 150)}...`);

      // Update session with summary
      const updated = await storage.updateDebateSession(req.params.id, {
        summary,
        keyPoints,
      });

      res.json(updated);
    } catch (error) {
      console.error("Debate summarization error:", error);
      res.status(500).json({ error: "Failed to generate debate summary" });
    }
  });

  // Download debate transcript as PDF
  app.get("/api/debate-sessions/:id/pdf", async (req, res) => {
    try {
      const session = await storage.getDebateSession(req.params.id);
      if (!session) {
        res.status(404).json({ error: "Debate session not found" });
        return;
      }

      const messages = await storage.getDebateMessages(req.params.id);
      const proposal = await storage.getProposal(session.proposalId);
      
      if (!proposal) {
        res.status(404).json({ error: "Proposal not found" });
        return;
      }

      // Set response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="debate-${session.ticker}-${new Date().toISOString().split('T')[0]}.pdf"`
      );

      // Generate PDF
      await pdfService.generateDebateTranscript(session, messages, proposal, res);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate debate PDF" });
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

  // ============= WORKFLOW CORE ENDPOINTS =============
  
  // 1. GET /api/workflows - List all workflows with filtering
  app.get("/api/workflows", async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.stage) filters.stage = req.query.stage as string;
      if (req.query.owner) filters.owner = req.query.owner as string;
      if (req.query.ticker) filters.ticker = req.query.ticker as string;
      
      const workflows = await storage.getWorkflows(filters);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  // 2. GET /api/workflows/:id - Get workflow details
  app.get("/api/workflows/:id", async (req, res) => {
    try {
      const workflow = await storage.getWorkflow(req.params.id);
      if (!workflow) {
        res.status(404).json({ error: "Workflow not found" });
        return;
      }
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow" });
    }
  });

  // 3. POST /api/workflows - Create new workflow
  app.post("/api/workflows", async (req, res) => {
    try {
      const validated = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validated);
      res.json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create workflow" });
    }
  });

  // 4. PATCH /api/workflows/:id - Update workflow
  app.patch("/api/workflows/:id", async (req, res) => {
    try {
      const workflow = await storage.updateWorkflow(req.params.id, req.body);
      if (!workflow) {
        res.status(404).json({ error: "Workflow not found" });
        return;
      }
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workflow" });
    }
  });

  // 5. DELETE /api/workflows/:id - Delete workflow
  app.delete("/api/workflows/:id", async (req, res) => {
    try {
      await storage.deleteWorkflow(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  // 6. POST /api/workflows/:id/transition - Transition workflow stage
  app.post("/api/workflows/:id/transition", async (req, res) => {
    try {
      const validated = z.object({
        toStage: z.string(),
        transitionedBy: z.string(),
      }).parse(req.body);
      
      const stage = await storage.transitionStage(
        req.params.id,
        validated.toStage,
        validated.transitionedBy
      );
      res.json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to transition workflow stage" });
    }
  });

  // 7. GET /api/workflows/:id/stages - Get workflow stages
  app.get("/api/workflows/:id/stages", async (req, res) => {
    try {
      const stages = await storage.getWorkflowStages(req.params.id);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow stages" });
    }
  });

  // 8. GET /api/workflows/:id/current-stage - Get current stage
  app.get("/api/workflows/:id/current-stage", async (req, res) => {
    try {
      const stage = await storage.getCurrentStage(req.params.id);
      if (!stage) {
        res.status(404).json({ error: "Current stage not found" });
        return;
      }
      res.json(stage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current stage" });
    }
  });

  // ============= WORKFLOW ARTIFACTS ENDPOINTS =============

  // 9. GET /api/workflows/:id/artifacts - Get workflow artifacts
  app.get("/api/workflows/:id/artifacts", async (req, res) => {
    try {
      const artifactType = req.query.artifactType as string | undefined;
      const artifacts = await storage.getWorkflowArtifacts(req.params.id, artifactType);
      res.json(artifacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow artifacts" });
    }
  });

  // 10. POST /api/workflows/:id/artifacts - Create artifact
  app.post("/api/workflows/:id/artifacts", async (req, res) => {
    try {
      const validated = insertWorkflowArtifactSchema.omit({ workflowId: true }).parse(req.body);
      const artifact = await storage.createWorkflowArtifact({
        ...validated,
        workflowId: req.params.id,
      });
      res.json(artifact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create artifact" });
    }
  });

  // 11. PATCH /api/artifacts/:id - Update artifact
  app.patch("/api/artifacts/:id", async (req, res) => {
    try {
      const artifact = await storage.updateWorkflowArtifact(req.params.id, req.body);
      if (!artifact) {
        res.status(404).json({ error: "Artifact not found" });
        return;
      }
      res.json(artifact);
    } catch (error) {
      res.status(500).json({ error: "Failed to update artifact" });
    }
  });

  // ============= MONITORING ENDPOINTS =============

  // 12. GET /api/workflows/:id/thesis-health - Get thesis health metrics
  app.get("/api/workflows/:id/thesis-health", async (req, res) => {
    try {
      const metrics = await storage.getThesisHealthMetrics(req.params.id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch thesis health metrics" });
    }
  });

  // 13. GET /api/workflows/:id/thesis-health/latest - Get latest health
  app.get("/api/workflows/:id/thesis-health/latest", async (req, res) => {
    try {
      const metric = await storage.getLatestThesisHealth(req.params.id);
      if (!metric) {
        res.status(404).json({ error: "Latest thesis health metric not found" });
        return;
      }
      res.json(metric);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest thesis health" });
    }
  });

  // 14. POST /api/workflows/:id/thesis-health - Create health metric
  app.post("/api/workflows/:id/thesis-health", async (req, res) => {
    try {
      const validated = insertThesisHealthMetricSchema.omit({ workflowId: true }).parse(req.body);
      const metric = await storage.createThesisHealthMetric({
        ...validated,
        workflowId: req.params.id,
      });
      res.json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create thesis health metric" });
    }
  });

  // 15. GET /api/workflows/:id/monitoring-events - Get monitoring events
  app.get("/api/workflows/:id/monitoring-events", async (req, res) => {
    try {
      const events = await storage.getMonitoringEvents(req.params.id);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monitoring events" });
    }
  });

  // 16. POST /api/workflows/:id/monitoring-events - Create event
  app.post("/api/workflows/:id/monitoring-events", async (req, res) => {
    try {
      const validated = insertMonitoringEventSchema.omit({ workflowId: true }).parse(req.body);
      const event = await storage.createMonitoringEvent({
        ...validated,
        workflowId: req.params.id,
      });
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create monitoring event" });
    }
  });

  // 17. POST /api/monitoring-events/:id/resolve - Resolve event
  app.post("/api/monitoring-events/:id/resolve", async (req, res) => {
    try {
      const validated = z.object({
        actionTaken: z.string(),
      }).parse(req.body);
      
      const event = await storage.resolveMonitoringEvent(req.params.id, validated.actionTaken);
      if (!event) {
        res.status(404).json({ error: "Monitoring event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to resolve monitoring event" });
    }
  });

  // 18. GET /api/market-alerts - Get market alerts
  app.get("/api/market-alerts", async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.ticker) filters.ticker = req.query.ticker as string;
      if (req.query.read !== undefined) {
        filters.read = req.query.read === 'true';
      }
      
      const alerts = await storage.getMarketAlerts(filters);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market alerts" });
    }
  });

  // 19. POST /api/market-alerts - Create market alert
  app.post("/api/market-alerts", async (req, res) => {
    try {
      const validated = insertMarketAlertSchema.parse(req.body);
      const alert = await storage.createMarketAlert(validated);
      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create market alert" });
    }
  });

  // 20. POST /api/market-alerts/:id/read - Mark alert as read
  app.post("/api/market-alerts/:id/read", async (req, res) => {
    try {
      const alert = await storage.markAlertRead(req.params.id);
      if (!alert) {
        res.status(404).json({ error: "Market alert not found" });
        return;
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  // ============= EXECUTION ENDPOINTS =============

  // 21. GET /api/workflows/:id/trade-orders - Get trade orders
  app.get("/api/workflows/:id/trade-orders", async (req, res) => {
    try {
      const orders = await storage.getTradeOrders(req.params.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trade orders" });
    }
  });

  // 22. POST /api/workflows/:id/trade-orders - Create trade order
  app.post("/api/workflows/:id/trade-orders", async (req, res) => {
    try {
      const validated = insertTradeOrderSchema.omit({ workflowId: true }).parse(req.body);
      const order = await storage.createTradeOrder({
        ...validated,
        workflowId: req.params.id,
      });
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create trade order" });
    }
  });

  // 23. PATCH /api/trade-orders/:id - Update trade order
  app.patch("/api/trade-orders/:id", async (req, res) => {
    try {
      const order = await storage.updateTradeOrder(req.params.id, req.body);
      if (!order) {
        res.status(404).json({ error: "Trade order not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update trade order" });
    }
  });

  // 24. GET /api/workflows/:id/compliance-checks - Get compliance checks
  app.get("/api/workflows/:id/compliance-checks", async (req, res) => {
    try {
      const checks = await storage.getComplianceChecks(req.params.id);
      res.json(checks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance checks" });
    }
  });

  // 25. POST /api/workflows/:id/compliance-checks - Create check
  app.post("/api/workflows/:id/compliance-checks", async (req, res) => {
    try {
      const validated = insertComplianceCheckSchema.omit({ workflowId: true }).parse(req.body);
      const check = await storage.createComplianceCheck({
        ...validated,
        workflowId: req.params.id,
      });
      res.json(check);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create compliance check" });
    }
  });

  // 26. PATCH /api/compliance-checks/:id - Update check
  app.patch("/api/compliance-checks/:id", async (req, res) => {
    try {
      const check = await storage.updateComplianceCheck(req.params.id, req.body);
      if (!check) {
        res.status(404).json({ error: "Compliance check not found" });
        return;
      }
      res.json(check);
    } catch (error) {
      res.status(500).json({ error: "Failed to update compliance check" });
    }
  });

  // 27. GET /api/workflows/:id/risk-assessments - Get risk assessments
  app.get("/api/workflows/:id/risk-assessments", async (req, res) => {
    try {
      const assessments = await storage.getRiskAssessments(req.params.id);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk assessments" });
    }
  });

  // 28. POST /api/workflows/:id/risk-assessments - Create assessment
  app.post("/api/workflows/:id/risk-assessments", async (req, res) => {
    try {
      const validated = insertRiskAssessmentSchema.omit({ workflowId: true }).parse(req.body);
      const assessment = await storage.createRiskAssessment({
        ...validated,
        workflowId: req.params.id,
      });
      res.json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create risk assessment" });
    }
  });

  // Risk/Compliance Actions Routes - DEPRECATED
  // These routes were replaced with workflow-centric compliance and risk systems
  // Use /api/workflows/:workflowId/compliance-checks and /api/workflows/:workflowId/risk-assessments instead
  // app.get("/api/risk-compliance-actions", async (req, res) => {
  //   try {
  //     const filters: any = {};
  //     if (req.query.entityType) filters.entityType = req.query.entityType as string;
  //     if (req.query.entityId) filters.entityId = req.query.entityId as string;
  //     if (req.query.status) filters.status = req.query.status as string;
  //     
  //     const actions = await storage.getRiskComplianceActions(filters);
  //     res.json(actions);
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to fetch risk/compliance actions" });
  //   }
  // });

  // app.get("/api/risk-compliance-actions/:id", async (req, res) => {
  //   try {
  //     const action = await storage.getRiskComplianceAction(req.params.id);
  //     if (!action) {
  //       res.status(404).json({ error: "Risk/compliance action not found" });
  //       return;
  //     }
  //     res.json(action);
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to fetch risk/compliance action" });
  //   }
  // });

  // app.post("/api/risk-compliance-actions", async (req, res) => {
  //   try {
  //     const validated = insertRiskComplianceActionSchema.parse(req.body);
  //     const action = await storage.createRiskComplianceAction(validated);
  //     res.json(action);
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       res.status(400).json({ error: "Validation failed", details: error.errors });
  //       return;
  //     }
  //     res.status(500).json({ error: "Failed to create risk/compliance action" });
  //   }
  // });

  // app.patch("/api/risk-compliance-actions/:id", async (req, res) => {
  //   try {
  //     const validated = insertRiskComplianceActionSchema.partial().parse(req.body);
  //     const action = await storage.updateRiskComplianceAction(req.params.id, validated);
  //     if (!action) {
  //       res.status(404).json({ error: "Risk/compliance action not found" });
  //       return;
  //     }
  //     res.json(action);
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       res.status(400).json({ error: "Validation failed", details: error.errors });
  //       return;
  //     }
  //     res.status(500).json({ error: "Failed to update risk/compliance action" });
  //   }
  // });

  const httpServer = createServer(app);

  // WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Track active IC meeting rooms
  const icMeetingRooms = new Map<string, Set<any>>();
  
  // Track active debate sessions
  const debateRooms = new Map<string, Set<any>>();
  
  // Track active workflow rooms for monitoring alerts
  const workflowRooms = new Map<string, Set<any>>();

  // Track authenticated connections
  // SECURITY: Maps WebSocket connections to authenticated user context
  const authenticatedConnections = new Map<any, { userId: string, email: string }>();

  // Helper function to clean up empty rooms (prevents memory leaks)
  function cleanupEmptyRooms() {
    [icMeetingRooms, debateRooms, workflowRooms].forEach(roomMap => {
      roomMap.forEach((clients, key) => {
        if (clients.size === 0) {
          roomMap.delete(key);
        }
      });
    });
  }

  // Get session middleware for WebSocket authentication
  const sessionMiddleware = getSession();

  wss.on("connection", async (ws, req) => {
    console.log("[WebSocket] Connection attempt...");
    
    // SECURITY: Validate session from HTTP handshake
    // This prevents identity spoofing by verifying user identity against express-session store
    const sessionUser = await validateWebSocketSession(req, sessionMiddleware);
    
    // Track authentication state for this connection
    // authenticated = true only if session validation succeeded
    let authenticated = !!sessionUser;
    let userContext = sessionUser;
    
    if (authenticated && userContext) {
      authenticatedConnections.set(ws, userContext);
      console.log(`[WebSocket] Client authenticated: ${userContext.email}`);
    } else {
      console.log("[WebSocket] Client connected (unauthenticated)");
    }

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // SECURITY: Handle authentication first
        switch (message.type) {
          case "authenticate":
            // SECURITY: Authentication is now done via session validation during handshake
            // This handler is kept for backward compatibility but validates against session
            try {
              const authSchema = z.object({
                type: z.literal("authenticate"),
                userId: z.string().min(1),
                email: z.string().email(),
              });
              
              const validatedAuth = authSchema.parse(message);
              
              // SECURITY FIX: Cannot authenticate as a different user than the session user
              // This prevents identity spoofing attacks
              if (userContext && (
                validatedAuth.userId !== userContext.userId || 
                validatedAuth.email !== userContext.email
              )) {
                console.log(`[WebSocket Auth] Rejected attempt to spoof identity: client claimed ${validatedAuth.email}, session is ${userContext.email}`);
                ws.send(JSON.stringify({
                  type: "error",
                  message: "Cannot authenticate as different user than session",
                }));
                break;
              }
              
              // If not yet authenticated (no session), re-validate session
              if (!authenticated) {
                const sessionUser = await validateWebSocketSession(req, sessionMiddleware);
                if (sessionUser) {
                  authenticated = true;
                  userContext = sessionUser;
                  authenticatedConnections.set(ws, userContext);
                  console.log(`[WebSocket Auth] Session re-validated for ${userContext.email}`);
                } else {
                  ws.send(JSON.stringify({
                    type: "error",
                    message: "Authentication failed: No valid session found",
                  }));
                  break;
                }
              }
              
              ws.send(JSON.stringify({
                type: "authenticated",
                user: userContext,
              }));
              console.log(`[WebSocket Auth] Authentication confirmed for: ${userContext?.email}`);
            } catch (error) {
              console.error("[WebSocket Auth] Authentication error:", error);
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError 
                  ? "Authentication failed: Invalid credentials format" 
                  : "Authentication failed: Invalid credentials",
              }));
            }
            break;

          case "join_meeting":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate payload
            try {
              const joinMeetingSchema = z.object({
                type: z.literal("join_meeting"),
                meetingId: z.string().min(1),
              });
              
              const validatedJoin = joinMeetingSchema.parse(message);
              const meetingId = validatedJoin.meetingId;
              
              // Check meeting exists
              const meeting = await storage.getICMeeting(meetingId);
              if (!meeting) {
                ws.send(JSON.stringify({ type: "error", message: "Meeting not found" }));
                break;
              }
              
              // Join IC meeting room
              if (!icMeetingRooms.has(meetingId)) {
                icMeetingRooms.set(meetingId, new Set());
              }
              icMeetingRooms.get(meetingId)!.add(ws);
              
              // Send current meeting state
              ws.send(JSON.stringify({
                type: "meeting_state",
                meeting,
              }));
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid message format" : "Failed to join meeting",
              }));
            }
            break;

          case "leave_meeting":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and leave IC meeting room
            try {
              const leaveMeetingSchema = z.object({
                type: z.literal("leave_meeting"),
                meetingId: z.string().min(1),
              });
              
              const validated = leaveMeetingSchema.parse(message);
              icMeetingRooms.get(validated.meetingId)?.delete(ws);
              cleanupEmptyRooms();
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Invalid message format",
              }));
            }
            break;

          case "cast_vote":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and broadcast vote to all meeting participants
            try {
              const castVoteSchema = z.object({
                type: z.literal("cast_vote"),
                meetingId: z.string().min(1),
                vote: z.object({
                  proposalId: z.string(),
                  userId: z.string(),
                  vote: z.enum(["APPROVE", "REJECT", "ABSTAIN"]),
                  comments: z.string().optional(),
                }),
              });
              
              const validated = castVoteSchema.parse(message);
              
              // Authorization: Ensure user can only vote as themselves
              if (validated.vote.userId !== userContext.userId) {
                ws.send(JSON.stringify({ type: "error", message: "Unauthorized: Cannot vote on behalf of others" }));
                break;
              }
              
              // Map validated fields to storage schema
              const vote = await storage.createVote({
                proposalId: validated.vote.proposalId,
                vote: validated.vote.vote,
                voterName: userContext?.email || validated.vote.userId,
                voterRole: "ANALYST", // Default role
                comment: validated.vote.comments,
              });
              const meetingClients = icMeetingRooms.get(validated.meetingId);
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
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid vote format" : "Failed to cast vote",
              }));
            }
            break;

          case "update_meeting":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and broadcast meeting updates
            try {
              const updateMeetingSchema = z.object({
                type: z.literal("update_meeting"),
                meetingId: z.string().min(1),
                updates: z.record(z.any()),
              });
              
              const validated = updateMeetingSchema.parse(message);
              
              // Authorization: Check if user can update this meeting
              // TODO: Add role-based authorization (only meeting creator or admin)
              
              const updated = await storage.updateICMeeting(validated.meetingId, validated.updates);
              const clients = icMeetingRooms.get(validated.meetingId);
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
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid update format" : "Failed to update meeting",
              }));
            }
            break;

          case "agent_invocation":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and stream agent responses in real-time
            try {
              const agentInvocationSchema = z.object({
                type: z.literal("agent_invocation"),
                agentType: z.string().min(1),
                ticker: z.string().min(1).max(10),
              });
              
              const validated = agentInvocationSchema.parse(message);
              
              ws.send(JSON.stringify({
                type: "agent_started",
                agentType: validated.agentType,
              }));

              // Invoke agent and stream response
              let result;
              switch (validated.agentType) {
                case "contrarian":
                  result = await agentService.generateContrarianAnalysis(validated.ticker);
                  break;
                default:
                  throw new Error(`Unknown agent type: ${validated.agentType}`);
              }

              ws.send(JSON.stringify({
                type: "agent_response",
                agentType: validated.agentType,
                result,
              }));
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid agent invocation format" : (error as Error).message,
              }));
            }
            break;

          case "join_debate":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and join debate session room
            try {
              const joinDebateSchema = z.object({
                type: z.literal("join_debate"),
                sessionId: z.string().min(1),
                userName: z.string().optional(),
              });
              
              const validated = joinDebateSchema.parse(message);
              const debateSessionId = validated.sessionId;
              
              // Check debate session exists
              const debateSession = await storage.getDebateSession(debateSessionId);
              if (!debateSession) {
                ws.send(JSON.stringify({ type: "error", message: "Debate session not found" }));
                break;
              }
              
              if (!debateRooms.has(debateSessionId)) {
                debateRooms.set(debateSessionId, new Set());
              }
              debateRooms.get(debateSessionId)!.add(ws);
              
              // Send current debate session state
              const debateMessages = await storage.getDebateMessages(debateSession.meetingId || debateSessionId);
              
              ws.send(JSON.stringify({
                type: "debate_state",
                session: debateSession,
                messages: debateMessages,
              }));
              
              // Notify others that someone joined
              const debateParticipants = debateRooms.get(debateSessionId);
              if (debateParticipants) {
                const joinMsg = JSON.stringify({
                  type: "participant_joined",
                  userName: validated.userName || userContext.email,
                  timestamp: new Date().toISOString(),
                });
                debateParticipants.forEach(client => {
                  if (client !== ws && client.readyState === 1) {
                    client.send(joinMsg);
                  }
                });
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid message format" : "Failed to join debate",
              }));
            }
            break;

          case "leave_debate":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and leave debate session room
            try {
              const leaveDebateSchema = z.object({
                type: z.literal("leave_debate"),
                sessionId: z.string().min(1),
                userName: z.string().optional(),
              });
              
              const validated = leaveDebateSchema.parse(message);
              debateRooms.get(validated.sessionId)?.delete(ws);
              cleanupEmptyRooms();
              
              // Notify others that someone left
              const leavingParticipants = debateRooms.get(validated.sessionId);
              if (leavingParticipants) {
                const leaveMsg = JSON.stringify({
                  type: "participant_left",
                  userName: validated.userName || userContext.email,
                  timestamp: new Date().toISOString(),
                });
                leavingParticipants.forEach(client => {
                  if (client.readyState === 1) {
                    client.send(leaveMsg);
                  }
                });
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Invalid message format",
              }));
            }
            break;

          case "send_debate_message":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and save/broadcast debate message
            try {
              const sendDebateMessageSchema = z.object({
                type: z.literal("send_debate_message"),
                sessionId: z.string().min(1),
                senderId: z.string(),
                senderName: z.string(),
                senderType: z.string().optional(),
                content: z.string().min(1),
                messageType: z.string().optional(),
                metadata: z.record(z.any()).optional(),
              });
              
              const validated = sendDebateMessageSchema.parse(message);
              
              // Authorization: Ensure user can only send as themselves
              if (validated.senderId !== userContext.userId) {
                ws.send(JSON.stringify({ type: "error", message: "Unauthorized: Cannot send messages on behalf of others" }));
                break;
              }
              
              // Save message
              const newMessage = await storage.createDebateMessage({
                meetingId: validated.sessionId,
                debateSessionId: validated.sessionId,
                senderRole: validated.senderType || "USER",
                userId: validated.senderId,
                senderName: validated.senderName,
                content: validated.content,
                messageType: validated.messageType || "TEXT",
                metadata: validated.metadata || {},
              });

              // Update session message count
              const currentSession = await storage.getDebateSession(validated.sessionId);
              if (currentSession) {
                await storage.updateDebateSession(validated.sessionId, {
                  messageCount: (currentSession.messageCount || 0) + 1,
                });
              }

              // Broadcast to all participants in the debate room
              const debateClients = debateRooms.get(validated.sessionId);
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
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid message format" : "Failed to send message",
              }));
            }
            break;

          case "invoke_agent_in_debate":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and invoke AI agent in debate
            try {
              const invokeAgentSchema = z.object({
                type: z.literal("invoke_agent_in_debate"),
                sessionId: z.string().min(1),
                agentType: z.string().min(1),
                ticker: z.string().min(1).max(10),
              });
              
              const validated = invokeAgentSchema.parse(message);
              
              ws.send(JSON.stringify({
                type: "agent_thinking",
                agentType: validated.agentType,
              }));

              // Generate agent response
              let agentResult;
              switch (validated.agentType) {
                case "contrarian":
                  agentResult = await agentService.generateContrarianAnalysis(validated.ticker);
                  break;
                case "research_synthesizer":
                  agentResult = await agentService.generateResearchBrief(validated.ticker);
                  break;
                case "financial_modeler":
                  agentResult = await agentService.generateDCFModel(validated.ticker);
                  break;
                default:
                  throw new Error(`Unknown agent type: ${validated.agentType}`);
              }

              // Save agent message to debate
              const agentMessage = await storage.createDebateMessage({
                meetingId: validated.sessionId,
                debateSessionId: validated.sessionId,
                senderRole: "AGENT",
                userId: null,
                senderName: `${validated.agentType} Agent`,
                content: JSON.stringify(agentResult),
                messageType: "ANALYSIS",
                metadata: { agentType: validated.agentType, ticker: validated.ticker },
              });

              // Broadcast agent response to all participants
              const agentDebateClients = debateRooms.get(validated.sessionId);
              if (agentDebateClients) {
                const agentBroadcast = JSON.stringify({
                  type: "agent_debate_response",
                  message: agentMessage,
                  agentType: validated.agentType,
                  result: agentResult,
                });
                agentDebateClients.forEach(client => {
                  if (client.readyState === 1) {
                    client.send(agentBroadcast);
                  }
                });
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid agent invocation format" : (error as Error).message,
              }));
            }
            break;

          case "join_workflow":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and join workflow room for real-time updates
            try {
              const joinWorkflowSchema = z.object({
                type: z.literal("join_workflow"),
                workflowId: z.string().min(1),
              });
              
              const validated = joinWorkflowSchema.parse(message);
              const { workflowId } = validated;
              
              // Check user has access to this workflow
              const workflow = await storage.getWorkflow(workflowId);
              if (!workflow) {
                ws.send(JSON.stringify({ type: "error", message: "Workflow not found" }));
                break;
              }
              
              // TODO: Check user permission (owner, assigned analyst, etc.)
              
              if (!workflowRooms.has(workflowId)) {
                workflowRooms.set(workflowId, new Set());
              }
              workflowRooms.get(workflowId)!.add(ws);
              
              // Send current workflow state
              const currentStage = await storage.getCurrentStage(workflowId);
              ws.send(JSON.stringify({
                type: "workflow_state",
                workflow,
                currentStage,
              }));
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid message format" : "Failed to join workflow",
              }));
            }
            break;

          case "leave_workflow":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and leave workflow room
            try {
              const leaveWorkflowSchema = z.object({
                type: z.literal("leave_workflow"),
                workflowId: z.string().min(1),
              });
              
              const validated = leaveWorkflowSchema.parse(message);
              const workflowClients = workflowRooms.get(validated.workflowId);
              if (workflowClients) {
                workflowClients.delete(ws);
              }
              cleanupEmptyRooms();
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Invalid message format",
              }));
            }
            break;

          case "workflow_stage_transition":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and transition workflow stage
            try {
              const transitionSchema = z.object({
                type: z.literal("workflow_stage_transition"),
                workflowId: z.string().min(1),
                toStage: z.string().min(1),
                transitionedBy: z.string().min(1),
              });
              
              const validated = transitionSchema.parse(message);
              const { workflowId, toStage, transitionedBy } = validated;
              
              // Authorization: Check if user can transition this workflow
              const workflow = await storage.getWorkflow(workflowId);
              if (!workflow) {
                ws.send(JSON.stringify({ type: "error", message: "Workflow not found" }));
                break;
              }
              
              // Authorization: Only workflow owner or the transitioner can transition
              // TODO: Add more sophisticated role-based authorization (admins, assigned analysts)
              if (workflow.owner !== userContext.userId && userContext.userId !== transitionedBy) {
                ws.send(JSON.stringify({ type: "error", message: "Unauthorized: Cannot transition this workflow" }));
                break;
              }
              
              const newStage = await storage.transitionStage(workflowId, toStage, transitionedBy);
              
              // Broadcast to all workflow subscribers
              const workflowClients = workflowRooms.get(workflowId);
              if (workflowClients) {
                const broadcast = JSON.stringify({
                  type: "stage_transitioned",
                  workflowId,
                  stage: newStage,
                  transitionedBy,
                });
                workflowClients.forEach(client => {
                  if (client.readyState === 1) {
                    client.send(broadcast);
                  }
                });
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid transition format" : "Failed to transition workflow",
              }));
            }
            break;

          case "monitoring_alert":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and create/broadcast monitoring event
            try {
              const monitoringAlertSchema = z.object({
                type: z.literal("monitoring_alert"),
                workflowId: z.string().min(1),
                event: z.object({
                  ticker: z.string(),
                  eventType: z.string(),
                  severity: z.string(),
                  description: z.string(),
                  metadata: z.record(z.any()).optional(),
                }),
              });
              
              const validated = monitoringAlertSchema.parse(message);
              const { workflowId, event } = validated;
              
              // Authorization: Check user has access to this workflow
              const workflow = await storage.getWorkflow(workflowId);
              if (!workflow) {
                ws.send(JSON.stringify({ type: "error", message: "Workflow not found" }));
                break;
              }
              
              // Map event fields to storage schema
              const monitoringEvent = await storage.createMonitoringEvent({
                workflowId,
                eventType: event.eventType,
                severity: event.severity,
                title: event.description.substring(0, 100), // Use first 100 chars as title
                description: event.description,
                ticker: event.ticker,
                details: event.metadata,
              });
              
              // Broadcast to workflow subscribers
              const subscribers = workflowRooms.get(workflowId);
              if (subscribers) {
                const alert = JSON.stringify({
                  type: "new_monitoring_event",
                  event: monitoringEvent,
                });
                subscribers.forEach(client => {
                  if (client.readyState === 1) {
                    client.send(alert);
                  }
                });
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid monitoring alert format" : "Failed to create monitoring event",
              }));
            }
            break;

          case "market_alert_broadcast":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and create/broadcast market alert
            try {
              const marketAlertSchema = z.object({
                type: z.literal("market_alert_broadcast"),
                alert: z.object({
                  ticker: z.string(),
                  alertType: z.string(),
                  severity: z.string(),
                  title: z.string(),
                  description: z.string(),
                  affectedWorkflows: z.array(z.string()).optional(),
                  metadata: z.record(z.any()).optional(),
                }),
              });
              
              const validated = marketAlertSchema.parse(message);
              const { alert } = validated;
              
              // TODO: Authorization - only admins or system can broadcast market alerts
              
              const marketAlert = await storage.createMarketAlert(alert);
              
              // Broadcast to all affected workflows
              if (marketAlert.affectedWorkflows && Array.isArray(marketAlert.affectedWorkflows)) {
                marketAlert.affectedWorkflows.forEach((affectedWorkflowId: string) => {
                  const clients = workflowRooms.get(affectedWorkflowId);
                  if (clients) {
                    const broadcast = JSON.stringify({
                      type: "market_alert",
                      alert: marketAlert,
                    });
                    clients.forEach(client => {
                      if (client.readyState === 1) {
                        client.send(broadcast);
                      }
                    });
                  }
                });
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid market alert format" : "Failed to broadcast market alert",
              }));
            }
            break;

          case "artifact_updated":
            // SECURITY: Require authentication
            if (!authenticated || !userContext) {
              ws.send(JSON.stringify({ type: "error", message: "Unauthenticated" }));
              break;
            }
            
            // Validate and update/broadcast artifact
            try {
              const artifactUpdatedSchema = z.object({
                type: z.literal("artifact_updated"),
                workflowId: z.string().min(1),
                artifact: z.object({
                  id: z.string(),
                  artifactType: z.string().optional(),
                  title: z.string().optional(),
                  content: z.any().optional(),
                  status: z.string().optional(),
                  metadata: z.record(z.any()).optional(),
                }),
              });
              
              const validated = artifactUpdatedSchema.parse(message);
              const { workflowId, artifact } = validated;
              
              // Authorization: Check user has access to this workflow
              const workflow = await storage.getWorkflow(workflowId);
              if (!workflow) {
                ws.send(JSON.stringify({ type: "error", message: "Workflow not found" }));
                break;
              }
              
              // TODO: Add authorization check for artifact updates
              
              const updatedArtifact = await storage.updateWorkflowArtifact(artifact.id, artifact);
              
              // Broadcast to workflow subscribers
              const artifactSubscribers = workflowRooms.get(workflowId);
              if (artifactSubscribers) {
                const broadcast = JSON.stringify({
                  type: "artifact_changed",
                  artifact: updatedArtifact,
                });
                artifactSubscribers.forEach(client => {
                  if (client.readyState === 1) {
                    client.send(broadcast);
                  }
                });
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error instanceof z.ZodError ? "Invalid artifact update format" : "Failed to update artifact",
              }));
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
      // SECURITY: Remove from authenticated connections
      authenticatedConnections.delete(ws);
      
      // Clean up: remove client from all rooms
      icMeetingRooms.forEach((clients) => clients.delete(ws));
      debateRooms.forEach((clients) => clients.delete(ws));
      workflowRooms.forEach((clients) => clients.delete(ws));
      
      // Clean up empty rooms to prevent memory leaks
      cleanupEmptyRooms();
      
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return httpServer;
}
