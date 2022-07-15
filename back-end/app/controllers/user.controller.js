const user = require('../models/user.model');
const db = require('../../config/db');
const path = require('path');
const photo_directory = __dirname + '../../../storage/images';
const image_type = ['image/png', 'image/jpeg', 'image/gif'];

exports.userRegister = async function(req, res) {
    try {
        const flag = await checkUserRegister(req.body);
        if (flag != null) {
            res.status(400).send(flag);
        } else{
            const userId = await user.add_user(req.body)
            res.status(201).json({userId});
        }
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
        res.status(400)
            .send('The email address must not already be in use');
    } else {
            res.statusMessage = 'Internal Server Error';
            res.status(500).send(err);
        }
    }
};

exports.userLogin = async function(req, res) {
    try{
        const result = await user.user_login(req.body);
        if (result === null) {
            res.status(400).send('Bad Request');
        } else {
            res.status(200).send(result);
        }
    }catch (err){
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
};

exports.userLogout = async function(req, res) {
    try{
        user.user_logout(req.authenticatedUserId);
        res.status(200).send();
    } catch ( err ){
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
};

exports.userInfo = async function(req, res) {
    try {
        const exist = await checkUserExist(req.params.id);
        if (!exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            const result = await user.get_user(req.params.id, req.header('X-Authorization'));
            if (result.length === 0) {
                res.statusMessage = 'Not Found';
                res.status(404).send();
            } else {
                res.status(200).json(result[0]);
            }
        }
    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
};

exports.userChange = async function(req, res) {
    try {
        const exist = await checkUserExist(req.params.id);
        if (!exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        }else if (req.authenticatedUserId !== req.params.id) {
            res.status(403).send();
        } else {
            const result = await user.change_user(req.params.id, req.body);
            if (typeof result === "string") {
                res.statusMessage = result;
                res.status(400).send();
            } else{
                res.status(200).send();
            }
        }
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400)
                .send('The email address must not already be in use');
        } else {
            res.statusMessage = 'Internal Server Error';
            res.status(500).send(err);
        }
    }
};

exports.userPhotoGet = async function(req, res){
    try{
        const exist = await checkUserExist(req.params.id);
        if (!exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            const photo_name = await user.get_usersPhoto(req.params.id);
            if (photo_name === null) {
                res.statusMessage = 'Not Found';
                res.status(404).send();
            } else{
                const type_index = photo_name.indexOf('.') + 1;
                res.contentType('image/' + photo_name.slice(type_index));
                res.status(200).sendFile(path.join(photo_directory, photo_name));
            }
        }
    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}

exports.userPhotoSet = async function (req, res) {
    try {
        const exist = await checkUserExist(req.params.id);
        if (!exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else if (req.authenticatedUserId !== req.params.id) {
            res.statusMessage = 'Forbidden';
            res.status(403).send();
        } else if (image_type.indexOf(req.header('Content-Type')) < 0) {  // Check if image being sent is of an accepted type
            res.status(400).send();
        } else {
            const exist = await user.delete_userPhoto(req.params.id);
            await user.set_userPhoto(req.params.id, req.header('Content-Type'), req.body);
            if (!exist) {
                res.status(201).send();
            } else {
                res.status(200).send();
            }
        }
    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}

exports.userPhotoDelete = async function (req, res) {
    try {
        const exist = await checkUserExist(req.params.id);
        if (!exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else if (req.authenticatedUserId !== req.params.id) {
            res.statusMessage = 'Forbidden';
            res.status(403).send();
        } else {
            const result = await user.delete_userPhoto(req.params.id);
            if (!result) {
                res.statusMessage = 'Not Found';
                res.status(404).send();
            } else {
                res.status(200).send();
            }
        }
    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}





async function checkUserRegister(user) {
    if (!user.email.includes('@')) {
        return 'The email should be valid'
    }
    if (user.password.length < 1) {
        return 'The password must not be an empty string'
    }
    return null
}

async function checkUserExist(user_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT id FROM user WHERE id = ?'
    const [result] = await conn.query(query, [user_id]);
    conn.release();
    return result.length > 0
}