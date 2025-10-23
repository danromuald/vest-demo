import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import Dashboard from "@/pages/dashboard";
import Research from "@/pages/research";
import ICMeeting from "@/pages/ic-meeting";
import Portfolio from "@/pages/portfolio";
import Monitoring from "@/pages/monitoring";
import Documents from "@/pages/documents";
import DebateRoom from "@/pages/debate-room";
import HistoricalMeetings from "@/pages/historical-meetings";
import AgentOutputs from "@/pages/agent-outputs";
import MonitoringHub from "@/pages/monitoring-hub";
import WorkflowTimeline from "@/pages/workflow-timeline";
import ResearchBrief from "@/pages/research-brief";
import FinancialModel from "@/pages/financial-model";
import RiskAnalysis from "@/pages/risk-analysis";
import ScenarioSimulator from "@/pages/scenario-simulator";
import ThesisMonitor from "@/pages/thesis-monitor";
import QuantAnalysis from "@/pages/quant-analysis";
import MarketEvents from "@/pages/market-events";
import InvestmentMemos from "@/pages/investment-memos";
import ComplianceReports from "@/pages/compliance-reports";
import MeetingMinutes from "@/pages/meeting-minutes";
import TradeOrders from "@/pages/trade-orders";
import RiskReports from "@/pages/risk-reports";
import DataRetrieval from "@/pages/data-retrieval";
import VoiceSummaries from "@/pages/voice-summaries";
import AttributionReports from "@/pages/attribution-reports";
import RiskRegime from "@/pages/risk-regime";
import Proposals from "@/pages/proposals";
import ProposalDetail from "@/pages/proposal-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/workflow-timeline" component={WorkflowTimeline} />
      <Route path="/research" component={Research} />
      <Route path="/research-brief" component={ResearchBrief} />
      <Route path="/financial-model" component={FinancialModel} />
      <Route path="/risk-analysis" component={RiskAnalysis} />
      <Route path="/scenario-simulator" component={ScenarioSimulator} />
      <Route path="/thesis-monitor" component={ThesisMonitor} />
      <Route path="/quant-analysis" component={QuantAnalysis} />
      <Route path="/market-events" component={MarketEvents} />
      <Route path="/investment-memos" component={InvestmentMemos} />
      <Route path="/compliance-reports" component={ComplianceReports} />
      <Route path="/meeting-minutes" component={MeetingMinutes} />
      <Route path="/trade-orders" component={TradeOrders} />
      <Route path="/risk-reports" component={RiskReports} />
      <Route path="/data-retrieval" component={DataRetrieval} />
      <Route path="/voice-summaries" component={VoiceSummaries} />
      <Route path="/attribution-reports" component={AttributionReports} />
      <Route path="/risk-regime" component={RiskRegime} />
      <Route path="/proposals" component={Proposals} />
      <Route path="/proposals/:id" component={ProposalDetail} />
      <Route path="/ic-meeting" component={ICMeeting} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/monitoring" component={Monitoring} />
      <Route path="/monitoring-hub" component={MonitoringHub} />
      <Route path="/documents" component={Documents} />
      <Route path="/debate-room" component={DebateRoom} />
      <Route path="/historical-meetings" component={HistoricalMeetings} />
      <Route path="/agent-outputs" component={AgentOutputs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-border p-3">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-2">
                    <NotificationBell />
                    <ThemeToggle />
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
