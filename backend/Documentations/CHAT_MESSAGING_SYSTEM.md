# Chat Messaging & Connection Request System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Firebase Integration](#firebase-integration)
5. [API Endpoints](#api-endpoints)
6. [Workflow Diagrams](#workflow-diagrams)
7. [Frontend Components](#frontend-components)
8. [Security & Privacy](#security--privacy)
9. [Implementation Guide](#implementation-guide)
10. [Configuration](#configuration)

---

## 1. Overview

### Feature Description
A LinkedIn-style social networking feature that enables users to:
- Send connection requests to other users
- Accept or reject connection requests
- View list of connected users in a dedicated chat section
- Real-time messaging with connected users
- Send attachments, images, and live location (WhatsApp-style)
- See online/offline status and typing indicators

### Technology Stack
- **Backend**: NestJS (existing)
- **Database**: MongoDB (existing - for connections/requests)
- **Real-time Chat**: Firebase Firestore & Firebase Storage
- **Authentication**: JWT (existing) + Firebase Custom Tokens
- **Frontend**: Next.js (existing)

### Key Components
1. **Connection Management** - MongoDB-based connection requests and relationships
2. **Chat Service** - Firebase Firestore for real-time messaging
3. **Media Storage** - Firebase Storage for attachments
4. **Notification System** - Integration with existing notification module

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ User Profile │  │ Connections  │  │   Chat Interface     │  │
│  │    Page      │  │     Page     │  │  (Real-time)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────┬────────────────┬────────────────────┬──────────────┘
             │                │                    │
             │ REST API       │ REST API           │ Firebase SDK
             │                │                    │
┌────────────▼────────────────▼────────────────────┼──────────────┐
│                    NestJS Backend                │              │
│  ┌──────────────────────────────────────────┐   │              │
│  │     Connection Module (MongoDB)          │   │              │
│  │  - Connection Requests                   │   │              │
│  │  - Accept/Reject Logic                   │   │              │
│  │  - Connection List                       │   │              │
│  └──────────────────────────────────────────┘   │              │
│  ┌──────────────────────────────────────────┐   │              │
│  │     Firebase Module                      │   │              │
│  │  - Custom Token Generation               │   │              │
│  │  - Chat Room Creation                    │   │              │
│  └──────────────────────────────────────────┘   │              │
└─────────────────────────────────────────────────┼──────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │    Firebase Services        │
                                    │  ┌──────────────────────┐   │
                                    │  │  Firestore Database  │   │
                                    │  │  - Messages          │   │
                                    │  │  - Chat Rooms        │   │
                                    │  │  - User Presence     │   │
                                    │  └──────────────────────┘   │
                                    │  ┌──────────────────────┐   │
                                    │  │  Firebase Storage    │   │
                                    │  │  - Attachments       │   │
                                    │  │  - Images            │   │
                                    │  └──────────────────────┘   │
                                    └─────────────────────────────┘
```

### Data Flow

**Connection Request Flow:**
```
User A Profile → Click "Connect" → POST /connections/request → MongoDB
                                                                    ↓
User B Profile → View Requests → GET /connections/requests → Accept/Reject
                                                                    ↓
                                        Update Connection Status → MongoDB
```

**Chat Flow:**
```
User A → Open Chat → GET /firebase/token → Firebase Auth Token
                                                ↓
                            Frontend Firebase SDK → Firestore Listener
                                                ↓
User A sends message → Firestore Write → Real-time Update → User B receives
```

---

## 3. Database Schema

### MongoDB Collections

#### 3.1 Connection Schema
```typescript
// Collection: connections
{
  _id: ObjectId,
  requester: ObjectId,          // User who sent the request
  recipient: ObjectId,           // User who received the request
  status: String,                // 'pending' | 'accepted' | 'rejected' | 'blocked'
  requestMessage: String,        // Optional message with request
  createdAt: Date,               // When request was sent
  updatedAt: Date,               // When status changed
  respondedAt: Date              // When accepted/rejected
}

// Indexes:
// - { requester: 1, recipient: 1 } (unique)
// - { recipient: 1, status: 1 }
// - { requester: 1, status: 1 }
```

#### 3.2 Updated User Schema
```typescript
// Add to existing User schema
{
  // ... existing fields ...
  
  // Connection stats (denormalized for performance)
  connectionCount: Number,       // Total accepted connections
  pendingRequestsCount: Number,  // Pending incoming requests
  
  // Chat settings
  chatSettings: {
    allowMessagesFrom: String,   // 'everyone' | 'connections' | 'none'
    showOnlineStatus: Boolean,
    readReceipts: Boolean,
    lastSeen: Date
  }
}
```

### Firebase Firestore Structure

#### 3.3 Chat Rooms Collection
```javascript
// Collection: chatRooms
{
  id: "userId1_userId2",         // Sorted user IDs concatenated
  participants: [userId1, userId2],
  participantDetails: {
    userId1: {
      name: "John Doe",
      avatar: "url",
      lastRead: timestamp
    },
    userId2: {
      name: "Jane Smith",
      avatar: "url",
      lastRead: timestamp
    }
  },
  lastMessage: {
    text: "Hello!",
    senderId: userId1,
    timestamp: timestamp,
    type: "text"                 // 'text' | 'image' | 'file' | 'location'
  },
  unreadCount: {
    userId1: 0,
    userId2: 3
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3.4 Messages Subcollection
```javascript
// Subcollection: chatRooms/{roomId}/messages
{
  id: "auto-generated",
  senderId: userId,
  senderName: "John Doe",
  text: "Hello!",
  type: "text",                  // 'text' | 'image' | 'file' | 'location'
  
  // For attachments
  attachmentUrl: "firebase-storage-url",
  attachmentName: "document.pdf",
  attachmentSize: 1024,
  attachmentType: "application/pdf",
  
  // For location
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    address: "New York, NY"
  },
  
  // Message status
  status: "sent",                // 'sending' | 'sent' | 'delivered' | 'read'
  readBy: [userId2],
  deliveredTo: [userId2],
  
  // Metadata
  timestamp: timestamp,
  edited: false,
  editedAt: timestamp,
  deleted: false,
  deletedAt: timestamp,
  replyTo: messageId             // For threaded replies
}
```

#### 3.5 User Presence Collection
```javascript
// Collection: userPresence
{
  userId: "user123",
  status: "online",              // 'online' | 'offline' | 'away'
  lastSeen: timestamp,
  currentChatRoom: "roomId",     // Currently active chat
  typing: {
    roomId: "room123",
    isTyping: true,
    timestamp: timestamp
  }
}
```

---

## 4. Firebase Integration

### 4.1 Firebase Project Setup

**Required Firebase Services:**
- Firebase Authentication (Custom Tokens)
- Cloud Firestore (Real-time Database)
- Firebase Storage (File uploads)
- Firebase Cloud Messaging (Optional - for push notifications)

**Configuration Steps:**
1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Firebase Storage
4. Download service account key (JSON)
5. Add to backend `.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
```

### 4.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isParticipant(roomId) {
      return request.auth.uid in get(/databases/$(database)/documents/chatRooms/$(roomId)).data.participants;
    }
    
    // Chat rooms
    match /chatRooms/{roomId} {
      allow read: if isAuthenticated() && isParticipant(roomId);
      allow create: if isAuthenticated() && request.auth.uid in request.resource.data.participants;
      allow update: if isAuthenticated() && isParticipant(roomId);
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuthenticated() && isParticipant(roomId);
        allow create: if isAuthenticated() && 
                         isParticipant(roomId) && 
                         request.resource.data.senderId == request.auth.uid;
        allow update: if isAuthenticated() && 
                         resource.data.senderId == request.auth.uid;
        allow delete: if isAuthenticated() && 
                         resource.data.senderId == request.auth.uid;
      }
    }
    
    // User presence
    match /userPresence/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

### 4.3 Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chat-attachments/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
    
    match /chat-images/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024 && // 5MB limit
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 5. API Endpoints

### 5.1 Connection Management Endpoints

#### Send Connection Request
```http
POST /api/v1/connections/request
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "recipientId": "user_id",
  "message": "Hi! I'd like to connect with you."
}

Response 201:
{
  "success": true,
  "connection": {
    "_id": "connection_id",
    "requester": "current_user_id",
    "recipient": "recipient_id",
    "status": "pending",
    "requestMessage": "Hi! I'd like to connect with you.",
    "createdAt": "2026-02-05T18:14:51Z"
  }
}
```

#### Get Pending Requests (Incoming)
```http
GET /api/v1/connections/requests/pending
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "requests": [
    {
      "_id": "connection_id",
      "requester": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "requestMessage": "Hi! I'd like to connect.",
      "createdAt": "2026-02-05T18:14:51Z"
    }
  ],
  "total": 5
}
```

#### Accept Connection Request
```http
POST /api/v1/connections/:connectionId/accept
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "connection": {
    "_id": "connection_id",
    "status": "accepted",
    "respondedAt": "2026-02-05T18:20:00Z"
  },
  "chatRoomId": "userId1_userId2"
}
```

#### Reject Connection Request
```http
POST /api/v1/connections/:connectionId/reject
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "connection": {
    "_id": "connection_id",
    "status": "rejected",
    "respondedAt": "2026-02-05T18:20:00Z"
  }
}
```

#### Get My Connections
```http
GET /api/v1/connections/my-connections
Authorization: Bearer <jwt_token>
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - search: string (optional)

Response 200:
{
  "success": true,
  "connections": [
    {
      "_id": "connection_id",
      "user": {
        "_id": "user_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "chatSettings": {
          "showOnlineStatus": true
        }
      },
      "connectedAt": "2026-02-05T18:20:00Z",
      "chatRoomId": "userId1_userId2"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

#### Remove Connection
```http
DELETE /api/v1/connections/:connectionId
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "message": "Connection removed successfully"
}
```

#### Check Connection Status
```http
GET /api/v1/connections/status/:userId
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "status": "accepted",  // 'none' | 'pending' | 'accepted' | 'rejected'
  "connectionId": "connection_id",
  "canSendRequest": false,
  "canChat": true
}
```

### 5.2 Firebase Integration Endpoints

#### Get Firebase Custom Token
```http
POST /api/v1/firebase/token
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "firebaseToken": "custom_firebase_token",
  "expiresIn": 3600
}
```

#### Create/Get Chat Room
```http
POST /api/v1/chat/room
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "participantId": "user_id"
}

Response 200:
{
  "success": true,
  "roomId": "userId1_userId2",
  "exists": true
}
```

#### Upload Chat Attachment
```http
POST /api/v1/chat/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

FormData:
  - file: <file>
  - roomId: "userId1_userId2"

Response 200:
{
  "success": true,
  "url": "https://firebasestorage.googleapis.com/...",
  "fileName": "document.pdf",
  "fileSize": 1024,
  "fileType": "application/pdf"
}
```

---

## 6. Workflow Diagrams

### 6.1 Connection Request Workflow

```mermaid
sequenceDiagram
    participant UA as User A
    participant FE as Frontend
    participant BE as Backend
    participant DB as MongoDB
    participant UB as User B

    UA->>FE: Click "Connect" on User B's profile
    FE->>BE: POST /connections/request
    BE->>DB: Check existing connection
    alt Connection exists
        BE->>FE: Error: Already connected/pending
    else No connection
        BE->>DB: Create connection (status: pending)
        BE->>DB: Increment User B pendingRequestsCount
        BE->>FE: Success response
        FE->>UA: Show "Request Sent"
        
        Note over UB: User B opens app
        UB->>FE: Navigate to Connections page
        FE->>BE: GET /connections/requests/pending
        BE->>DB: Query pending requests
        DB->>BE: Return requests
        BE->>FE: Return requests with user details
        FE->>UB: Display pending requests
        
        alt User B accepts
            UB->>FE: Click "Accept"
            FE->>BE: POST /connections/:id/accept
            BE->>DB: Update status to 'accepted'
            BE->>DB: Increment both users' connectionCount
            BE->>BE: Create Firebase chat room
            BE->>FE: Success + chatRoomId
            FE->>UB: Show "Now connected"
        else User B rejects
            UB->>FE: Click "Reject"
            FE->>BE: POST /connections/:id/reject
            BE->>DB: Update status to 'rejected'
            BE->>FE: Success
            FE->>UB: Request removed
        end
    end
```

### 6.2 Chat Messaging Workflow

```mermaid
sequenceDiagram
    participant UA as User A
    participant FE as Frontend
    participant BE as Backend
    participant FS as Firestore
    participant UB as User B

    UA->>FE: Open chat with User B
    FE->>BE: GET /firebase/token
    BE->>FE: Return Firebase custom token
    FE->>FE: signInWithCustomToken(token)
    FE->>FS: Subscribe to chatRooms/{roomId}/messages
    FS->>FE: Real-time listener established
    
    UA->>FE: Type message
    FE->>FS: Update userPresence (typing: true)
    FS->>UB: Real-time update (User A is typing...)
    
    UA->>FE: Send message
    FE->>FS: Add document to messages collection
    FS->>FS: Trigger onCreate
    FS->>FE: Confirm write
    FS->>UB: Real-time message delivery
    FE->>UA: Show message as sent
    
    UB->>FE: Read message
    FE->>FS: Update message.readBy array
    FS->>UA: Real-time update (message read)
    FE->>UA: Show read receipt
```

### 6.3 File Upload Workflow

```mermaid
sequenceDiagram
    participant UA as User A
    participant FE as Frontend
    participant BE as Backend
    participant ST as Firebase Storage
    participant FS as Firestore

    UA->>FE: Select file to send
    FE->>FE: Validate file (size, type)
    FE->>BE: POST /chat/upload (multipart)
    BE->>BE: Validate file
    BE->>ST: Upload to /chat-attachments/{userId}/
    ST->>BE: Return download URL
    BE->>FE: Return file URL + metadata
    FE->>FS: Create message with attachment
    FS->>FS: Save message
    FS->>FE: Confirm
    FE->>UA: Show message with attachment
```

---

## 7. Frontend Components

### 7.1 Component Structure

```
frontend/apps/dashboard/src/
├── app/
│   ├── users/
│   │   └── [id]/
│   │       └── page.tsx              # User profile with Connect button
│   ├── connections/
│   │   ├── page.tsx                  # Connections list
│   │   └── requests/
│   │       └── page.tsx              # Pending requests
│   └── chat/
│       ├── page.tsx                  # Chat list (all conversations)
│       └── [roomId]/
│           └── page.tsx              # Individual chat interface
├── components/
│   ├── connections/
│   │   ├── ConnectionButton.tsx     # Connect/Pending/Connected button
│   │   ├── ConnectionRequestCard.tsx
│   │   └── ConnectionsList.tsx
│   └── chat/
│       ├── ChatList.tsx             # List of conversations
│       ├── ChatRoom.tsx             # Main chat interface
│       ├── MessageBubble.tsx        # Individual message
│       ├── MessageInput.tsx         # Text input + attachments
│       ├── TypingIndicator.tsx
│       ├── OnlineStatus.tsx
│       └── AttachmentPreview.tsx
└── lib/
    ├── firebase/
    │   ├── config.ts                # Firebase initialization
    │   ├── auth.ts                  # Custom token auth
    │   ├── firestore.ts             # Firestore helpers
    │   └── storage.ts               # Storage helpers
    └── hooks/
        ├── useConnections.ts
        ├── useConnectionStatus.ts
        ├── useChatRoom.ts
        ├── useMessages.ts
        └── usePresence.ts
```

### 7.2 Key Component Examples

#### ConnectionButton Component
```typescript
// components/connections/ConnectionButton.tsx
'use client';

import { useState } from 'react';
import { useConnectionStatus } from '@/lib/hooks/useConnectionStatus';

interface ConnectionButtonProps {
  userId: string;
}

export function ConnectionButton({ userId }: ConnectionButtonProps) {
  const { status, loading, sendRequest, acceptRequest, rejectRequest } = 
    useConnectionStatus(userId);
  
  if (loading) return <button disabled>Loading...</button>;
  
  switch (status) {
    case 'none':
      return (
        <button onClick={sendRequest} className="btn-primary">
          Connect
        </button>
      );
    case 'pending':
      return (
        <button disabled className="btn-secondary">
          Request Sent
        </button>
      );
    case 'accepted':
      return (
        <button className="btn-success" disabled>
          Connected
        </button>
      );
    default:
      return null;
  }
}
```

#### ChatRoom Component
```typescript
// components/chat/ChatRoom.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useMessages } from '@/lib/hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

interface ChatRoomProps {
  roomId: string;
  currentUserId: string;
}

export function ChatRoom({ roomId, currentUserId }: ChatRoomProps) {
  const { messages, loading, sendMessage, markAsRead } = useMessages(roomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    // Mark messages as read when component mounts
    markAsRead();
  }, []);
  
  return (
    <div className="chat-room">
      <div className="messages-container">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
          />
        ))}
        <TypingIndicator roomId={roomId} currentUserId={currentUserId} />
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput onSend={sendMessage} roomId={roomId} />
    </div>
  );
}
```

### 7.3 Custom Hooks

#### useMessages Hook
```typescript
// lib/hooks/useMessages.ts
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useMessages(roomId: string) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const messagesRef = collection(db, `chatRooms/${roomId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [roomId]);
  
  const sendMessage = async (text: string, type = 'text', metadata = {}) => {
    const messagesRef = collection(db, `chatRooms/${roomId}/messages`);
    await addDoc(messagesRef, {
      text,
      type,
      senderId: currentUser.id,
      senderName: currentUser.name,
      timestamp: serverTimestamp(),
      status: 'sent',
      ...metadata
    });
  };
  
  return { messages, loading, sendMessage };
}
```

---

## 8. Security & Privacy

### 8.1 Security Measures

**Backend Security:**
- JWT authentication required for all endpoints
- Connection validation before chat room access
- Rate limiting on connection requests (max 50/day)
- File upload validation (type, size, virus scanning)
- Firebase custom tokens with 1-hour expiry

**Firebase Security:**
- Firestore rules enforce participant validation
- Storage rules validate user ownership
- No direct database access from frontend
- Encrypted data in transit (HTTPS/WSS)

**Privacy Controls:**
- Users can only message connections
- Block functionality to prevent unwanted contact
- Option to hide online status
- Option to disable read receipts
- Message deletion (soft delete)

### 8.2 Data Privacy

**User Data:**
- Minimal data shared in chat (name, avatar only)
- Phone/email not exposed in Firebase
- Connection list is private
- Chat history encrypted at rest

**Compliance:**
- GDPR: Right to delete all messages
- Data export functionality
- Clear privacy policy
- User consent for data processing

---

## 9. Implementation Guide

### Phase 1: Backend - Connection Management (Week 1)

**Step 1: Create Connection Module**
```bash
cd backend
nest generate module connections
nest generate service connections
nest generate controller connections
```

**Step 2: Create Connection Schema**
- File: `src/connections/schema/connection.schema.ts`
- Implement schema as defined in section 3.1

**Step 3: Implement Connection Service**
- File: `src/connections/connections.service.ts`
- Methods: sendRequest, getPendingRequests, acceptRequest, rejectRequest, getMyConnections, removeConnection, checkStatus

**Step 4: Implement Connection Controller**
- File: `src/connections/connections.controller.ts`
- Implement all endpoints from section 5.1
- Add JWT guards to all routes

**Step 5: Update User Schema**
- Add connection-related fields from section 3.2

### Phase 2: Backend - Firebase Integration (Week 2)

**Step 1: Install Firebase Admin SDK**
```bash
npm install firebase-admin
```

**Step 2: Create Firebase Module**
```bash
nest generate module firebase
nest generate service firebase
```

**Step 3: Initialize Firebase Admin**
- File: `src/firebase/firebase.service.ts`
- Initialize with service account credentials
- Implement custom token generation

**Step 4: Create Chat Module**
```bash
nest generate module chat
nest generate service chat
nest generate controller chat
```

**Step 5: Implement Chat Endpoints**
- Token generation endpoint
- Chat room creation
- File upload endpoint

### Phase 3: Frontend - Connection UI (Week 3)

**Step 1: Create Connection Components**
- ConnectionButton component
- ConnectionRequestCard component
- ConnectionsList component

**Step 2: Create Connection Pages**
- `/connections` page
- `/connections/requests` page

**Step 3: Update User Profile**
- Add ConnectionButton to user profile page
- Show connection status

**Step 4: Implement Connection Hooks**
- useConnectionStatus hook
- useConnections hook

### Phase 4: Frontend - Chat Interface (Week 4)

**Step 1: Setup Firebase Client SDK**
```bash
cd frontend
npm install firebase
```

**Step 2: Initialize Firebase**
- Create Firebase config
- Implement custom token authentication

**Step 3: Create Chat Components**
- ChatList component
- ChatRoom component
- MessageBubble component
- MessageInput component
- TypingIndicator component

**Step 4: Create Chat Pages**
- `/chat` page (list of conversations)
- `/chat/[roomId]` page (individual chat)

**Step 5: Implement Chat Hooks**
- useMessages hook
- useChatRoom hook
- usePresence hook

### Phase 5: Advanced Features (Week 5)

**Step 1: File Attachments**
- Implement file upload UI
- Integrate with Firebase Storage
- Add preview functionality

**Step 2: Location Sharing**
- Integrate browser geolocation API
- Display location on map (Google Maps/Mapbox)

**Step 3: Typing Indicators**
- Implement real-time typing status
- Update presence collection

**Step 4: Read Receipts**
- Track message read status
- Display read indicators

**Step 5: Push Notifications**
- Setup Firebase Cloud Messaging
- Send notifications for new messages
- Handle notification clicks

---

## 10. Configuration

### 10.1 Backend Environment Variables

Add to `backend/.env`:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Connection Settings
MAX_CONNECTIONS_PER_USER=500
MAX_CONNECTION_REQUESTS_PER_DAY=50
CONNECTION_REQUEST_COOLDOWN_HOURS=24

# Chat Settings
MAX_MESSAGE_LENGTH=5000
MAX_FILE_SIZE_MB=10
MAX_IMAGE_SIZE_MB=5
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,txt,zip
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp
```

### 10.2 Frontend Environment Variables

Add to `frontend/.env.local`:
```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### 10.3 Firebase Console Configuration

**Firestore Database:**
1. Go to Firebase Console → Firestore Database
2. Create database in production mode
3. Set location (choose closest to users)
4. Apply security rules from section 4.2

**Storage:**
1. Go to Firebase Console → Storage
2. Get started with default bucket
3. Apply storage rules from section 4.3

**Authentication:**
1. Go to Firebase Console → Authentication
2. Enable "Custom" authentication provider
3. No additional configuration needed

### 10.4 Package Dependencies

**Backend (package.json):**
```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0"
  }
}
```

**Frontend (package.json):**
```json
{
  "dependencies": {
    "firebase": "^10.7.0",
    "react-firebase-hooks": "^5.1.1"
  }
}
```

---

## 11. Testing Strategy

### 11.1 Backend Tests

**Unit Tests:**
- Connection service methods
- Firebase token generation
- File upload validation

**Integration Tests:**
- Connection request flow
- Accept/reject connection
- Chat room creation

**Test Commands:**
```bash
npm run test                    # Unit tests
npm run test:e2e               # E2E tests
npm run test:cov               # Coverage report
```

### 11.2 Frontend Tests

**Component Tests:**
- ConnectionButton states
- ChatRoom message rendering
- MessageInput validation

**Integration Tests:**
- Connection request flow
- Real-time message updates
- File upload flow

### 11.3 Manual Testing Checklist

- [ ] Send connection request
- [ ] Accept connection request
- [ ] Reject connection request
- [ ] Send text message
- [ ] Send image
- [ ] Send file attachment
- [ ] Share location
- [ ] Typing indicator works
- [ ] Online status updates
- [ ] Read receipts display
- [ ] Unread count updates
- [ ] Search connections
- [ ] Remove connection
- [ ] Block user

---

## 12. Performance Optimization

### 12.1 Database Optimization

**MongoDB Indexes:**
```javascript
// Connections collection
db.connections.createIndex({ requester: 1, recipient: 1 }, { unique: true });
db.connections.createIndex({ recipient: 1, status: 1 });
db.connections.createIndex({ requester: 1, status: 1 });
db.connections.createIndex({ createdAt: -1 });

// Users collection
db.users.createIndex({ connectionCount: -1 });
```

**Firestore Composite Indexes:**
```javascript
// chatRooms collection
- participants (array), updatedAt (descending)

// messages subcollection
- timestamp (ascending)
- senderId, timestamp (ascending)
```

### 12.2 Frontend Optimization

**React Optimization:**
- Memoize chat components with React.memo
- Use useMemo for filtered/sorted lists
- Implement virtual scrolling for long message lists
- Lazy load images and attachments

**Firebase Optimization:**
- Limit initial message query (last 50 messages)
- Implement pagination for older messages
- Detach listeners when component unmounts
- Use Firebase local persistence

### 12.3 Caching Strategy

**Backend:**
- Cache user connection lists (Redis)
- Cache connection status checks
- TTL: 5 minutes

**Frontend:**
- Cache user profiles
- Cache chat room metadata
- Use SWR or React Query for API calls

---

## 13. Monitoring & Analytics

### 13.1 Metrics to Track

**Connection Metrics:**
- Connection requests sent/received
- Acceptance rate
- Average time to respond
- Total connections per user

**Chat Metrics:**
- Messages sent per day
- Active chat rooms
- Average response time
- File upload success rate

**Performance Metrics:**
- API response times
- Firebase read/write operations
- Storage bandwidth usage
- Error rates

### 13.2 Logging

**Backend Logging:**
```typescript
// Log connection events
logger.info('Connection request sent', {
  requesterId: user.id,
  recipientId: recipient.id,
  timestamp: new Date()
});

// Log errors
logger.error('Failed to create chat room', {
  error: error.message,
  userId: user.id
});
```

**Firebase Logging:**
- Enable Firestore audit logs
- Monitor storage usage
- Track authentication events

---

## 14. Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Firebase project created and configured
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Database indexes created
- [ ] Backend tests passing
- [ ] Frontend tests passing
- [ ] Manual testing completed

### Deployment

- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Verify Firebase connection
- [ ] Test connection request flow
- [ ] Test chat messaging
- [ ] Test file uploads
- [ ] Monitor error logs
- [ ] Check performance metrics

### Post-Deployment

- [ ] Monitor user adoption
- [ ] Track error rates
- [ ] Optimize based on metrics
- [ ] Gather user feedback
- [ ] Plan feature enhancements

---

## 15. Future Enhancements

### Phase 6: Advanced Features

**Group Chats:**
- Multiple participants per chat room
- Group admin controls
- Member management

**Voice/Video Calls:**
- WebRTC integration
- Call history
- Screen sharing

**Message Reactions:**
- Emoji reactions
- Reaction counts
- Animated reactions

**Advanced Search:**
- Search messages within chat
- Search across all chats
- Filter by date/type

**Message Scheduling:**
- Schedule messages to send later
- Recurring messages
- Reminders

**Chat Bots:**
- Automated responses
- Welcome messages
- FAQ bot

---

## Conclusion

This documentation provides a complete blueprint for implementing a production-ready chat messaging system with connection requests in the HelloSphere platform. The system leverages MongoDB for connection management and Firebase for real-time messaging, providing a scalable and performant solution.

**Key Takeaways:**
- Modular architecture allows independent development of features
- Firebase handles real-time complexity
- MongoDB manages relational data (connections)
- Security is enforced at multiple layers
- Scalable design supports growth

**Next Steps:**
1. Review this documentation with the team
2. Set up Firebase project
3. Begin Phase 1 implementation
4. Iterate based on user feedback

For questions or clarifications, refer to the relevant sections or consult the NestJS and Firebase documentation.
