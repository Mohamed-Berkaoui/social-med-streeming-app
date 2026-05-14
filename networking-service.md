# Networking Service (Friends & Requests)

## Purpose

Manages the social graph: friend requests, approvals, and removals. This service supports private accounts with asynchronous approval.

## Scope

- Send friend request
- Accept or reject friend request
- Cancel outgoing request
- Remove friend
- List friends and pending requests

## Data Store

Relational DB (align with the User Service DB engine).

## Schema

### friends

- userId (FK -> users.id)
- friendId (FK -> users.id)
- createdAt (TIMESTAMP)
- Primary Key: (userId, friendId)

### friend_requests

- userId (FK -> users.id)
- receiverId (FK -> users.id)
- status (ENUM: pending, accepted, rejected)
- createdAt (TIMESTAMP)
- Primary Key: (userId, receiverId)
- Index: receiverId

## API Endpoints (HTTP)

Base path: /networking

### POST /friend-requests

Create a new friend request.

- Body: { receiverId, userId }
- Response: { requestId, status }

### GET /friend-requests

List incoming and/or outgoing requests.

- Query: direction=incoming|outgoing, status=pending|accepted|rejected
- Response: { items: [...] }

### PATCH /friend-requests/:receiverId/accept

Accept a friend request.

- Response: { status: accepted }

### PATCH /friend-requests/:receiverId/reject

Reject a friend request.

- Response: { status: rejected }

### DELETE /friend-requests/:receiverId

Cancel an outgoing request.

- Response: { status: cancelled }

### GET /friends

List current friends for the authenticated user.

- Query: limit, cursor
- Response: { items: [...] }

### DELETE /friends/:friendId

Remove a friend.

- Response: { status: removed }

## Events (Async)

Publish to RabbitMQ for downstream services.

- FriendRequestCreated
- FriendRequestAccepted
- FriendRequestRejected
- FriendRemoved

## Service Notes

- Enforce uniqueness on (userId, receiverId) for pending requests.
- On accept: create reciprocal rows in friends and update request status.
- Private accounts require approval; public accounts can auto-accept if desired.
