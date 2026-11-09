# EstateIQ AI

### Every enquiry matters. Every visit counts.

An AI-assisted real-estate lead management and site-visit booking platform built for sales teams.

## Project Links

| Resource | Link |
|---|---|
| GitHub Repository | [EstateIQ AI](https://github.com/pujitha-mule/EstateIQ-AI) |
| Live Frontend | [Open EstateIQ AI](https://estate-iq-l29z33ua9-pujitha-mules-projects.vercel.app/) |
| Backend API | [Render Backend](https://estateiq-ai-backend.onrender.com) |
| API Documentation | [FastAPI Swagger Docs](https://estateiq-ai-backend.onrender.com/docs) |
| Health Check | [Backend Health](https://estateiq-ai-backend.onrender.com/api/health) |

---

## 1. Project Overview

EstateIQ AI is a real-estate lead management and site-visit coordination platform designed to help property sales teams manage buyer enquiries, track leads, provide project information, and schedule property visits.

The platform brings lead management, an assistant interface, booking workflows, and sales analytics into one workspace.

The prototype is designed around a real-estate developer operating two residential projects in Ahmedabad, Gujarat.

## 2. Problem Statement

Real-estate sales teams often face delays in responding to incoming enquiries. Manual lead handling can result in missed opportunities, inconsistent follow-ups, duplicate records, and limited visibility into sales performance.

EstateIQ AI aims to simplify this process through:

- Centralized lead management.
- Buyer requirement tracking.
- Project information access.
- Site-visit scheduling.
- Human escalation.
- Sales dashboard and analytics.

## 3. Key Objectives

- Organize enquiries in a unified lead database.
- Track buyer preferences, budgets, and requirements.
- Provide project information through an assistant interface.
- Display available site-visit slots.
- Prevent duplicate confirmed bookings for a lead.
- Allow sales executives to manage enquiries.
- Support human handoff for enquiries requiring personal assistance.
- Provide visibility into lead and booking performance.

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT |
| Password Security | Passlib, bcrypt |
| API Testing | Pytest, HTTPX |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

## 5. System Architecture

EstateIQ AI follows a client-server architecture.

### Frontend
- Provides the sales workspace.
- Displays the dashboard and lead records.
- Provides the AI assistant interface.
- Displays site-visit availability and bookings.
- Provides analytics and settings screens.

### Backend
- Exposes REST API endpoints through FastAPI.
- Handles authentication.
- Manages lead and project records.
- Processes assistant requests.
- Validates site-visit bookings.
- Handles booking cancellation and human handoff.
- Provides dashboard information.

### Database
PostgreSQL stores application records, including:
- Users and roles.
- Projects.
- Project fact sheets.
- Leads.
- Visit slots.
- Bookings.

### Request Flow

1. A user signs in through the React frontend.
2. The frontend sends authenticated requests to FastAPI.
3. FastAPI validates requests and applies business rules.
4. SQLAlchemy communicates with PostgreSQL.
5. The backend returns responses to the frontend.
6. The frontend updates the relevant screens.

## 6. Application Modules

### 6.1 Authentication
- User login.
- JWT-based authentication.
- User roles for admin, sales executives, and sales head.
- Authenticated user information.

### 6.2 Lead Management
- View and manage lead records.
- Track buyer contact information.
- Store project preferences and configurations.
- Track lead source, status, and priority.
- Update lead information.

### 6.3 AI Assistant
- Assistant interface for buyer enquiries.
- Rule-based responses using available project information.
- Basic project fact-based responses.
- Conversation history.
- Human escalation through the handoff API.

**Implementation note:** The current assistant is deterministic and rule-based. It is not yet connected to a production LLM or complete retrieval-augmented generation pipeline.

### 6.4 Site-Visit Booking
- Retrieve available visit slots.
- Filter availability by project and date.
- Create bookings.
- Associate bookings with leads.
- Validate slot capacity.
- Prevent multiple confirmed bookings for the same lead.
- Cancel existing bookings.

### 6.5 Human Handoff
- Create escalation requests.
- Assign escalations to sales executives.
- Support human review of enquiries that need additional assistance.

### 6.6 Dashboard and Analytics
- Total lead information.
- Booking information.
- Visit statistics.
- Lead status breakdown.
- Lead source breakdown.
- Handoff information.
- Available conversion metrics.

Metrics depend on the data currently available in the database.

### 6.7 Project Settings
The frontend includes a settings interface for project-related information. A complete approved-facts management API and administration workflow remain future improvements.

## 7. Database Design

The main SQLAlchemy entities are:

| Entity | Purpose |
|---|---|
| User | User accounts, roles, and password hashes |
| Project | Residential project information |
| FactSheet | Project facts and verification status |
| Lead | Buyer information and requirements |
| VisitSlot | Available site-visit time slots |
| Booking | Site-visit reservations and status |

### Entity Relationships

- A project can have multiple leads.
- A project can have multiple visit slots.
- A lead belongs to a project.
- A booking connects a lead, project, and visit time.
- Project fact sheets store information associated with a project.

## 8. API Documentation

All application API routes are available under `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/me` | Retrieve authenticated user |
| GET | `/api/leads` | Retrieve leads |
| POST | `/api/leads` | Create a lead |
| GET | `/api/leads/{lead_id}` | Retrieve lead details |
| PATCH | `/api/leads/{lead_id}` | Update lead |
| GET | `/api/slots` | Retrieve available slots |
| GET | `/api/bookings` | Retrieve bookings |
| POST | `/api/bookings` | Create booking |
| PATCH | `/api/bookings/{booking_id}/cancel` | Cancel booking |
| POST | `/api/chat` | Process assistant message |
| GET | `/api/chat/{lead_id}` | Retrieve conversation history |
| POST | `/api/handoff` | Create human handoff |
| GET | `/api/dashboard` | Retrieve dashboard metrics |

Interactive API documentation:

[Open EstateIQ AI Swagger Documentation](https://estateiq-ai-backend.onrender.com/docs)

## 9. Security and Privacy

- JWT authentication for protected API requests.
- Password hashing for stored credentials.
- Environment variables for database connections and application secrets.
- Backend request validation.
- Role information associated with user accounts.
- Synthetic sample data for demonstration.

Before production use, the application requires further work on comprehensive role-based authorization, audit logging, data retention, consent management, and applicable DPDP and WhatsApp policies.

## 10. Testing

Backend testing was performed using Pytest.

Previously recorded test results:

- 22 backend tests passed.
- Authentication endpoints tested.
- Lead endpoints tested.
- Booking availability and creation tested.
- Booking cancellation tested.
- Human handoff tested.
- Dashboard API tested.

The frontend production build was also tested, with responsive checks across mobile viewport sizes.

## 11. Deployment

### Frontend: Vercel

Production frontend:

https://estate-iq-l29z33ua9-pujitha-mules-projects.vercel.app/

### Backend: Render

Backend URL:

https://estateiq-ai-backend.onrender.com

### Database: PostgreSQL

The deployed backend connects to a managed PostgreSQL database hosted on Render.

### Environment Variables

Backend:
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `FRONTEND_ORIGIN`
- `PYTHON_VERSION`

Frontend:
- `VITE_API_BASE_URL`

Actual secret values are configured through deployment environment settings and are not included in the repository.

## 12. Current Limitations

The current implementation is a working prototype. The following features require further development:

- Production LLM integration and retrieval-based responses.
- Complete English, Hindi, and Gujarati conversational support.
- Live WhatsApp and SMS notifications.
- Automated visit reminder delivery.
- Complete approved project fact management.
- Advanced duplicate lead detection.
- Production-grade multi-instance booking concurrency.
- Expanded role-based authorization.
- More comprehensive sales analytics and audit logs.

## 13. Future Enhancements

- Integrate an LLM with verified project information retrieval.
- Add WhatsApp Business API integration.
- Automate booking confirmations and reminders.
- Improve duplicate lead detection.
- Add advanced lead assignment and follow-up workflows.
- Introduce calendar integration.
- Expand analytics and reporting.
- Strengthen security, monitoring, and audit capabilities.

## 14. Conclusion

EstateIQ AI brings real-estate lead management, assistant-based buyer engagement, human handoff, and site-visit coordination into a single application.

The project provides a foundation for improving sales-team workflows and reducing manual effort while leaving room for further development in AI integration, automation, and production readiness.

---

**Built with React, FastAPI, PostgreSQL, and Python.**

**EstateIQ AI | Every enquiry matters. Every visit counts.**
