import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

/* returns    PAYLOAD   of   JWT TOKEN   if is  VALID */
export function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: 'Missing token' });
        const token = authHeader.split(' ')[1];
        const payloadJWT = jwt.verify(token, JWT_SECRET)
        req.payloadJWT = payloadJWT;
        next()
    } catch (err) {
        console.err(err)
        return res.status(500).json({ message: 'SERVER PROBLEM' })
    }
}

export default {
    verifyToken
};