
from sqlalchemy.orm import Session

from app.models.lead import Lead
from app.models.project import Project, FactSheet


def generate_assistant_response(
    db: Session,
    lead: Lead,
    message: str,
) -> str:
    text = message.lower().strip()

    project = None

    if lead.project_id:
        project = db.query(Project).filter(
            Project.id == lead.project_id,
            Project.is_active.is_(True),
        ).first()

    if any(word in text for word in ["hello", "hi", "hey", "namaste"]):
        return (
            f"Hello {lead.name}! Welcome to EstateIQ AI. "
            "Are you looking for a 2 BHK or 3 BHK apartment?"
        )

    if any(word in text for word in ["human", "person", "executive", "agent", "call me"]):
        return (
            "Certainly. I can connect you with a sales executive "
            "who can assist you further."
        )

    if not project:
        return (
            "I couldn't find a verified project linked to your enquiry. "
            "I can connect you with our sales team for assistance."
        )

    facts = db.query(FactSheet).filter(
        FactSheet.project_id == project.id,
        FactSheet.is_verified.is_(True),
    ).all()

    fact_map = {
        fact.key.lower(): fact.value
        for fact in facts
    }

    if any(word in text for word in ["location", "where", "address"]):
        location = fact_map.get("location") or project.location

        if location:
            return (
                f"{project.name} is located at {location}. "
                "Would you like to arrange a site visit?"
            )

        return (
            "I don't have verified location information available. "
            "I'll connect you with our sales team."
        )

    if any(word in text for word in ["price", "cost", "rate", "budget"]):
        price_fact = fact_map.get("price_range")

        if price_fact:
            return (
                f"The verified recorded price range is {price_fact}. "
                "Please contact our sales team for the final quotation."
            )

        return (
            "I don't have a verified price range available. "
            "Our sales team can confirm the latest pricing and offers."
        )

    if any(word in text for word in ["possession", "handover"]):
        possession = fact_map.get("possession")

        if possession:
            return f"The recorded possession information is {possession}."

        return (
            "I don't have verified possession information available. "
            "I'll connect you with our sales team for confirmation."
        )

    if any(word in text for word in ["amenities", "facilities", "features"]):
        amenities = fact_map.get("amenities")

        if amenities:
            return f"The verified project amenities are: {amenities}."

        return (
            "I don't have a verified amenities list available. "
            "Our sales team can share the confirmed details."
        )

    if any(word in text for word in ["2 bhk", "3 bhk", "configuration", "bedroom"]):
        configuration = (
            fact_map.get("configuration")
            or project.configuration
        )

        if configuration:
            return (
                f"The recorded configurations for {project.name} are "
                f"{configuration}."
            )

        return (
            "I'll confirm the available apartment configurations "
            "with our sales team."
        )

    if any(word in text for word in ["visit", "appointment", "book", "schedule"]):
        return (
            "I'd be happy to help arrange a site visit. "
            "Which date would you prefer?"
        )

    return (
        f"Thank you for your interest in {project.name}. "
        "I can help with verified project details and site visits. "
        "Would you like to speak with a sales executive?"
    )
