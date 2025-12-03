# API Endpoints Documentation

Base URL: `http://localhost:5000/api` (or configure via `PORT` environment variable)

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Health Check

### GET `/api/health`
**Access:** Public

**Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## 2. Authentication Endpoints

### 2.1 Register User
**POST** `/api/auth/register`  
**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "age": 28,
  "photos": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "age": 28,
    "bio": null,
    "photos": ["https://example.com/photo1.jpg"],
    "location": null,
    "preferences": null,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

### 2.2 Login
**POST** `/api/auth/login`  
**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "age": 28,
    "bio": "Love traveling and coffee",
    "photos": ["https://example.com/photo1.jpg"],
    "location": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "city": "New York"
    },
    "preferences": {
      "ageRange": { "min": 25, "max": 35 },
      "maxDistance": 50,
      "interests": ["travel", "coffee", "photography"]
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "token": "jwt_token_here"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### 2.3 Get Current User
**GET** `/api/auth/me`  
**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "age": 28,
    "bio": "Love traveling and coffee",
    "photos": ["https://example.com/photo1.jpg"],
    "location": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "city": "New York"
    },
    "preferences": {
      "ageRange": { "min": 25, "max": 35 },
      "maxDistance": 50,
      "interests": ["travel", "coffee", "photography"]
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 2.4 Logout
**POST** `/api/auth/logout`  
**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 3. User Profile Endpoints

### 3.1 Update User Profile
**PATCH** `/api/users/:userId`  
**Access:** Private (Requires Authentication - Can only update own profile)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Updated",
  "age": 29,
  "bio": "Updated bio",
  "photos": ["https://example.com/new-photo.jpg"],
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006,
    "city": "New York"
  },
  "preferences": {
    "ageRange": { "min": 26, "max": 36 },
    "maxDistance": 60,
    "interests": ["travel", "coffee", "photography", "hiking"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Updated",
    "age": 29,
    "bio": "Updated bio",
    "photos": ["https://example.com/new-photo.jpg"],
    "location": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "city": "New York"
    },
    "preferences": {
      "ageRange": { "min": 26, "max": 36 },
      "maxDistance": 60,
      "interests": ["travel", "coffee", "photography", "hiking"]
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

---

## 4. Chat Endpoints

### 4.1 Get All Chats
**GET** `/api/chats?userId=user-123`  
**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `userId` (required): The current user's ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "chat-456",
      "participants": ["user-123", "user-456"],
      "messages": [
        {
          "id": "msg-789",
          "chatId": "chat-456",
          "senderId": "user-456",
          "text": "Hey! How are you doing?",
          "type": "text",
          "createdAt": "2024-01-20T15:30:00Z",
          "readAt": null,
          "imageUrl": null
        }
      ],
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ]
}
```

**Notes:**
- Returns last 50 messages per chat
- Messages are sorted by createdAt (oldest first)
- Only returns chats where the current user is a participant

---

### 4.2 Get Single Chat
**GET** `/api/chats/:chatId`  
**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "chat-456",
    "participants": ["user-123", "user-456"],
    "messages": [
      {
        "id": "msg-789",
        "chatId": "chat-456",
        "senderId": "user-456",
        "text": "Hey! How are you doing?",
        "type": "text",
        "createdAt": "2024-01-20T15:30:00Z",
        "readAt": null,
        "imageUrl": null
      }
    ],
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
```

**Error Response (if chat not found or unauthorized):**
```json
{
  "success": false,
  "error": "Chat not found"
}
```

---

### 4.3 Create Chat
**POST** `/api/chats`  
**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-123",
  "otherUserId": "user-456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "chat-789",
    "participants": ["user-123", "user-456"],
    "messages": [],
    "createdAt": "2024-01-20T16:00:00Z",
    "updatedAt": "2024-01-20T16:00:00Z"
  }
}
```

**Notes:**
- If a chat already exists between these two users, returns the existing chat
- User can only create chats for themselves (userId must match authenticated user)

---

## 5. Message Endpoints

### 5.1 Send Message
**POST** `/api/chats/:chatId/messages`  
**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (Text Message):**
```json
{
  "senderId": "user-123",
  "text": "Hello! How are you?",
  "type": "text"
}
```

**Request Body (Image Message):**
```json
{
  "senderId": "user-123",
  "text": "Check this out!",
  "type": "image",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg-791",
    "chatId": "chat-456",
    "senderId": "user-123",
    "text": "Hello! How are you?",
    "type": "text",
    "createdAt": "2024-01-20T16:05:00Z",
    "readAt": null,
    "imageUrl": null
  }
}
```

**Notes:**
- `type` can be `"text"`, `"image"`, or `"system"`
- For image messages, `imageUrl` is required
- Updates the chat's `updatedAt` timestamp automatically

---

### 5.2 Mark Messages as Read
**POST** `/api/chats/:chatId/read`  
**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

**Notes:**
- Marks all unread messages in the chat as read for the specified user
- Only messages sent by other users are marked as read
- Updates `readAt` timestamp for all unread messages

---

## Socket.io Events

### Client to Server Events:

1. **`join-chat`**
   - Join a chat room
   - Data: `chatId` (string)

2. **`leave-chat`**
   - Leave a chat room
   - Data: `chatId` (string)

3. **`send-message`**
   - Send a message via socket
   - Data: `{ chatId, messageData }`

4. **`typing`**
   - Send typing indicator
   - Data: `{ chatId, userId }`

### Server to Client Events:

1. **`receive-message`**
   - Receive a new message
   - Data: Message object

2. **`user-typing`**
   - Receive typing indicator
   - Data: `{ chatId, userId }`

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Data Types

### User
```typescript
{
  id: string;
  name: string;
  age: number;
  bio?: string | null;
  photos: string[];
  location?: {
    latitude: number;
    longitude: number;
    city?: string | null;
  } | null;
  preferences?: {
    ageRange: { min: number; max: number };
    maxDistance?: number;
    interests?: string[];
  } | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Chat
```typescript
{
  id: string;
  participants: string[]; // Array of user IDs
  messages: Message[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Message
```typescript
{
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: "text" | "image" | "system";
  createdAt: string; // ISO 8601
  readAt?: string | null; // ISO 8601, null if unread
  imageUrl?: string | null; // Required if type is "image"
}
```

### API Response
```typescript
{
  success: boolean;
  data?: T; // The actual response data
  error?: string; // Error message if success is false
  message?: string; // Optional success/error message
}
```

