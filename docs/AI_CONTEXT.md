# AI_CONTEXT.md

> Version: 1.0
> Project: DentAI Frontend
> Framework: Angular 21
> Architecture: Feature-Based Architecture
> Backend: FastAPI
> Last Updated: 2026

---

# AI Context

This document is the single source of truth for every AI assistant
working on the DentAI Frontend project.

Examples include:

- GitHub Copilot
- Copilot Agent
- Cursor AI
- Claude Code
- ChatGPT
- Gemini
- Continue.dev
- Codeium
- Windsurf
- Any future coding assistant

Before generating any code,
reviewing pull requests,
creating components,
refactoring files,
or suggesting architectural changes,

the AI MUST understand every rule defined in this document.

This document has higher priority than generic Angular best practices.

Always follow this project context before making technical decisions.

---

# Project Identity

Project Name

DentAI

Project Type

Enterprise Internal Dental Clinic Management System

Project Category

Healthcare Management System

Application Style

Desktop-like Business Application

Think of this project as:

- POS System
- ERP System
- Hospital Information System
- Internal Clinic Operating System

NOT as

- Public Website
- Marketing Website
- Portfolio
- E-commerce
- Social Media Platform
- Landing Page

DentAI is a productivity tool.

Its primary objective is helping clinic staff complete daily tasks
as quickly and accurately as possible.

---

# Product Philosophy

DentAI is built for people who use the system
for many hours every day.

Typical users spend between

6

and

10

hours

inside the application.

Because of that,

the frontend must prioritize

Speed

Consistency

Productivity

Reliability

Maintainability

over

Fancy animations

Creative transitions

Experimental UI

Visual complexity

Every architectural decision should improve
daily productivity.

Never optimize for screenshots.

Always optimize for workflow efficiency.

---

# Primary Goals

The frontend should achieve the following goals.

Goal 1

Fast navigation.

Users should reach important screens
with as few clicks as possible.

Goal 2

Fast data entry.

Receptionists should register patients
and create appointments quickly.

Goal 3

Reliable workflows.

The application should minimize
user mistakes.

Goal 4

Maintainability.

Developers should be able
to add new features
without restructuring the project.

Goal 5

Scalability.

The architecture should support

new modules

new APIs

new dashboards

new reports

new AI features

without requiring major refactoring.

---

# Product Vision

DentAI is not a demo project.

DentAI is intended to behave like
a production business application.

The codebase should be suitable for:

• Graduation Project

• Portfolio

• Technical Interviews

• Team Collaboration

• Long-term maintenance

Every line of code should be written
as if the application will continue
to evolve for years.

---

# Business Context

DentAI manages the internal operations
of a dental clinic.

Typical business areas include:

Authentication

Patients

Appointments

Medical Records

Treatment Plans

Inventory

Notifications

Reports

Analytics

Artificial Intelligence

The frontend architecture must support
all of these modules naturally.

No module should require
major restructuring when added.

---

# Core Business Principle

DentAI is workflow-driven.

The application is NOT page-driven.

Never think:

"I need to build another page."

Instead think:

"I need to support another business workflow."

Business workflows always have priority
over visual organization.

---

# Required User Roles

The system currently supports:

Owner

Doctor

Receptionist

Future roles may include:

Assistant

Accountant

Clinic Manager

Administrator

The architecture must remain flexible
for future roles.

Never hardcode role assumptions.

---

# Authentication Philosophy

DentAI is an internal application.

There is NO public registration.

Users are created internally.

Registration pages must NEVER be generated
unless explicitly requested.

Authentication consists of:

Login

Logout

JWT Authentication

Refresh Tokens

Session Validation

Role-Based Authorization

Password reset is optional
and depends on business requirements.

---

# Performance Philosophy

Performance has higher priority
than visual appearance.

Always prefer:

Fast rendering

Fast searching

Fast filtering

Fast forms

Fast tables

Lazy loading

Minimal bundle size

Keyboard-friendly workflows

Avoid unnecessary animations.

Avoid heavy UI libraries.

Avoid excessive DOM rendering.

Every millisecond matters.

Every click matters.

Every workflow matters.

This philosophy must influence
every architectural decision
made inside the project.

# Business Workflows

DentAI is NOT designed around pages.

DentAI is designed around business workflows.

Every feature must represent a real clinic operation.

The frontend architecture should mirror how users work inside the clinic.

Never think in terms of:

Page → Page → Page

Always think in terms of:

Business Process → User Action → Result

Business workflows are the foundation of the frontend architecture.

---

# Required Screens

The project requirements define the following major application modules.

Authentication

Dashboard

Patients

Appointments

Waitlist

Inventory

Notifications

Analytics

Settings

Artificial Intelligence

These modules represent business capabilities.

They are NOT independent mini applications.

They cooperate to support the clinic workflow.

Never redesign the architecture when implementing a new required screen.

The existing architecture must naturally support every module.

---

# Workflow First Philosophy

Every new feature should answer one question:

"What business problem does this solve?"

If the answer is unclear,

stop generating code.

