"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { UserInfoSection } from "@/components/settings/user-info";
import { CallTriggersSection } from "@/components/settings/call-triggers";
import { VoiceConfigSection } from "@/components/voice/voice-config";
import { TranscriberConfigSection } from "@/components/voice/transcriber-config";
import { CallTimeoutSection } from "@/components/settings/call-timeout";
import { PostCallAnalysisSection } from "@/components/settings/post-call-analysis";
import { CallSuccessEvalSection } from "@/components/settings/call-success-eval";
import { useAgentStore } from "@/store/agent-store";
import { motion, AnimatePresence } from "framer-motion";

export function RightPanel() {
  const { ui } = useAgentStore();

  return (
    <AnimatePresence mode="wait">
      {ui.rightPanelOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="border-l border-border bg-background shrink-0 overflow-hidden hidden lg:block"
        >
          <ScrollArea className="h-full">
            <div className="p-4 space-y-1">
              <h2 className="text-sm font-semibold mb-4 text-foreground/80">
                Configuration
              </h2>

              <UserInfoSection />
              <CallTriggersSection />
              <VoiceConfigSection />
              <TranscriberConfigSection />
              <CallTimeoutSection />
              <PostCallAnalysisSection />
              <CallSuccessEvalSection />
            </div>
          </ScrollArea>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
