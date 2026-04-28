---
noteId: "9eb6d1203f5411f1bd808579060c506e"
tags: []

---



# Architectural Blueprint: Social & Streaming Ecosystem

This iteration dives into the mechanics of *how* these services interact, specifically leveraging gRPC for synchronous internal calls and RabbitMQ for asynchronous event-driven processes.

## 1. System Communication Strategy

To maintain low latency and high availability across the microservices, we split communication into two paradigms:

* **gRPC (Synchronous):** Used when a service needs an immediate response to proceed. 
    * *Example:* The `Post Service` needs to verify a user's `profileVisibility` before rendering a post. It makes a high-speed gRPC call to the `User Service`.
* **RabbitMQ (Asynchronous/Event-Driven):** Used to decouple heavy tasks from the main request thread, ensuring the user gets an instant HTTP 200 OK.
    * *Example:* When a video is uploaded, the `Media Service` publishes a `VideoUploaded` event. The `Streaming Service` consumes this to start transcoding, and the `Notification Service` consumes it to alert followers.

---

## 2. Granular Data Schema & Storage Routing

By routing structured, relational data to MySQL and unstructured, high-velocity data to MongoDB, we optimize for both integrity and scale.

### A. The Relational Core (postgreSQL)
*Use Case: Strict ACID compliance for authentication, billing, and core identity.*

* **Users Table:** `id` (UUID, PK), `name` (VARCHAR), `email` (VARCHAR, UNIQUE), `password` (HASH), `avatar` (URL), `bio` (TEXT), `phone` (VARCHAR), `city` (VARCHAR).
* **User_Settings Table:** `userId` (FK), `profileVisibility` (ENUM: public, private, friends), `friendRequests` (BOOLEAN), `messages` (ENUM: all, friends_only).
* **Friends Table:** `userId` (FK), `friendId` (FK), `createdAt` (TIMESTAMP). *Composite Primary Key (userId, friendId).*
* **Friend_Requests Table:** `userId` (FK), `receiverId` (FK), `status` (ENUM: pending, accepted, rejected), `createdAt` (TIMESTAMP).

### B. The Document Store (MongoDB)
*Use Case: High write throughput, flexible schemas, and rapid querying for content feeds.*

* **Posts Collection:** * `_id` (ObjectId)
    * `userId` (String/UUID)
    * `content` (String)
    * `visibility` (String)
    * `url` (String - optional)
    * `class` (String - e.g., 'text', 'video_link', 'image')
    * `createdAt` (ISODate)
* **Comments Collection:** `_id`, `userId`, `postId` (Indexed), `content`, `createdAt`.
* **Likes Collection:** `_id`, `userId`, `postId` (Indexed), `createdAt`. *(Often grouped in a single collection to quickly aggregate like counts).*
* **Messages Collection:** `_id`, `userId`, `receiverId`, `text`, `url`, `isRead` (Boolean), `createdAt`. *(Indexed on `userId` + `receiverId` for chat history).*
* **Notifications Collection:** `_id`, `userId` (Indexed), `type` (String: LIKE, COMMENT, FOLLOW), `userSourceId`, `postId`, `isRead`, `createdAt`.

### C. The Media & Asset Tracker (MongoDB + Object Storage)
* **Media Collection:** `_id`, `userId`, `url` (S3/CDN Link), `size` (Number), `type` (String: image/jpeg, video/mp4), `createdAt`.

---

## 3. Deep Dive: The "Fan-Out on Write" Feed Architecture

The feed is the most read-heavy component. Calculating it on the fly (pull model) is too slow. We use a **Push Model** (Fan-out on write) powered by Redis.

**The Workflow:**
1.  **Action:** User A publishes a new post. The HTTP request hits the API Gateway -> `Post Service`.
2.  **Write:** `Post Service` saves the document to MongoDB.
3.  **Event Emission:** `Post Service` publishes a `PostCreated` event (containing `postId` and `userId`) to RabbitMQ.
4.  **Fan-Out Consumption:** The `Feed Service` consumes the event.
5.  **Fetch Connections:** `Feed Service` makes a gRPC call to the `User Service` to get a list of all User A's followers.
6.  **Redis Injection:** For *every* follower, the `Feed Service` pushes the `postId` into their specific Redis Sorted Set (ZSET).
    * *Key:* `feed:user:{followerId}`
    * *Score:* Current Unix Timestamp (ensures chronological ordering).
    * *Value:* `postId`
7.  **Read (Instant):** When a follower opens their app, the API queries `feed:user:{followerId}` in Redis. It retrieves the top 20 `postIds`, fetches those specific documents from MongoDB, and returns the constructed feed.

---

## 4. The Streaming & Real-Time Layer

* **Messages (WebSockets + Redis Pub/Sub):** When User A messages User B, the connection might be on different server instances. We use Redis Pub/Sub to route the WebSocket payload to the exact server where User B maintains their active socket connection.
* **Streaming (WebRTC/HLS):** WebRTC is utilized for 1-to-1 or small group live streaming requiring sub-second latency. For large-scale broadcasts, the video stream is transcoded and pushed to a CDN using HLS (HTTP Live Streaming), dropping latency to ~5-10 seconds but supporting millions of concurrent viewers.

