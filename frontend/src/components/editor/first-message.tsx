"use client";

import { useAgentStore } from "@/store/agent-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle } from "lucide-react";
import type { FirstMessageMode } from "@/types/agent";

const modes: { value: FirstMessageMode; label: string; desc: string }[] = [
  {
    value: "auto",
    label: "Auto",
    desc: "Agent speaks first automatically",
  },
  {
    value: "manual",
    label: "Manual",
    desc: "Wait for caller to speak first",
  },
  {
    value: "disabled",
    label: "Disabled",
    desc: "No first message",
  },
];

export function FirstMessage() {
  const { agent, updateAgent } = useAgentStore();

  return (
    <div className="space-y-3">
      {/* Mode Selector */}
      <div className="flex items-end gap-4">
        <div className="space-y-1.5 w-48">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            First Message Mode
          </Label>
          <Select
            value={agent.firstMessageMode}
            onValueChange={(value) => {
              if (value) updateAgent({ firstMessageMode: value as FirstMessageMode });
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modes.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  <div>
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      — {m.desc}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* First Message Content */}
      {agent.firstMessageMode !== "disabled" && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              First Message
            </Label>
            <span className="text-[10px] text-muted-foreground/60 font-mono">
              {agent.firstMessage.length} chars
            </span>
          </div>
          <Textarea
            value={agent.firstMessage}
            onChange={(e) => updateAgent({ firstMessage: e.target.value })}
            placeholder="Enter the first message your agent will say..."
            className="min-h-[60px] text-sm resize-none"
          />
        </div>
      )}
    </div>
  );
}
