'use client';

import React, { useState } from 'react';
import { getAvailableActions, getActionLabel, getActionColor, isTerminalState } from '@/lib/workflow';
import type { ModuleType, ActionType, ApplicationStatusResponse } from '@/types';
import { useUser } from '@/lib/UserContext';

interface ActionButtonsProps {
  module: ModuleType;
  currentState: string;
  onAction: (action: ActionType, comment?: string) => Promise<void>;
  onRefresh: () => void;
  status?: ApplicationStatusResponse | null;
}

export function ActionButtons({ module, currentState, onAction, status }: ActionButtonsProps) {
  const { user } = useUser();
  const [actioning, setActioning] = useState<ActionType | null>(null);
  const [showConfirm, setShowConfirm] = useState<ActionType | null>(null);
  const [comment, setComment] = useState('');

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        Please select a user to perform actions.
      </div>
    );
  }

  if (isTerminalState(module, currentState)) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-500 text-center">
        This application is in a terminal state. No further actions are available.
      </div>
    );
  }

  const availableActions = getAvailableActions(module, currentState, user.role);

  if (availableActions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-500 text-center">
        No actions available for your role ({user.role}) in the current state.
      </div>
    );
  }

  const handleAction = async (action: ActionType) => {
    setActioning(action);
    try {
      await onAction(action, comment || undefined);
      setShowConfirm(null);
      setComment('');
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActioning(null);
    }
  };

  return (
    <div>
      {status?.last_comment && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Last comment:</div>
          <div className="text-sm text-gray-700 italic">&ldquo;{status.last_comment}&rdquo;</div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {availableActions.map(({ action, toState }) => (
          <div key={action}>
            {showConfirm === action ? (
              <div className="flex items-center gap-2 bg-white border rounded-lg p-3 shadow-sm">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment (optional)"
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 w-48"
                />
                <button
                  onClick={() => handleAction(action)}
                  disabled={actioning === action}
                  className={`px-3 py-1.5 rounded text-white text-sm font-medium ${getActionColor(action)} disabled:opacity-50`}
                >
                  {actioning === action ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(action)}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${getActionColor(action)}`}
              >
                {getActionLabel(action)}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
