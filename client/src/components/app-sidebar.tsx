import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, GitBranch, Search, FileText, Users, TrendingUp, 
  Bell, FolderOpen, Bot, Brain, Calculator, AlertTriangle, BarChart3,
  Sparkles, Activity, Target, Shield, DollarSign, FileCheck, Database,
  Volume2, PieChart, Gauge, MessageCircle, Archive, ChevronRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UserMenu } from "@/components/user-menu";

const workflowItems = [
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
];

const preWorkAgents = [
  { title: "Research Briefs", url: "/research-brief", icon: Brain },
  { title: "Financial Models", url: "/financial-model", icon: Calculator },
  { title: "Quant Analysis", url: "/quant-analysis", icon: Activity },
  { title: "Risk Analysis", url: "/risk-analysis", icon: AlertTriangle },
  { title: "Scenario Simulator", url: "/scenario-simulator", icon: Target },
];

const meetingAgents = [
  { title: "Debate Room", url: "/debate-room", icon: MessageCircle },
  { title: "Debate Archives", url: "/debate-archives", icon: Archive },
  { title: "Investment Memos", url: "/investment-memos", icon: FileText },
];

const executionAgents = [
  { title: "Meeting Minutes", url: "/meeting-minutes", icon: FileCheck },
  { title: "Compliance Reports", url: "/compliance-reports", icon: Shield },
  { title: "Risk Reports", url: "/risk-reports", icon: AlertTriangle },
  { title: "Trade Orders", url: "/trade-orders", icon: DollarSign },
];

const monitoringAgents = [
  { title: "Thesis Monitor", url: "/thesis-monitor", icon: Target },
  { title: "Market Events", url: "/market-events", icon: Bell },
];

const supportingAgents = [
  { title: "Data Retrieval", url: "/data-retrieval", icon: Database },
  { title: "Voice Summaries", url: "/voice-summaries", icon: Volume2 },
  { title: "Attribution Reports", url: "/attribution-reports", icon: PieChart },
  { title: "Risk Regime", url: "/risk-regime", icon: Gauge },
  { title: "All Agent Outputs", url: "/agent-outputs", icon: Sparkles },
];

const resourceItems = [
  {
    title: "Documents",
    url: "/documents",
    icon: FolderOpen,
  },
  {
    title: "Monitoring Hub",
    url: "/monitoring-hub",
    icon: BarChart3,
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
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}
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
              <Collapsible defaultOpen={false} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton data-testid="toggle-prework-agents">
                      <Brain className="h-4 w-4" />
                      <span>Pre-Work Agents</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {preWorkAgents.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location === item.url}
                            data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}
                          >
                            <Link href={item.url}>
                              <item.icon className="h-3.5 w-3.5" />
                              <span className="text-xs">{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <Collapsible defaultOpen={false} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton data-testid="toggle-ic-execution-agents">
                      <Users className="h-4 w-4" />
                      <span>IC & Execution</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {[...meetingAgents, ...executionAgents].map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location === item.url}
                            data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}
                          >
                            <Link href={item.url}>
                              <item.icon className="h-3.5 w-3.5" />
                              <span className="text-xs">{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <Collapsible defaultOpen={false} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton data-testid="toggle-monitoring-agents">
                      <Activity className="h-4 w-4" />
                      <span>Monitoring & Analytics</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {[...monitoringAgents, ...supportingAgents].map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location === item.url}
                            data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}
                          >
                            <Link href={item.url}>
                              <item.icon className="h-3.5 w-3.5" />
                              <span className="text-xs">{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/ /g, '-')}`}
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
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
