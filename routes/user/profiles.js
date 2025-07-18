const express = require("express")
const router = express.Router()

const upload = require("../../utils/multer")

const profilesController = require("../../controllers/user/profiles")

router.post("/profile/:id/upload-avatar", upload.single("avatars"), profilesController.uploadAvatar)

module.exports = router