# Backend Coding Test - GraphQL API Server

## How to Run This Project

### 1. Clone the Repository

```sh
git clone [https://github.com/zeon-X/graphql-test-server.git](https://github.com/zeon-X/graphql-test-server.git)
cd graphql-test-server
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Create `.env` File

Create a `.env` file in the `structured-server` folder with the following content:

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
_Add an image here showing the terminal with the JWT token output._

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
_Add an image here showing the header set in Apollo Studio._

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
_Add an image here showing the variables set in Apollo Studio._

---

### d. Run the Query and View Results

- Click "Run" to execute the query.
- You should see the nested data returned.

**Screenshot:**  
_Add an image here showing the query result._

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
  sample-schema/
    action.txt
    node.txt
    resourceTemplate.txt
    response.txt
    trigger.txt
  ```
- _Note: The project is currently unstructured due to time constraints, but all logic and data are ready for recursive or nested fetching. The system can resolve almost any query within the sample-schema definitions._

---
