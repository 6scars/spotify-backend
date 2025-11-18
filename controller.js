import jwt from 'jsonwebtoken'
import env from 'dotenv'
import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import { sql } from './db.js'
import { createClient } from '@supabase/supabase-js'
import './scripts.js';
env.config()


let controller;
const JWT_SECRET = process.env.JWT_SECRET;
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

async function signIn(req, res, next) {
    const { email, password } = req.body;
    try {
        const data = await sql`
            SELECT id, email, password
            FROM authors
            WHERE authors.email = ${email}
        `;
        const userPassword = data[0].password;
        const userId = data[0].id
        const userEmail = data[0].email

        const isMatch = await bcrypt.compare(password, userPassword);
        if (isMatch) {
            const token = await jwt.sign({
                id: userId,
                email: userEmail
            },
                JWT_SECRET,
                { expiresIn: '1h' }
            )

            return res.status(201).json({ message: 'logedIn', user_id: userId, token })
        } else {
            throw 'wrong password'
        }

    } catch (err) {
        return res.status(401).json({ message: 'wrongPassword' })
    }
}

async function signUp(req, res, next) {
    const saltRounds = 10;
    const { email, password } = req.body
    try {
        const hashed = await bcrypt.hash(password, saltRounds)

        const newUser = await sql`
            INSERT INTO authors (email,password)
            VALUES (${email}, ${hashed})
            ON CONFLICT (email) DO NOTHING
            RETURNING *
        `;
        return res.status(201).json({ message: 'User Created' })
    } catch (err) {
        console.error('SINGUP error:', err)
    }
    return res.status(202).json({ message: "accomplished" })
}

async function playlists(req, res, next) {
    try {
        const { id } = req.body
        if (typeof id != 'number') {
            throw 'playlists function, not valid input'
        }

        const data = await sql`
        SELECT
            authors.id AS author_id,
            authors.author AS author_name,
            authors.email,
            playlists.id AS playlist_id,
            playlists.name AS playlist_name,
            ARRAY_AGG(DISTINCT songs.id) AS song_ids,
            ARRAY_AGG(DISTINCT songs."song_Image") AS song_images
        FROM authors
        INNER JOIN authors_playlists ON authors.id = authors_playlists.author_id
        INNER JOIN playlists ON playlists.id = authors_playlists.playlist_id
        FULL  OUTER JOIN playlists_songs ON playlists_songs.playlist_id = playlists.id
        FULL OUTER JOIN authors_songs ON playlists_songs.song_id = authors_songs.song_id
        LEFT JOIN songs ON authors_songs.song_id = songs.id
        WHERE authors.id = ${id}
        GROUP BY authors.id, authors.author, authors.email, playlists.id, playlists.name;


        `;
        return res.status(202).json({ message: "accomplished", data: data })
    } catch (err) {
        console.error("❌ Error fetching authors:", err);
    }

}

async function fetchSongs(req, res, next) {
    try {
        const data = await sql`
        SELECT
            song_id,
            "song_Name" AS song_name,
            songs."song_Image" AS song_image,
            songs.created_at,
            songs.views,
            authors.follows,
            file,
            credit,
            album_id,
            author_image AS author_image,
            author,
            author_id,
            biograph
        FROM songs
        INNER JOIN authors_songs ON authors_songs.song_id = songs.id
        INNER JOIN authors ON authors.id = authors_songs.author_id

    `
        return res.status(201).json({ message: "accompllished", data })

    } catch (err) {
        console.error('FETCH SONG FAILURE', err);
        return res.status(401).json({ message: 'FETCH SONG FAILURE', error: err })
    }
}

async function checkToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing token' });

    const token = authHeader.split(' ')[1];
    try {
        const verifiedToken = jwt.verify(token, JWT_SECRET)
        if (verifiedToken) {
            return res.status(201).json({ message: "accomplished", token: token })
        } else {
            return res.status(401).json({ message: 'NOT VALID TOKEN' })
        }
    } catch (err) {
        console.error('NOT VALID TOKEN')
        return res.status(401).json({ message: 'NOT VALID TOKEN' })
    }
}


