"use client";

import { useAgentStore } from "@/store/agent-store";
import { CollapsibleSection } from "@/components/settings/collapsible-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

export function UserInfoSection() {
  const { userInfo, updateUserInfo } = useAgentStore();

  return (
    <CollapsibleSection
      title="User Info"
      icon={<User className="w-4 h-4" />}
      defaultOpen={true}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="user-name" className="text-xs text-muted-foreground">
            Name
          </Label>
          <Input
            id="user-name"
            value={userInfo.name}
            onChange={(e) => updateUserInfo({ name: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="user-company"
            className="text-xs text-muted-foreground"
          >
            Company
          </Label>
          <Input
            id="user-company"
            value={userInfo.company}
            onChange={(e) => updateUserInfo({ company: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="user-email"
            className="text-xs text-muted-foreground"
          >
            Email
          </Label>
          <Input
            id="user-email"
            type="email"
            value={userInfo.email}
            onChange={(e) => updateUserInfo({ email: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}
