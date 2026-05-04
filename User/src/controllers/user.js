const userModel = require("../models/user.model");
const userSettingsModel = require("../models/user-settings.model");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

async function register(req, res, next) {
  try {
    const { email, name, phone, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);
    const newUser = await userModel.create({
      email,
      name,
      phone,
      password: hashPassword,
    });
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const existUser = await userModel.findOne({ email });

    if (!existUser || existUser.password != password) {
      return res.status(400).json({ message: "invalid credintionals" });
    }

    const token = jwt.sign({ id: existUser._id }, "helloWorld", {
      expiresIn: "1d",
    });

    res.json({ data: token });
  } catch (error) {
    next(error);
  }
}

async function getUserInfos(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getUserInfos };
