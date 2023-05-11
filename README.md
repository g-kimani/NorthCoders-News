# News API

Welcome to the News API, a RESTful API that interacts with a news database containing articles, topics, users, and comments. Built with Express and PostgreSQL, the API offers endpoints for retrieving and modifying data from the database.

Link to hosted version: [Insert link here]

## Getting Started

Follow the instructions below to clone, install dependencies, seed the local database, and run tests.

### **Prerequisites**

Make sure you have the following installed:

- Node.js (v19 or higher)
- PostgreSQL (v14 or higher)

1. Clone the repository:

```bash
git clone https://github.com/g-kimani/Northcoders-News-Api.git
```

2. Install dependencies:

```bash
npm install
```

3. Create the two `.env` files:

   - Create a `.env.development` file and add the following:

   ```bash
   PGDATABASE=nc_news
   ```

   - Create a `.env.test` file and add the following:

   ```bash
   PGDATABASE=nc_news_test
   ```

4. Setup the local database:

```bash
npm run setup-dbs
```

4. Seed the local database:

```bash
npm run seed
```

5. Start the server:

```bash
npm start
```

## Running Tests

To run the tests, run the following command:

```bash
npm test
```

## Minimum Versions

This project requires Node.js version 19 or later and PostgreSQL version 14 or later to run. Please ensure that you have these installed before attempting to run the project.
