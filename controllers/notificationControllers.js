const asyncHandler = require("express-async-handler");
const { Notification, validateCreateNotification, validateUpdateNotification } = require("../models/Notification");
const { User } = require("../models/User");

/**
 * @desc create notification
 * @route /api/notifications
 * @method POST
 * @access private
 */
module.exports.createNotification = asyncHandler(async (req, res) => {
    const { error } = validateCreateNotification(req.body);
    if(error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { title, createdForUser, refType, refId, message } = req.body;

    const user = await User.findById(createdForUser);
    if(!user){
        return res.status(404).json({ message: 'User not found' });
    }

    let ref;
    if(refType === 'User') {
        ref = await User.findById(refId);
    }
    if(refType === 'Task') {
        ref = await Task.findById(refId);
    }
    
    if(!ref) {
        return res.status(404).json({ message: 'reference not found' });
    }

    const notification = await Notification.create({
        title,
        createdForUser,
        refType,
        refId,
        message
    });

    return res.status(201).json({ message: "Notification created", notification });
});

/**
 * @desc update notification
 * @route /api/notifications/:id/notificationId
 * @method PUT
 * @access private
 */
module.exports.updateNotification = asyncHandler(async (req, res) => {
    const { error } = validateUpdateNotification(req.body);
    if(error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { title, message } = req.body;

    const updatedNotification = await Notification.findByIdAndUpdate(req.params.notificationId,
    {
       $set: {
            title,
            message
       }
    },
    { new: true }
    );

    return res.status(200).json({ message: "Notification updated", notification: updatedNotification });
});

/**
 * @desc get single notification
 * @route /api/notifications/:id/notificationId
 * @method GET
 * @access private
 */
module.exports.getSingleNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    let notification = await Notification.findById(notificationId);

    if(!notification) {
        return res.status(404).json({ message: 'Notification Not Found' })
    }

    notification.read = true;
    await notification.save();

    notification = await notification.populate('refId');

    return res.status(200).json({ notification });
});

/**
 * @desc get all notifications or unread/read notifications
 * @route /api/notifications/:id
 * @method GET
 * @access private
 */
module.exports.getAllOrUnreadOrReadNotification = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * perPage;
    
    let filters = {};
    filters.createdForUser = req.user.id;
    if(req.query.read) {
        filters.read = req.query.read === 'true';
    }

    const totalUnread = await Notification
        .countDocuments(filters);

    const notifications = await Notification
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .populate('refId');

    await Notification.updateMany(filters,
        {
            $set: {
                read: true,
            }
        },
        { new: true }
    );
    
    return res.status(200).json({ notifications, totalUnread, page, pages: Math.ceil(totalUnread / perPage) });
});

/**
 * @desc Delete notification
 * @route /api/notifications/:id/notificationId
 * @method DELETE
 * @access private
 */
module.exports.deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.notificationId);
    if(!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    await Notification.findByIdAndDelete(req.params.notificationId);
    
    return res.status(200).json({ message: "Notification deleted" });
});


/**
 * @desc mark notification as read
 * @route /api/notifications/read/:id/:notificationId
 * @method PUT
 * @access private
 */
module.exports.MarkNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.notificationId);
    if(!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    const updatedNotification = await Notification.findByIdAndUpdate(req.params.notificationId,
        {
            $set: {
                read: true
            }
        },
        { new: true }
    );

    return res.status(200).json({ message: "Notification marked as read" });
});