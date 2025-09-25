# Backend Coding Test - GraphQL API Server

## Setup & Run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. The server will run at `http://localhost:4000` (default).

## Authentication

- Use the JWT token printed in the console when the server starts.
- Example header:
  ```
  Authorization: Bearer <your_token>
  ```

## Query Example

```
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

## Environment Variables

- You can change the JWT secret and port in `.env`.
