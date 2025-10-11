const mongoose = require("mongoose");

module.exports = (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "invalid id" });
    }
    if(req.params.notificationId && !mongoose.Types.ObjectId.isValid(req.params.notificationId)) {
        return res.status(400).json({ message: "invalid notificationId" });
    }
    if(req.params.taskId && !mongoose.Types.ObjectId.isValid(req.params.taskId)) {
        return res.status(400).json({ message: "invalid taskId" });
    }
    next();
}