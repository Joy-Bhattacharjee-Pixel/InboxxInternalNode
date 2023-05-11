const db = require("../models");
const Settings = db.settings;

exports.addSettings = async (req, res) => {
    try {
        const response = await Settings.create();
        res.send(response);
    } catch (error) {
        res.send(error.message || "We have faced some issue, please try again later")
    }
}

exports.getSettings = async (req, res) => {
    try {
        const response = await Settings.findAll();
        res.send(response[0]);
    } catch (error) {
        res.send(error.message || "We have faced some issue, please try again later")
    }
}

exports.updateSettings = async (req, res) => {
    const body = req.body;
    const id = 1;
    try {
        const response = await Settings.update(body, { where: { id: id } });
        res.send(response);
    } catch (error) {
        res.send(error.message || "We have faced some issue, please try again later")
    }
}
