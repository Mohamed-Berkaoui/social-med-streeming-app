const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectToDb.js");
const User = require("./user.model.js");

const UserSettings = sequelize.define(
  "User_Settings",
  {
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
    },
    profilevisibility: {
      type: DataTypes.ENUM("public", "private", "friends"),
      defaultValue: "public",
    },
    friendrequests: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    messages: {
      type: DataTypes.ENUM("all", "friends_only"),
      defaultValue: "all",
    },
  },
  {
    tableName: "user_settings",
    timestamps: false,
  },
);

module.exports = UserSettings;
