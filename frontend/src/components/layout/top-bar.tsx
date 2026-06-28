"use client";

import { useAgentStore } from "@/store/agent-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Phone,
  MessageSquare,
  PhoneCall,
  Save,
  Rocket,
  Circle,
  Pencil,
  Check,
  X,
  PanelRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function TopBar() {
  const { agent, updateAgent, saveAgent, publishAgent, ui, toggleRightPanel, toggleTestChat, toggleTestCall } =
    useAgentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(agent.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveName = () => {
    if (editName.trim()) {
      updateAgent({ name: editName.trim() });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(agent.name);
    setIsEditing(false);
  };

  const handleSave = () => {
    saveAgent();
    toast.success("Agent saved", {
      description: "All changes have been saved successfully.",
    });
  };

  const handlePublish = () => {
    publishAgent();
    toast.success("Agent published", {
      description: "Your agent is now live and ready to take calls.",
    });
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 glass-subtle shrink-0 z-20">
      {/* Left section: Agent name + status */}
      <div className="flex items-center gap-3 min-w-0">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              <Input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="h-8 w-48 text-sm font-medium"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleSaveName}
              >
                <Check className="w-3.5 h-3.5 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCancelEdit}
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </motion.div>
          ) : (
            <motion.button
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-2 hover:bg-accent rounded-md px-2 py-1 transition-colors"
            >
              <h1 className="text-sm font-semibold truncate max-w-[200px]">
                {agent.name}
              </h1>
              <Pencil className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/70 transition-colors" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <Badge
            variant={agent.status === "published" ? "default" : "secondary"}
            className="text-[11px] px-2 py-0.5 font-medium capitalize"
          >
            {agent.status === "published" ? (
              <Circle className="w-1.5 h-1.5 fill-green-400 text-green-400 mr-1" />
            ) : (
              <Circle className="w-1.5 h-1.5 fill-amber-400 text-amber-400 mr-1" />
            )}
            {agent.status}
          </Badge>

          <AnimatePresence>
            {agent.hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge
                  variant="outline"
                  className="text-[11px] px-2 py-0.5 font-medium text-amber-500 border-amber-500/30"
                >
                  Unsaved changes
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right section: Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 hidden sm:flex"
          onClick={toggleTestCall}
        >
          <Phone className="w-3.5 h-3.5" />
          Test Call
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 hidden sm:flex"
          onClick={toggleTestChat}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Test Chat
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 hidden md:flex"
          onClick={() =>
            toast.info("Add a calling number", {
              description: "Configure a phone number for your agent.",
            })
          }
        >
          <PhoneCall className="w-3.5 h-3.5" />
          Add Number
        </Button>

        <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 text-xs gap-1.5",
            agent.hasUnsavedChanges && "border-amber-500/50 text-amber-600 dark:text-amber-400"
          )}
          onClick={handleSave}
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>

        <Button
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={handlePublish}
        >
          <Rocket className="w-3.5 h-3.5" />
          Publish
        </Button>

        <div className="w-px h-5 bg-border mx-1 hidden lg:block" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hidden lg:flex"
          onClick={toggleRightPanel}
        >
          <PanelRight
            className={cn(
              "w-4 h-4 transition-colors",
              ui.rightPanelOpen ? "text-primary" : "text-muted-foreground"
            )}
          />
        </Button>
      </div>
    </header>
  );
}
