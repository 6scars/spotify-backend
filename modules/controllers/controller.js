import { sql }                  from '../../config/db.js'
import                               '../utils/utils.js';


let controller;



export async function addSongToPlaylist(req, res, next) {
    try {
        const { playlist_id, song_id } = req.body
        const user_id = req.payloadJWT.id

        const data = await sql`
            INSERT INTO playlists_songs (playlist_id, song_id)
            SELECT p.id, ${song_id}
            FROM playlists p
            JOIN authors_playlists ap ON ap.playlist_id = p.id
            WHERE p.id = ${playlist_id} AND ap.author_id = ${user_id}
            RETURNING *;

        `
        console.log(data)
        return res.status(201).json({ message: 'addSongToPlaylist accomplished! song has been added to the playlist.' })
    } catch (err) {
        console.error(err)
        return res.status(500).jsono({ message: "server error" })
    }

}

export async function handleRemoveSong(req, res, next) {
    try {
        const { playlist_id, song_id } = req.body
        const user_id = req.payloadJWT.id
        await sql`
            DELETE FROM playlists_songs
            USING playlists
            JOIN authors_playlists ON playlists.id = authors_playlists.playlist_id
            WHERE playlists_songs.playlist_id = ${playlist_id} 
            AND playlists.id = ${playlist_id}
            AND playlists_songs.song_id = ${song_id}
            AND authors_playlists.author_id = ${user_id}
        `
        return res.status(201).json({ message: 'addSongToPlaylist accomplished! song has been removed from the playlist.' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "server error" })
    }
}

export default controller = {
    handleRemoveSong,
    addSongToPlaylist
}