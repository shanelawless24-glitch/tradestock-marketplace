"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

type StatusType = "dealer" | "subscription" | "ticket";

interface StatusBadgeProps {
  type: StatusType;
  status: string;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[type][status as keyof typeof STATUS_COLORS[typeof type]] ||
    "bg-gray-100 text-gray-800 border-gray-200";

  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    suspended: "Suspended",
    removed: "Removed",
    trialing: "Trialing",
    active: "Active",
    past_due: "Past Due",
    canceled: "Canceled",
    unpaid: "Unpaid",
    inactive: "Inactive",
    open: "Open",
    bot_handling: "Bot Handling",
    escalated: "Escalated",
    closed: "Closed",
  };

  return (
    <Badge
      variant="outline"
      className={cn("capitalize", colors, className)}
    >
      {labels[status] || status}
    </Badge>
  );
}
