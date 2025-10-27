import type { User } from "@shared/schema";

export type UserRole = "ANALYST" | "PM" | "COMPLIANCE" | "ADMIN";

export interface RolePermissions {
  // Workflow permissions
  canCreateWorkflow: boolean;
  canApproveWorkflow: boolean;
  canViewWorkflows: boolean;
  
  // IC Meeting permissions
  canVoteInMeeting: boolean;
  canLeadMeeting: boolean;
  canParticipateInMeeting: boolean;
  
  // Agent permissions
  canGenerateAgentOutput: boolean;
  canViewAgentOutput: boolean;
  
  // Compliance permissions
  canApproveCompliance: boolean;
  canViewComplianceReports: boolean;
  
  // Trade permissions
  canApproveTrades: boolean;
  canExecuteTrades: boolean;
  
  // Portfolio permissions
  canManagePortfolio: boolean;
  canViewPortfolio: boolean;
  
  // Admin permissions
  canManageUsers: boolean;
  canAccessAllFeatures: boolean;
}

const rolePermissionsMap: Record<UserRole, RolePermissions> = {
  ANALYST: {
    canCreateWorkflow: true,
    canApproveWorkflow: false,
    canViewWorkflows: true,
    canVoteInMeeting: false, // Can participate but not vote
    canLeadMeeting: false,
    canParticipateInMeeting: true,
    canGenerateAgentOutput: true,
    canViewAgentOutput: true,
    canApproveCompliance: false,
    canViewComplianceReports: true,
    canApproveTrades: false,
    canExecuteTrades: false,
    canManagePortfolio: false,
    canViewPortfolio: true,
    canManageUsers: false,
    canAccessAllFeatures: false,
  },
  PM: {
    canCreateWorkflow: true,
    canApproveWorkflow: true,
    canViewWorkflows: true,
    canVoteInMeeting: true,
    canLeadMeeting: true,
    canParticipateInMeeting: true,
    canGenerateAgentOutput: true,
    canViewAgentOutput: true,
    canApproveCompliance: false,
    canViewComplianceReports: true,
    canApproveTrades: true,
    canExecuteTrades: true,
    canManagePortfolio: true,
    canViewPortfolio: true,
    canManageUsers: false,
    canAccessAllFeatures: false,
  },
  COMPLIANCE: {
    canCreateWorkflow: false,
    canApproveWorkflow: false,
    canViewWorkflows: true,
    canVoteInMeeting: false,
    canLeadMeeting: false,
    canParticipateInMeeting: true,
    canGenerateAgentOutput: false,
    canViewAgentOutput: true,
    canApproveCompliance: true,
    canViewComplianceReports: true,
    canApproveTrades: true,
    canExecuteTrades: false,
    canManagePortfolio: false,
    canViewPortfolio: true,
    canManageUsers: false,
    canAccessAllFeatures: false,
  },
  ADMIN: {
    canCreateWorkflow: true,
    canApproveWorkflow: true,
    canViewWorkflows: true,
    canVoteInMeeting: true,
    canLeadMeeting: true,
    canParticipateInMeeting: true,
    canGenerateAgentOutput: true,
    canViewAgentOutput: true,
    canApproveCompliance: true,
    canViewComplianceReports: true,
    canApproveTrades: true,
    canExecuteTrades: true,
    canManagePortfolio: true,
    canViewPortfolio: true,
    canManageUsers: true,
    canAccessAllFeatures: true,
  },
};

export function getPermissions(user: User | null | undefined): RolePermissions {
  if (!user) {
    // Return all-false permissions for unauthenticated users
    return {
      canCreateWorkflow: false,
      canApproveWorkflow: false,
      canViewWorkflows: false,
      canVoteInMeeting: false,
      canLeadMeeting: false,
      canParticipateInMeeting: false,
      canGenerateAgentOutput: false,
      canViewAgentOutput: false,
      canApproveCompliance: false,
      canViewComplianceReports: false,
      canApproveTrades: false,
      canExecuteTrades: false,
      canManagePortfolio: false,
      canViewPortfolio: false,
      canManageUsers: false,
      canAccessAllFeatures: false,
    };
  }
  
  const role = (user.role || "ANALYST") as UserRole;
  return rolePermissionsMap[role];
}

export function hasPermission(
  user: User | null | undefined,
  permission: keyof RolePermissions
): boolean {
  const permissions = getPermissions(user);
  return permissions[permission];
}

// Agent visibility by role
export function canViewAgent(user: User | null | undefined, agentType: string): boolean {
  // Unauthenticated users cannot view any agents
  if (!user) return false;
  
  const role = (user.role || "ANALYST") as UserRole;
  
  // Admin can see everything
  if (role === "ADMIN") return true;
  
  // PM can see everything
  if (role === "PM") return true;
  
  // Compliance can only see compliance and risk related agents
  if (role === "COMPLIANCE") {
    const complianceAgents = [
      "COMPLIANCE_CHECKER",
      "RISK_REPORTER",
      "RISK_ANALYZER",
      "RISK_REGIME_ANALYZER",
      "THESIS_MONITOR",
      "MARKET_MONITOR"
    ];
    return complianceAgents.includes(agentType);
  }
  
  // Analyst can see all research agents, but not execution agents
  if (role === "ANALYST") {
    const analystRestrictedAgents = [
      "TRADE_EXECUTOR", // Can't see trade execution
    ];
    return !analystRestrictedAgents.includes(agentType);
  }
  
  return false;
}
