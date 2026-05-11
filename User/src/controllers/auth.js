const userModel = require("../models/user.model");
const userSettingsModel = require("../models/user-settings.model");
const bcrypt = require("bcrypt");
const { SuccessResponse, FailedResponse } = require("../views/response");

const jwt = require("jsonwebtoken");


async function register(req, res, next) {
    try {
        const { email, name, phone, password } = req.body;
        const existUser = await userModel.findOne({ where: { email } });

        if (existUser) {
            return res.status(400).json(new FailedResponse(400, "User already exists"));
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({
            email,
            name,
            phone,
            password: hashPassword,
        });
        let userSettings;
        try {
            userSettings = await userSettingsModel.create({
                userid: newUser.id,
            });
        } catch (error) {
            await newUser.destroy();
            throw error;
        }

        res.status(201).json(new SuccessResponse({ user: newUser, settings: userSettings }, 201));
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {

    try {
        //throw new Error("Test error handling in login"); // Test error handling
        const { email, password } = req.body;
        // QUERY: Retrieve user from database by email address
        const existUser = await userModel.findOne({ where: { email } });
        // if (!existUser || bcrypt.compare(password, existUser.password)) {
        //  return res.status(400).json({ message: "invalid credintionals" });
        //}
        // VALIDATION: Verify both user existence and password match
        // CRITICAL FIX: Use bcrypt.compare() instead of direct string comparison
        // Direct comparison fails because stored password is hashed; bcrypt provides cryptographic validation
        const isPasswordValid = existUser && await bcrypt.compare(password, existUser.password);
        if (!isPasswordValid) {
            return res.status(400).json(new FailedResponse(400, "Invalid credentials"));
        }
        // SECURITY: Generate JWT token using environment-based secret for production security
        // CRITICAL FIX: Replaced hardcoded "helloWorld" with JWT_SECRET from environment
        const token = jwt.sign({ id: existUser.id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.status(200).json(new SuccessResponse({ data: token, user: existUser }, 200));
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login };