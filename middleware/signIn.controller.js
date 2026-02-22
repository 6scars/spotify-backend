import { sql } from '../config/db.js'
import passwordCompare from '../helper/passwordCompare.js';
import createToken from '../helper/createToken.js';

export async function signIn(req, res, next) {
    const { email, password } = req.body;
    try {
        const data = await query(email);
        const { id: userId, password: userPassword, email: userEmail} = data[0];
        const isMatch = await passwordCompare(password, userPassword);

        if (isMatch) {  
            const token = await createToken(userId, userEmail);
            return res.status(201).json({ message: 'logedIn', user_id: userId, token })
        }

        throw 'wrong password'
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err})
    }
}

async function query(email){
    try{
        const data = await sql`
                SELECT id, email, password
                FROM authors
                WHERE authors.email = ${email}
            `;

        return data;
    }catch(err){
        console.error(err);
        throw 'signIn.controller query error';
    }

}



export default signIn;