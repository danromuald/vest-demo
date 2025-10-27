import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Brain,
  Shield,
  BarChart3,
  CheckCircle,
  Sparkles,
  Clock,
  Target,
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: "16 AI Agents",
      description:
        "Automated research, analysis, and monitoring with specialized AI agents",
    },
    {
      icon: Users,
      title: "IC Workflow",
      description:
        "Streamlined investment committee meetings with real-time collaboration",
    },
    {
      icon: Shield,
      title: "Compliance Built-in",
      description: "Automated regulatory checks and documentation",
    },
    {
      icon: BarChart3,
      title: "Portfolio Monitoring",
      description:
        "Continuous thesis health tracking and market event detection",
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce analyst workload by 60% with automated workflows",
    },
    {
      icon: CheckCircle,
      title: "Institutional Quality",
      description: "Enterprise-grade security and audit trails",
    },
  ];

  const roles = [
    {
      role: "Analyst",
      description: "Create proposals, conduct research, participate in debates",
    },
    {
      role: "PM",
      description: "Lead IC meetings, vote on proposals, manage portfolio",
    },
    {
      role: "Compliance",
      description: "Monitor regulatory compliance, review risk reports",
    },
    {
      role: "Admin",
      description: "Full system access, user management, configuration",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-5xl w-full text-center space-y-8"
        >
          {/* Logo & Title */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
              <span className="font-mono text-3xl font-bold text-primary-foreground">
                V
              </span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Vest
            </h1>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-Powered Investment Committee Workflow Platform
          </p>

          <p className="text-base text-muted-foreground max-w-3xl mx-auto">
            Streamline your investment workflow from discovery through execution
            and monitoring. Leverage 16 specialized RockAI agents to enhance
            decision quality, ensure compliance, and maintain institutional
            knowledge.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="pt-4 space-y-4"
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => (window.location.href = "/api/demo-signin")}
              data-testid="button-demo-signin"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Enter Demo
            </Button>
            <p className="text-sm text-muted-foreground">
              No credentials required - instant access to full platform
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                <Card className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Roles Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="pt-12"
          >
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Different views and permissions for each role in your
                  organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roles.map((item) => (
                    <div key={item.role} className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold mb-2">{item.role}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 px-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Vest Investment Committee Platform</p>
          <p>© 2025 - Enterprise Demo</p>
        </div>
      </footer>
    </div>
  );
}
