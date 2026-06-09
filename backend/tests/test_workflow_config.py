from pathlib import Path

import pytest

from app.utils.validate_workflow import load_strict_json, validate_workflow_config
from app.workflow.config_loader import ConfigLoader


def test_workflow_config_loads_and_exposes_pending_roles():
    loader = ConfigLoader()

    assert loader.find_transition("NOC", "DRAFT", "SUBMIT") == {
        "to": "OFFICER_REVIEW",
        "roles": ["PRO"],
    }
    assert loader.get_pending_roles("NOC", "OFFICER_REVIEW") == ["OFFICER"]
    assert loader.get_pending_roles("NOC", "CONFIRMED") == []


def test_duplicate_transition_keys_fail(tmp_path: Path):
    config_path = tmp_path / "workflows.json"
    config_path.write_text(
        """
        {
          "NOC": {
            "states": ["DRAFT", "APPROVED", "REJECTED"],
            "transitions": {
              "DRAFT:APPROVE": {"to": "APPROVED", "roles": ["HEAD"]},
              "DRAFT:APPROVE": {"to": "REJECTED", "roles": ["HEAD"]}
            }
          }
        }
        """,
        encoding="utf-8",
    )

    with pytest.raises(ValueError, match="Duplicate JSON key"):
        load_strict_json(config_path)


def test_approve_cannot_transition_to_rejected():
    config = {
        "NOC": {
            "states": ["DRAFT", "HEAD_APPROVAL", "APPROVED", "REJECTED"],
            "transitions": {
                "DRAFT:SUBMIT": {"to": "HEAD_APPROVAL", "roles": ["PRO"]},
                "HEAD_APPROVAL:APPROVE": {"to": "REJECTED", "roles": ["HEAD"]},
            },
        }
    }
    rules = {
        "action_rules": {"APPROVE": {"forbidden_to_states": ["REJECTED"]}},
        "allowed_actions": ["SUBMIT", "APPROVE"],
        "allow_self_loops": False,
        "initial_state_strategy": "FIRST_STATE",
        "terminal_state_strategy": "NO_OUTGOING_TRANSITIONS",
    }

    with pytest.raises(ValueError, match="APPROVE cannot transition to REJECTED"):
        validate_workflow_config(config, rules)


def test_submit_only_from_initial_state():
    config = {
        "NOC": {
            "states": ["DRAFT", "OFFICER_REVIEW", "APPROVED"],
            "transitions": {
                "DRAFT:SUBMIT": {"to": "OFFICER_REVIEW", "roles": ["PRO"]},
                "OFFICER_REVIEW:SUBMIT": {"to": "APPROVED", "roles": ["PRO"]},
            },
        }
    }
    rules = {
        "action_rules": {"SUBMIT": {"from_initial_state_only": True}},
        "allowed_actions": ["SUBMIT"],
        "allow_self_loops": False,
        "initial_state_strategy": "FIRST_STATE",
        "terminal_state_strategy": "NO_OUTGOING_TRANSITIONS",
    }

    with pytest.raises(ValueError, match="SUBMIT is only allowed from DRAFT"):
        validate_workflow_config(config, rules)


def test_unknown_action_fails():
    config = {
        "NOC": {
            "states": ["DRAFT", "OFFICER_REVIEW", "REJECTED"],
            "transitions": {
                "DRAFT:SUBMIT": {"to": "OFFICER_REVIEW", "roles": ["PRO"]},
                "OFFICER_REVIEW:ESCALATE": {"to": "REJECTED", "roles": ["OFFICER"]},
            },
        }
    }
    rules = {
        "action_rules": {},
        "allowed_actions": ["SUBMIT", "APPROVE", "REJECT"],
        "allow_self_loops": False,
        "initial_state_strategy": "FIRST_STATE",
        "terminal_state_strategy": "NO_OUTGOING_TRANSITIONS",
    }

    with pytest.raises(ValueError, match="action ESCALATE is not allowed"):
        validate_workflow_config(config, rules)
