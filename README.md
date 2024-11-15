# Dynamic Socket Reports

Dynamic Spreadsheet Report Generation with Real-Time Socket Notification

## Overview

This project provides a full-stack solution for generating dynamic spreadsheet reports with real-time notifications. Reports are created based on MongoDB data, and users are notified instantly through Socket.IO when reports are ready.

## Prerequisites

- Docker and Docker Compose installed
- MongoDB, Redis and Envs are set up within Docker Compose

## Setup

### Step 1: Start the Docker Containers

To start the development environment, use Docker Compose:
```bash
docker-compose up --build
```

This command will spin up three services:
- **App**: The application server
- **Mongo**: The MongoDB instance
- **Redis**: The Redis server

After a successful build, the console output you provided indicates the following sequence of events in your application:
```
app-1    | [0]  ✓ Ready in 1215ms
app-1    | [0] Redis Client Connected
app-1    | [1] Attempting to reconnect 1
app-1    | [0] 2024-11-15 11:26:25.676 - info: Setting up socket
app-1    | [1] npm run start-websocket exited with code 0
```

### Step 2: Load Sample Data into MongoDB

#### 1. Copy Data Files into MongoDB Container


Make sure to **check out the project repository** first, as we need the **exact path** to the `sample_data` folder within your project. Once you've done that, you can proceed to **locate the MongoDB container ID**. 

To find the container ID for your MongoDB instance, you can run the following command:

```bash
docker ps
```

Then, use the following commands to copy data files into the MongoDB container. Replace `<container-id>` with the actual MongoDB container ID from `docker ps` output.
```bash
docker cp ./sample_data/customers.json <container-id>:/tmp/customers.json
docker cp ./sample_data/accounts.json <container-id>:/tmp/accounts.json
docker cp ./sample_data/transactions.json <container-id>:/tmp/transactions.json
```

**Sample Input**:
```plaintext
pwd: /Users/ashish/Downloads/others/code/dynamic-socket-reports

docker cp ./sample_data/accounts.json c77e21dc4406:/tmp/accounts.json
```

**Sample Output**:
```plaintext
Successfully copied 305kB to c77e21dc4406:/tmp/accounts.json
```

#### 2. Import Data into MongoDB

Access the MongoDB container’s shell with MongoDB container ID from `docker ps` :
```bash
docker exec -it <container-id> bash
```

Then, use the `mongoimport` command to load the data into the database:
```bash
mongoimport --db dynamic-reports --collection customers --file /tmp/customers.json
mongoimport --db dynamic-reports --collection accounts --file /tmp/accounts.json
mongoimport --db dynamic-reports --collection transactions --file /tmp/transactions.json
```

**Sample Input**:
```plaintext
mongoimport --db dynamic-reports --collection customers --file /tmp/customers.json
```

**Sample Output**:
```plaintext
connected to: mongodb://localhost/
500 document(s) imported successfully. 0 document(s) failed to import.
```

### Step 3: Verify Data in MongoDB

To verify the imported data:
1. Exit the current shell by typing `exit`.
2. Open a MongoDB shell with mongo container ID:
   ```bash
   docker exec -it <container-id> mongo
   ```
3. Switch to your database and list collections:
   ```plaintext
   use dynamic-reports
   show collections
   ```

**Sample Output**:
```
> use dynamic-reports
switched to db dynamic-reports

> show collections
accesstokens
accounts
customers
reports
transactions
```

## Running the Application

After completing these steps, the application should be ready to use. Open a web browser and go to `http://localhost:3000` to access the app.

## Sample Login Credentials

For testing, you can use the following login credentials:

- **Email**: john@test.com  
  **Password**: Test@123

- **Email**: adam@test.com  
  **Password**: Login@321

# Local Setup Instructions

## Prerequisites
Before running the application locally, make sure you have the following installed:
- Node.js
- npm

## Steps to Run Locally

### Setting up the Environment

1. **Copy the Environment Variables**
   ```bash
   cp .env.sample .env.local
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Start the Application**
   ```bash
   npm run start
   ```

After completing these steps, the application should be ready to use. Open a web browser and go to http://localhost:3000 to access the app.

### Running in Development Mode

If you prefer to use development/nodemon mode, follow these steps:

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Start the WebSocket Server**
  For nodemon mode: After starting the server use to connect to websocket:
   ```bash
   npm run start-websocket
   ```

## Notes

- The `.env` file contains configuration details and environment variables, such as database connection URLs, JWT secrets, etc.
- For real-time notifications, ensure WebSocket connections are set up properly in the frontend.
- To check `data` folder and execute commands inside the app container, open a shell session using containerId:
`docker exec -it <container-id> sh`
