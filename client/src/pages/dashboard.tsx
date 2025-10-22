import { MetricCard } from "@/components/metric-card";
import { WorkflowStageNavigator } from "@/components/workflow-stage-navigator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, FileText, Bell, Loader2, ArrowRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Position, Proposal, ResearchRequest, Notification } from "@shared/schema";

export default function Dashboard() {
  const { data: positions = [], isLoading: loadingPositions } = useQuery<Position[]>({
    queryKey: ['/api/positions'],
  });

  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ['/api/proposals'],
  });

  const { data: researchRequests = [] } = useQuery<ResearchRequest[]>({
    queryKey: ['/api/research-requests'],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  if (loadingPositions) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const portfolioValue = positions.reduce((sum, p) => sum + parseFloat(p.marketValue), 0);
  const totalGainLoss = positions.reduce((sum, p) => sum + parseFloat(p.gainLoss), 0);
  const avgGainLossPercent = positions.length > 0
    ? positions.reduce((sum, p) => sum + parseFloat(p.gainLossPercent), 0) / positions.length
    : 0;

  const activeProposals = proposals.filter(p => p.status === "PENDING");
  const criticalAlerts = notifications.filter(n => n.severity === "CRITICAL" && !n.readAt).length;
  const activeResearch = researchRequests.filter(r => r.status === "IN_PROGRESS").length;

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
          title="Active Research"
          value={activeResearch}
          icon={<FileText className="h-4 w-4" />}
          changeLabel={`${researchRequests.length} total requests`}
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
          title="Critical Alerts"
          value={criticalAlerts}
          icon={<Bell className="h-4 w-4" />}
          variant={criticalAlerts > 0 ? "warning" : "success"}
          changeLabel={`${notifications.length} total notifications`}
        />
      </div>

      {/* Workflow Stage Navigator */}
      <WorkflowStageNavigator />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/research">
          <Card className="hover-elevate cursor-pointer" data-testid="card-quick-action-research">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Research Pipeline</h3>
                <p className="text-sm text-muted-foreground">{activeResearch} active requests</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/debate-room">
          <Card className="hover-elevate cursor-pointer" data-testid="card-quick-action-debate">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Debate Room</h3>
                <p className="text-sm text-muted-foreground">Multi-agent collaboration</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/ic-meeting">
          <Card className="hover-elevate cursor-pointer" data-testid="card-quick-action-meeting">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">IC Meeting</h3>
                <p className="text-sm text-muted-foreground">{activeProposals.length} pending proposals</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Active Proposals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {activeProposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No pending proposals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeProposals.slice(0, 3).map((proposal) => (
                  <div 
                    key={proposal.id}
                    className="flex items-center justify-between hover-elevate rounded-md p-3 border border-border"
                    data-testid={`proposal-${proposal.id}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{proposal.ticker} - {proposal.proposalType}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: ${parseFloat(proposal.targetPrice).toFixed(2)} • Upside: {parseFloat(proposal.upside).toFixed(1)}%
                      </p>
                    </div>
                    <Badge variant={proposal.recommendation === "BUY" ? "default" : "secondary"}>
                      {proposal.recommendation}
                    </Badge>
                  </div>
                ))}
                {activeProposals.length > 3 && (
                  <Link href="/ic-meeting">
                    <Button variant="ghost" size="sm" className="w-full" data-testid="button-view-all-proposals">
                      View all {activeProposals.length} proposals
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Recent Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No recent alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex items-start gap-3 hover-elevate rounded-md p-3 border border-border"
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      notification.severity === "CRITICAL" ? "bg-destructive/10" :
                      notification.severity === "WARNING" ? "bg-yellow-500/10" :
                      "bg-blue-500/10"
                    }`}>
                      {notification.severity === "CRITICAL" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      {notification.severity === "WARNING" && <Clock className="h-4 w-4 text-yellow-500" />}
                      {notification.severity === "INFO" && <Bell className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    </div>
                  </div>
                ))}
                {notifications.length > 3 && (
                  <Link href="/monitoring">
                    <Button variant="ghost" size="sm" className="w-full" data-testid="button-view-all-notifications">
                      View all {notifications.length} notifications
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Portfolio Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {positions.slice(0, 3).map((position) => {
              const gainLoss = parseFloat(position.gainLoss);
              const gainLossPercent = parseFloat(position.gainLossPercent);
              
              return (
                <div 
                  key={position.id}
                  className="flex flex-col gap-2 p-4 rounded-md border border-border hover-elevate"
                  data-testid={`position-${position.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{position.ticker}</span>
                    <Badge variant={position.thesisHealth === "HEALTHY" ? "default" : 
                                   position.thesisHealth === "CHALLENGED" ? "secondary" : "destructive"}>
                      {position.thesisHealth}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{position.sector}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">P&L</span>
                    <span className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                      ${(gainLoss / 1000).toFixed(1)}K ({gainLossPercent > 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {positions.length > 3 && (
            <Link href="/portfolio">
              <Button variant="ghost" size="sm" className="w-full mt-4" data-testid="button-view-all-positions">
                View all {positions.length} positions
                <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
