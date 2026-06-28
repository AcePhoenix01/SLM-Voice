"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { ProviderSelector } from "@/components/editor/provider-selector";
import { FirstMessage } from "@/components/editor/first-message";
import { PromptEditor } from "@/components/editor/prompt-editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function AgentsPage() {
  return (
    <MainLayout showTopBar={true} showRightPanel={true}>
      <ScrollArea className="h-full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 max-w-4xl mx-auto space-y-6"
        >
          {/* Section Header */}
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Agent Configuration
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure your AI voice agent&apos;s behavior, personality, and
              response style.
            </p>
          </div>

          {/* Provider & Model */}
          <div className="space-y-1.5">
            <ProviderSelector />
          </div>

          <Separator className="my-2" />

          {/* First Message */}
          <FirstMessage />

          <Separator className="my-2" />

          {/* System Prompt Editor */}
          <PromptEditor />
        </motion.div>
      </ScrollArea>
    </MainLayout>
  );
}
