
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_user
from app.models.chat import ChatMessage, Handoff
from app.models.lead import Lead
from app.models.user import User
from app.schemas.chat import ChatRequest, HandoffRequest
from app.services.ai_service import generate_assistant_response


router = APIRouter(tags=["AI Assistant"])


@router.get("/chat/{lead_id}")
def get_chat_history(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(404, "Lead not found.")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.lead_id == lead_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return [
        {
            "id": message.id,
            "lead_id": message.lead_id,
            "sender": message.sender,
            "message": message.message,
            "language": message.language,
            "created_at": message.created_at,
        }
        for message in messages
    ]


@router.post("/chat")
def send_chat_message(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == payload.lead_id
    ).first()

    if not lead:
        raise HTTPException(404, "Lead not found.")

    user_message = ChatMessage(
        lead_id=lead.id,
        sender="user",
        message=payload.message,
        language=payload.language,
    )

    db.add(user_message)
    db.flush()

    reply = generate_assistant_response(
        db=db,
        lead=lead,
        message=payload.message,
    )

    assistant_message = ChatMessage(
        lead_id=lead.id,
        sender="assistant",
        message=reply,
        language=payload.language,
    )

    db.add(assistant_message)
    db.commit()

    db.refresh(user_message)
    db.refresh(assistant_message)

    return {
        "reply": reply,
        "user_message": {
            "id": user_message.id,
            "sender": user_message.sender,
            "message": user_message.message,
        },
        "assistant_message": {
            "id": assistant_message.id,
            "sender": assistant_message.sender,
            "message": assistant_message.message,
        },
        "handoff_required": False,
    }


@router.post("/handoff")
def request_handoff(
    payload: HandoffRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == payload.lead_id
    ).first()

    if not lead:
        raise HTTPException(404, "Lead not found.")

    executive = None

    if payload.executive:
        executive = db.query(User).filter(
            User.full_name == payload.executive,
            User.is_active.is_(True),
        ).first()

        if not executive:
            raise HTTPException(
                404,
                "Selected sales executive not found.",
            )

    elif current_user.role == "sales_executive":
        executive = current_user

    else:
        executive = db.query(User).filter(
            User.role == "sales_executive",
            User.is_active.is_(True),
        ).order_by(User.id.asc()).first()

    if executive:
        lead.assigned_to_id = executive.id

    lead.status = "contacted"

    summary = (
        payload.summary.strip()
        if payload.summary
        else "Buyer requested a sales representative."
    )

    handoff = Handoff(
        lead_id=lead.id,
        assigned_to=executive.id if executive else None,
        summary=summary,
        status="pending",
    )

    db.add(handoff)

    db.add(
        ChatMessage(
            lead_id=lead.id,
            sender="system",
            message=f"Human handoff requested. {summary}",
            language="en",
        )
    )

    db.commit()
    db.refresh(handoff)

    return {
        "success": True,
        "handoff_id": handoff.id,
        "lead_id": lead.id,
        "assigned_executive": (
            executive.full_name if executive else None
        ),
        "message": "Handoff request recorded.",
    }
