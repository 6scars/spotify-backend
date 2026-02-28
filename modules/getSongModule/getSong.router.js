import express from "express"
import getSong from "../getSongModule/getSong.controller.js"

const router = express.Router()

router.get('/getSong', getSong)

export default router