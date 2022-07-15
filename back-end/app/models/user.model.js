const db = require('../../config/db');
const bcrypt = require('bcrypt');
const fs = require('mz/fs');
const image_directory = './storage/images/';

exports.add_user = async function (user_data) {
    //const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO user (first_name, last_name, email, password) VALUES(?,?,?,?)';
    const hashed_password =  await bcrypt.hash(user_data.password, 10);
    const [result] = await db.getPool().query(query, [user_data.firstName, user_data.lastName, user_data.email, hashed_password]);
    //conn.release();
    return result.insertId;
};

exports.user_login = async function (user_data) {
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT id, password FROM user WHERE email = ?';
    const [result] = await db.getPool().query(query, [user_data.email]);
    //conn.release();
    if (result.length === 0) {
        return null;
    } else {
        const check_password = await bcrypt.compare(user_data.password, result[0].password);
        if(!check_password) {
            return null;
        } else {
            var token = randomNum() + randomNum();
            const t_query = 'UPDATE user SET auth_token = ? WHERE email = ?';
            await db.getPool().query(t_query, [token, user_data.email]);
            return {"userId":result[0].id, "token": token};
        }
    }
};

exports.user_logout = async function (user_id){
    //const conn = await db.getPool().getConnection();
    const query = 'UPDATE user SET auth_token = NULL WHERE id = ?'
    await db.getPool().query(query, [user_id]);
    //conn.release();
};

exports.get_user = async function(user_id, token){
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT first_name AS firstName, last_name AS lastName, email FROM user WHERE id = ?'
    const [ result ] = await db.getPool().query(query, [user_id]);
    const query2 = 'SELECT id FROM user WHERE id = ? AND auth_token = ?'
    const [ id ] = await db.getPool().query(query2, [user_id, token]);
    //conn.release();

    if (id.length === 0) {
        delete result[0].email;
    }
    return result;
};

exports.change_user = async function(user_id, new_info) {
    //const conn = await db.getPool().getConnection();
    let sql_column = 'SET';
    let sql_value = [];
    if (new_info.firstName !== undefined) {
        sql_column += ' first_name = ?';
        sql_value.push(new_info.firstName);
    }
    if (new_info.lastName !== undefined) {
        if (sql_value.length < 1) {
            sql_column += ' last_name = ?';
        } else {
            sql_column += ', last_name = ?';
        }
        sql_value.push(new_info.lastName);
    }
    if (new_info.email !== undefined){
        if (!new_info.email.includes('@')) {
            return 'The email must be syntactically valid';
        } else {
            if (sql_value.length < 1) {
                sql_column += ' email = ?';
            } else {
                sql_column += ', email = ?';
            }
            sql_value.push(new_info.email);
        }
    }
    if (new_info.password !== undefined){
        if (new_info.password.length < 1) {
            return 'The password must not be an empty string';
        } else{
            if (new_info.currentPassword === undefined) {
                return 'The current password must also be provided';
            } else {
                const check_password = 'SELECT password FROM user WHERE id = ?';
                const [password] = await db.getPool().query(check_password, [user_id]);
                const password_correct = await bcrypt.compare(new_info.currentPassword, password[0].password);
                if(password_correct) {
                    if (sql_value.length < 1) {
                        sql_column += ' password = ?';
                    } else {
                        sql_column += ', password = ?';
                    }
                    const hashed_password = await bcrypt.hash(new_info.password, 10);
                    sql_value.push(hashed_password);
                } else {
                    return 'Incorrect password';
                }
            }
        }
    }
    const query = 'UPDATE user ' + sql_column + ' WHERE id = ?';
    sql_value.push(user_id);
    const [result] = await db.getPool().query(query, sql_value);
    //conn.release();
    return result;
}

exports.get_usersPhoto = async function (user_id) {
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT image_filename FROM user WHERE id = ?';
    const [result] = await db.getPool().query(query, [user_id]);
    //conn.release();
    return result[0].image_filename;
}

exports.set_userPhoto = async function (user_id, content_type, image) {
    //const conn = await db.getPool().getConnection();
    const new_image_name = createImage(user_id, content_type);
    const query = 'UPDATE user SET image_filename = ? WHERE id = ?';
    await db.getPool().query(query, [new_image_name, user_id]);
    //conn.release();
    fs.writeFileSync(image_directory+new_image_name, image);
}

exports.delete_userPhoto = async function (user_id) {
    //const conn = await db.getPool().getConnection();
    const f_query = 'SELECT image_filename FROM user WHERE id = ?';
    const [image_name] = await db.getPool().query(f_query, [user_id]);
    if (image_name[0].image_filename === null) {
        //conn.release();
        return false;
    } else {
        const delete_query = 'UPDATE user SET image_filename = null WHERE id = ?'
        await db.getPool().query(delete_query, [user_id]);
        //conn.release();
        await fs.unlink(image_directory + image_name[0].image_filename);
        return true;
    }
}



function randomNum() {
    return Math.random().toString(36).substr(2);
}

function createImage(user_id, content_type) {
    /* Creates a filename based on the current time and user_id */
    let minutes = new Date().getMinutes();
    let seconds = new Date().getSeconds();
    return 'user' + '_' + user_id + '_' + minutes + seconds + '.' + content_type.slice(6);
}
