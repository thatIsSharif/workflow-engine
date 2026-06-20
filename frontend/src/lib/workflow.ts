import type { WorkflowConfigs, WorkflowConfig, ActionType, ModuleType } from '@/types';
import workflowsData from './workflows.json';

const workflows = workflowsData as WorkflowConfigs;

export function getAvailableActions(
  module: ModuleType,
  currentState: string,
  userRole: string
): { action: ActionType; toState: string }[] {
  const config = workflows[module];
  if (!config) return [];

  const actions: { action: ActionType; toState: string }[] = [];
  for (const [key, transition] of Object.entries(config.transitions)) {
    const [state, action] = key.split(':') as [string, ActionType];
    if (state === currentState && transition.roles.includes(userRole)) {
      actions.push({ action, toState: transition.to });
    }
  }
  return actions;
}

export function isTerminalState(module: ModuleType, state: string): boolean {
  const config = workflows[module];
  if (!config) return false;
  const terminalStates = config.states.filter((s) => {
    return !Object.keys(config.transitions).some((key) => key.startsWith(`${s}:`));
  });
  return terminalStates.includes(state);
}

export function getActionLabel(action: ActionType): string {
  const labels: Record<ActionType, string> = {
    SUBMIT: 'Submit',
    APPROVE: 'Approve',
    REJECT: 'Reject',
    REVERT: 'Revert',
    SIGN: 'Sign',
    CONFIRM: 'Confirm',
  };
  return labels[action] || action;
}

export function getActionColor(action: ActionType): string {
  const colors: Record<ActionType, string> = {
    SUBMIT: 'bg-blue-600 hover:bg-blue-700',
    APPROVE: 'bg-green-600 hover:bg-green-700',
    REJECT: 'bg-red-600 hover:bg-red-700',
    REVERT: 'bg-yellow-600 hover:bg-yellow-700',
    SIGN: 'bg-indigo-600 hover:bg-indigo-700',
    CONFIRM: 'bg-teal-600 hover:bg-teal-700',
  };
  return colors[action] || 'bg-gray-600 hover:bg-gray-700';
}

export function formatState(state: string): string {
  return state
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export { workflows };
