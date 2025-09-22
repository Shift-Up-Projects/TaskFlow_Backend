const router = require("express").Router();
const {
  deleteUserCtrl,
  getAllUsersCtrl,
  updateUserCtrl,
  verifyUserAccountCtrl,
  getSingleUserCtrl,
} = require("../controllers/userControllers");

const {
    sendResetPasswordLinkCtrl,
    getResetPasswordLinkCtrl,
    resetPasswordCtrl,    
} = require("../controllers/authControllers")

const {
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyToken");

const validateObjectId = require("../middlewares/validateObjectId")
router.route("/forgot-password")
    .post(sendResetPasswordLinkCtrl);

router.route("/reset-password/:id/:resetPasswordToken")
    .get(validateObjectId, getResetPasswordLinkCtrl);

router.route("/reset-password")
    .post(resetPasswordCtrl);

router.route("/")
    .get(verifyToken, getAllUsersCtrl);

router.route("/current-user")
    .get(verifyToken, getSingleUserCtrl);
    
router.route("/:id")
    .delete(validateObjectId, verifyTokenAndAuthorization, deleteUserCtrl)
    .put(validateObjectId, verifyTokenAndAuthorization, updateUserCtrl);

router.route("/verrify-account/:id/:verificationToken")
    .get(validateObjectId, verifyUserAccountCtrl)

module.exports = router;
