# Backend Coding Test - GraphQL API Server

## How to Run This Project

### 1. Clone the Repository

```sh
git clone https://github.com/zeon-X/graphql-test-server.git
cd graphql-test-server
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Create `.env` File

Create a `.env` file in the root folder with the following content:

```
JWT_SECRET=test_secret
PORT=4000
```

_(You can change these values if needed.)_

### 4. Start the Server

```sh
npm start
```

- The server will run at [http://localhost:4000](http://localhost:4000) by default.
- When the server starts, it will print a sample JWT token in the console.

**Screenshot:**  
<img width="591" height="146" alt="Screenshot 2025-09-26 at 1 19 20 AM" src="https://github.com/user-attachments/assets/ce34bb08-09c0-4ec5-8112-463e38e9fd0e" />

---

## 5. Open Apollo Studio (or GraphQL Playground)

### a. Set Authentication Header

- In the "Headers" section, add:

```json
{
  "Authorization": "Bearer <your_token>"
}
```

Replace `<your_token>` with the JWT token from the server output.

**Screenshot:**  
<img width="1838" height="1052" alt="Screenshot 2025-09-26 at 01-18-26 Explorer Sandbox Studio" src="https://github.com/user-attachments/assets/5cce6b19-4c22-4d93-88aa-eb5e9baaa434" />

---

### b. Set Query

Paste this query in the query editor:

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

---

### c. Set Variables

Example variables (pick a valid nodeId from your data):

```json
{
  "nodeId": "6296be3470a0c1052f89cccb"
}
```

**Screenshot:**  
<img width="1960" height="1050" alt="Screenshot 2025-09-26 at 01-18-35 Explorer Sandbox Studio" src="https://github.com/user-attachments/assets/ac136ad3-a757-4683-97cb-698788e86a74" />

---

### d. Run the Query and View Results

- Click "Run" to execute the query.
- You should see the nested data returned.

**Screenshot:**  
<img width="2940" height="1456" alt="Screenshot 2025-09-26 at 01-18-44 Explorer Sandbox Studio" src="https://github.com/user-attachments/assets/b758b5c4-11c6-42f3-8234-fc0a9d604535" />

---

## About the Project

- **Folder Structure:**
  ```
  index.js
  package.json
  README.md
  db/
    action.json
    node.json
    resourceTemplate.json
    response.json
    trigger.json
 
  ```
- _Note: The project is currently unstructured due to time constraints, but all logic and data are ready for recursive or nested fetching. The system can resolve almost any query within the sample-schema definitions._

---
