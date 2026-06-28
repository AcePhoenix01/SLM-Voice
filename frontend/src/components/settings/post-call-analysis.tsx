"use client";

import { useAgentStore } from "@/store/agent-store";
import { CollapsibleSection } from "@/components/settings/collapsible-section";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart2 } from "lucide-react";
import type { AnalysisType } from "@/types/agent";

const analysisOptions: { id: AnalysisType; label: string }[] = [
  { id: "sentiment", label: "Sentiment Analysis" },
  { id: "summary", label: "Call Summary" },
  { id: "intent", label: "Intent Detection" },
  { id: "custom", label: "Custom Analysis" },
];

export function PostCallAnalysisSection() {
  const { postCallAnalysis, updatePostCallAnalysis } = useAgentStore();

  const toggleAnalysisType = (type: AnalysisType) => {
    const types = postCallAnalysis.analysisTypes.includes(type)
      ? postCallAnalysis.analysisTypes.filter((t) => t !== type)
      : [...postCallAnalysis.analysisTypes, type];
    updatePostCallAnalysis({ analysisTypes: types });
  };

  return (
    <CollapsibleSection
      title="Post Call Analysis"
      icon={<BarChart2 className="w-4 h-4" />}
    >
      <div className="space-y-3">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            Enable Analysis
          </Label>
          <Switch
            checked={postCallAnalysis.enabled}
            onCheckedChange={(checked) =>
              updatePostCallAnalysis({ enabled: checked })
            }
          />
        </div>

        {postCallAnalysis.enabled && (
          <>
            {/* Analysis Type Toggles */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Analysis Types
              </Label>
              {analysisOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-xs text-foreground/70">
                    {option.label}
                  </span>
                  <Switch
                    checked={postCallAnalysis.analysisTypes.includes(option.id)}
                    onCheckedChange={() => toggleAnalysisType(option.id)}
                  />
                </div>
              ))}
            </div>

            {/* Custom Prompt */}
            {postCallAnalysis.analysisTypes.includes("custom") && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Custom Analysis Prompt
                </Label>
                <Textarea
                  value={postCallAnalysis.customPrompt}
                  onChange={(e) =>
                    updatePostCallAnalysis({ customPrompt: e.target.value })
                  }
                  placeholder="Enter your custom analysis instructions..."
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>
            )}
          </>
        )}
      </div>
    </CollapsibleSection>
  );
}
