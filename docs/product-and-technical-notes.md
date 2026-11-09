# Product and technical notes

## Scope delivered
The prototype focuses on the required slice: lead list and duplicate checks, fact-sheet assistant, visit booking, reminders, human handoff and source analytics. It intentionally does not attempt to replace a full CRM.

## Key data rules
- Phone numbers are normalized before duplicate checks.
- A booking references a slot record, and `slot_id` is unique in the bookings table. The API checks availability and catches uniqueness conflicts.
- Only future slots marked available are offered.
- The assistant only uses the editable project fact sheet. If a question is not covered, it says a salesperson will confirm and offers handoff.
- The assistant never provides a final price or discount.
- Consent is stored independently from lead creation. Demo seed consent is synthetic.
- Message reminders are persisted as simulated records, not sent externally.

## Security and deployment boundary
The demo login is not production authentication. The SQLite default is for evaluation. For deployment, use PostgreSQL, migrations, JWT, password hashing, server-side role checks, secure secrets, rate limiting, and audit trails.

## RERA and DPDP
The UI labels registration IDs as placeholders. Never send promotional content until the actual project registration number and approved claims are entered. Capture purpose-specific consent, record timestamps and source, provide opt-out, and suppress future promotional contact after opt-out. Obtain approved WhatsApp templates and opt-in before WhatsApp messaging.
