"use client";

import { useAgentStore } from "@/store/agent-store";
import { CollapsibleSection } from "@/components/settings/collapsible-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timer } from "lucide-react";
import type { TimeoutAction } from "@/types/agent";

export function CallTimeoutSection() {
  const { callConfig, updateCallConfig } = useAgentStore();

  return (
    <CollapsibleSection
      title="Call Timeout"
      icon={<Timer className="w-4 h-4" />}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Timeout (seconds)
          </Label>
          <Input
            type="number"
            value={callConfig.timeoutSeconds}
            onChange={(e) =>
              updateCallConfig({ timeoutSeconds: parseInt(e.target.value) || 0 })
            }
            min={5}
            max={300}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Max Retries</Label>
          <Input
            type="number"
            value={callConfig.maxRetries}
            onChange={(e) =>
              updateCallConfig({ maxRetries: parseInt(e.target.value) || 0 })
            }
            min={0}
            max={10}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Timeout Action
          </Label>
          <Select
            value={callConfig.timeoutAction}
            onValueChange={(value) => {
              if (value) updateCallConfig({ timeoutAction: value as TimeoutAction });
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hangup">Hang Up</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="voicemail">Voicemail</SelectItem>
              <SelectItem value="retry">Retry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CollapsibleSection>
  );
}
