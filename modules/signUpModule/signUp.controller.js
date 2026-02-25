import bcrypt           from 'bcrypt'
import {sql}            from '../../config/db.js'
import AppError         from '../errorHandler/errorHandler.js';

export default async function signUp(req, res, next) {
    const saltRounds = 10;
    const { email, password } = req.body
    try {
        const hashed = await bcrypt.hash(password, saltRounds)

        const newUser = await insertNewUser(email, hashed)
        
        return res.status(201).json({ message: 'User Created' })
    } catch (err) {
        console.error('SINGUP error:', err)
    }
    return res.status(202).json({ message: "accomplished" })
}

async function insertNewUser(email, hashed){
    try{
       const data = await sql`
                INSERT INTO authors (email,password)
                VALUES (${email}, ${hashed})
                ON CONFLICT (email) DO NOTHING
            RETURNING *
        `;
        return data;
    }catch(err){
        throw new AppError(err.message || "signUp querry error", 500)
    }

}