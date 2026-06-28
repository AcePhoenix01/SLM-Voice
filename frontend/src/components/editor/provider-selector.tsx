"use client";

import { useAgentStore } from "@/store/agent-store";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AIProvider } from "@/types/agent";
import { Bot, Sparkles, Brain, Cpu, Wrench } from "lucide-react";

const providers: {
  value: AIProvider;
  label: string;
  icon: React.ElementType;
  models: { value: string; label: string }[];
}[] = [
  {
    value: "google",
    label: "Google AI Studio",
    icon: Bot,
    models: [
      { value: "gemma-4-26b-a4b-it", label: "Gemma 4 (26B)" },
      { value: "gemma-2-9b-it", label: "Gemma 2 (9B)" },
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    ],
  },
  {
    value: "mistral",
    label: "Mistral AI",
    icon: Brain,
    models: [
      { value: "open-mistral-7b", label: "Mistral 7B" },
      { value: "mistral-small-latest", label: "Mistral Small" },
    ],
  },
  {
    value: "openrouter",
    label: "OpenRouter (Open SLMs)",
    icon: Sparkles,
    models: [
      { value: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", label: "Nemotron 3 Nano Omni (Free)" },
      { value: "meta-llama/llama-3-8b-instruct:free", label: "Llama 3 (8B) (Free)" },
      { value: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B (Free)" },
    ],
  },
  {
    value: "custom",
    label: "Custom API endpoint",
    icon: Wrench,
    models: [{ value: "custom", label: "Custom Model" }],
  },
];

export function ProviderSelector() {
  const { agent, updateAgent } = useAgentStore();

  const currentProvider = providers.find((p) => p.value === agent.provider);
  const models = currentProvider?.models || [];

  return (
    <div className="flex items-end gap-4">
      {/* Provider */}
      <div className="space-y-1.5 flex-1">
        <Label className="text-xs font-medium text-muted-foreground">
          AI Provider
        </Label>
        <Select
          value={agent.provider}
          onValueChange={(value) => {
            if (!value) return;
            const newProvider = providers.find((p) => p.value === value);
            updateAgent({
              provider: value as AIProvider,
              model: newProvider?.models[0]?.value || "",
            });
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {providers.map((p) => {
              const Icon = p.icon;
              return (
                <SelectItem key={p.value} value={p.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{p.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Model */}
      <div className="space-y-1.5 flex-1">
        <Label className="text-xs font-medium text-muted-foreground">
          Model
        </Label>
        <Select
          value={agent.model}
          onValueChange={(value) => {
            if (value) updateAgent({ model: value });
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
