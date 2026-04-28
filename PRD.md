
# Part 1: Product Requirements Document (PRD)

## 1. Executive Summary
This platform is a highly scalable, hybrid application merging core social networking features (following, posting, feeding) with high-performance media and real-time streaming capabilities. The goal is to provide a seamless, low-latency experience where users can discover content, communicate instantly, and consume live media without interruption.

## 2. Core User Journeys & Features

### 2.1 Identity & Social Graph
* **Authentication:** Users must be able to register and log in securely. Sessions will be managed via JWT.
* **Profiles:** Users can customize their presence (`avatar`, `bio`, `city`) and manage privacy (`profileVisibility`).
* **Social Connections:** Users can send friend requests or follow other users. The system must support asynchronous approvals for private accounts.

### 2.2 Content Creation & Engagement
* **Posts:** Users can create diverse content types (`class`: text, image, video link) with specific `visibility` settings.
* **Engagement:** Users can interact with posts via likes and hierarchical comments.
* **Media Handling:** The platform must support rich media uploads (images, videos), tracking `size` and generating secure access URLs.

### 2.3 Discovery & Consumption
* **The Feed:** Users require a dynamic, chronological feed displaying posts exclusively from the users they follow. This feed must load almost instantly upon opening the app.
* **Streaming:** The platform will host real-time video broadcasting and consumption.

### 2.4 Communication & Alerts
* **Direct Messaging:** Real-time, 1-to-1 chat capabilities with read receipts (`isRead`) and media support.
* **Notifications:** Users must receive instant alerts for relevant activities (likes, follows, messages) to drive engagement.

## 3. Non-Functional Requirements
* **Availability:** 99.99% uptime, requiring a decoupled microservices architecture.
* **Latency:** Feed loads must be under 200ms. Messaging must feel instantaneous (sub 50ms).
* **Scalability:** The system must handle sudden spikes in traffic (e.g., a viral post or a popular live stream) without degrading core social features.

---

# Part 2: System Design Document

## 1. High-Level Architecture
The system utilizes a microservices architecture sitting behind an **API Gateway**, which handles rate limiting, request routing, and JWT validation.

### 1.1 Communication Protocols
* **gRPC (Synchronous):** Used for internal, high-speed, blocking requests between services (e.g., the Post Service asking the User Service for a user's details).
* **RabbitMQ (Asynchronous):** Used for event-driven, non-blocking tasks. When a user acts (likes a post, uploads a video), an event is published to a queue to be processed in the background by Notifications, Media, or Feed services.

## 2. Microservices & Database Strategy

To balance relational integrity with unstructured data scale, we employ a Polyglot Persistence strategy.

### 2.1 Auth & User Service (Relational / MySQL)
* **Responsibility:** Managing stateful, highly structured identity data.
* **`user` Table:** `id` (PK), `name`, `email`, `password` (hashed), `avatar`, `bio`, `phone`, `city`
* **`user_settings` Table:** `userId` (FK), `profileVisibility`, `friendRequests`, `messages`
* **`friend_system` Table:** `userId`, `friendId`, `createdAt`
* **`friend_requests` Table:** `userId`, `receiverId`, `createdAt`

### 2.2 Post, Media & Engagement Services (Document / MongoDB)
* **Responsibility:** Storing high-volume, flexible schema data.
* **`post` Collection:** `id`, `userId`, `content`, `visibility`, `url`, `class`
* **`comment` Collection:** `id`, `userId`, `postId`, `content`, `createdAt`
* **`like` Collection:** `userId`, `postId`, `createdAt`
* **`media` Collection:** `id`, `userid`, `url`, `size`, `createdAt`
* **`notifications` Collection:** `id`, `userid`, `type`, `userSourceId`, `isread`, `postId`

### 2.3 Messaging Service (MongoDB + WebSockets)
* **Responsibility:** Handling real-time 1-on-1 chats.
* **`message` Collection:** `userId`, `receiverId`, `text`, `url`, `isread`
* **Architecture:** Users connect via WebSockets. Active connections are mapped in Redis. Messages are saved to MongoDB and immediately pushed to the receiving WebSocket.

## 3. Key System Workflows

### 3.1 The Feed System: Fan-Out on Write (Redis)
To achieve the sub-200ms feed requirement, we pre-compute feeds.
1. **Trigger:** User A creates a post.
2. **Event:** Post Service saves to MongoDB and publishes to RabbitMQ.
3. **Fan-Out:** The Feed Service consumes the event, fetches all followers of User A, and writes the `postId` to the Redis feed of *every* follower.
4. **Data Structure (Redis Sorted Set):** * **Key:** `feed:user_id`
   * **Value:** `postid`
   * **Score:** timestamp (to maintain chronological order).
5. **Retrieval:** When a user opens the app, the API simply fetches the top N `postids` from their Redis feed and retrieves the documents from MongoDB.

### 3.2 Streaming Architecture
* **Ingestion:** Broadcasters send video via WebRTC to ingestion servers for low latency.
* **Processing:** Video is transcoded into multiple bitrates (1080p, 720p, 480p).
* **Delivery:** Streams are distributed via an external CDN (Content Delivery Network) using HLS (HTTP Live Streaming) to viewers.

