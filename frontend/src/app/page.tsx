"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  PhoneCall,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAgentStore } from "@/store/agent-store";
import { motion } from "framer-motion";
import Link from "next/link";
import type { RecentActivity } from "@/types/agent";

const stats = [
  {
    title: "Total Agents",
    value: "3",
    change: "+1 this week",
    icon: Bot,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Active Calls",
    value: "12",
    change: "Live now",
    icon: PhoneCall,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Success Rate",
    value: "94.2%",
    change: "+2.1% vs last week",
    icon: TrendingUp,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    title: "Avg Duration",
    value: "4m 32s",
    change: "-12s vs last week",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

const recentActivities: RecentActivity[] = [
  {
    id: "1",
    action: "Published",
    agent: "Customer Support Bot",
    timestamp: "2 minutes ago",
    type: "published",
  },
  {
    id: "2",
    action: "Edited prompt for",
    agent: "Sales Assistant",
    timestamp: "15 minutes ago",
    type: "edited",
  },
  {
    id: "3",
    action: "Created",
    agent: "Appointment Scheduler",
    timestamp: "1 hour ago",
    type: "created",
  },
  {
    id: "4",
    action: "Test call on",
    agent: "Customer Support Bot",
    timestamp: "2 hours ago",
    type: "called",
  },
  {
    id: "5",
    action: "Published",
    agent: "Lead Qualifier",
    timestamp: "Yesterday",
    type: "published",
  },
];

const typeColors: Record<string, string> = {
  published: "bg-green-500/10 text-green-600 dark:text-green-400",
  edited: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  created: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  called: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const { setActiveNav } = useAgentStore();
  const [agentCount, setAgentCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:3001/api/agents")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAgentCount(data.length);
        }
      })
      .catch(err => console.error("Failed to fetch agents count:", err));
  }, []);

  const stats = [
    {
      title: "Total Agents",
      value: agentCount.toString(),
      change: "Active agents",
      icon: Bot,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Calls",
      value: "—",
      change: "Tracking coming soon",
      icon: PhoneCall,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Success Rate",
      value: "—",
      change: "Tracking coming soon",
      icon: TrendingUp,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      title: "Avg Duration",
      value: "—",
      change: "Tracking coming soon",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <MainLayout showTopBar={false} showRightPanel={false}>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your Voice AI agents and performance metrics.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.title} variants={item}>
                <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold tracking-tight">
                          {stat.value}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70">
                          {stat.change}
                        </p>
                      </div>
                      <div
                        className={`p-2 rounded-lg ${stat.bg} transition-transform group-hover:scale-110 duration-300`}
                      >
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                  {/* Subtle gradient accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Recent Activity
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <Activity className="w-8 h-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No recent activity found.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Link href="/agents" onClick={() => setActiveNav("agents")}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-10 text-sm hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <div className="p-1 rounded bg-violet-500/10">
                      <Plus className="w-3 h-3 text-violet-500" />
                    </div>
                    Create New Agent
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 text-sm hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <div className="p-1 rounded bg-blue-500/10">
                    <Bot className="w-3 h-3 text-blue-500" />
                  </div>
                  Manage Agents
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 text-sm hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <div className="p-1 rounded bg-green-500/10">
                    <Sparkles className="w-3 h-3 text-green-500" />
                  </div>
                  View Analytics
                </Button>

                <Link href="/settings" onClick={() => setActiveNav("settings")}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-10 text-sm hover:border-primary/30 hover:bg-primary/5 transition-all mt-2"
                  >
                    <div className="p-1 rounded bg-amber-500/10">
                      <Activity className="w-3 h-3 text-amber-500" />
                    </div>
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
