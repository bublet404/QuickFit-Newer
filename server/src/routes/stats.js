const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/statsController");

router.use(auth);

router.get("/", controller.getStats);

module.exports = router;