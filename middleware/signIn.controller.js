import { sql } from '../config/db.js'
import passwordCompare from '../helper/passwordCompare.js';
import createToken from '../helper/createToken.js';
import AppError from './errorHandler.js';

export async function signIn(req, res, next) {
    const { email, password } = req.body;
    try {
        if(!email || !password) {
            return next(new AppError("No email or password", 400))
        };

        const data = await query(email);
        const { id: userId, password: userPassword, email: userEmail} = data[0];

        if(!userId | !userPassword || !userEmail) {
            return next(new AppError("Invalid user data from database", 500))
        }

        const isMatch = await passwordCompare(password, userPassword);

        if(!isMatch){
            return next(new AppError("Wrong password", 401));
        }

        const token = await createToken(userId, userEmail);

        if(!token){
            return next(new AppError("There is not createdtoken", 500))
        }


        return res.status(200).json({ message: 'logedIn', user_id: userId, token })
    } catch (err) {
        next(err)
    }
}

async function query(email){
    try{
        const data = await sql`
                SELECT id, email, password
                FROM authors
                WHERE authors.email = ${email}
            `;

        if(!data || data.length === 0) throw new AppError("User not found", 404);

        return data;
    }catch(err){
        throw new AppError(err.message || "singIn querry error", err.status || 500);
    }

}



export default signIn;