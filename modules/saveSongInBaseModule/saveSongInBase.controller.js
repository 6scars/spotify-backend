import fs                       from "fs";
import jwt                      from "jsonwebtoken";
import path                     from "path";
import { sql }                  from "../../config/db.js";
import { createClient }         from '@supabase/supabase-js'
import AppError                 from "../errorHandler/errorHandler.js";


export const JWT_SECRET = process.env.JWT_SECRET;
export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)


export default async function saveSongInBase(req, res, next) {
    const fsp = fs.promises; // use promises on the existing fs import

    // Helper to safely unlink a path if it exists
    const safeUnlink = async (p) => {
        try {
            if (!p) return;
            await fsp.unlink(p);
        } catch (err) {
            next(err)
        }
    };

    let mp3File, imgFile;
    try {
        // parse addSongForm
        if (!req.body?.addSongForm) {
            throw new AppError('saveSongInBase req.body.addSongForm missing', 500)
        }
        const addSongForm = JSON.parse(req.body.addSongForm);

        if (!addSongForm.song_name) {
            throw new AppError('saveSongInBase addSongForm.song_name missing', 500)
        }

        // files (names must match router: 'mp3' and 'img')
        console.log(req.files?.mp3?.[0])
        mp3File = req.files?.mp3?.[0];
        imgFile = req.files?.img?.[0];
        if (!mp3File || !imgFile) {
            throw new AppError('saveSongInBase  req.files?.mp3?  & req.files?.img? missing', 500)
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
        if (mp3Error) throw new AppError(`saveSongInBase supabase.storage error ${mp3Error}`, mp3Error.message)

        // Upload image
        const { data: imgData, error: imgError } = await supabase.storage
            .from('spotify')
            .upload(`images/songPictures/${imgName}`, imgBuffer, {
                contentType: imgFile.mimetype,
                upsert: true
            });
        if (imgError) throw new AppError(`saveSongInBase supabase.storage error ${imgError}`, imgError.message)


        // Insert metadata into DB
        jwt.verify(req.body.token, JWT_SECRET)

        const decodedToken = jwt.decode(req.body.token); 
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
        next(err)
    } finally {
        // Always try to delete local uploads (won't throw due to safeUnlink)
        await safeUnlink(mp3File?.path);
        await safeUnlink(imgFile?.path);
    }
}