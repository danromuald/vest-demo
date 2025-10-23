import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, GitBranch, Search, Users, TrendingUp, Bell, FileText, Bot, DollarSign, AlertTriangle, BarChart3, Activity, Newspaper, FileCheck, Shield, Send, Database, Mic, PieChart } from "lucide-react";
import { Link, useLocation } from "wouter";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Workflow Timeline",
    url: "/workflow-timeline",
    icon: GitBranch,
  },
  {
    title: "Research",
    url: "/research",
    icon: Search,
  },
  {
    title: "Proposals",
    url: "/proposals",
    icon: FileText,
  },
  {
    title: "IC Meeting",
    url: "/ic-meeting",
    icon: Users,
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: TrendingUp,
  },
  {
    title: "Monitoring",
    url: "/monitoring",
    icon: Bell,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
  },
];

const agentItems = [
  {
    title: "Research Brief",
    url: "/research-brief",
    icon: FileText,
  },
  {
    title: "Financial Model",
    url: "/financial-model",
    icon: DollarSign,
  },
  {
    title: "Risk Analysis",
    url: "/risk-analysis",
    icon: AlertTriangle,
  },
  {
    title: "Quant Analysis",
    url: "/quant-analysis",
    icon: BarChart3,
  },
  {
    title: "Scenario Simulator",
    url: "/scenario-simulator",
    icon: Activity,
  },
  {
    title: "Investment Memos",
    url: "/investment-memos",
    icon: FileCheck,
  },
  {
    title: "Compliance Reports",
    url: "/compliance-reports",
    icon: Shield,
  },
  {
    title: "Meeting Minutes",
    url: "/meeting-minutes",
    icon: FileText,
  },
  {
    title: "Trade Orders",
    url: "/trade-orders",
    icon: Send,
  },
  {
    title: "Risk Reports",
    url: "/risk-reports",
    icon: AlertTriangle,
  },
  {
    title: "Data Retrieval",
    url: "/data-retrieval",
    icon: Database,
  },
  {
    title: "Voice Summaries",
    url: "/voice-summaries",
    icon: Mic,
  },
  {
    title: "Attribution Reports",
    url: "/attribution-reports",
    icon: PieChart,
  },
  {
    title: "Market Events",
    url: "/market-events",
    icon: Newspaper,
  },
  {
    title: "Thesis Monitor",
    url: "/thesis-monitor",
    icon: TrendingUp,
  },
  {
    title: "Risk Regime",
    url: "/risk-regime",
    icon: Shield,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="font-mono text-base font-bold text-primary-foreground">V</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-sidebar-foreground">Vest</h2>
            <p className="text-xs text-muted-foreground">IC Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>AI Agents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {agentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
            <span className="text-xs font-medium text-sidebar-accent-foreground">SC</span>
          </div>
          <div className="flex-1 text-sm">
            <p className="font-medium text-sidebar-foreground">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">Technology Analyst</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
