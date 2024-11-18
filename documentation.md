### Low-Level Design (LLD) Document for APIs and Implementation

#### 1. **Overview**

This LLD document serves as a blueprint detailing how APIs and their corresponding functionalities are implemented in this project. Each section addresses the technical specifics, ensuring consistent design and robust implementation.

---

### 2. **APIs Design**

#### **General Details**

- **Protocol**: REST over HTTP
- **Framework**: Next.js with TypeScript
- **Authentication**: Cookie-based JWT + CSRF double authentication
- **Watcher**: `fs.watch` for monitoring `report-config.json`
- **Security**: Content Security Policy, Helmet, Rate Limiting, Sanitize Incoming Data
- **Versioning**: API versioning in URL (e.g., `/v1`)
- **Response Format**: JSON
- **Error Handling**: Consistent error structure (e.g., `{ "message": "error_message", "status": false }`)


#### **Development and Code Quality Tools**

1. **Docker**:
   - Docker is used for containerizing the entire application, including both frontend (Next.js) and backend components.
   - The project includes a unified `Dockerfile` for building the container and running the services in a consistent environment.
   - **Docker Compose** is used to orchestrate services like the backend, database, and Redis.

   **Key Files**:
   - `Dockerfile`: Defines the image and dependencies for both frontend and backend.
   - `docker-compose.yml`: Specifies how to run the app, connecting the backend, database, and other services.
   
2. **Husky**:
   - Husky is used to enforce pre-commit and pre-push hooks to ensure quality code.
   - It runs automated checks like linting, formatting, and tests before changes are committed or pushed.

   **Key Actions**:
   - Pre-commit hook runs `lint-staged` for ensuring that only staged files are linted and formatted.
   - Pre-push hook ensures tests pass before code is pushed to the repository.

3. **lint-staged**:
   - **lint-staged** runs linters on files that are staged for commit. It helps in enforcing consistent code formatting and standards without needing to lint the entire codebase each time.
   - It works seamlessly with Husky to run checks only on staged files, optimizing the development flow.

   **Key Configuration**:
   - `.lintstagedrc.json`: Configures which files should be linted and formatted.
   
4. **ESLint**:
   - ESLint is used for linting JavaScript and TypeScript files. It ensures that the code adheres to consistent styling and avoids potential errors.
   - It integrates with Husky and lint-staged to run checks automatically before commits.

   **Key Configuration**:
   - `.eslintrc.json`: Contains the ESLint rules and plugins specific to the project.

5. **Prettier**:
   - Prettier is used for automatic code formatting. It ensures consistent formatting across the project by reformatting the code according to defined style guidelines.
   - Prettier works together with ESLint to fix formatting issues and maintain readability.

   **Key Configuration**:
   - `.prettierrc`: Contains the Prettier formatting rules.
   - Prettier is also integrated into Husky and lint-staged to run before commits.

---

### 3. **Code Structure**

**Backend Structure**

- **`controllers/`**: Contains logic for handling app configurations and processing HTTP requests related to reports. Each file corresponds to a specific action (e.g., `generateReport.ts` for generating reports, `downloadReport.ts` for file downloads).
- **`constants/`**: Contains constant variables used throughout the application, such as error messages, status codes, and configurations.

- **`database/`**: Includes the models used for interacting with the database, such as MongoDB models. For example, `Report.ts` would define the structure of report data.

- **`handlers/`**: Manages error handling and logging. This can include custom error classes and logging utilities to handle application errors consistently.

- **`middlewares/`**: Contains reusable middleware functions for tasks like error handling, JWT authentication, and request logging.

- **`services/`**: Contains logic for interacting with external services like Redis, file storage.

- **`types/`**: Contains TypeScript type definitions and interfaces, ensuring type safety across the application.

- **`utils/`**: Includes reusable utility functions for common tasks, such as data formatting, string manipulation, or file handling.

- **`validations/`**: Contains route-level validations using Joi to ensure that request data is valid before processing.

**Frontend Structure**

- **`app/`**: Contains the frontend logic, including UI components, styling (CSS), and other client-side interactions.

- **`app/`**: This directory should contain all frontend-related files, such as:
  - **UI components**: React components, layouts, and page structures.
  - **CSS**: Styling, including CSS, or other CSS frameworks that style the UI.
  - **State management**: Any global state management or hooks that control application state.
  - **Client-side logic**: Logic related to making API calls, handling form submissions, displaying modals, and rendering data on the page.
  - **Assets**: Static files like images, icons, fonts, etc.

**Example:**

