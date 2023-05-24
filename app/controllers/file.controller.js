const path = require('path');

exports.getFile = async (req, res) => {
    if (!req.params.id) {
        res.send("");
    }
    try {
        const filePath = path.resolve(path.dirname('')) + "/resources/static/assets/tmp/" + req.params.id;
        res.sendFile(filePath);
    } catch (error) {
        res.send(error.message || "We have faced some issue, please try again later");
    }
}

exports.getFile2 = async (req, res) => {
    if (!req.params.id) {
        res.send("");
    }
    try {
        const filePath = path.resolve(path.dirname('')) + "/resources/static/assets/uploads/" + req.params.id;
        res.sendFile(filePath);
    } catch (error) {
        res.send(error.message || "We have faced some issue, please try again later");
    }
}