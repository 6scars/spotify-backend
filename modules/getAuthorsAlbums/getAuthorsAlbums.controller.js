import getAuthorAlbumsByUserIdQuery from "./getAuthors-helper-functions/getAuthorsAlbums.helper.getAuthorAlbumsByIdQuery.js";

export default async function getAuthorsAlbums(req, res, next) {
    const { id, email } = req.payloadJWT;
    try {
        console.log("RESPONSE")
        const response = await getAuthorAlbumsByUserIdQuery(id)
        console.log("RESPONSE", response)
        return res.status(200).json({ message: "good", data: response });

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "getAuthorsAlbums ERROR" })
    }
}


