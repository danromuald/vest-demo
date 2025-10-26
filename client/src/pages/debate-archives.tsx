import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { FileText, Download, Clock, Users, MessageSquare, TrendingUp, TrendingDown, Minus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DebateSession } from "@shared/schema";
import { format } from "date-fns";

export default function DebateArchivesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: sessions, isLoading } = useQuery<DebateSession[]>({
    queryKey: ["/api/debate-sessions"],
  });

  const filteredSessions = sessions?.filter(session => {
    const matchesSearch = 
      session.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.topic.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      session.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return dateB - dateA; // Most recent first
  });

  const handleDownloadPDF = async (sessionId: string, ticker: string) => {
    try {
      const response = await fetch(`/api/debate-sessions/${sessionId}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debate-${ticker}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold" data-testid="heading-debate-archives">Debate Archives</h1>
        <p className="text-muted-foreground">
          Browse and review past Investment Committee debates
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticker or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-debates"
                />
              </div>
              <div className="sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Debates</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Summary */}
      {sessions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Debates</p>
                  <p className="text-2xl font-bold" data-testid="stat-total-debates">{sessions.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold" data-testid="stat-completed-debates">
                    {sessions.filter(s => s.status === 'COMPLETED').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold" data-testid="stat-active-debates">
                    {sessions.filter(s => s.status === 'ACTIVE').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold" data-testid="stat-avg-participants">
                    {Math.round(sessions.reduce((sum, s) => sum + (s.participantCount || 0), 0) / sessions.length) || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Debate List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">Loading debates...</div>
        )}

        {!isLoading && filteredSessions && filteredSessions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No debates found matching your criteria</p>
            </CardContent>
          </Card>
        )}

        {filteredSessions?.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover-elevate" data-testid={`card-debate-${session.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-lg">
                        {session.ticker}
                      </Badge>
                      <Badge
                        variant={
                          session.status === 'COMPLETED' ? 'default' :
                          session.status === 'ACTIVE' ? 'secondary' : 'outline'
                        }
                        data-testid={`badge-status-${session.id}`}
                      >
                        {session.status}
                      </Badge>
                      {session.decision && (
                        <Badge
                          variant={
                            session.decision === 'APPROVED' ? 'default' :
                            session.decision === 'REJECTED' ? 'destructive' : 'outline'
                          }
                          className="gap-1"
                          data-testid={`badge-decision-${session.id}`}
                        >
                          {session.decision === 'APPROVED' && <TrendingUp className="h-3 w-3" />}
                          {session.decision === 'REJECTED' && <TrendingDown className="h-3 w-3" />}
                          {session.decision === 'DEFERRED' && <Minus className="h-3 w-3" />}
                          {session.decision}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{session.topic}</CardTitle>
                    <CardDescription className="flex items-center gap-4 flex-wrap">
                      {session.startedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(session.startedAt), 'MMM d, yyyy')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {session.participantCount || 0} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {session.messageCount || 0} messages
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {session.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(session.id, session.ticker)}
                        data-testid={`button-download-pdf-${session.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Link href={`/debate-room?session=${session.id}`}>
                      <Button size="sm" data-testid={`button-view-debate-${session.id}`}>
                        View Debate
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              {session.summary && (
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {session.summary.substring(0, 300)}
                      {session.summary.length > 300 && '...'}
                    </p>
                    {session.keyPoints && session.keyPoints.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Key Points</h4>
                        <ul className="space-y-1">
                          {session.keyPoints.slice(0, 3).map((point, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
