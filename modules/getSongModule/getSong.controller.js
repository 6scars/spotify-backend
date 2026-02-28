import getSongBySongId from "./getSong-helper-function/getSong.query.js"

export default async function getSong(req, res, next) {
    try {
        const id = req.query.id;
        if (id) {
            const data = await getSongBySongId(id)
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

