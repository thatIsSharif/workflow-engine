'use client';

import { formatState } from '@/lib/workflow';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  REQUESTED: 'bg-blue-100 text-blue-800',
  OFFICER_REVIEW: 'bg-orange-100 text-orange-800',
  CONTROLLER_REVIEW: 'bg-orange-100 text-orange-800',
  CONTROLLER_APPROVAL: 'bg-orange-100 text-orange-800',
  HEAD_APPROVAL: 'bg-purple-100 text-purple-800',
  ADMIN_REVIEW: 'bg-orange-100 text-orange-800',
  UNDER_REVIEW: 'bg-orange-100 text-orange-800',
  FINANCE_CONFIRMATION: 'bg-teal-100 text-teal-800',
  APPROVED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  SIGNED: 'bg-indigo-100 text-indigo-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${
        statusColors[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {formatState(status)}
    </span>
  );
}

export function StateIndicator({ state }: { state: string }) {
  const colorMap: Record<string, string> = {
    DRAFT: 'bg-gray-400',
    PENDING: 'bg-yellow-400',
    REQUESTED: 'bg-blue-400',
    OFFICER_REVIEW: 'bg-orange-400',
    CONTROLLER_REVIEW: 'bg-orange-400',
    CONTROLLER_APPROVAL: 'bg-orange-400',
    HEAD_APPROVAL: 'bg-purple-400',
    ADMIN_REVIEW: 'bg-orange-400',
    UNDER_REVIEW: 'bg-orange-400',
    FINANCE_CONFIRMATION: 'bg-teal-400',
    APPROVED: 'bg-green-500',
    COMPLETED: 'bg-green-500',
    SIGNED: 'bg-indigo-500',
    REJECTED: 'bg-red-500',
  };

  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${colorMap[state] || 'bg-gray-400'}`}
      title={formatState(state)}
    />
  );
}
