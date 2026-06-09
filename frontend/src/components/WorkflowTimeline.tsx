'use client';

import type { WorkflowHistoryEntry } from '@/types';
import { formatState, getActionLabel } from '@/lib/workflow';

interface TimelineProps {
  history: WorkflowHistoryEntry[];
}

const actionColors: Record<string, string> = {
  SUBMIT: 'bg-blue-500',
  APPROVE: 'bg-green-500',
  REJECT: 'bg-red-500',
  REVERT: 'bg-yellow-500',
  SIGN: 'bg-indigo-500',
  CONFIRM: 'bg-teal-500',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WorkflowTimeline({ history }: TimelineProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No workflow history yet.
      </div>
    );
  }

  const sorted = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sorted.map((entry, idx) => {
          const isLast = idx === sorted.length - 1;
          const color = actionColors[entry.action] || 'bg-gray-500';

          return (
            <li key={entry.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${color}`}
                    >
                      <span className="text-white text-xs font-bold">
                        {entry.action.charAt(0)}
                      </span>
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{getActionLabel(entry.action as any)}</span>
                        {' '}—{' '}
                        <span className="text-gray-500">
                          {formatState(entry.old_state)}
                        </span>
                        {' → '}
                        <span className="font-medium">
                          {formatState(entry.new_state)}
                        </span>
                      </p>
                      {entry.comment && (
                        <p className="mt-1 text-sm text-gray-600 italic">
                          &ldquo;{entry.comment}&rdquo;
                        </p>
                      )}
                      {entry.actioned_by && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          Actioned by user #{entry.actioned_by}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={entry.timestamp}>{formatDate(entry.timestamp)}</time>
                    </div>
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
