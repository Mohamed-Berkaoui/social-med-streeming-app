import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectToDb.js";
import User from "./user.model.js";

const UserSettings = sequelize.define(
  "User_Settings",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
    },
    profileVisibility: {
      type: DataTypes.ENUM("public", "private", "friends"),
      defaultValue: "public",
    },
    friendRequests: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    messages: {
      type: DataTypes.ENUM("all", "friends_only"),
      defaultValue: "all",
    },
  },
  {
    tableName: "User_Settings",
    timestamps: false,
  },
);

export default UserSettings;
