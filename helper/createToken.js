import jwt from "jsonwebtoken"
const JWT_SECRET = process.env.JWT_SECRET;

export default async function createToken(userId, userEmail){
    try{
        return await jwt.sign({
                id: userId,
                email: userEmail
            },
                JWT_SECRET,
                { expiresIn: '1h' }
            )
    }catch(err){
        throw ("createToken", err)
    }

}