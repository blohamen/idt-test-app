# Feature Specification: State Population Browser

**Feature Directory**: `specs/001-state-population-browser`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description based on the NRS Fullstack test task assignment for IDT.

---

## 1. Overview

The State Population Browser is a fullstack web application that allows users to explore US states and counties, verify demographic data consistency, and interact with synchronized state lists. The system consists of a PostgreSQL database populated from provided raw mock data, a Node.js + Express backend providing state and county APIs, and a React frontend featuring two scrollable state lists, a real-time search filter for the second list, and an interactive county breakdown details panel that highlights population discrepancies.

---

## Clarifications

### Session 2026-11-05

- Q: How should the application handle the interaction conflict between single-click (open details) and double-click (toggle highlight) on a state item? → A: Option A (Single-click immediately opens details without artificial delay; double-click toggles highlight and keeps that state open in details).
- Q: How should the backend provide and the frontend resolve the state detail endpoint link? → A: Option A (Backend serves `GET /api/states` returning relative detail links like `/api/state/<StateName>` and exposes `GET /api/state/:name`; the frontend retrieves state details by following the `detail` link property from each state object).
- Q: What should the detail panel display upon initial application load before any state is clicked? → A: Option A (Display an informative placeholder message prompting the user to select a state from either list, without making automatic state detail requests on launch).
- Q: Should the highlighted states persist across page reloads, or remain in-memory UI state for the current session? → A: Option A (In-memory React client state for the duration of the browser session without persistence across page reloads).
- Q: How should the four UI areas be visually arranged on desktop screens? → A: Option A (Three-column desktop layout: Column 1 for Scrollable State List #1; Column 2 for Search box placed above Scrollable State List #2; Column 3 for Scrollable Detail Panel).
- Q: How should frontend assets be served in containerized production? → A: Express static hosting (Single container service: Express serves the compiled frontend static files and handles SPA routing fallback, eliminating the separate Nginx container for maximum simplicity per Constitution Principle I).
- Q: How should API routing, error handling, and server termination be structured? → A: Option A (API endpoints are accessible via both root (`/states`, `/state/:name`, `/health`) and `/api` prefix (`/api/states`, `/api/state/:name`, `/api/health`) for dual compatibility with assignment requirements and REST conventions, without route list hardcoding in SPA fallback; errors are handled via a lightweight NestJS-style `HttpException` hierarchy with `asyncHandler`; server lifecycle includes structured logging and graceful shutdown on `SIGTERM`/`SIGINT`).


---

## 2. User Scenarios & Testing

### User Story 1 - Browse States & View County Breakdown (Priority: P1)

As a user exploring demographic data, I want to view a scrollable list of US states and click on any state to inspect its details, county breakdown, and verify whether the sum of county populations matches the recorded state total.

**Why this priority**: This constitutes the core value proposition and primary data visualization of the application. Without this, the app does not fulfill its basic purpose.

**Independent Test**: Can be verified by launching the app, clicking on "California" to verify matching population sums, and clicking on "Iowa" to confirm that the +1 population discrepancy is explicitly highlighted.

**Acceptance Scenarios**:
1. **Given** the application is loaded with both state lists populated, **When** no state has been clicked yet, **Then** the detail panel displays a clean placeholder prompt instructing the user to select a state, and no detail API call is triggered.
2. **Given** the application is loaded with 51 states in List #1, **When** a user single-clicks on a state (e.g., "Alabama"), **Then** the detail panel displays:
   - State name ("Alabama")
   - Total state population (4,833,722)
   - Number of counties (67)
   - Scrollable list of all 67 counties with individual county names and populations
   - Calculated sum of county populations (4,833,722)
   - Visual status indicator showing that county population sum matches the state population.
3. **Given** the detail panel is active, **When** a user single-clicks on "Iowa", **Then** the detail panel displays state population (3,090,415), county sum (3,090,416), and an explicit warning/mismatch indicator displaying the discrepancy (+1).

---

### User Story 2 - Dual List Synchronization & Highlighting (Priority: P2)

As a user comparing or categorizing states, I want to see two synchronized lists of states and toggle the highlight status of states via double-click in either list so that my selections stay in sync across both views.

**Why this priority**: The dual list synchronization demonstrates reactive state management and coordinated UI components.

**Independent Test**: Double-click state in List #1 -> verify highlight appears in both List #1 and List #2. Double-click another state in List #2 -> verify highlight appears in both lists. Double-click an already highlighted state -> verify unhighlighting in both lists. Single-clicking in List #2 also updates the detail panel.

**Acceptance Scenarios**:
1. **Given** both state lists are rendered, **When** a user double-clicks a state in List #1, **Then** that state toggles to highlighted styling in List #1 AND List #2 simultaneously.
2. **Given** a state is highlighted, **When** a user double-clicks that same state in List #2, **Then** the state becomes unhighlighted in both List #1 and List #2.
3. **Given** List #2 is displayed, **When** a user single-clicks any state in List #2, **Then** the detail panel updates to display that state's details.

---

### User Story 3 - Real-Time Search & Filtering on List #2 (Priority: P3)

As a user searching for specific states, I want a search input that filters only the second state list in real time as I type, without altering List #1 or the detail panel.

**Why this priority**: Provides interactive filtering and proves scoped component isolation (filter applies only to List #2).

**Independent Test**: Type partial strings (e.g., "ne") into the search box -> verify List #2 only displays matching states ("Maine", "Nebraska", "Nevada", "Minnesota", etc.), while List #1 continues showing all 51 states.

**Acceptance Scenarios**:
1. **Given** the search input is focused, **When** the user types "ne", **Then** List #2 filters immediately to states containing "ne" (case-insensitive substring match anywhere in the name), while List #1 remains unfiltered (all 51 states).
2. **Given** a state is highlighted and matches the search query, **When** displayed in the filtered List #2, **Then** its highlighted status is preserved visually.
3. **Given** a query with no matches (e.g., "xyz"), **When** typed into the search box, **Then** List #2 displays an empty state message or zero items, without throwing errors.
4. **Given** the search box has input, **When** the input is cleared, **Then** List #2 restores all 51 states.

---

### User Story 4 - Data Seeding & API Service (Priority: P1)

As a developer or evaluator, I want the backend to import the provided mock data into a PostgreSQL database and serve it through REST API endpoints so that the frontend receives reliable, relational data.

**Why this priority**: Foundational requirement for runnable fullstack operation.

**Independent Test**: Run seed script -> query database to verify 51 states and 3143 counties -> call `GET /states` / `GET /api/states` and `GET /state/:name` / `GET /api/state/:name` (or detail endpoint) -> verify exact JSON responses.

**Acceptance Scenarios**:
1. **Given** a fresh PostgreSQL instance, **When** the database migration and import scripts execute, **Then** 51 state records and 3,143 county records are correctly inserted with relational integrity.
2. **Given** the backend is running, **When** `GET /states` or `GET /api/states` is requested, **Then** the server responds with status 200 and an array of all 51 states including name, population, county count, and relative detail URL/link (`/api/state/...`).
3. **Given** the backend is running, **When** a state detail request is made for "Iowa" (`GET /state/Iowa` or `GET /api/state/Iowa`), **Then** the server responds with status 200 containing Iowa's state info and its 99 counties with raw population counts.


---

### Edge Cases

- **Double-Click vs Single-Click Conflict**: Standard web browsers fire two `click` events before a `dblclick` event. As clarified, single-click opens state details immediately without artificial delay, and double-click toggles the highlight state while leaving that state selected in the detail panel.
- **Extreme County Counts**: Delaware has 3 counties, District of Columbia has 1, while Texas has 254 counties. The county list in the detail panel must be scrollable and performant regardless of county count.
- **Discrepancy Boundaries**: Iowa has a +1 discrepancy (3,090,416 sum vs 3,090,415 state total). Other states have zero discrepancy. The comparison logic must strictly compare integers and clearly indicate whether `sum === total`.
- **Special Characters and Spaces in State Names**: Names with spaces ("New York", "West Virginia", "District of Columbia", "North Carolina", "South Carolina", "North Dakota", "South Dakota", "New Hampshire", "New Jersey", "New Mexico", "Rhode Island") must be handled cleanly in URLs and search filters.
- **Container Sizing and Scrolling**: Both state list containers must be constrained to a height requiring scrolling for 51 items on standard desktop viewports.

---

## 3. Requirements

### Functional Requirements

- **FR-001**: The backend MUST expose both `GET /states` and `GET /api/states` endpoints returning all 51 US states (including District of Columbia), each with `state` name, `population`, `counties` count, and a relative `detail` link (e.g. `/api/state/<StateName>`).
- **FR-002**: The backend MUST expose state detail endpoints at both `GET /state/:name` and `GET /api/state/:name` returning the state's counties with their names and populations. The frontend MUST retrieve detailed state information by requesting the path supplied in the `detail` link of each state object.
- **FR-003**: The database schema MUST contain relational tables for `states` and `counties` in PostgreSQL with proper foreign key relationships.
- **FR-004**: The data import script MUST load all data from `mock/usa-states/USA-states.json` and all 51 files in `mock/states/*.json` into PostgreSQL without manual data fixes or loss.
- **FR-005**: The UI MUST be arranged in a three-column layout across desktop viewports:
  1. Column 1: Scrollable State List #1
  2. Column 2: Search box placed directly above Scrollable State List #2 (the search box filters only List #2)
  3. Column 3: Scrollable Detail Panel
- **FR-006**: The state list containers MUST have constrained dimensions requiring vertical scrolling to view all 51 items.
- **FR-007**: Single-clicking a state in List #1 MUST open its detail view in the detail panel.
- **FR-008**: Single-clicking a state in List #2 MUST open its detail view in the detail panel.
- **FR-009**: Double-clicking a state in List #1 MUST toggle that state's highlight status (updating both List #1 and List #2 simultaneously) and keep that state selected in the detail panel without artificial click delay.
- **FR-010**: Double-clicking a state in List #2 MUST toggle that state's highlight status (updating both List #1 and List #2 simultaneously) and keep that state selected in the detail panel without artificial click delay.
- **FR-011**: The search box MUST filter only List #2 based on case-insensitive substring matching against the state name in real time while typing.
- **FR-012**: The detail panel MUST display a placeholder message prior to user selection. Upon state selection, it MUST display:
  - State name
  - Total state population
  - Number of counties
  - Scrollable list of counties with their individual populations
  - Calculated sum of county populations
  - Explicit indication whether the county population sum matches the state population record.
- **FR-013**: The application MUST run reproducibly via Docker (`docker compose up` with a 2-service architecture: `db` + `app` serving both API and static frontend assets) or documented single-step setup.
- **FR-014**: The backend MUST implement centralized error handling utilizing a lightweight NestJS-style `HttpException` hierarchy (`BadRequestException`, `NotFoundException`, `InternalServerErrorException`, `ServiceUnavailableException`) and an `asyncHandler` wrapper to ensure all operational errors produce predictable JSON responses.
- **FR-015**: The backend MUST provide structured contextual logging (`Logger` with ISO timestamps, levels, and JSON in production) and handle graceful shutdown on `SIGTERM` and `SIGINT` signals, closing active HTTP connections and the PostgreSQL pool safely before process exit.


---

## 4. Key Entities

- **State**:
  - `id`: Unique identifier (serial primary key or slug/name).
  - `name`: Full state name (e.g., "Alabama", "Iowa", "District of Columbia"). Unique.
  - `population`: Recorded state population (integer).
  - `county_count`: Recorded number of counties (integer).
  - `detail_url`: URL or relative endpoint for detail retrieval.
- **County**:
  - `id`: Unique identifier (serial primary key).
  - `state_id`: Foreign key reference to parent `State`.
  - `name`: County name (e.g., "Autauga County", "Adair County").
  - `population`: County population (integer).

---

## 5. Success Criteria

- **SC-001**: 100% of mock data is imported into PostgreSQL (51 states, 3,143 counties verified by record count).
- **SC-002**: Frontend correctly lists all 51 states in List #1 and List #2 upon initial load.
- **SC-003**: Single click on any state displays the detail panel and all its counties within 300ms under normal local network conditions.
- **SC-004**: Iowa's population discrepancy (+1 difference between 3,090,416 county sum and 3,090,415 state total) is explicitly flagged with clear visual cues in the detail panel.
- **SC-005**: Double-click toggle latency between List #1 and List #2 is instantaneous (< 50ms UI update).
- **SC-006**: Search input filters List #2 in real time (< 50ms debounce/render) without modifying List #1.
- **SC-007**: Application and database can be spun up from a clean repository clone using a single Docker Compose command or documented setup script.

---

## 6. Assumptions

- **Target Audience / Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge) at 1280x720 resolution or higher.
- **Session Lifespan**: Highlighting is strictly an ephemeral in-memory UI state (React state/context) for the duration of the browser tab session, not persisted across page reloads.
- **Population Data**: Raw population numbers are stored as standard 32-bit integers (US state populations are all < 40 million, well within integer range).
- **Mock Data Server Port**: The placeholder `localhost:nnn` in `mock/usa-states/USA-states.json` will be resolved to the actual backend port (e.g., `3001` or dynamic host config) or served as a relative path by the backend.
