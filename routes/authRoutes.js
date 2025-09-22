const router = require("express").Router();
const {
    loginUserCtrl,
    registerUserCtrl,
} = require("../controllers/authControllers")

router.route("/register")
  .post(registerUserCtrl);

router.route("/login")
  .post(loginUserCtrl);

module.exports = router;
