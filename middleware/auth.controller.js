import jwt from 'jsonwebtoken'
import env from 'dotenv';
env.config();

const JWT_SECRET = process.env.JWT_SECRET


/* req.verifyToken <- jwt.decode(token)*/
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


// export async function createToken(req,res,next){
//     try{
//         const token = await jwt.sign({
//                 id: userId,
//                 email: userEmail
//             },
//                 JWT_SECRET,
//                 { expiresIn: '1h' }
//             )
//             console.log("create Token: ", token);
//         return;
//     }catch(err){
//         console.warn('createToken error')
//         return res.status(500).json({message:"server error",err});
//     }


// }
export default {
    verifyToken
};