- **`app/components/`**: Contains UI components like buttons, forms, modals, and other elements.
- **`app/styles/`**: Contains the CSS files for styling the components
- **`app/hooks/`**: Contains custom React hooks for managing state or side effects.
- **`app/pages/`**: Contains individual pages or routes for the application.

---

### 4. **Error Handling Strategy**

#### **General Strategy**

- Use HTTP status codes appropriately:

  - `200 OK` for successful requests.
  - `400 Bad Request` for client-side errors.
  - `401 Unauthorized` for authentication issues.
  - `500 Internal Server Error` for unexpected server errors.

- **Global Error Handler in `errorHandler.ts`**:

  - Centralized error handling for all APIs.
  - Formats the error message and provides appropriate status codes.

  ```json
  { "message": "Description of the error.", "status": false }
  ```

---

### 5. **Flow Diagrams**

#### **Report Generation Flow**

```plaintext
User ---> [Generate Report API] ---> Asynchronous Report Processing
                                           |
                                           v
                               [WebSocket: reportReady/reportFailed]
```

#### **Report Download Flow**

```plaintext
User  ---> [Download Report API] ---> File Stream ---> Auto WS Notification ---> User Download
```

---

### 6. **Tools and Libraries**

- **Backend**: Node.js, Next.js
- **File Handling**: `xlsx`, `fs`, `path`
- **WebSocket**: Socket.IO
- **Database**: MongoDB
- **Validation**: Joi

---

### 7. APIs Details

### **-- Watch Config API**


- **Endpoint**: `/v1/watch`
- **Method**: `GET`
- **Authentication**: Requires authentication via cookies and the `x-csrf-token` header.

- **Request Body**: None

- **Response**:
  - **200 OK**: `{ "status": true }`

#### **Behavior**:
- **Purpose**: 
  - This API listens for changes to the `report-config.json` file located in the `data/configs` directory. 
  - It watches the file and, upon detecting any changes, triggers the reloading of the configuration.
  - The `configUpdated` event is emitted via **WebSockets** (`io.emit`) to notify connected clients about the updated configuration.
  
- **Flow**:
  - When a GET request is made to this endpoint, the API uses the `watchConfig` function to initiate a file watcher on the `report-config.json` file.
  - **File Watching**: The system watches for changes to the `report-config.json` file using `fs.watch`. When a change is detected, the `loadConfig` function is triggered to reload the configuration and emit the updated configuration to all connected clients through the WebSocket connection.
  - On initial request, the latest configuration is loaded and emitted immediately.
  
- **Authentication**:
  - The user must provide a valid JWT token in the `Authorization` header.
  - A CSRF token must be included in the `x-csrf-token` header for security purposes.
  - The session is validated through the session cookie, which helps verify that the request is coming from an authenticated user.

- **Error Handling**:
  - If there is an issue while reading or parsing the configuration file, errors will be logged to the server's console.
  
#### **Use Case**:
- **Real-Time Configuration Updates**: This API is useful for scenarios where the configuration file (`report-config.json`) can change during runtime, and any update needs to be propagated to all users or services connected to the application, without requiring them to manually reload the application.

---

### **-- Socket Handler API**

- **Endpoint**: `/v1/socket`
- **Method**: `GET`
- **Authentication**: None required (Socket connection is established separately)
- **Request Body**: None

- **Response**:
  - **200 OK**: `{ "status": true, "message": "Socket connection established" }`
  - **500 Internal Server Error**: `{ "message": "Error occurred", "status": false }`

#### **Behavior**:
- **Purpose**: 
  - This API is responsible for setting up and initializing a **Socket.IO** server on the backend. It establishes a WebSocket connection between the client and the server to enable real-time communication.
  - The WebSocket server is set up when a request is made to this endpoint, ensuring that the server is ready to handle real-time events (e.g., reporting, configuration changes, etc.).

- **Flow**:
  - When a `GET` request is made to this endpoint, the server checks if a Socket.IO server (`res.socket.server.io`) is already set up.
  - If the Socket.IO server is already initialized, it logs `"Already set up"` and ends the request.
  - If the server is not yet initialized, it sets up the **Socket.IO** server on the `res.socket.server` object and attaches middleware for error handling and authentication.
  - The server listens for the `connection` event, which is emitted when a client successfully connects to the WebSocket. If an `unauthorized` error occurs, the client is disconnected.
  
- **Error Handling**:
  - If an unauthorized access attempt is detected, the socket will be disconnected, preventing any further communication.

- **Use Case**:
  - **Real-Time Communication**: This API is crucial for enabling real-time features in your application, such as notifying users about updates (e.g., report generation completion, config updates, etc.). Once the WebSocket connection is established, it allows the client and server to communicate asynchronously and instantly.

