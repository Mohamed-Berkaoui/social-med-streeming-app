const express = require("express");
const { connectDB } = require("./src/config/connectToDb");
const { getUserInfos, updateAvatarUser, updateUserInfos, updateUserPassword } = require("./src/controllers/user");
const { updateUserSettings } = require("./src/controllers/settings");
const { login, register } = require("./src/controllers/auth");
const upload = require("./src/config/multerUploader");
const { ErrorResponse, FailedResponse } = require("./src/views/response.js");

const logger = require("./src/config/logger");

const app = express();

app.use(express.json());


app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.post("/register", register);
app.post("/login", login);
app.get("/infos/:id", getUserInfos);
app.put("/settings/:id", updateUserSettings);
app.put("/infos/:id", updateUserInfos);
app.put("/password/:id", updateUserPassword);

app.post('/upload', upload.single('file'), updateAvatarUser);


app.all("*all", function (req, res) {

  logger.warn(`404 - Route not found: ${req.originalUrl}`);

  res.status(404).json(
    new FailedResponse(404, "404 not found")
  );
});


app.use(function (error, req, res, next) {

  logger.error({
    message: error.message,
    stack: error.stack,
    route: req.originalUrl,
    method: req.method
  });

  res.status(500).json(
    new ErrorResponse(error.message)
  );
});


connectDB()
  .then(function () {
    app.listen(3001, function () {
      logger.info("User service running on port 3001");
    });
  })
  .catch((error) => {
    logger.error({
      message: "Database connection failed",
      error: error.message
    });
  });