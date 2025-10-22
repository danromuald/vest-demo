import { MetricCard } from "@/components/metric-card";
import { WorkflowTimeline } from "@/components/workflow-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, FileText, Bell, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Position } from "@shared/schema";

export default function Dashboard() {
  const { data: positions = [], isLoading, isError } = useQuery<Position[]>({
    queryKey: ['/api/positions'],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const portfolioValue = positions.reduce((sum, p) => sum + parseFloat(p.marketValue), 0);
  const totalGainLoss = positions.reduce((sum, p) => sum + parseFloat(p.gainLoss), 0);
  const avgGainLossPercent = positions.length > 0
    ? positions.reduce((sum, p) => sum + parseFloat(p.gainLossPercent), 0) / positions.length
    : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
          Investment Committee Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered workflow management and portfolio oversight
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Portfolio Value"
          value={`$${(portfolioValue / 1000000).toFixed(1)}M`}
          change={2.3}
          changeLabel="vs last month"
          icon={<TrendingUp className="h-4 w-4" />}
          variant="success"
        />
        <MetricCard
          title="Total Positions"
          value={positions.length}
          icon={<FileText className="h-4 w-4" />}
        />
        <MetricCard
          title="P&L YTD"
          value={`$${(totalGainLoss / 1000000).toFixed(2)}M`}
          change={avgGainLossPercent}
          changeLabel="return"
          icon={<TrendingUp className="h-4 w-4" />}
          variant={totalGainLoss >= 0 ? 'success' : 'danger'}
        />
        <MetricCard
          title="Active Alerts"
          value="3"
          icon={<Bell className="h-4 w-4" />}
          variant="warning"
        />
      </div>

      {/* Workflow Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Current Workflow Stage</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <WorkflowTimeline currentStage="discovery" />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Active Proposals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between hover-elevate rounded-md p-3 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">NVDA - Buy Recommendation</p>
                  <p className="text-xs text-muted-foreground">Sarah Chen • Technology</p>
                </div>
                <span className="rounded-full bg-chart-4/10 px-2 py-1 text-xs font-medium text-chart-4">
                  Pending
                </span>
              </div>
              <div className="flex items-center justify-between hover-elevate rounded-md p-3 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">TSLA - Position Review</p>
                  <p className="text-xs text-muted-foreground">Michael Torres • Automobiles</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  In Review
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Recent Market Events</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 hover-elevate rounded-md p-3 border border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-3/10">
                  <span className="text-xs font-bold text-chart-3">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">MSFT drops 2.1%</p>
                  <p className="text-xs text-muted-foreground">AI capex concerns from CFO comments</p>
                  <p className="text-xs text-muted-foreground mt-1">10 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 hover-elevate rounded-md p-3 border border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2/10">
                  <span className="text-xs font-bold text-chart-2">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">AAPL earnings beat</p>
                  <p className="text-xs text-muted-foreground">Services revenue +15% YoY</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
