"use client";

import { useAgentStore } from "@/store/agent-store";
import { CollapsibleSection } from "@/components/settings/collapsible-section";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

export function CallSuccessEvalSection() {
  const { callSuccessEval, updateCallSuccessEval } = useAgentStore();

  const toggleCriterion = (id: string) => {
    const updated = callSuccessEval.criteria.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    updateCallSuccessEval({ criteria: updated });
  };

  return (
    <CollapsibleSection
      title="Call Success Evaluation"
      icon={<CheckCircle className="w-4 h-4" />}
    >
      <div className="space-y-3">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            Enable Evaluation
          </Label>
          <Switch
            checked={callSuccessEval.enabled}
            onCheckedChange={(checked) =>
              updateCallSuccessEval({ enabled: checked })
            }
          />
        </div>

        {callSuccessEval.enabled && (
          <>
            {/* Criteria Toggles */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Success Criteria
              </Label>
              {callSuccessEval.criteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-xs text-foreground/70">
                    {criterion.label}
                  </span>
                  <Switch
                    checked={criterion.enabled}
                    onCheckedChange={() => toggleCriterion(criterion.id)}
                  />
                </div>
              ))}
            </div>

            {/* Rubric */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Evaluation Rubric
              </Label>
              <Textarea
                value={callSuccessEval.rubric}
                onChange={(e) =>
                  updateCallSuccessEval({ rubric: e.target.value })
                }
                placeholder="Define how to evaluate call success..."
                className="text-xs min-h-[60px] resize-none"
              />
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
}
