const events_image = require('../models/events_image.model');
const db = require('../../config/db');
const path = require('path');
const image_directory = __dirname + '../../../storage/images';
const image_type = ['image/png', 'image/jpeg', 'image/gif'];
const fs = require('mz/fs');


exports.getEventImage = async function (req, res) {
    try{
        const exist = await checkEventExist(req.params.id);
        if (!exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            const image_name = await events_image.get_image(req.params.id);
            if (image_name === null) {
                res.statusMessage = 'Not Found';
                res.status(404).send();
            } else {
                const type_index = image_name.indexOf('.') + 1;
                res.contentType('image/' + image_name.slice(type_index));
                res.status(200).sendFile(path.join(image_directory, image_name))
            }
        }
    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}

exports.setEventImage = async function (req, res) {
    try{
        const exist = await checkEventExist(req.params.id);
        const organizer_id = await getUserIdByEvent(req.params.id);
        if (!exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else if (req.authenticatedUserId != organizer_id[0].organizer_id) {
            res.statusMessage = 'Forbidden';
            res.status(403).send();
        } else if (image_type.indexOf(req.header('Content-Type')) < 0) {  // Check if image being sent is of an accepted type
            res.status(400).send();
        } else {
            const current_image = await getCurrentImage(req.params.id);
            const exist = events_image.set_image(req.params.id, req.header('Content-Type'), req.body);
            if (exist === null) {
                res.status(201).send();
            } else {
                await fs.unlink('./storage/images/' + current_image[0].image_filename);
                res.status(200).send();
            }
        }
    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}



async function checkEventExist(event_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT id FROM event WHERE id = ?'
    const [result] = await conn.query(query, [event_id]);
    conn.release();
    return result.length > 0
}

async function getUserIdByEvent(event_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT organizer_id FROM event WHERE id = ?'
    const [result] = await conn.query(query, [event_id]);
    conn.release();
    return result
}

async function getCurrentImage(event_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT image_filename FROM event WHERE id = ?'
    const [result] = await conn.query(query, [event_id]);
    conn.release();
    return result
}