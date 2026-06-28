"use client";

import { useAgentStore } from "@/store/agent-store";
import { CollapsibleSection } from "@/components/settings/collapsible-section";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioLines } from "lucide-react";
import type { TranscriberProvider } from "@/types/agent";

const transcriberProviders: { value: string; label: string }[] = [
  { value: "soniox", label: "Soniox" },
  { value: "openai", label: "OpenAI Whisper" },
  { value: "browser", label: "Browser Native (Free)" },
];

const languages = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "it-IT", label: "Italian" },
  { value: "pt-BR", label: "Portuguese (BR)" },
  { value: "ja-JP", label: "Japanese" },
  { value: "ko-KR", label: "Korean" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "hi-IN", label: "Hindi" },
  { value: "ar-SA", label: "Arabic" },
];

export function TranscriberConfigSection() {
  const { transcriberConfig, updateTranscriberConfig } = useAgentStore();

  return (
    <CollapsibleSection
      title="Transcriber Settings"
      icon={<AudioLines className="w-4 h-4" />}
    >
      <div className="space-y-3">
        {/* Provider */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Provider</Label>
          <Select
            value={transcriberConfig.provider}
            onValueChange={(value) => {
              if (value) updateTranscriberConfig({ provider: value as TranscriberProvider });
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {transcriberProviders.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Language</Label>
          <Select
            value={transcriberConfig.language}
            onValueChange={(value) => {
              if (value) updateTranscriberConfig({ language: value });
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Toggle Settings */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Streaming</Label>
            <Switch
              checked={transcriberConfig.streaming}
              onCheckedChange={(checked) =>
                updateTranscriberConfig({ streaming: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Auto Detect Language
            </Label>
            <Switch
              checked={transcriberConfig.autoDetect}
              onCheckedChange={(checked) =>
                updateTranscriberConfig({ autoDetect: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Noise Reduction
            </Label>
            <Switch
              checked={transcriberConfig.noiseReduction}
              onCheckedChange={(checked) =>
                updateTranscriberConfig({ noiseReduction: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Punctuation
            </Label>
            <Switch
              checked={transcriberConfig.punctuation}
              onCheckedChange={(checked) =>
                updateTranscriberConfig({ punctuation: checked })
              }
            />
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