#### **Authentication**:
- This endpoint does not require authentication for establishing the socket connection

- **Logging**: The server logs relevant messages (`"Already set up"` and `"Setting up socket"`) for debugging purposes, which helps monitor the initialization process.

---

### **-- Login API**

- **Endpoint**: `/v1/login`
- **Method**: `POST`
- **Description**: This API handles user authentication by validating provided credentials. Upon successful authentication, it generates the required authentication cookies, including CSRF and JWT tokens for further requests.

#### **Request Body**:

- **`email`** (string): The user's email address.
- **`password`** (string): The user's password.

**Example Request Body**:

```json
{
  "email": "john@test.com",
  "password": "Test@123"
}
```

#### **Response**:

- **200 OK**: If the login is successful, returns a success message along with a status of `true`.

  - **Response Body**:
    ```json
    {
      "status": true,
      "message": "success"
    }
    ```

- **Headers**: Upon successful login, the response will include the following headers:
  - **Set-Cookie**: The response will set the `CSRF` and `JWT` tokens as cookies for future authentication. These cookies are necessary for making subsequent authenticated requests.

**Example Response Headers**:

```
Set-Cookie: csrf_token=<csrf_token_value>; HttpOnly; Path=/; Secure;
Set-Cookie: jwt_token=<jwt_token_value>; HttpOnly; Path=/; Secure;
```

#### **Behavior**:

- The login process verifies the user’s credentials.
- If authentication is successful:
  - A CSRF token and a JWT token are generated and sent as cookies.
  - These tokens are used to authenticate future requests, ensuring a secure session.
- If authentication fails (invalid credentials), an error message will be returned indicating the failure (e.g., `401 Unauthorized`).

#### **Error Response**:

- **401 Unauthorized**: If the credentials are incorrect or missing.
  - **Response Body**:
    ```json
    {
      "status": false,
      "message": "Invalid email or password"
    }
    ```

---

### **-- Get Reports API**

- **Endpoint**: `/v1/report`
- **Method**: `GET`
- **Authentication**: Requires authentication via cookies and the `x-csrf-token` header.

#### **Request Query Parameters**:

- **`page`** (integer, optional): The page number to fetch. Default is `1` if not provided.
- **`limit`** (integer, optional): The number of reports per page. Default is `10` if not provided.
- **`sortBy`** (string, optional): The field to sort by. Example: `createdAt`. Default is `createdAt` if not provided.
- **`sortOrder`** (string, optional): The sort order of the results. Can be either `asc` or `desc`. Default is `desc` if not provided.
- **`search`** (string, optional): The search keyword to filter reports based on the `fileName`. Default is an empty string if not provided.

#### **Response**:

- **200 OK**: If the request is successful, the server responds with a JSON object containing the reports data and pagination information.

  - **Response Body**:

    ```json
    {
      "status": true,
      "reports": [
        {
          "fileName": "Report_HBCQb8.xlsx",
          "createdAt": "2024-11-15T15:13:13.187",
          "userName": "Adam Nichole"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "total": 50,
        "totalPage": 5,
        "limit": 10
      }
    }
    ```

  - **Fields**:

    - **`status`** (boolean): Indicates if the request was successful.
    - **`reports`** (array): An array of reports generated by the user. Each report object contains the following details:

      - **`userName`** (string): Name of the user
      - **`fileName`** (string): The name of the generated report file.
      - **`createdAt`** (string): The timestamp when the report was generated.

    - **`pagination`** (object): Contains pagination information to navigate through large datasets.
      - **`total`** (integer): The total number of reports available.
      - **`totalPage`** (integer): Total pages present
      - **`currentPage`** (integer): The current page number.
      - **`limit`** (integer): The number of reports per page.

#### **Behavior**:

- This API endpoint retrieves all the reports generated by the authenticated user. It also provides pagination details.
- The response includes a list of reports, each with its metadata such as file name, and generation timestamp.
- Pagination data allows the user to fetch results across multiple pages, and sorting/searching capabilities allow fine-grained control over the data returned.

#### **Authentication**:

- The request must include an authenticated session via cookies (which should contain the CSRF token and JWT) and the `x-csrf-token` header to prevent CSRF attacks.

#### **Error Response**:

- **401 Unauthorized**: If the user is not authenticated or does not provide valid authentication tokens.
  - **Response Body**:
    ```json
    {
      "status": false,
      "message": "Authentication required"
    }
    ```


---

### **-- Generate Report API**

