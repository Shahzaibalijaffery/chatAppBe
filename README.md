# Chat App Backend

A real-time chat application backend built with Node.js, Express, MongoDB, and Socket.io.

## Features

- User authentication (register, login, logout)
- One-on-one chat
- Group chat
- Real-time messaging with Socket.io
- Message read receipts
- User search
- Online/offline status
- Typing indicators

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
mychatAppBe/
├── controllers/        # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── chatController.js
│   └── messageController.js
├── models/            # Database models
│   ├── User.js
│   ├── Chat.js
│   └── Message.js
├── routes/            # API routes
│   ├── auth.js
│   ├── users.js
│   ├── chats.js
│   └── messages.js
├── middleware/        # Custom middleware
│   └── auth.js
├── utils/             # Utility functions
│   └── generateToken.js
├── server.js          # Entry point
├── package.json
└── .env.example
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and copy the contents from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - Set your MongoDB connection string
   - Set a secure JWT secret
   - Configure other settings as needed

5. Make sure MongoDB is running on your system

6. Start the server:
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/logout` - Logout user (Protected)

### Users
- `GET /api/users` - Get all users (search: `?search=keyword`) (Protected)
- `GET /api/users/:id` - Get user by ID (Protected)
- `PUT /api/users/:id` - Update user profile (Protected)

### Chats
- `POST /api/chats` - Create or fetch one-on-one chat (Protected)
- `GET /api/chats` - Get all chats for current user (Protected)
- `GET /api/chats/:chatId` - Get chat by ID (Protected)
- `POST /api/chats/group` - Create group chat (Protected)
- `PUT /api/chats/group/:chatId` - Rename group chat (Protected)
- `PUT /api/chats/group/:chatId/add` - Add user to group (Protected)
- `PUT /api/chats/group/:chatId/remove` - Remove user from group (Protected)

### Messages
- `POST /api/messages` - Send a message (Protected)
- `GET /api/messages/:chatId` - Get all messages for a chat (Protected)
- `PUT /api/messages/:messageId/read` - Mark message as read (Protected)
- `PUT /api/messages/chat/:chatId/read` - Mark all messages in chat as read (Protected)

## Socket.io Events

### Client to Server
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `send-message` - Send a message
- `typing` - Send typing indicator

### Server to Client
- `receive-message` - Receive a new message
- `user-typing` - Receive typing indicator

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `CORS_ORIGIN` - Allowed CORS origins

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Example API Usage

### Register
```bash
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Chat
```bash
POST /api/chats
Authorization: Bearer <token>
{
  "userId": "user_id_here"
}
```

### Send Message
```bash
POST /api/messages
Authorization: Bearer <token>
{
  "content": "Hello!",
  "chatId": "chat_id_here"
}
```

## License

ISC

