import { storage } from "../storage";
import type { InsertNotification, ThesisMonitor, MarketEvent } from "@shared/schema";

export class NotificationService {
  /**
   * Create a thesis monitoring alert notification
   */
  async createThesisAlert(monitor: ThesisMonitor): Promise<void> {
    let severity: "INFO" | "WARNING" | "CRITICAL" = "INFO";
    
    if (monitor.healthStatus === "ALERT") {
      severity = "CRITICAL";
    } else if (monitor.healthStatus === "WARNING") {
      severity = "WARNING";
    }

    const alerts = monitor.alerts as any;
    const concerns = alerts?.keyConcerns || [];

    const notification: InsertNotification = {
      type: "THESIS_ALERT",
      severity,
      title: `Thesis Alert: ${monitor.ticker}`,
      message: `${monitor.ticker} thesis health is now ${monitor.healthStatus}. ${Array.isArray(concerns) ? concerns.join(", ") : "Review recommended."}`,
      ticker: monitor.ticker,
      relatedId: monitor.id,
      actionUrl: `/monitoring?ticker=${monitor.ticker}`,
      isRead: false,
    };

    await storage.createNotification(notification);
  }

  /**
   * Create a market event notification
   */
  async createMarketEventAlert(event: MarketEvent): Promise<void> {
    let severity: "INFO" | "WARNING" | "CRITICAL" = "INFO";
    
    if (event.severity === "CRITICAL") {
      severity = "CRITICAL";
    } else if (event.severity === "HIGH" || event.severity === "MEDIUM") {
      severity = "WARNING";
    }

    const notification: InsertNotification = {
      type: "MARKET_EVENT",
      severity,
      title: `Market Event: ${event.ticker || "Portfolio"}`,
      message: `${event.eventType} detected - ${event.description}`,
      ticker: event.ticker || undefined,
      relatedId: event.id,
      actionUrl: event.ticker ? `/monitoring?ticker=${event.ticker}` : "/monitoring",
      isRead: false,
    };

    await storage.createNotification(notification);
  }

  /**
   * Create an IC vote notification
   */
  async createVoteNotification(
    proposalId: string,
    ticker: string,
    voterName: string,
    vote: string
  ): Promise<void> {
    const notification: InsertNotification = {
      type: "IC_VOTE",
      severity: "INFO",
      title: `New Vote: ${ticker}`,
      message: `${voterName} voted ${vote} on ${ticker} proposal`,
      ticker,
      relatedId: proposalId,
      actionUrl: `/ic-meeting`,
      isRead: false,
    };

    await storage.createNotification(notification);
  }

  /**
   * Create a system notification
   */
  async createSystemNotification(
    title: string,
    message: string,
    severity: "INFO" | "WARNING" | "CRITICAL" = "INFO"
  ): Promise<void> {
    const notification: InsertNotification = {
      type: "SYSTEM",
      severity,
      title,
      message,
      isRead: false,
    };

    await storage.createNotification(notification);
  }

  /**
   * Check thesis monitors and create alerts for unhealthy positions
   */
  async checkThesisMonitorsAndAlert(): Promise<void> {
    const monitors = await storage.getThesisMonitors();
    
    for (const monitor of monitors) {
      if (monitor.healthStatus === "WARNING" || monitor.healthStatus === "ALERT") {
        await this.createThesisAlert(monitor);
      }
    }
  }
}

export const notificationService = new NotificationService();