Never create components because they look useful.

Only create components because they solve a business workflow.

---

# Receptionist Workflow

The Receptionist is the busiest user of the system.

The frontend should optimize this workflow above all others.

Typical workflow:

Login

↓

Dashboard

↓

Search Patient

↓

Patient Found?

↓

Yes

↓

Book Appointment

↓

Assign Doctor

↓

Save

↓

Done

If Patient Does Not Exist

↓

Create Patient

↓

Book Appointment

↓

Done

The entire workflow should require as few clicks as possible.

---

# Doctor Workflow

Doctor logs in.

↓

Dashboard

↓

Today's Appointments

↓

Open Patient

↓

Review Medical History

↓

Diagnosis

↓

Treatment Plan

↓

Save Visit

↓

Next Patient

The doctor should never navigate through unnecessary pages.

Patient information should always be quickly accessible.

---

# Owner Workflow

Owner Login

↓

Dashboard

↓

Business Analytics

↓

Revenue

↓

Appointments

↓

Inventory

↓

Reports

↓

Staff

↓

Settings

Owners care about business metrics.

The dashboard should prioritize summarized information.

---

# Internal Application Rules

DentAI is used only by clinic employees.

There are NO anonymous users.

There are NO guest users.

There are NO customers browsing the application.

There are NO marketing pages.

There are NO landing pages.

There are NO product pages.

There are NO checkout pages.

There are NO shopping carts.

There are NO blogs.

There are NO testimonials.

Never generate these features unless explicitly requested.

---

# Authentication Rules

Authentication exists only for internal employees.

The application should support:

Login

Logout

Session Validation

Token Refresh

Role Validation

Registration is intentionally excluded.

If an AI assistant generates:

Register Page

Signup Component

Public Registration API

Registration Form

that suggestion is incorrect.

---

# Business Modules

The architecture must support the following modules.

Authentication

Responsible for:

Login

Session

Permissions

Roles

Dashboard

Responsible for:

Overview

KPIs

Daily Summary

Quick Actions

Patients

Responsible for:

Patient Profiles

Medical Information

Search

History

Appointments

Responsible for:

Scheduling

Calendar

Status

Rescheduling

Waitlist

Responsible for:

Queue Management

Patient Priority

Inventory

Responsible for:

Materials

Supplies

Stock

Alerts

Notifications

Responsible for:

Reminders

System Messages

Appointment Notifications

Analytics

Responsible for:

Charts

Business Insights

Statistics

Artificial Intelligence

Responsible for:

Predictions

Treatment Assistance

Insights

Recommendations

---

# Business Priorities

Priority 1

Patient Management

Priority 2

Appointment Scheduling

Priority 3

Doctor Productivity

Priority 4

Inventory Tracking

Priority 5

Reporting

Priority 6

Artificial Intelligence

AI should never dictate the architecture.

The architecture should first support traditional workflows.

AI is an enhancement.

Not the foundation.

---

# Feature Boundaries

Each feature owns its business logic.

Patients feature should never contain:

Appointment Logic

Inventory Logic

Analytics Logic

AI Logic

Each feature should remain cohesive.

Cross-feature communication should happen through APIs or shared infrastructure.

Never create tight coupling between features.

---

# User Experience Philosophy

The best interface is the one that allows users to complete tasks quickly.

Beauty is appreciated.

Efficiency is mandatory.

Examples of good UX:

Minimal clicks

Predictable navigation

Large clickable areas

Fast search

Keyboard shortcuts

Responsive tables

Persistent filters

Examples of poor UX:

Fancy transitions

Long animations

Complex menus

Hidden actions

Multiple unnecessary confirmation dialogs

Always optimize for speed.

---

# Decision Rule

Before generating any feature ask:

Does this feature exist in the Required Screens?

If YES

↓

Implement it.

If NO

↓

Ask before implementing.

Never invent business modules.

Never assume business requirements.

The documentation is the source of truth.

---

# Business Terminology

Always use consistent terminology.

Use:

Patient

Appointment

Receptionist

Doctor

Owner

Inventory

Notification

Analytics

Treatment

Medical Record

Avoid inconsistent naming such as:

Customer

Client

Employee

Booking

Order

Product

Unless they are explicitly required by the backend.

Consistency is part of the architecture.
# Architecture Rules

This project follows a strict Feature-Based Architecture.

Every generated file must respect the architecture.

Architecture consistency is more important than code generation speed.

If a generated solution violates the architecture,
it is considered incorrect,
even if it works.

---

# Architecture Layers

The frontend consists of five primary layers.

Core

Shared

Features

Layouts

Styles

Each layer has a single responsibility.

Never mix responsibilities between layers.

---

# Dependency Rules

Dependencies always flow downward.

Features

↓

Shared

↓

Core

Features may use:

Shared

Core

Layouts (when appropriate)

Shared may use:

Core

Shared must NEVER depend on any Feature.

Core depends on nothing except Angular and third-party libraries.

Core must NEVER import anything from Features.

Never create circular dependencies.

---

# Core Layer

Purpose

