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
  companies, positions, proposals, icMeetings, votes,
  agentResponses, financialModels, thesisMonitors, marketEvents,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
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
}

export const storage = new DatabaseStorage();
