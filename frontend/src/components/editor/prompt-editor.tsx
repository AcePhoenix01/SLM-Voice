"use client";

import { useAgentStore } from "@/store/agent-store";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Undo2,
  Redo2,
  FileText,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ToolbarAction {
  icon: React.ElementType;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean;
}

const toolbarActions: ToolbarAction[] = [
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**" },
  { icon: Italic, label: "Italic", prefix: "_", suffix: "_" },
  { icon: Underline, label: "Underline", prefix: "<u>", suffix: "</u>" },
];

const listActions: ToolbarAction[] = [
  {
    icon: List,
    label: "Bullet List",
    prefix: "- ",
    suffix: "",
    block: true,
  },
  {
    icon: ListOrdered,
    label: "Numbered List",
    prefix: "1. ",
    suffix: "",
    block: true,
  },
];

const linkAction: ToolbarAction = {
  icon: Link2,
  label: "Insert Link",
  prefix: "[",
  suffix: "](url)",
};

export function PromptEditor() {
  const { agent, updateAgent } = useAgentStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState<string[]>([agent.systemPrompt]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback(
    (text: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(text);
        // Keep only last 50 states
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [historyIndex]
  );

  const handleTextChange = (value: string) => {
    updateAgent({ systemPrompt: value });
    pushHistory(value);
  };

  const insertFormatting = (action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = agent.systemPrompt;
    const selected = text.substring(start, end);

    let newText: string;
    let newCursorPos: number;

    if (action.block) {
      // For block-level formatting (lists), prefix each line
      const beforeSelection = text.substring(0, start);
      const lastNewline = beforeSelection.lastIndexOf("\n");
      const lineStart = lastNewline + 1;

      if (selected) {
        const lines = selected.split("\n");
        const formattedLines = lines.map((line, i) => {
          const prefix = action.label === "Numbered List" ? `${i + 1}. ` : action.prefix;
          return `${prefix}${line}`;
        });
        newText =
          text.substring(0, start) +
          formattedLines.join("\n") +
          text.substring(end);
        newCursorPos = start + formattedLines.join("\n").length;
      } else {
        newText =
          text.substring(0, lineStart) +
          action.prefix +
          text.substring(lineStart);
        newCursorPos = start + action.prefix.length;
      }
    } else {
      if (selected) {
        newText =
          text.substring(0, start) +
          action.prefix +
          selected +
          action.suffix +
          text.substring(end);
        newCursorPos = end + action.prefix.length + action.suffix.length;
      } else {
        newText =
          text.substring(0, start) +
          action.prefix +
          action.suffix +
          text.substring(end);
        newCursorPos = start + action.prefix.length;
      }
    }

    updateAgent({ systemPrompt: newText });
    pushHistory(newText);

    // Restore focus and cursor position
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      updateAgent({ systemPrompt: history[newIndex] });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      updateAgent({ systemPrompt: history[newIndex] });
    }
  };

  const wordCount = agent.systemPrompt
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          System Prompt
        </Label>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>

      <div
        className={cn(
          "rounded-lg border border-border bg-card/50 overflow-hidden transition-all",
          "focus-within:ring-1 focus-within:ring-ring focus-within:border-ring"
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
          {/* Formatting Actions */}
          {toolbarActions.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.label}>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting(action)}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom" className="text-xs">
                  {action.label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          <Separator orientation="vertical" className="h-4 mx-1" />

          {/* List Actions */}
          {listActions.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.label}>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting(action)}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom" className="text-xs">
                  {action.label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Link Action */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => insertFormatting(linkAction)}
                >
                  <Link2 className="w-3.5 h-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Insert Link
            </TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Undo / Redo */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Undo
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Redo
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={agent.systemPrompt}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter your system prompt here..."
          className={cn(
            "w-full bg-transparent px-3 py-3 text-sm leading-relaxed resize-none outline-none",
            "placeholder:text-muted-foreground/40 font-mono",
            isExpanded ? "min-h-[500px]" : "min-h-[280px]"
          )}
          spellCheck={false}
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-muted/20 text-[10px] text-muted-foreground/60">
          <span>Markdown supported</span>
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>{agent.systemPrompt.length} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
