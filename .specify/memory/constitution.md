# NRS Fullstack Application Constitution

## Core Principles

### I. Scope-Appropriate Simplicity
Architecture and technical solutions must match the scope of this test task. Avoid premature optimizations, unnecessary microservices, or redundant abstractions. Any added complexity or third-party dependency must be explicitly justified.

### II. Specification-First & Explicit Criteria
Application behavior and acceptance criteria must be clearly defined and agreed upon before implementation begins. All edge cases, ambiguities, and assumptions must be stated explicitly rather than implied or silently resolved in code.

### III. Source Data Integrity & Transparent Discrepancies
Raw source data from `mock/` must be imported and preserved as-is without manual or silent corrections. Known anomalies (such as the Iowa county population discrepancy) must be preserved in storage and surfaced transparently in the application.

### IV. Pragmatic Verification
Automated checks must focus on high-value paths: critical business logic, the data import pipeline, and core API contracts. Pragmatic integration and unit tests are prioritized over rigid TDD dogmatism or arbitrary code coverage metrics.

### V. Reproducible Environment & Setup
The project must be runnable from a clean repository clone using clear, step-by-step instructions. Docker and containerized services (PostgreSQL, app services) are standard for deterministic bootstrapping and database migration/seeding.

### VI. Engineered AI Collaboration & Transparency
All AI-generated code, architecture suggestions, and configurations must undergo thorough human engineering review and verification. The project documentation must accurately detail real AI usage, including which suggestions were adopted, modified, or rejected, and how they were validated.

## Technology Baseline

- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Language & Artifacts**: All code, comments, documentation, and Spec Kit artifacts are maintained in clear, accessible English.

## Governance

- This Constitution serves as the foundational agreement for all subsequent stages (`spec`, `clarify`, `plan`, `tasks`, `implement`).
- Any deviations or additions must be justified against the original test task scope.
- Amendments require documentation and explicit approval.

**Version**: 1.0.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-05
