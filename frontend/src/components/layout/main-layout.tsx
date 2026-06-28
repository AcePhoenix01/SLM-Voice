"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { RightPanel } from "@/components/layout/right-panel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TestChat } from "@/components/chat/test-chat";
import { TestCall } from "@/components/chat/test-call";
import { useEffect } from "react";
import { useAgentStore } from "@/store/agent-store";
import { Loader2 } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  showTopBar?: boolean;
  showRightPanel?: boolean;
}

export function MainLayout({
  children,
  showTopBar = true,
  showRightPanel = false,
}: MainLayoutProps) {
  const { initAgent, ui } = useAgentStore();

  useEffect(() => {
    initAgent();
  }, [initAgent]);

  if (ui.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }

  return (
    <TooltipProvider delay={200}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {showTopBar && <TopBar />}

          <div className="flex-1 flex overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">{children}</main>

            {/* Right Panel */}
            {showRightPanel && <RightPanel />}
          </div>
        </div>

        {/* Global Overlays */}
        <TestChat />
        <TestCall />
      </div>
    </TooltipProvider>
  );
}
