import express          from 'express'
import getPlaylist     from './getPlaylists.controller.js'

const router = express.Router()

router.get('/getPlaylistData', getPlaylist)

export default router