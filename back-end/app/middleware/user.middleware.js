const db = require('../../config/db')

exports.loginRequired = async function (req, res, next) {
    const token = req.header('X-Authorization');
    try{
        const result = await findUserIdByToken(token);
        if (result.length === 0) {
            res.statusMessage = "Unauthorized";
            res.status(401).send();
        } else {
            req.authenticatedUserId = result[0].id.toString();
            next();
        }
    } catch (err) {
        if(!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};


async function findUserIdByToken(token) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT id FROM user WHERE auth_token = ?';
    const [result] = await conn.query(query, [token]);
    conn.release();
    return result;
}