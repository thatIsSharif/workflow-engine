"use client";

import { useState } from "react";
import type { ModuleType } from "@/lib/types";
import { getAvailableActions } from "@/lib/types";
import { performAction } from "@/lib/api";

interface ActionButtonsProps {
  module: ModuleType;
  applicationId: string;
  currentState: string;
  userRole: string;
  userId: number;
  onActionComplete: () => void;
}

const actionColors: Record<string, string> = {
  SUBMIT: "bg-blue-600 hover:bg-blue-700",
  APPROVE: "bg-green-600 hover:bg-green-700",
  REJECT: "bg-red-600 hover:bg-red-700",
  REVERT: "bg-amber-600 hover:bg-amber-700",
  CONFIRM: "bg-teal-600 hover:bg-teal-700",
  SIGN: "bg-indigo-600 hover:bg-indigo-700",
};

export default function ActionButtons({
  module,
  applicationId,
  currentState,
  userRole,
  userId,
  onActionComplete,
}: ActionButtonsProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showComment, setShowComment] = useState<string | null>(null);

  const availableActions = getAvailableActions(module, currentState, userRole);

  if (availableActions.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No actions available for your role in the current state.
      </div>
    );
  }

  const handleAction = async (action: string) => {
    setLoading(action);
    setError("");
    try {
      await performAction(module, applicationId, action, userId, comment || undefined);
      setComment("");
      setShowComment(null);
      onActionComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(null);
    }
  };

  const actionLabel = (a: string) => {
    switch (a) {
      case "REJECT": return "Reject";
      case "REVERT": return "Revert";
      default: return a.charAt(0) + a.slice(1).toLowerCase();
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {availableActions.map((action) => {
          const needsComment = action === "REJECT" || action === "REVERT";
          const color = actionColors[action] || "bg-gray-600 hover:bg-gray-700";

          if (needsComment && showComment !== action) {
            return (
              <button
                key={action}
                onClick={() => setShowComment(action)}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${color}`}
              >
                {actionLabel(action)}
              </button>
            );
          }

          return (
            <div key={action} className="flex items-center gap-2">
              {needsComment && (
                <input
                  type="text"
                  placeholder="Add comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              <button
                onClick={() => handleAction(action)}
                disabled={loading === action}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  loading === action ? "opacity-50 cursor-not-allowed" : color
                }`}
              >
                {loading === action ? "Processing..." : actionLabel(action)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
