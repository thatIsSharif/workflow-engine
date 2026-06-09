"""
Workflow configuration validation.
"""
import json
from pathlib import Path
from typing import Any

from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def _reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key found: {key}")
        result[key] = value
    return result


def load_strict_json(path: str | Path) -> dict[str, Any]:
    with open(Path(path), "r", encoding="utf-8") as f:
        return json.load(f, object_pairs_hook=_reject_duplicate_keys)


def _load_config_from_settings() -> dict[str, Any]:
    return load_strict_json(settings.workflow_config_path)


def _load_rules_from_settings() -> dict[str, Any]:
    return load_strict_json(settings.workflow_rules_path)


def validate_workflow_config(
    config: dict[str, Any] | None = None,
    rules: dict[str, Any] | None = None,
) -> None:
    config = config if config is not None else _load_config_from_settings()
    rules = rules if rules is not None else _load_rules_from_settings()

    action_rules = rules.get("action_rules", {})
    allowed_actions = set(rules.get("allowed_actions", []))
    allow_self_loops = bool(rules.get("allow_self_loops", False))
    initial_state_strategy = rules.get("initial_state_strategy", "FIRST_STATE")
    terminal_state_strategy = rules.get(
        "terminal_state_strategy", "NO_OUTGOING_TRANSITIONS"
    )
    require_all_states_reachable = bool(rules.get("require_all_states_reachable", True))
    require_path_to_terminal = bool(rules.get("require_path_to_terminal", True))

    for entity, definition in config.items():
        prefix = f"[{entity}]"
        states = definition.get("states")
        transitions = definition.get("transitions")

        if not isinstance(states, list) or not states:
            raise ValueError(f"{prefix} 'states' must be a non-empty list")
        if not all(isinstance(state, str) and state for state in states):
            raise ValueError(f"{prefix} all states must be non-empty strings")
        if not isinstance(transitions, dict):
            raise ValueError(f"{prefix} 'transitions' must be a dict")
        if allowed_actions and not all(isinstance(action, str) for action in allowed_actions):
            raise ValueError("'allowed_actions' must be a list[str]")
        if initial_state_strategy != "FIRST_STATE":
            raise ValueError("Only FIRST_STATE initial_state_strategy is supported")
        if terminal_state_strategy != "NO_OUTGOING_TRANSITIONS":
            raise ValueError(
                "Only NO_OUTGOING_TRANSITIONS terminal_state_strategy is supported"
            )

        state_set = set(states)
        initial_state = states[0]
        outgoing_states = {
            key.split(":")[0]
            for key in transitions
            if isinstance(key, str) and key.count(":") == 1
        }
        terminal_states = state_set - outgoing_states
        if not terminal_states:
            raise ValueError(f"{prefix} must have at least one terminal state")

        for key, transition in transitions.items():
            ref = f"{prefix} transition '{key}'"
            if not isinstance(key, str) or key.count(":") != 1:
                raise ValueError(f"{ref} key must follow STATE:ACTION")
            from_state, action = key.split(":")
            if key != key.upper() or not from_state or not action:
                raise ValueError(f"{ref} key must be uppercase STATE:ACTION")
            if allowed_actions and action not in allowed_actions:
                raise ValueError(f"{ref} action {action} is not allowed")
            if from_state not in state_set:
                raise ValueError(f"{ref} state '{from_state}' not in states")
            if from_state in terminal_states:
                raise ValueError(f"{ref} terminal state cannot have transitions")
            if not isinstance(transition, dict):
                raise ValueError(f"{ref} must be an object")

            to_state = transition.get("to")
            if to_state not in state_set:
                raise ValueError(f"{ref} has invalid 'to' state '{to_state}'")
            if not allow_self_loops and to_state == from_state:
                raise ValueError(f"{ref} self-loops are not allowed")

            roles = transition.get("roles")
            if (
                not isinstance(roles, list)
                or not roles
                or not all(isinstance(role, str) and role for role in roles)
            ):
                raise ValueError(f"{ref} 'roles' must be a non-empty list[str]")

            rule = action_rules.get(action, {})
            if rule.get("from_initial_state_only") and from_state != initial_state:
                raise ValueError(
                    f"{ref} action {action} is only allowed from {initial_state}"
                )

            required_to_state = rule.get("required_to_state")
            if required_to_state and to_state != required_to_state:
                raise ValueError(
                    f"{ref} action {action} must transition to {required_to_state}"
                )

            allowed_to_states = rule.get("allowed_to_states")
            if allowed_to_states and to_state not in allowed_to_states:
                raise ValueError(
                    f"{ref} action {action} can only transition to "
                    f"{', '.join(allowed_to_states)}"
                )

            forbidden_to_states = rule.get("forbidden_to_states", [])
            if to_state in forbidden_to_states:
                raise ValueError(
                    f"{ref} action {action} cannot transition to {to_state}"
                )

            forbidden_to_terminal_states = rule.get("forbidden_to_terminal_states", [])
            if to_state in terminal_states and to_state in forbidden_to_terminal_states:
                raise ValueError(
                    f"{ref} action {action} cannot transition to terminal {to_state}"
                )

        if require_all_states_reachable or require_path_to_terminal:
            _validate_workflow_graph(
                prefix=prefix,
                states=state_set,
                transitions=transitions,
                initial_state=initial_state,
                terminal_states=terminal_states,
                require_all_states_reachable=require_all_states_reachable,
                require_path_to_terminal=require_path_to_terminal,
            )

        logger.info(
            f"{prefix} config valid - {len(states)} states, "
            f"{len(transitions)} transitions"
        )


def _validate_workflow_graph(
    *,
    prefix: str,
    states: set[str],
    transitions: dict[str, Any],
    initial_state: str,
    terminal_states: set[str],
    require_all_states_reachable: bool,
    require_path_to_terminal: bool,
) -> None:
    graph: dict[str, set[str]] = {state: set() for state in states}
    for key, transition in transitions.items():
        from_state, _action = key.split(":")
        graph[from_state].add(transition["to"])

    reachable = _reachable_from(initial_state, graph)
    unreachable = states - reachable
    if require_all_states_reachable and unreachable:
        raise ValueError(f"{prefix} unreachable states: {', '.join(sorted(unreachable))}")

    if not require_path_to_terminal:
        return

    for state in states - terminal_states:
        if not _can_reach_terminal(state, graph, terminal_states):
            raise ValueError(f"{prefix} state '{state}' has no path to terminal state")


def _reachable_from(start: str, graph: dict[str, set[str]]) -> set[str]:
    seen: set[str] = set()
    stack = [start]
    while stack:
        state = stack.pop()
        if state in seen:
            continue
        seen.add(state)
        stack.extend(graph.get(state, set()) - seen)
    return seen


def _can_reach_terminal(
    start: str, graph: dict[str, set[str]], terminal_states: set[str]
) -> bool:
    return bool(_reachable_from(start, graph) & terminal_states)
