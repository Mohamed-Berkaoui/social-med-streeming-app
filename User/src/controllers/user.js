const userModel = require("../models/user.model");
const userSettingsModel = require("../models/user-settings.model");
const bcrypt = require("bcrypt");
const { SuccessResponse, FailedResponse } = require("../views/response");

const jwt = require("jsonwebtoken");



async function getUserInfos(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await userModel.findByPk(userId);
    if (!user) {
      return res.status(404).json(new FailedResponse(404, "User not found"));
    }
    let userSettings = await userSettingsModel.findOne({ where: { userid: userId } });
    if (!userSettings) {
      try {
        userSettings = await userSettingsModel.create({
          userid: userId,
        });
      } catch (error) {
        throw error;
      }
    }
    res.status(200).json(new SuccessResponse({ user, settings: userSettings }, 200));
  } catch (error) {
    next(error);
  }
}


async function updateAvatarUser(req, res, next) {
  res.status(200).json(new SuccessResponse({ message: "avatar updated" }, 200));
}

async function updateUserInfos(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await userModel.findByPk(userId);
    if (!user) {
      return res.status(404).json(new FailedResponse(404, "User not found"));
    }
    const { name, email, bio, phone, city } = req.body;


    await user.update({
      name: name || user.name,
      email: email || user.email,
      bio: bio || user.bio,
      phone: phone || user.phone,
      city: city || user.city
    });


    res.status(200).json(new SuccessResponse({ user }, 200));
  } catch (error) {
    next(error);
  }
}
async function updateUserPassword(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await userModel.findByPk(userId);
    if (!user) {
      return res.status(404).json(new FailedResponse(404, "User not found"));
    }
    const { oldPassword, newPassword } = req.body;
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json(new FailedResponse(400, "Invalid current password"));
    }
    const hashNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashNewPassword
    });


    res.status(200).json(new SuccessResponse({ user }, 200));
  } catch (error) {
    next(error);
  }
}


module.exports = { getUserInfos, updateAvatarUser, updateUserInfos, updateUserPassword };