async function addView(req, res, next) {
    const song_id = req.body.song_id;
    const auth = req.headers.authorization;
    let user_id = null;
    let token = auth.split(' ')[1];

    if (token === 'null' || !token) {
        token = null;
    }
    if (token) {
        const verifiedUserData = jwt.verify(token, JWT_SECRET);
        console.log(verifiedUserData)
        user_id = verifiedUserData.id
    }
    try {
        await sql.begin(async sql => {
            await sql`
            UPDATE songs
            SET views = views + 1
            WHERE id = ${song_id}
        `
            await sql`
            INSERT INTO views (user_id, song_id)
            VALUES (${user_id}, ${song_id})
        `

        })



        return res.sendStatus(204)
    } catch (err) {
        console.error('FUNCTION ERORR addView', err)
        return res.sendStatus(500);
    }

}



async function getDataFromToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing or invalid token" });
        }
        const token = authHeader.split(" ")[1];
        const decodedData = jwt.decode(token);
        req.decodedData = decodedData;
        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getAuthorsAlbums(req, res, next) {
    const { id, email } = req.decodedData;
    try {
        const response = await sql`
        SELECT album_name, album.id
        FROM album
        INNER JOIN authors
        ON album.author_id = authors.id
        WHERE authors.id = ${id}
    `
        return res.status(200).json({ message: "good", data: response });

    } catch (err) {
        console.error(err)
        return res.status(200).json({ message: "getAuthorsAlbums ERROR" })
    }


}

export async function saveSongInBase(req, res, next) {
    const fsp = fs.promises; // use promises on the existing fs import

    // Helper to safely unlink a path if it exists
    const safeUnlink = async (p) => {
        try {
            if (!p) return;
            await fsp.unlink(p);
        } catch (err) {
            // log but don't throw (we don't want cleanup failure to mask the real error)
            console.error('unlink error', p, err?.message ?? err);
        }
    };

    let mp3File, imgFile;
    try {
        // parse addSongForm
        if (!req.body?.addSongForm) {
            return res.status(400).json({ message: 'Missing addSongForm' });
        }
        const addSongForm = JSON.parse(req.body.addSongForm);

        if (!addSongForm.song_name) {
            return res.status(400).json({ message: 'Input song Name' });
        }

        // files (names must match router: 'mp3' and 'img')
        mp3File = req.files?.mp3?.[0];
        imgFile = req.files?.img?.[0];
        if (!mp3File || !imgFile) {
            return res.status(400).json({ message: 'Missing files' });
        }

        // read files as buffers using promise API
        const mp3Buffer = await fsp.readFile(mp3File.path);
        const imgBuffer = await fsp.readFile(imgFile.path);

        const mp3Name = path.basename(mp3File.filename);
        const imgName = path.basename(imgFile.filename);

        // Upload MP3
        const { data: mp3Data, error: mp3Error } = await supabase.storage
            .from('spotify')
            .upload(`songs/${mp3Name}`, mp3Buffer, {
                contentType: mp3File.mimetype,
                upsert: true
            });
        if (mp3Error) throw mp3Error;

        // Upload image
        const { data: imgData, error: imgError } = await supabase.storage
            .from('spotify')
            .upload(`images/songPictures/${imgName}`, imgBuffer, {
                contentType: imgFile.mimetype,
                upsert: true
            });
        if (imgError) throw imgError;

        // Insert metadata into DB
        jwt.verify(req.body.token, JWT_SECRET)

        const decodedToken = jwt.decode(req.body.token); // use verify if you need to validate signature
        const { song_name, credit, album_id } = addSongForm;
        const albumIdValue = album_id && album_id !== '' ? album_id : null;


        const insertSongs = await sql`
            INSERT INTO songs ("song_Name", file, "song_Image", credit, album_id)
            VALUES (${song_name}, ${mp3Name}, ${imgName}, ${credit}, ${albumIdValue})
            RETURNING id;
            `;

        const song_id = insertSongs?.[0]?.id;
        if (!song_id) throw new Error('Failed to insert song (no id returned)');

        // Insert into authors_songs junction table
        await sql`
            INSERT INTO authors_songs (author_id, song_id)
            VALUES (${decodedToken.id}, ${song_id});
            `;

        // success response
        return res.status(201).json({
            message: 'Songs have been uploaded!',
        });
    } catch (err) {
        console.error('saveSongInBase error:', err);
        return res.status(500).json({ message: err?.message ?? String(err) });
    } finally {
        // Always try to delete local uploads (won't throw due to safeUnlink)
        await safeUnlink(mp3File?.path);
        await safeUnlink(imgFile?.path);
    }
}

