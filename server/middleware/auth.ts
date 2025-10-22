import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

type UserRole = "ADMIN" | "ANALYST" | "PM" | "RISK_OFFICER" | "COMPLIANCE" | "TRADER";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // @ts-ignore - session is added by express-session middleware
    const userId = req.session?.userId;
    
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const user = await storage.getUserProfile(userId);
    
    if (!user) {
      res.status(401).json({ error: "Invalid session" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}

export const permissions = {
  canCreateResearch: ["ADMIN", "ANALYST", "PM"] as UserRole[],
  canEditResearch: ["ADMIN", "ANALYST", "PM"] as UserRole[],
  canDeleteResearch: ["ADMIN"] as UserRole[],
  canAdvanceWorkflow: ["ADMIN", "PM"] as UserRole[],
  canRevertWorkflow: ["ADMIN"] as UserRole[],
  canVote: ["ADMIN", "PM", "ANALYST"] as UserRole[],
  canViewPortfolio: ["ADMIN", "PM", "ANALYST", "RISK_OFFICER", "COMPLIANCE"] as UserRole[],
  canExecuteTrade: ["ADMIN", "TRADER"] as UserRole[],
  canAccessRiskCompliance: ["ADMIN", "RISK_OFFICER", "COMPLIANCE"] as UserRole[],
  canManageUsers: ["ADMIN"] as UserRole[],
};
