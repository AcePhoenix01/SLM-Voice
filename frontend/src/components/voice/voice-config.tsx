"use client";

import { useAgentStore } from "@/store/agent-store";
import { CollapsibleSection } from "@/components/settings/collapsible-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic } from "lucide-react";
import type { VoiceProvider, BackgroundSound } from "@/types/agent";

const voiceProviders: { value: VoiceProvider; label: string }[] = [
  { value: "elevenlabs", label: "ElevenLabs" },
  { value: "browser", label: "Browser Native (Free)" },
];

const voiceModels: Record<string, { value: string; label: string }[]> = {
  elevenlabs: [
    { value: "eleven_turbo_v2", label: "Turbo v2" },
    { value: "eleven_multilingual_v2", label: "Multilingual v2" },
    { value: "eleven_monolingual_v1", label: "Monolingual v1" },
  ],
  browser: [
    { value: "default", label: "System Default Voice" },
  ],
};

const voiceOptions: Record<string, string[]> = {
  elevenlabs: ["Rachel", "Domi", "Bella", "Antoni", "Elli", "Josh", "Arnold", "Adam", "Sam"],
  browser: ["Default", "Male", "Female"],
};

export function VoiceConfigSection() {
  const { voiceConfig, updateVoiceConfig } = useAgentStore();

  return (
    <CollapsibleSection
      title="Voice Configuration"
      icon={<Mic className="w-4 h-4" />}
      defaultOpen={true}
    >
      <div className="space-y-3">
        {/* Provider */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Provider</Label>
          <Select
            value={voiceConfig.provider}
            onValueChange={(value) => {
              if (!value) return;
              const v = value as VoiceProvider;
              updateVoiceConfig({
                provider: v,
                model: voiceModels[v]?.[0]?.value || "",
                voice: voiceOptions[v]?.[0] || "",
              });
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voiceProviders.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Model</Label>
          <Select
            value={voiceConfig.model}
            onValueChange={(value) => {
              if (value) updateVoiceConfig({ model: value });
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(voiceModels[voiceConfig.provider] || []).map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Voice</Label>
          <Select
            value={voiceConfig.voice}
            onValueChange={(value) => {
              if (value) updateVoiceConfig({ voice: value });
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(voiceOptions[voiceConfig.provider] || []).map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>



        {/* Input Minimum Characters */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Input Min Characters
          </Label>
          <Input
            type="number"
            value={voiceConfig.inputMinimumCharacters}
            onChange={(e) =>
              updateVoiceConfig({
                inputMinimumCharacters: parseInt(e.target.value) || 0,
              })
            }
            min={1}
            max={20}
            className="h-8 text-sm"
          />
        </div>

        {/* Punctuation Boundary */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            Punctuation Boundary
          </Label>
          <Switch
            checked={voiceConfig.punctuationBoundary}
            onCheckedChange={(checked) =>
              updateVoiceConfig({ punctuationBoundary: checked })
            }
          />
        </div>

        {/* Stability Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Stability</Label>
            <span className="text-xs text-muted-foreground font-mono">
              {voiceConfig.stability.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[voiceConfig.stability]}
            onValueChange={(val) => {
              const value = Array.isArray(val) ? val[0] : (val as unknown as number);
              updateVoiceConfig({ stability: value });
            }}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/60">
            <span>Variable</span>
            <span>Stable</span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
