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
} from "@shared/schema";
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

export class MemStorage implements IStorage {
  private companies: Map<string, Company> = new Map();
  private positions: Map<string, Position> = new Map();
  private proposals: Map<string, Proposal> = new Map();
  private icMeetings: Map<string, ICMeeting> = new Map();
  private votes: Map<string, Vote> = new Map();
  private agentResponses: Map<string, AgentResponse> = new Map();
  private financialModels: Map<string, FinancialModel> = new Map();
  private thesisMonitors: Map<string, ThesisMonitor> = new Map();
  private marketEvents: Map<string, MarketEvent> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed initial companies
    const nvda: Company = {
      id: randomUUID(),
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      sector: "Technology",
      industry: "Semiconductors",
      marketCap: "2850000000000",
      currentPrice: "875.50",
      description: "Leader in GPU technology and AI computing infrastructure",
      createdAt: new Date(),
    };
    this.companies.set(nvda.id, nvda);

    const msft: Company = {
      id: randomUUID(),
      ticker: "MSFT",
      name: "Microsoft Corporation",
      sector: "Technology",
      industry: "Software",
      marketCap: "2950000000000",
      currentPrice: "415.25",
      description: "Cloud computing, productivity software, and AI services",
      createdAt: new Date(),
    };
    this.companies.set(msft.id, msft);

    // Seed positions
    const position1: Position = {
      id: randomUUID(),
      ticker: "MSFT",
      companyName: "Microsoft Corporation",
      shares: 120000,
      avgCost: "385.50",
      currentPrice: "415.25",
      marketValue: "49830000",
      portfolioWeight: "2.85",
      gainLoss: "3570000",
      gainLossPercent: "7.72",
      sector: "Technology",
      analyst: "Sarah Chen",
      thesisHealth: "HEALTHY",
      purchaseDate: new Date("2024-08-15"),
      createdAt: new Date(),
    };
    this.positions.set(position1.id, position1);
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanyByTicker(ticker: string): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(c => c.ticker === ticker);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const company: Company = {
      ...insertCompany,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.companies.set(company.id, company);
    return company;
  }

  // Positions
  async getPositions(): Promise<Position[]> {
    return Array.from(this.positions.values());
  }

  async getPosition(id: string): Promise<Position | undefined> {
    return this.positions.get(id);
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const position: Position = {
      ...insertPosition,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.positions.set(position.id, position);
    return position;
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position | undefined> {
    const position = this.positions.get(id);
    if (!position) return undefined;
    const updated = { ...position, ...updates };
    this.positions.set(id, updated);
    return updated;
  }

  // Proposals
  async getProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values());
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const proposal: Proposal = {
      ...insertProposal,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  async updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal | undefined> {
    const proposal = this.proposals.get(id);
    if (!proposal) return undefined;
    const updated = { ...proposal, ...updates, updatedAt: new Date() };
    this.proposals.set(id, updated);
    return updated;
  }

  // IC Meetings
  async getICMeetings(): Promise<ICMeeting[]> {
    return Array.from(this.icMeetings.values());
  }

  async getICMeeting(id: string): Promise<ICMeeting | undefined> {
    return this.icMeetings.get(id);
  }

  async createICMeeting(insertMeeting: InsertICMeeting): Promise<ICMeeting> {
    const meeting: ICMeeting = {
      ...insertMeeting,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.icMeetings.set(meeting.id, meeting);
    return meeting;
  }

  async updateICMeeting(id: string, updates: Partial<ICMeeting>): Promise<ICMeeting | undefined> {
    const meeting = this.icMeetings.get(id);
    if (!meeting) return undefined;
    const updated = { ...meeting, ...updates };
    this.icMeetings.set(id, updated);
    return updated;
  }

  // Votes
  async getVotes(proposalId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(v => v.proposalId === proposalId);
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const vote: Vote = {
      ...insertVote,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.votes.set(vote.id, vote);
    return vote;
  }

  // Agent Responses
  async getAgentResponses(ticker?: string): Promise<AgentResponse[]> {
    const responses = Array.from(this.agentResponses.values());
    return ticker ? responses.filter(r => r.ticker === ticker) : responses;
  }

  async createAgentResponse(insertResponse: InsertAgentResponse): Promise<AgentResponse> {
    const response: AgentResponse = {
      ...insertResponse,
      id: randomUUID(),
      generatedAt: new Date(),
    };
    this.agentResponses.set(response.id, response);
    return response;
  }

  // Financial Models
  async getFinancialModels(ticker?: string): Promise<FinancialModel[]> {
    const models = Array.from(this.financialModels.values());
    return ticker ? models.filter(m => m.ticker === ticker) : models;
  }

  async createFinancialModel(insertModel: InsertFinancialModel): Promise<FinancialModel> {
    const model: FinancialModel = {
      ...insertModel,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.financialModels.set(model.id, model);
    return model;
  }

  // Thesis Monitors
  async getThesisMonitors(): Promise<ThesisMonitor[]> {
    return Array.from(this.thesisMonitors.values());
  }

  async getThesisMonitor(ticker: string): Promise<ThesisMonitor | undefined> {
    return Array.from(this.thesisMonitors.values()).find(m => m.ticker === ticker);
  }

  async createThesisMonitor(insertMonitor: InsertThesisMonitor): Promise<ThesisMonitor> {
    const monitor: ThesisMonitor = {
      ...insertMonitor,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.thesisMonitors.set(monitor.id, monitor);
    return monitor;
  }

  async updateThesisMonitor(id: string, updates: Partial<ThesisMonitor>): Promise<ThesisMonitor | undefined> {
    const monitor = this.thesisMonitors.get(id);
    if (!monitor) return undefined;
    const updated = { ...monitor, ...updates };
    this.thesisMonitors.set(id, updated);
    return updated;
  }

  // Market Events
  async getMarketEvents(limit: number = 20): Promise<MarketEvent[]> {
    const events = Array.from(this.marketEvents.values());
    return events.sort((a, b) => 
      (b.detectedAt?.getTime() || 0) - (a.detectedAt?.getTime() || 0)
    ).slice(0, limit);
  }

  async createMarketEvent(insertEvent: InsertMarketEvent): Promise<MarketEvent> {
    const event: MarketEvent = {
      ...insertEvent,
      id: randomUUID(),
      detectedAt: new Date(),
    };
    this.marketEvents.set(event.id, event);
    return event;
  }
}

export const storage = new MemStorage();
