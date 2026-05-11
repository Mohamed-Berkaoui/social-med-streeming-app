const userModel = require("../models/user.model");
const userSettingsModel = require("../models/user-settings.model");
const { SuccessResponse, FailedResponse } = require("../views/response");


async function updateUserSettings(req, res, next) {
    try {
        const userId = req.params.id;
        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json(new FailedResponse(404, "User not found"));
        }
        const { profilevisibility, friendrequests, messages } = req.body;
        let settings = await userSettingsModel.findOne({ where: { userid: userId } });
        console.log(settings);
        if (!settings) {
            try {
                settings = await userSettingsModel.create({
                    userid: userId,
                    profilevisibility: profilevisibility || "public",
                    friendrequests: friendrequests !== undefined ? friendrequests : true,
                    messages: messages || "all",
                });
            } catch (error) {
                throw error;
            }
        } else {
            settings.profilevisibility = profilevisibility || settings.profilevisibility;
            settings.friendrequests = friendrequests !== undefined ? friendrequests : settings.friendrequests;
            settings.messages = messages || settings.messages;
            await settings.save();
        }
        res.status(200).json(new SuccessResponse({ settings }, 200));
    } catch (error) {
        next(error);
    }

}

module.exports = { updateUserSettings };