const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectToDb.js");
const { v4 } = require("uuid");
//import { v4 as uuidv4 } from "uuid";
const uuidv4 = v4;

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING, // URL
    },
    bio: {
      type: DataTypes.TEXT,
    },
    phone: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "users",
    //timestamps: true,
  },
);
console.log(sequelize.models.User);
module.exports = User;
