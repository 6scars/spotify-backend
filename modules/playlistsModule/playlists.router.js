import express          from "express"
import playlists        from "./playlists.controller.js"

const router = express.Router();

router.post('/playlists', playlists)
export default router