Provide infrastructure.

Core is NOT responsible for business logic.

Core contains only reusable application infrastructure.

Examples:

Configuration

Environment

HTTP

Interceptors

Tokens

Constants

Utilities

Guards

Storage

Logging

Core must remain business-agnostic.

---

# Core Must Never Contain

Patient logic

Appointment logic

Inventory logic

Analytics logic

Doctor logic

Reception logic

Scheduling logic

Medical Record logic

If a service understands business concepts,

it belongs to a Feature,

not Core.

---

# Shared Layer

Purpose

Reusable presentation logic.

Shared contains reusable UI building blocks.

Examples

Button

Input

Card

Modal

Dialog

Badge

Avatar

Spinner

Tooltip

Loader

Skeleton

Validators

Pipes

Directives

Shared should never know anything about Patients,
Appointments,
Inventory,
or any business entity.

---

# Shared Must Never Contain

PatientCard

AppointmentCalendar

InventoryTable

DoctorDashboard

ReceptionSidebar

These belong inside their Features.

---

# Feature Layer

Every business capability lives inside Features.

Examples

Auth

Patients

Appointments

Inventory

Analytics

Notifications

Settings

Artificial Intelligence

Every feature owns:

Pages

Components

Services

Routes

Interfaces

Models

Business logic

No other feature should directly manipulate its internals.

---

# Feature Independence

Every feature should be independently maintainable.

A developer should be able to work inside one feature
without modifying unrelated features.

Keep features loosely coupled.

Prefer communication through APIs
instead of cross-feature imports.

---

# Layout Layer

Layouts organize application structure.

Layouts are NOT business features.

Layouts should only provide:

Header

Sidebar

Footer

Navigation

Router Outlet

Layout Shell

Layouts should never contain business logic.

---

# Routing Philosophy

Routing follows business workflows.

Not UI hierarchy.

Good

Dashboard

↓

Patients

↓

Patient Details

↓

Appointments

Bad

Home

↓

Page 1

↓

Page 2

↓

Page 3

Users navigate through tasks,

not arbitrary pages.

---

# Standalone Components

The project uses Angular Standalone APIs.

Always generate standalone components.

Never generate NgModules.

Never introduce AppModule.

Never introduce Feature Modules.

Standalone is mandatory.

---

# Dependency Injection

Prefer Angular inject() API.

Example

const http = inject(HttpClient);

instead of constructor injection

unless constructor injection provides a clear advantage.

Use readonly whenever possible.

---

# Component Rules

A component should have one responsibility.

Components should remain small.

Prefer composition over inheritance.

Business logic belongs inside services.

Components coordinate UI.

They should not become business controllers.

---

# Service Rules

Every feature owns its services.

Examples

PatientService

AppointmentService

InventoryService

AnalyticsService

NotificationService

Avoid creating:

CrudService

BaseCrudService

UniversalApiService

MegaService

Services should represent business capabilities.

---

# Models

Do not create speculative models.

Only create models after
the backend contract exists.

Models should reflect API responses.

Never invent backend structures.

---

# Interfaces

Create interfaces only when needed.

Avoid empty interfaces.

Avoid placeholder interfaces.

Interfaces should improve type safety,
not increase complexity.

---

# State Management

Do not introduce NgRx by default.

Prefer Angular Signals.

Use local state whenever possible.

Introduce a global state solution
only when justified by real requirements.

Avoid premature optimization.

---

# HTTP Layer

The backend is FastAPI.

All API communication should assume REST endpoints.

Use HttpClient.

Centralize configuration.

Do not hardcode URLs.

Always use Environment configuration.

---

# Error Handling

Handle errors consistently.

Business-specific error messages belong to Features.

Infrastructure errors belong to Core.

Never duplicate error handling logic.

---

# Performance Principles

Performance is a functional requirement.

Always prefer:

Lazy Loading

OnPush Change Detection

Signals

Efficient Rendering

TrackBy

Debounced Search

Server-side Pagination

Minimal DOM updates

Never optimize for visual complexity.

Optimize for workflow speed.

---

# Security Principles

Authentication

JWT

Refresh Tokens

Role-Based Access Control

Protected Routes

Protected API Calls

Never expose sensitive information.

Never trust client-side validation alone.

---

# Naming Convention

Use consistent naming.

Good

patient.service.ts

patient-list.component.ts

appointment.routes.ts

inventory.model.ts

Avoid

helper.ts

utils2.ts

service-final.ts

new-component.ts

Names should describe responsibility.

---

# AI Decision Rule

Before generating code ask:

Is this infrastructure?

↓

Core

Is this reusable UI?

↓

Shared

Is this business logic?

↓

Feature

Is this page layout?

↓

Layouts

If uncertain,

ask before generating code.

Never guess architecture.

---

# Final Rule

The architecture exists to reduce future complexity.

Never sacrifice long-term maintainability
for short-term convenience.

Every new file should make the project
easier to understand,

not harder.

If a proposed solution increases coupling,

duplicates responsibilities,

or introduces unnecessary abstraction,

it should be rejected.