- **Endpoint**: `/v1/report/generate`
- **Method**: `GET`
- **Authentication**: Required (JWT) with CSRF token in cookies and the `x-csrf-token` header.

#### **Request Body**:

- None

#### **Response**:

- **200 OK**:
  - The request is successful. The server begins the report generation process in the background. It will notify the client once the report is ready (via WebSocket).
  - **Response Body**:
    ```json
    {
      "status": true,
      "message": "Report generation started."
    }
    ```
- **400 Bad Request**:
  - The server cannot find any data to generate the report.
  - **Response Body**:
    ```json
    {
      "status": false,
      "message": "No Data found."
    }
    ```
- **500 Internal Server Error**:
  - An error occurred while processing the request.
  - **Response Body**:
    ```json
    {
      "status": false,
      "message": "Failed to generate report."
    }
    ```

#### **Behavior**:

- The report generation process starts asynchronously. While the backend processes the data (e.g., querying the database, formatting the data, generating the report), it will not block the client.
- **WebSocket Integration**:
  - A WebSocket notification is triggered when the report is generated. This will allow the frontend to show a notification or initiate the download of the report once it's ready.
  - On the frontend, the user will be notified when the report is ready for download via WebSocket events like `reportReady` or `reportFailed`.
- **Backend**:
  - The backend processes the data, prepares the report, and then stores it in a designated location (e.g., a file system or cloud storage).
  - Once the report is ready, it will notify the frontend via WebSocket with the `reportReady` event and provide the filename for downloading.

#### **Authentication**:

- This endpoint requires JWT-based authentication with a CSRF token. The CSRF token is provided via cookies and needs to be included in the `x-csrf-token` header for security.

#### **Error Response**:

- **401 Unauthorized**:
  - The user is not authenticated or their session has expired.
  - **Response Body**:
    ```json
    {
      "status": false,
      "message": "Authentication required"
    }
    ```


---

### **-- Download Report API**

- **Endpoint**: `/v1/report/download`
- **Method**: `POST`
- **Authentication**: Required (JWT) with CSRF token in cookies and the `x-csrf-token` header.

#### **Request Body**:

- **`fileName`** (string, required): The name of the report file to be downloaded. This should match the file generated and stored on the server.

#### **Response**:

- **200 OK**:

  - The requested file is successfully streamed to the client, initiating a download in the browser.
  - The file is returned as a stream to avoid overloading memory for large files, allowing for efficient downloading even for large report files.
  - **Response Headers**:
    - `Content-Disposition: attachment; filename=<fileName>`: Triggers the download with the provided `fileName`.
    - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (or the appropriate content type depending on the file type).

- **400 Bad Request**:

  - The requested file does not exist on the server.
  - **Response Body**:
    ```json
    {
      "message": "File not found.",
      "status": false
    }
    ```

- **500 Internal Server Error**:
  - An error occurred while attempting to stream the file to the client.
  - **Response Body**:
    ```json
    {
      "message": "Failed to download file.",
      "status": false
    }
    ```

#### **Behavior**:

- **File Streaming**:
  - The backend will locate the requested file based on the `fileName` and stream it directly to the client using a `ReadableStream`. This minimizes memory usage on the server, especially for large files.
  - **Error Handling**: If the file cannot be found or another error occurs during the streaming process, appropriate error messages will be returned to the client.
- **Download Handling**:

  - The response headers include `Content-Disposition` to trigger the file download on the client side.
  - The file will be downloaded in the browser with the filename provided in the `fileName` field.

- **Security**:
  - The API uses JWT for authentication to ensure that only authorized users can download reports.
  - The file download is allowed only for reports that the authenticated user has access to.

#### **Example Usage**:

**Request**:

```http
POST /v1/report/download
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "fileName": "Report_12345.xlsx"
}
```

