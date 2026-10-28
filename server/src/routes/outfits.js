const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/outfitController");

router.use(auth);

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
router.post("/:id/wear", controller.recordWear);

module.exports = router;