import PDFDocument from "pdfkit";
import type { Writable } from "stream";
import type { Proposal, ICMeeting, Position, DebateSession, DebateMessage } from "@shared/schema";

export class PDFService {
  /**
   * Generate Investment Memo PDF
   */
  async generateInvestmentMemo(
    proposal: Proposal,
    stream: Writable
  ): Promise<void> {
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Investment Memorandum", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(new Date().toLocaleDateString(), { align: "center" })
      .moveDown(2);

    // Executive Summary
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Executive Summary")
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Company: ${proposal.companyName}`, { continued: false })
      .text(`Ticker: ${proposal.ticker}`)
      .text(`Analyst: ${proposal.analyst}`)
      .text(`Recommendation: ${proposal.proposalType}`)
      .text(`Proposed Weight: ${proposal.proposedWeight}%`)
      .text(
        `Target Price: $${proposal.targetPrice || "N/A"}`
      )
      .moveDown(1);

    // Investment Thesis
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Investment Thesis")
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(proposal.thesis, { align: "justify" })
      .moveDown(1);

    // Catalysts
    if (proposal.catalysts && proposal.catalysts.length > 0) {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Catalysts")
        .moveDown(0.5);

      proposal.catalysts.forEach((catalyst, index) => {
        doc
          .fontSize(11)
          .font("Helvetica")
          .text(`${index + 1}. ${catalyst}`, { indent: 20 });
      });
      doc.moveDown(1);
    }

    // Risks
    if (proposal.risks && proposal.risks.length > 0) {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Key Risks")
        .moveDown(0.5);

      proposal.risks.forEach((risk, index) => {
        doc
          .fontSize(11)
          .font("Helvetica")
          .text(`${index + 1}. ${risk}`, { indent: 20 });
      });
      doc.moveDown(1);
    }

    // Status
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Proposal Status")
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Status: ${proposal.status}`)
      .text(`Created: ${proposal.createdAt?.toLocaleDateString() || "N/A"}`)
      .text(`Last Updated: ${proposal.updatedAt?.toLocaleDateString() || "N/A"}`);

    // Footer
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text(
        "This document contains confidential information for investment committee review only.",
        50,
        doc.page.height - 50,
        { align: "center" }
      );

