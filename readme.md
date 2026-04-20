# 99Tech Backend Engineering Assessment

Welcome to my technical submission for the **Backend Engineer (Fully Remote)** position at **99tech.co**.

## Repository Overview

This repository is divided into three distinct challenges, located within the `src/` directory. Each problem folder contains its own dedicated `README.md` with specific installation and execution instructions.

### [Problem 4: Three Ways to Sum to N](./src/problem4)
* **Focus:** Algorithmic thinking, Big O complexity, and testing.
* **Description:** Three distinct TypeScript implementations (Mathematical, Iterative, and Recursive) to solve a summation problem. The module is strictly typed and verified by a comprehensive Jest test suite.

### [Problem 5: A Crude Server](./src/problem5)
* **Focus:** API Development, Data Integrity, and Enterprise Architecture.
* **Description:** A production-ready RESTful CRUD server built with Express and Prisma. It features strict Zod runtime validation, ACID-compliant database transactions to synchronize audit logs with a materialized view, automated Plop.js scaffolding, and an isolated integration testing environment.

### [Problem 6: Scoreboard Architecture](./src/problem6)
* **Focus:** System Design, Distributed Systems, and Security (Anti-Cheat).
* **Description:** A comprehensive architectural specification for a live leaderboard module. It details a high-performance execution flow using PostgreSQL for permanent auditing, a Redis Sorted Set (`ZSET`) for sub-millisecond ranking tie-breakers, and a distributed WebSocket backplane for real-time client hydration.

---

## Quick Start for Reviewers (Root Execution)

To save you time, this repository is configured so you can install dependencies and run the test suites for all problems directly from the root directory.

**1. Install all dependencies across all problems:**
```bash
npm run install:all
```

**2. Setup the Problem 5 Test Database:**
Problem 5 uses an isolated PostgreSQL database for integration testing. Please ensure you have configured your `.env.test` file inside `src/problem5/` (refer to `src/problem5/.env.test.example`). Then, push the schema to the test database:
```bash
# Navigate to problem 5, push the schema to the test DB, and return to root
cd src/problem5 && npx dotenv -e .env.test -- npm run db:migrate && cd ../..
```


**2. Run the tests:**
```bash
# Run all tests sequentially
npm run test:all

# OR run them individually from the root
npm run test:p4
npm run test:p5
```
(Note: Problem 5 requires a PostgreSQL database. Please ensure your .env.test is configured in src/problem5 and the schema is pushed before running test:p5 or test:all. See the Problem 5 README for DB setup details).

---

## Global Tech Stack Highlights
* **Core:** Node.js, Express.js, TypeScript
* **Data:** PostgreSQL, Prisma ORM, Redis
* **Validation & Security:** Zod, JWT, HMAC Signatures
* **Testing:** Jest, Supertest

Thank you for your time and consideration in reviewing this repository. I have structured the code, architecture, and documentation to reflect the exact engineering standards and attention to detail I would bring to the team at 99tech.co.