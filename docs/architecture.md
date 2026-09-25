# Architecture

PlacementOS MVP is built using a modern MERN stack architecture with a focus on clean separation of concerns and maintainable code.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Router, Axios
- **Backend**: Node.js, Express, TypeScript, Zod
- **Database**: MongoDB, Mongoose
- **Testing**: Vitest (Unit), Supertest (Integration)
- **Infrastructure**: Docker, GitHub Actions

## Data Flow

```text
React (Frontend)
       ↓ (Axios HTTP Requests)
REST API (Express)
       ↓ (Input Validation via Zod)
Controllers (HTTP Handling)
       ↓ (Business Logic)
Services (Core Algorithms)
       ↓ (Data Access)
Mongoose Models
       ↓
MongoDB
```

### Separation of Concerns

1. **Controllers**: Handle HTTP request/response logic. They parse incoming data, call the appropriate service, and format the response. They do not contain complex business logic.
2. **Services**: Contain all core business logic (Eligibility checking, Matching algorithm, Skill gap analysis). This makes the business logic highly testable and independent of the Express framework.
3. **Validators**: Zod schemas ensure all incoming data is strictly validated before hitting controllers.
4. **Models**: Mongoose schemas define the data structure and handle database-level operations (e.g., lowercase normalization of skills).

### Frontend Architecture
- **Pages**: Top-level components that represent full routes (Dashboard, Profile, etc.).
- **Components**: Reusable UI elements (Card, Badge, Button).
- **Store**: Redux Toolkit slices managing global state and asynchronous API calls.
- **Services**: API configuration using Axios.
