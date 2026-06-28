"use client";

import { useAgentStore } from "@/store/agent-store";
import { CollapsibleSection } from "@/components/settings/collapsible-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Webhook, Plus, Trash2, Copy } from "lucide-react";
import type { HttpMethod } from "@/types/agent";
import { toast } from "sonner";

export function CallTriggersSection() {
  const { callTriggers, addCallTrigger, updateCallTrigger, removeCallTrigger } =
    useAgentStore();

  const handleAdd = () => {
    addCallTrigger({
      event: "call.completed",
      webhookUrl: "",
      method: "POST",
    });
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(
      "https://api.yourdomain.com/v1/webhooks/triggers"
    );
    toast.success("API endpoint copied to clipboard");
  };

  return (
    <CollapsibleSection
      title="Call Triggers via API"
      icon={<Webhook className="w-4 h-4" />}
    >
      <div className="space-y-3">
        {/* API Endpoint */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border">
          <code className="text-[10px] text-muted-foreground truncate flex-1 font-mono">
            /v1/webhooks/triggers
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleCopyEndpoint}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>

        {/* Trigger List */}
        {callTriggers.map((trigger) => (
          <div
            key={trigger.id}
            className="space-y-2 p-2 rounded-md border border-border bg-muted/30"
          >
            <div className="flex items-center gap-2">
              <Input
                value={trigger.event}
                onChange={(e) =>
                  updateCallTrigger(trigger.id, { event: e.target.value })
                }
                placeholder="Event name"
                className="h-7 text-xs flex-1"
              />
              <Select
                value={trigger.method}
                onValueChange={(value) => {
                  if (value) updateCallTrigger(trigger.id, { method: value as HttpMethod });
                }}
              >
                <SelectTrigger className="h-7 w-20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["GET", "POST", "PUT", "PATCH", "DELETE"] as HttpMethod[]).map(
                    (m) => (
                      <SelectItem key={m} value={m} className="text-xs">
                        {m}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive/70 hover:text-destructive shrink-0"
                onClick={() => removeCallTrigger(trigger.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <Input
              value={trigger.webhookUrl}
              onChange={(e) =>
                updateCallTrigger(trigger.id, { webhookUrl: e.target.value })
              }
              placeholder="https://your-webhook-url.com"
              className="h-7 text-xs"
            />
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs gap-1.5"
          onClick={handleAdd}
        >
          <Plus className="w-3 h-3" />
          Add Trigger
        </Button>
      </div>
    </CollapsibleSection>
  );
}
