const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const logger = require("./logger");

dotenv.config();

// Sequelize Configuration
const sequelize = new Sequelize(
  process.env.DB_LINK,
  {
    dialect: process.env.DB_DIALECT,
    protocol: process.env.DB_DIALECT,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // VERY IMPORTANT for Neon
      },
    },
  },
);

// Connexion
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Connected to database successfully");
  } catch (error) {
    //console.error("Failed to connect to db", error);
    logger.error({
      message: "Failed to connect to database",
      error: error.message,
      stack: error.stack,
    });
  }
};

module.exports = { sequelize, connectDB };