    doc.end();
  }

  /**
   * Generate IC Meeting Minutes PDF
   */
  async generateMeetingMinutes(
    meeting: ICMeeting,
    proposals: Proposal[],
    stream: Writable
  ): Promise<void> {
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Investment Committee Meeting Minutes", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(meeting.meetingDate.toLocaleDateString(), { align: "center" })
      .moveDown(2);

    // Meeting Details
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Meeting Information")
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Meeting ID: ${meeting.id}`)
      .text(`Status: ${meeting.status}`)
      .text(
        `Attendees: ${meeting.attendees ? meeting.attendees.join(", ") : "N/A"}`
      )
      .moveDown(1);

    // Agenda
    if (meeting.agenda) {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Agenda")
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(JSON.stringify(meeting.agenda, null, 2), { indent: 20 })
        .moveDown(1);
    }

    // Proposals Reviewed
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Proposals Reviewed")
      .moveDown(0.5);

    proposals.forEach((proposal, index) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${proposal.ticker} - ${proposal.companyName}`)
        .moveDown(0.3);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Type: ${proposal.proposalType}`, { indent: 20 })
        .text(`Analyst: ${proposal.analyst}`, { indent: 20 })
        .text(`Proposed Weight: ${proposal.proposedWeight}%`, { indent: 20 })
        .text(`Status: ${proposal.status}`, { indent: 20 })
        .moveDown(0.5);
    });

    doc.moveDown(1);

    // Decisions
    if (meeting.decisions) {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Decisions")
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(JSON.stringify(meeting.decisions, null, 2), { indent: 20 })
        .moveDown(1);
    }

    // Minutes
    if (meeting.minutes) {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Meeting Notes")
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(meeting.minutes, { align: "justify" });
    }

    // Footer
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text(
        "These minutes are confidential and for internal use only.",
        50,
        doc.page.height - 50,
        { align: "center" }
      );

    doc.end();
  }

  /**
   * Generate Portfolio Summary PDF
   */
  async generatePortfolioSummary(
    positions: Position[],
    stream: Writable
  ): Promise<void> {
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Portfolio Summary Report", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(new Date().toLocaleDateString(), { align: "center" })
      .moveDown(2);

    // Portfolio Metrics
    const totalValue = positions.reduce(
      (sum, p) => sum + parseFloat(p.marketValue),
      0
    );
    const totalGainLoss = positions.reduce(
      (sum, p) => sum + parseFloat(p.gainLoss),
      0
    );

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Portfolio Overview")
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Total Positions: ${positions.length}`)
      .text(`Total Market Value: $${totalValue.toLocaleString()}`)
      .text(`Total Gain/Loss: $${totalGainLoss.toLocaleString()}`)
      .text(
        `Average Return: ${((totalGainLoss / (totalValue - totalGainLoss)) * 100).toFixed(2)}%`
      )
      .moveDown(2);

    // Position Details
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Position Details")
      .moveDown(0.5);

    positions.forEach((position, index) => {
      if (index > 0 && index % 3 === 0) {
        doc.addPage();
      }

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`${position.ticker} - ${position.companyName}`)
        .moveDown(0.3);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Sector: ${position.sector}`, { indent: 20 })
        .text(`Shares: ${position.shares.toLocaleString()}`, { indent: 20 })
        .text(`Avg Cost: $${position.avgCost}`, { indent: 20 })
        .text(`Current Price: $${position.currentPrice}`, { indent: 20 })
        .text(`Market Value: $${parseFloat(position.marketValue).toLocaleString()}`, {
          indent: 20,
        })
        .text(`Portfolio Weight: ${position.portfolioWeight}%`, { indent: 20 })
        .text(`Gain/Loss: $${parseFloat(position.gainLoss).toLocaleString()} (${position.gainLossPercent}%)`, {
          indent: 20,
        })
        .text(`Thesis Health: ${position.thesisHealth}`, { indent: 20 })
        .text(`Analyst: ${position.analyst}`, { indent: 20 })
        .moveDown(1);
    });

    // Footer
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text(
        "This report is for informational purposes only. Past performance does not guarantee future results.",
        50,
        doc.page.height - 50,
        { align: "center", width: doc.page.width - 100 }
      );

    doc.end();
  }

  /**
   * Generate Debate Transcript PDF
   */
  async generateDebateTranscript(
    session: DebateSession,
    messages: DebateMessage[],
    proposal: Proposal,
    stream: Writable
  ): Promise<void> {
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Investment Committee Debate Transcript", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(session.startedAt ? new Date(session.startedAt).toLocaleDateString() : new Date().toLocaleDateString(), { align: "center" })
      .moveDown(2);

    // Debate Information
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Debate Overview")
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Topic: ${session.topic}`)
      .text(`Ticker: ${session.ticker}`)
      .text(`Company: ${proposal.companyName}`)
      .text(`Status: ${session.status}`)
      .text(`Phase: ${session.currentPhase}`)
      .text(`Participants: ${session.participantCount}`)
      .text(`Messages: ${session.messageCount}`)
      .moveDown(0.5);

    if (session.startedAt) {
      doc.text(`Started: ${new Date(session.startedAt).toLocaleString()}`);
    }
    if (session.endedAt && session.startedAt) {
      doc.text(`Ended: ${new Date(session.endedAt).toLocaleString()}`);
      const duration = (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000 / 60;
      doc.text(`Duration: ${Math.round(duration)} minutes`);
    }

    doc.moveDown(1);

    // Decision
    if (session.decision) {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Decision")
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Outcome: ${session.decision}`)
        .moveDown(1);
    }

    // Summary
    if (session.summary) {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Executive Summary")
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(session.summary, { align: "justify" })
        .moveDown(1);
    }

    // Key Points
    if (session.keyPoints && session.keyPoints.length > 0) {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Key Discussion Points")
        .moveDown(0.5);

      session.keyPoints.forEach((point, index) => {
        doc
          .fontSize(11)
          .font("Helvetica")
          .text(`${index + 1}. ${point}`, { indent: 20 });
      });
      doc.moveDown(1);
    }

    // Proposal Context
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Investment Proposal")
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Type: ${proposal.proposalType}`)
      .text(`Proposed Weight: ${proposal.proposedWeight}%`)
      .text(`Target Price: $${proposal.targetPrice || "N/A"}`)
      .text(`Analyst: ${proposal.analyst}`)
      .moveDown(1);

    // Transcript
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Debate Transcript")
      .moveDown(0.5);

    messages.forEach((message, index) => {
      // Add page break if needed
      if (index > 0 && index % 8 === 0) {
        doc.addPage();
      }

      // Message header
      const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';
      const stance = message.stance ? ` [${message.stance}]` : '';
      
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`${message.senderName}${stance} - ${timestamp}`)
        .moveDown(0.2);

      // Message content
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(message.content, { indent: 20, align: "justify" })
        .moveDown(0.8);
    });

    // Footer
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text(
        "This debate transcript is confidential and for internal committee use only.",
        50,
        doc.page.height - 50,
        { align: "center", width: doc.page.width - 100 }
      );

    doc.end();
  }

  /**
   * Generate Workflow Artifacts PDF (Export All)
   */
  async generateWorkflowArtifacts(
    workflow: any,
    artifacts: any[],
    stream: Writable
  ): Promise<void> {
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Workflow Analysis Report", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(14)
      .font("Helvetica")
      .text(`${workflow.ticker} - ${workflow.companyName}`, { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(new Date().toLocaleDateString(), { align: "center" })
      .moveDown(2);

    // Workflow Overview
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Workflow Overview")
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Ticker: ${workflow.ticker}`)
      .text(`Company: ${workflow.companyName || "N/A"}`)
      .text(`Current Stage: ${workflow.currentStage}`)
      .text(`Created: ${workflow.createdAt ? new Date(workflow.createdAt).toLocaleDateString() : "N/A"}`)
      .text(`Total Artifacts: ${artifacts.length}`)
      .moveDown(2);

    // Artifacts by Type
    const artifactsByType = artifacts.reduce((acc, artifact) => {
      if (!acc[artifact.artifactType]) {
        acc[artifact.artifactType] = [];
      }
      acc[artifact.artifactType].push(artifact);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(artifactsByType).forEach(([type, arts], sectionIndex) => {
      if (sectionIndex > 0) {
        doc.addPage();
      }

      // Section Title
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(type.replace(/_/g, " "))
        .moveDown(0.5);

      arts.forEach((artifact, index) => {
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${artifact.title || type}`)
          .moveDown(0.3);

        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`Generated: ${artifact.createdAt ? new Date(artifact.createdAt).toLocaleDateString() : "N/A"}`, {
            indent: 20,
          })
          .text(`Stage: ${artifact.stage}`, { indent: 20 })
          .text(`Status: ${artifact.status}`, { indent: 20 });

        if (artifact.summary) {
          doc.moveDown(0.3);
          doc
            .fontSize(10)
            .font("Helvetica-Oblique")
            .text(`Summary: ${artifact.summary}`, {
              indent: 20,
              align: "justify",
              width: doc.page.width - 120,
            });
        }

        doc.moveDown(0.8);
      });
    });

    // Footer
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text(
        "This comprehensive workflow report is confidential and for internal use only.",
        50,
        doc.page.height - 50,
        { align: "center", width: doc.page.width - 100 }
      );

    doc.end();
  }
}

export const pdfService = new PDFService();
