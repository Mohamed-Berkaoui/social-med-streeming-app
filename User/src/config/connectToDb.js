const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

// Sequelize Configuration
const sequelize = new Sequelize(
  "postgresql://neondb_owner:npg_oBPjptsWI02F@ep-noisy-hat-anxp36nv-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",

  {
    dialect: "postgres",
    protocol: "postgres",
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
    console.log("Connected to db");
  } catch (error) {
    console.error("Failed to connect to db", error);
  }
};

module.exports = { sequelize, connectDB };
