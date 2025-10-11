const router = require("express").Router();
const {
    MarkNotificationAsRead,
    createNotification,
    deleteNotification,
    getAllOrUnreadOrReadNotification,
    updateNotification,
    getSingleNotification,
} = require("../controllers/notificationControllers");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
} = require("../middlewares/verifyToken");

const validateObjectId = require("../middlewares/validateObjectId");

router.route("/")
    .post(verifyTokenAndAdmin, createNotification);

router.route("/:id")
    .get(verifyTokenAndOnlyUser, getAllOrUnreadOrReadNotification);

router.route("/:id/:notificationId")
    .put(validateObjectId, verifyTokenAndAdmin, updateNotification)
    .delete(validateObjectId, verifyTokenAndAdmin, deleteNotification)
    .get(validateObjectId, verifyTokenAndOnlyUser, getSingleNotification);

router.route("/read/:id/:notificationId")
    .put(validateObjectId, verifyTokenAndOnlyUser, MarkNotificationAsRead);

module.exports = router;
