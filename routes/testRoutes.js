const router = require("express").Router();
const {
  testCtrl
} = require("../controllers/testControllers");
const validateObjectId = require("../middlewares/validateObjectId");

const {
  verifyToken,
} = require("../middlewares/verifyToken");

router.route("/:id").put(verifyToken, testCtrl);

module.exports = router;
