const express = require("express")
const router = express.Router()

const upload = require("../../utils/multer")
const { authSupabase } = require("../../middleware/authMiddleware")

const profilesController = require("../../controllers/user/profiles")

router.get("/get-me", authSupabase, profilesController.getOneProfile)
router.post("/profile/upload-avatar", authSupabase, upload.single("avatars"), profilesController.uploadAvatar)

module.exports = router