async function createPlaylist(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        const { playlistName, songsToAddArray } = req.body
        /*----verify-----*/
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(400).json({ message: `You are not loged in` })

        const token = authHeader.split(' ')[1]
        const { id: authorId } = jwt.verify(token, JWT_SECRET);

        /*-----sql queries-----*/
        await sql.begin(async tx => {
            let newPlaylistId;
            const insertPlaylists = await sql`
                INSERT INTO playlists (name)
                VALUES (${playlistName})
                RETURNING *
            `

            newPlaylistId = insertPlaylists[0].id
            await tx`
                INSERT INTO authors_playlists (author_id,playlist_id)
                VALUES (${authorId},${newPlaylistId})
            `

            let tuples
            if (songsToAddArray.length > 0) {
                tuples = songsToAddArray
                    .map((id) => tx`(${newPlaylistId},${id})`)
                    .reduce((acc, curr) => tx`${acc}, ${curr}`)

            }
            if (tuples) {
                await tx`
                    INSERT INTO playlists_songs (playlist_id, song_id)
                    VALUES ${tuples}
                `;
            }
        })
        return res.status(201).json({ message: 'createPlaylist function' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: `Creating Playlist ERORR$`, err })
    }
}


async function getPlaylistData(req, res, next) {

    try {
        const id = req.query.id;
        console.log(id)
        if (!id) {
            throw 'SERVER ERROR GET PLAYLISTS DATA, BAD ID'
        }
        const dataPlaylist = await sql`
            SELECT playlists.id, playlists.name, songs.id AS song_id,  songs."song_Name" AS song_name, songs."song_Image" AS song_image, songs.album_id, songs.views ,authors.id AS author_id, authors.author
            FROM playlists
            INNER JOIN playlists_songs
            ON playlists_songs.playlist_id = playlists.id
            INNER JOIN songs
            ON playlists_songs.song_id = songs.id
            INNER JOIN authors_songs
            ON songs.id = authors_songs.song_id
            INNER JOIN authors
            ON authors_songs.author_id = authors.id
            WHERE playlists.id =${id}
        `

        return res.status(201).json({ message: "fetchThePlaylistData", data: dataPlaylist })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "FETCHPLAYLIST ERROR", err })
    }

}

export async function getSong(req, res, next) {
    try {
        const id = req.query.id;
        if (id) {
            const data = await sql`
                SELECT
                    songs.id,
                    "song_Name" AS song_name,
                    songs."song_Image" AS song_image,
                    songs.created_at,
                    songs.views,
                    authors.follows,
                    file,
                    credit,
                    album_id,
                    author_image AS author_image,
                    author,
                    author_id,
                    biograph
                FROM songs
                INNER JOIN authors_songs ON authors_songs.song_id = songs.id
                INNER JOIN authors ON authors.id = authors_songs.author_id
                WHERE songs.id = ${id}
            `
            if (data) {
                return res.status(200).json({ message: "", data: data })
            }
        } else {
            console.error("GET SONG ERROR, IDSONG", err)
            throw 'getSong ERROR ID SONG'
        }
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "SERVER ERROR GETSONG FUNCTION", err })
    }
}


export function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: 'Missing token' });
        const token = authHeader.split(' ')[1];
        const d = jwt.verify(token, JWT_SECRET)
        req.d = d;
        next()
    } catch (err) {
        console.err(err)
        return res.status(500).json({ message: 'SERVER PROBLEM' })
    }
}

export async function addSongToPlaylist(req, res, next) {
    try {
        const { playlist_id, song_id } = req.body
        const user_id = req.d.id

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
        const user_id = req.d.id
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
    verifyToken,

    handleRemoveSong,
    addSongToPlaylist,
    signIn,
    signUp,
    playlists,
    checkToken,
    fetchSongs,
    addView,
    getDataFromToken,
    getAuthorsAlbums,
    saveSongInBase,
    createPlaylist,
    getPlaylistData,
    getSong
}