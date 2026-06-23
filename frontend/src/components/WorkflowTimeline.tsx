"use client";

import type { WorkflowHistoryEntry } from "@/lib/types";

interface WorkflowTimelineProps {
  history: WorkflowHistoryEntry[];
  userNameMap: Record<number, string>;
}

const actionLabels: Record<string, string> = {
  SUBMIT: "Submitted",
  APPROVE: "Approved",
  REJECT: "Rejected",
  REVERT: "Reverted",
  CONFIRM: "Confirmed",
  SIGN: "Signed",
};

export default function WorkflowTimeline({ history, userNameMap }: WorkflowTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No workflow history yet.
      </div>
    );
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sorted.map((entry, idx) => {
          const isLast = idx === sorted.length - 1;
          const label = actionLabels[entry.action] || entry.action;
          const userName = entry.actioned_by
            ? userNameMap[entry.actioned_by] || `User #${entry.actioned_by}`
            : "System";
          const date = new Date(entry.timestamp).toLocaleString();

          return (
            <li key={entry.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex gap-6">
                  <div className="flex-shrink-0">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                        entry.action === "REJECT"
                          ? "bg-red-500"
                          : entry.action === "APPROVE" || entry.action === "CONFIRM" || entry.action === "SIGN"
                          ? "bg-green-500"
                          : entry.action === "SUBMIT"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {entry.action === "REJECT"
                        ? "✕"
                        : entry.action === "APPROVE" || entry.action === "CONFIRM" || entry.action === "SIGN"
                        ? "✓"
                        : entry.action === "REVERT"
                        ? "↩"
                        : "→"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{label}</span>
                      <span className="text-gray-500"> by {userName}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {entry.old_state} → {entry.new_state}
                    </div>
                    {entry.comment && (
                      <div className="mt-1 text-sm text-gray-600 bg-gray-50 rounded p-2">
                        {entry.comment}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-gray-400">{date}</div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
