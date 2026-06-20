'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/UserContext';
import { ActionButtons } from './ActionButtons';
import { WorkflowTimeline } from './WorkflowTimeline';
import { StatusBadge } from './WorkflowStatus';
import type { ModuleType, DomainReadBase, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';
import { MODULE_LABELS, MODULE_ICONS } from '@/types';

interface FieldDisplay {
  label: string;
  value: string | number | null | undefined;
}

interface ModuleDetailProps {
  module: ModuleType;
  item: DomainReadBase & Record<string, any>;
  fields: FieldDisplay[];
  onAction: (action: ActionType, comment?: string) => Promise<void>;
  history?: WorkflowHistoryEntry[];
  status?: ApplicationStatusResponse | null;
  loading?: boolean;
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{String(value)}</dd>
    </div>
  );
}

export function ModuleDetail({ module: mod, item, fields, onAction, history, status, loading }: ModuleDetailProps) {
  const { user } = useUser();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/${mod.toLowerCase()}`}
          className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
        >
          ← Back to {MODULE_LABELS[mod]} list
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{MODULE_ICONS[mod]}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {MODULE_LABELS[mod]} Details
              </h1>
              <p className="text-sm text-gray-500">ID: {item.id}</p>
            </div>
          </div>
          <StatusBadge status={item.status} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Application Information</h2>
            </div>
            <div className="divide-y divide-gray-200">
              <InfoRow label="ID" value={item.id} />
              <InfoRow label="Status" value={item.status} />
              <InfoRow label="Version" value={item.version} />
              <InfoRow label="Created By (User ID)" value={item.created_by} />
              <InfoRow label="Created At" value={item.created_at ? new Date(item.created_at).toLocaleString() : null} />
              <InfoRow label="Updated At" value={item.updated_at ? new Date(item.updated_at).toLocaleString() : null} />
              {fields.map((f) => (
                <InfoRow key={f.label} label={f.label} value={f.value} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Workflow History</h2>
            </div>
            <div className="p-6">
              <WorkflowTimeline history={history || []} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Workflow Status</h2>
            </div>
            <div className="p-6">
              {status ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Current State</span>
                    <StatusBadge status={status.current_state} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last Action</span>
                    <span className="text-sm font-medium">{status.last_action || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Submitted By</span>
                    <span className="text-sm font-medium">{status.submitted_by ? `User #${status.submitted_by}` : 'N/A'}</span>
                  </div>
                  {status.pending_roles && status.pending_roles !== '[]' && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">Pending Roles</span>
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(status.pending_roles).map((role: string) => (
                          <span key={role} className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading status...</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Actions</h2>
            </div>
            <div className="p-6">
              <ActionButtons
                module={mod}
                currentState={item.status}
                onAction={onAction}
                onRefresh={() => {}}
                status={status}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
