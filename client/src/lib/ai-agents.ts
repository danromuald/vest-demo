import { 
  FileText, 
  TrendingUp, 
  Shield, 
  AlertCircle, 
  Sparkles 
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  color: string;
  specialty: string;
  voiceSettings: {
    pitch: number;
    rate: number;
  };
}

export const AI_AGENTS: AIAgent[] = [
  {
    id: "research",
    name: "Research Agent",
    role: "RESEARCH_AGENT",
    icon: FileText,
    color: "text-blue-500",
    specialty: "Market research, competitive analysis, and industry trends",
    voiceSettings: { pitch: 1.0, rate: 0.95 }, // Neutral, measured tone
  },
  {
    id: "quant",
    name: "Quant Agent",
    role: "QUANT_AGENT",
    icon: TrendingUp,
    color: "text-purple-500",
    specialty: "Quantitative modeling, valuation analysis, and financial metrics",
    voiceSettings: { pitch: 1.05, rate: 1.05 }, // Slightly higher, faster - analytical
  },
  {
    id: "risk",
    name: "Risk Agent",
    role: "RISK_AGENT",
    icon: Shield,
    color: "text-red-500",
    specialty: "Risk assessment, scenario analysis, and downside evaluation",
    voiceSettings: { pitch: 0.95, rate: 0.9 }, // Lower, slower - serious tone
  },
  {
    id: "compliance",
    name: "Compliance Agent",
    role: "COMPLIANCE_AGENT",
    icon: AlertCircle,
    color: "text-orange-500",
    specialty: "Regulatory compliance, governance, and policy adherence",
    voiceSettings: { pitch: 1.0, rate: 0.9 }, // Neutral, deliberate
  },
  {
    id: "contrarian",
    name: "Contrarian Agent",
    role: "CONTRARIAN_AGENT",
    icon: Sparkles,
    color: "text-yellow-500",
    specialty: "Devil's advocate, alternative scenarios, and bear case analysis",
    voiceSettings: { pitch: 0.9, rate: 1.1 }, // Lower, faster - challenging tone
  },
];

// Helper function to get agent by role or ID
export function getAgentInfo(agentRole: string | null | undefined): AIAgent | null {
  if (!agentRole) return null;
  
  const normalizedRole = agentRole.toUpperCase();
  return (
    AI_AGENTS.find(a => a.role === normalizedRole || a.id === normalizedRole.toLowerCase()) || null
  );
}

// Helper function to get agent voice settings
export function getAgentVoiceSettings(agentRole: string | null | undefined) {
  const agent = getAgentInfo(agentRole);
  return agent?.voiceSettings || { pitch: 1.0, rate: 1.0 };
}