**Response** (on success):

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="Report_12345.xlsx"
```

#### **Error Responses**:

- **401 Unauthorized**: The user is not authenticated or the JWT token is missing/invalid.
  - **Response Body**:
    ```json
    {
      "message": "Authentication required.",
      "status": false
    }
    ```

#### **Notes**:

- This endpoint assumes that the file is already generated and stored on the server. If the file is still being processed (e.g., if it's not ready), a notification informs the user when the download is ready.

---

### **-- Get Report Config API**

- **Endpoint**: `/v1/report-config`
- **Method**: `GET`
- **Authentication**: Required (JWT) with CSRF token in cookies and the `x-csrf-token` header.
- **Request Body**: None
- **Response**:
  - **200 OK**:
    - **Response Body**: JSON object containing the report configuration.
      ```json
      {
        "status": true,
        "reportsConfig": { "columns":  Array }
      }
      ```
  - **400 Bad Request**:
    - **Response Body**:
      ```json
      {
        "message": "File not found.",
        "status": false
      }
      ```
  - **500 Internal Server Error**:
    - **Response Body**:
      ```json
      {
        "message": "Failed to retrieve report config.",
        "status": false
      }
      ```

#### **Behavior**:

- **Purpose**: This API retrieves the configuration of the report stored in a JSON file (e.g., `report-config.json`). The configuration includes essential details about the report, such as report name, columns, and applicable filters.
- **Handling Errors**: If the configuration file is not found or cannot be accessed, the API returns a 400 error. If there is an issue with processing the request (such as server failure), a 500 error will be returned.

---

### **-- Download Report Config API**

- **Endpoint**: `/v1/report-config/download`
- **Method**: `POST`
- **Authentication**: Required (JWT) with CSRF token in cookies and the `x-csrf-token` header.
- **Request Parameters**:
  - **`fileName`** (string): Name of the report configuration file to be downloaded.
- **Response**:
  - **200 OK**:
    - **Response Body**: The report configuration file is streamed to the client for download.
    - **Headers**:
      - `Content-Disposition: attachment; filename="<fileName>"`: Triggers file download with the provided filename.
      - `Content-Type: application/json`: Specifies the content type of the file being sent.
  - **400 Bad Request**:
    - **Response Body**:
      ```json
      {
        "message": "File not found.",
        "status": false
      }
      ```
  - **500 Internal Server Error**:
    - **Response Body**:
      ```json
      {
        "message": "Failed to download file.",
        "status": false
      }
      ```

#### **Behavior**:

- **Purpose**: This API allows the client to download the specific report configuration file (e.g., `report-config.json`) that is used to generate reports.
- **File Handling**: The file is streamed from the server to the client, which facilitates large files or reports that need to be handled efficiently.
- **Error Handling**:
  - If the requested file is not found, a 400 error with a message is returned.
  - If there is an internal error while processing the download, a 500 error is returned.

---

### **-- Get User Data API**

- **Endpoint**: `/v1/user`
- **Method**: `GET`
- **Authentication**: Required (JWT) with CSRF token in cookies and the `x-csrf-token` header.

- **Request Body**: None

- **Response**:
  - **200 OK**:
    - **Response Body**: Returns the user data. Example:
      ```json
      {
        "status": true,
        "user": {
          "id": "268d1cc9-adae-40ca-813b-488d881bdc11",
          "name": "Adam Nichole",
          "email": "adam@test.com",
          "role": "user"
        }
      }
      ```

  - **400 Bad Request**:
    - **Response Body**:
      ```json
      {
        "message": "User not found.",
        "status": false
      }
      ```

  - **500 Internal Server Error**:
    - **Response Body**:
      ```json
      {
        "message": "Something went wrong",
        "status": false
      }
      ```

#### **Behavior**:
- **Purpose**: This API retrieves the authenticated user's information, such as their `id`, `name`, `email`, and `role`, which is typically used for display or user-specific actions on the frontend.
  
- **Authentication**: 
  - The user must provide a valid JWT token in the `Authorization` header.
  - A CSRF token must be included in the `x-csrf-token` header for security.
  - The session is validated using the session cookie, which stores user session data.

- **Error Handling**: 
  - If the user cannot be found, the server responds with a **400 Bad Request** and an error message.
  - Any unexpected issues, such as server errors, are handled with a **500 Internal Server Error** and a generic error message.

--- 

### **-- WebSocket Events**

1. **Event Name**: `reportReady`
   - **Payload**:
     ```json
     {
       "filename": "Report_ABC123.xlsx",
       "message": "Report generation completed!"
     }
     ```
2. **Event Name**: `reportFailed`
   - **Payload**:
     ```json
     {
       "message": "Report generation failed due to no data."
     }
     ```
---

### **Conclusion**  
This document provides a detailed low-level design for the app, describing the architecture, API endpoints, data structures, and key interactions. All components are mapped to ensure a modular and scalable architecture that meets both functional and non-functional requirements.

### **Key Takeaways**:
- The system follows a **microservices** architecture for scalability.
- APIs are designed to follow **RESTful principles** with clear authentication and authorization flows.
- Data is efficiently handled using **MongoDB** with pagination and proper validation.
- **Socket.IO** is integrated for real-time communication, enhancing user experience by providing notifications and updates.
- The backend leverages middleware for **error handling** and **validation**, ensuring a robust system.
