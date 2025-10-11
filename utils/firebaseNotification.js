const admin = require('../config/firebase');
const { Notification } = require('../models/Notification');
const { Task } = require('../models/Task');
const { User } = require('../models/User');

const createAndSendMessageNotification = async (createdForUser, refType, refId, title, body) => {
    await Notification.create({
    createdForUser,
    refType,
    refId,
    title,
    message: body
    });

    const user = await User.findById(createdForUser);
    if (user && user.fcmToken) {
        const message = {
            notification: {
            title: title,
            body: body
            },
            token: user.fcmToken
        };
        admin.messaging.send(message)
        .then(response => {
            console.log('notification sent successfully:', response);
        })
        .catch(error => {
            console.error('error at send notification:', error);
        });
    }   
};

module.exports = {
    createAndSendMessageNotification,
}