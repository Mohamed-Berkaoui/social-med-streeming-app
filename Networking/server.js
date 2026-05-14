const { SuccessResponse, ErrorResponse, FailedResponse } = require("./src/views/response.js");
const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");
const { prisma } = require("./src/config/db.js");
const express = require("express");
const { friend } = require("./src/config/db.js");
const app = express();

app.use(express.json());


app.post('/friend-requests/:receiverId/:userId', async function (req, res, next) {
  // Logic to send a friend request
  try {
    const receiverId = req.params.receiverId;
    const userId = req.params.userId;

    /**
     * @todo: check if the user and receiver exist, if they are already friends, if a request is already sent, etc. 
     * witw grpc & protobuf
     */

    const checkUser = axios.get('http://localhost:3001/infos/' + userId)
    const checkReceiver = axios.get('http://localhost:3001/infos/' + receiverId)

    const results = await Promise.all([checkUser, checkReceiver])

    //check if the user and receiver are already friends
    const existingFriendship = await prisma.friend.findFirst({
      where: {
        OR: [
          {
            user_id: parseInt(userId),
            friend_id: parseInt(receiverId)
          },
          { user_id: parseInt(receiverId), friend_id: parseInt(userId) }
        ]
      }
    });

    if (existingFriendship) {
      return res.status(400).json(new FailedResponse(400, "You are already friends"));
    }

    //check if a friend request is already sent
    const existingRequest = await prisma.friend_request.findFirst({
      where: {
        OR: [
          {
            user_id: parseInt(userId),
            receiver_id: parseInt(receiverId)
          },
          { user_id: parseInt(receiverId), receiver_id: parseInt(userId) }
        ]
      }
    });

    if (existingRequest) {
      return res.status(400).json(new FailedResponse(400, "You have already sent a friend request to this user"));
    }

    const friendRequest = await prisma.friend_request.create({
      data: {
        user_id: parseInt(userId),
        receiver_id: parseInt(receiverId),
        created_at: JSON.stringify(new Date())
      }
    })

    res.status(200).json(new SuccessResponse({ friendRequest }, 200));
  } catch (error) {
    next(error);
  }

});
app.get('/friend-requests/:userId', async function (req, res, next) {

  try {
    const userId = req.params.userId;

    const data = await prisma.friend_request.findMany({
      where: {
        OR: [
          { receiver_id: parseInt(userId) },
          { user_id: parseInt(userId) }
        ]
      }
    });

    res.status(200).json(new SuccessResponse({ data }, 200));
  } catch (error) {
    next(error);
  }
})
app.put('/friend-requests/accept/:userId/:senderId', async function (req, res, next) {

  try {
    const userId = req.params.userId;
    const senderId = req.params.senderId;

    //check if the friend request exists
    const existingRequest = await prisma.friend_request.findFirst({
      where:
      {
        user_id: parseInt(senderId),
        receiver_id: parseInt(userId)
      }
    });

    if (!existingRequest) {
      return res.status(404).json(new FailedResponse(404, "Friend request not found"));
    }

    //create the friendship
    const friendship = await prisma.friend.create({
      data: {
        user_id: existingRequest.receiver_id,
        friend_id: existingRequest.user_id,
        created_at: JSON.stringify(new Date())
      }
    });

    //remove the friend request
    await prisma.friend_request.deleteMany({
      where:
      {
        user_id: existingRequest.user_id,
        receiver_id: existingRequest.receiver_id
      }
    });

    res.status(200).json(new SuccessResponse({ friendship }, 200));
  } catch (error) {
    next(error);
  }
});

app.all("*all", function (req, res) {

  console.warn(`404 - Route not found: ${req.originalUrl}`);

  res.status(404).json(
    new FailedResponse(404, "404 not found")
  );
});


app.use(function (error, req, res, next) {
  console.error({
    message: error.message,
    stack: error.stack,
    route: req.originalUrl,
    method: req.method
  });

  res.status(500).json(
    new ErrorResponse(error.message)
  );
});

app.listen(3002, function () {
  console.log("friends service running on port 3002");
})

