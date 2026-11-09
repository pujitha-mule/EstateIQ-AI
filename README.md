# EstateIQ AI
## Technical Design Document (TDD)

**Project:** EstateIQ AI  
**Tagline:** Every enquiry matters. Every visit counts.  
**Version:** 1.0  
**Document Type:** Technical Design Document

### 1. Project Overview

EstateIQ AI is an AI-powered lead-response and site-visit management platform designed for real-estate developers.

The system helps sales teams respond to incoming enquiries, understand buyer requirements, provide project information, schedule site visits, and transfer qualified leads to sales executives.

The platform is designed to support English, Hindi, and Gujarati conversations.

### 2. Problem Statement

Real-estate sales teams often face delays in responding to enquiries. Manual lead handling can result in missed opportunities, inconsistent follow-ups, duplicate records, and poor visibility into sales performance.

EstateIQ AI aims to improve this process through automated lead engagement, buyer qualification, visit scheduling, and centralized lead management.

### 3. System Objectives

- Respond to incoming enquiries within two minutes.
- Maintain a unified lead database.
- Identify duplicate leads.
- Qualify buyers based on their requirements.
- Answer questions using verified project information.
- Schedule available site-visit slots.
- Send visit reminders through configured communication channels.
- Transfer conversations to sales executives when human assistance is required.
- Provide dashboard and source-wise performance analytics.

### 4. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT |
| AI integration | LLM API with project information retrieval |
| Testing | Pytest |
| Frontend deployment | Vercel |
| Backend deployment | Render |

### 5. System Architecture

The application follows a client-server architecture.

**Frontend**
- Provides the sales dashboard.
- Displays and manages leads.
- Provides the AI assistant interface.
- Displays site-visit slots and bookings.
- Shows analytics and project settings.

**Backend**
- Exposes REST API endpoints.
- Handles authentication and authorization.
- Manages lead records and duplicate checks.
- Processes AI chat requests.
- Validates and manages site-visit bookings.
- Provides dashboard statistics.

**Database**
- Stores users and roles.
- Stores projects and lead information.
- Stores chat messages and handoff records.
- Stores booking and consent information.

### 6. Core Modules

**6.1 Authentication**
- Login using registered credentials.
- JWT-based authentication.
- Role-based access for sales heads and sales executives.

**6.2 Lead Management**
- Create and view leads.
- Search leads by name or phone number.
- Detect duplicate phone numbers.
- Track lead status and source.
- View individual lead details.

**6.3 AI Assistant**
- Process buyer enquiries.
- Collect buyer preferences and requirements.
- Retrieve answers from verified project information.
- Support English, Hindi, and Gujarati.
- Escalate unanswered or sensitive queries to a human executive.
- Preserve conversation history.

**6.4 Site-Visit Booking**
- Display available time slots.
- Associate bookings with leads.
- Prevent double booking.
- Store booking details.
- Support reminders and booking status tracking.

**6.5 Human Handoff**
- Transfer a conversation to an assigned sales executive.
- Include the buyer's requirements and conversation summary.
- Flag unresolved or sensitive conversations for sales-head review.

**6.6 Dashboard and Analytics**
- Display total leads and booked visits.
- Show conversion rates.
- Display active handoffs.
- Provide lead-source breakdowns.
- Track response and booking performance using actual recorded data.

**6.7 Project Settings**
- Maintain verified project information.
- Manage available site-visit slots.
- Keep project facts grounded in approved source material.

### 7. Database Design

The primary entities are:

| Entity | Purpose |
|---|---|
| User | Stores user accounts, roles, and credentials |
| Project | Stores project details |
| Lead | Stores buyer contact and qualification details |
| Booking | Stores site-visit reservations |
| Chat | Stores conversation messages |
| Consent | Records communication consent |

Relationships:
- A project can have multiple leads.
- A lead can have multiple chat messages.
- A lead can have site-visit booking records.
- A user can manage or receive assigned leads.

### 8. API Design

The backend exposes REST APIs under `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/leads` | Retrieve leads |
| POST | `/api/leads` | Create a lead |
| GET | `/api/slots` | Retrieve available slots |
| GET | `/api/bookings` | Retrieve bookings |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/chat/{lead_id}` | Retrieve chat history |
| POST | `/api/chat` | Process an AI chat message |
| POST | `/api/handoff` | Create a human handoff |
| GET | `/api/dashboard` | Retrieve dashboard metrics |

### 9. Security and Privacy

- Authenticate protected API requests using JWT.
- Keep secrets and API keys in environment variables.
- Validate user input on the backend.
- Restrict access according to user roles.
- Record communication consent before sending promotional messages.
- Avoid exposing sensitive buyer information unnecessarily.
- Follow applicable DPDP requirements and WhatsApp messaging policies.

### 10. Error Handling

The application should handle:
- Invalid login credentials.
- Missing or invalid input.
- Duplicate lead creation.
- Unavailable booking slots.
- Concurrent booking attempts.
- AI service failures.
- Database connection errors.
- Unauthorized API requests.

Errors should return appropriate HTTP status codes and clear messages.

### 11. Testing Strategy

Testing should cover:
- Authentication and authorization.
- Lead creation and duplicate detection.
- AI responses and escalation conditions.
- Booking availability and double-booking prevention.
- API validation.
- Dashboard metric accuracy.
- Frontend and backend integration.

### 12. Future Improvements

- Live WhatsApp Business API integration.
- Automated reminder delivery.
- Production LLM integration with retrieval.
- Advanced sales performance analytics.
- Calendar integration.
- Automated lead assignment.
- Production monitoring and audit logs.

### 13. Conclusion

EstateIQ AI is designed to streamline real-estate lead management by combining AI-assisted buyer engagement, centralized lead tracking, site-visit scheduling, and sales analytics in one platform.