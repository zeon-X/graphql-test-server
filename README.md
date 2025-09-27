# GraphQL API Server – Backend Coding Test

## Quick Start

1. **Clone the repository:**

   ```sh
   git clone https://github.com/zeon-X/graphql-test-server.git
   cd graphql-test-server
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Configure environment:**

   - Create a `.env` file in the project root:
     ```
     JWT_SECRET=test_secret
     PORT=4000
     ```
   - You may change these values as needed.

4. **Start the server:**
   ```sh
   npm start
   ```
   - The server runs at [http://localhost:4000](http://localhost:4000) by default.
   - On startup, a sample JWT token is printed in the console.

---

## Using GraphQL Playground / Apollo Studio

1. **Set the Authorization header:**

   ```json
   {
     "Authorization": "Bearer <your_token>"
   }
   ```

   Replace `<your_token>` with the JWT token from the server output.

2. **Example Query:**

   ```graphql
   query Node($nodeId: ID!) {
     node(nodeId: $nodeId) {
       name
       triggerId
       trigger {
         _id
         resourceTemplateId
       }
       responseIds
       actionIds
       parentIds
       parents {
         name
         description
         actionIds
         parentIds
       }
     }
   }
   ```

3. **Example Variables:**

   ```json
   {
     "nodeId": "6296be3470a0c1052f89cccb"
   }
   ```

4. **Run the query:**
   - Click "Run" to execute and view nested results.
   - <img width="1809" height="1117" alt="Screenshot 2025-09-28 at 03-14-38 Explorer Sandbox Studio" src="https://github.com/user-attachments/assets/3dfd5221-086b-4956-822b-b4b6552f9cf9" />


---

## Project Structure

```
.
├── babel.config.js
├── index.js
├── package.json
├── README.md
├── src
│   ├── auth.js
│   ├── config.js
│   ├── dataLoads.js
│   ├── db
│   │   ├── action.json
│   │   ├── node.json
│   │   ├── resourceTemplate.json
│   │   ├── response.json
│   │   └── trigger.json
│   ├── helpers.js
│   ├── loaders.js
│   ├── resolvers.js
│   ├── scalars.js
│   └── schema.js
└── tests
    ├── crossLinkTorture.test.js
    ├── fourLevelParentChain.test.js
    ├── multiAliasBatch.test.js
    ├── nodeQuery.test.js
    └── toggleSections.test.js
```

---

## Running Tests

Automated tests are provided in the `tests` folder. To run all tests:

```sh
npm test
```

This will execute all test suites using Jest. You can add your own tests in the `tests/` directory or run individual files with:

```sh
npx jest tests/<test-file>.js
```

Test files cover query shapes, resolver logic, and edge cases. Review them for sample queries and expected results.

---

- The system supports recursive and nested fetching for all major types.
- Sample queries and mutations are available in the test files for reference.
- JWT authentication is required for all requests (see server output for a sample token).
- All logic and data are ready for deep GraphQL queries as defined in the schema.
