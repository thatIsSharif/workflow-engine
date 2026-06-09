# State Machine — NOC Workflow

Sourced from `backend/app/workflow/config/workflows.json`.

```mermaid
stateDiagram-v2
    [*] --> DRAFT : POST /noc/ (create)

    DRAFT --> OFFICER_REVIEW : SUBMIT\n[role: PRO]

    OFFICER_REVIEW --> CONTROLLER_REVIEW : APPROVE\n[role: OFFICER]
    OFFICER_REVIEW --> REJECTED : REJECT\n[role: OFFICER]
    OFFICER_REVIEW --> DRAFT : REVERT\n[role: OFFICER]

    CONTROLLER_REVIEW --> HEAD_APPROVAL : APPROVE\n[role: CONTROLLER]
    CONTROLLER_REVIEW --> REJECTED : REJECT\n[role: CONTROLLER]

    HEAD_APPROVAL --> APPROVED : APPROVE\n[role: HEAD]
    HEAD_APPROVAL --> REJECTED : REJECT\n[role: HEAD]

    APPROVED --> [*]
    REJECTED --> [*]
```

## States

| State | Description |
|---|---|
| `DRAFT` | NOC created, pending PRO submission |
| `OFFICER_REVIEW` | Submitted, under Officer review |
| `CONTROLLER_REVIEW` | Officer approved, under Controller review |
| `HEAD_APPROVAL` | Controller approved, pending Head sign-off |
| `APPROVED` | Fully approved — terminal state |
| `REJECTED` | Rejected at any stage — terminal state |

## Transitions

| From | Action | To | Role Required |
|---|---|---|---|
| DRAFT | SUBMIT | OFFICER_REVIEW | PRO |
| OFFICER_REVIEW | APPROVE | CONTROLLER_REVIEW | OFFICER |
| OFFICER_REVIEW | REJECT | REJECTED | OFFICER |
| OFFICER_REVIEW | REVERT | DRAFT | OFFICER |
| CONTROLLER_REVIEW | APPROVE | HEAD_APPROVAL | CONTROLLER |
| CONTROLLER_REVIEW | REJECT | REJECTED | CONTROLLER |
| HEAD_APPROVAL | APPROVE | APPROVED | HEAD |
| HEAD_APPROVAL | REJECT | REJECTED | HEAD |
