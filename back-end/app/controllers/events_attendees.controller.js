const attendees = require('../models/events_attendees.models');
const db = require('../../config/db');

exports.getAttendees = async function(req, res) {
    try {
        const exist = await checkEventExist(req.params.id);
        if (!exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            const organizer_id = await get_user_id(req.params.id);
            const authorized_user_id = await get_authorized_user(req);
            const attendees_list = await attendees.get_attendees_by_id(req.params.id, organizer_id, authorized_user_id);
            if(attendees_list.length > 0) {
                res.status(200).json(attendees_list);
            } else {
                res.statusMessage = 'Not Found';
                res.status(404).send();
            }
        }
    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}

exports.postAttendees = async function(req, res) {
    try {
        const exist = await checkEventExist(req.params.id);
        if (!exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        }  else {
            const result = await attendees.post_attendees_by_id(req.params.id, req.authenticatedUserId);
            if (typeof result === 'string') {
                res.statusMessage = result;
                res.status(403).send();
            } else {
                res.status(201).send();
            }
        }
    }catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}

exports.deleteAttendees = async function(req, res) {
    try {
        const exist = await checkEventExist(req.params.id);
        if (!exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            const result = await attendees.delete_attendees(req.params.id, req.authenticatedUserId);
            if (typeof result === 'string') {
                res.statusMessage = result;
                res.status(403).send();
            } else {
                res.status(200).send();
            }
        }
    }catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}

exports.setAttendees = async function(req, res) {
    try {
        const event_exist = await checkEventExist(req.params.event_id);
        const user_exist = await checkUserExist(req.params.user_id);
        if (!event_exist || !user_exist) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            const organizer_id = await get_organizer(req.params.event_id);
            if (req.authenticatedUserId != organizer_id) {
                res.statusMessage = 'Forbidden';
                res.status(403).send();
            } else {
                const result = await attendees.set_attendees_status(req.params.event_id, req.params.user_id, req.body.status);
                if ( result === "This user has not joined this event") {
                    res.statusMessage = result;
                    res.status(403).send();
                } else if (result === 'The status must be one of: "accepted", "pending", or "rejected"') {
                        res.statusMessage = result;
                        res.status(403).send();
                } else {
                        res.status(200).send();
                }
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

async function get_user_id(event_id){
    const conn = await db.getPool().getConnection();
    const query = 'SELECT organizer_id FROM event WHERE id = ?';
    const [result] = await conn.query(query, [event_id]);
    conn.release();
    return result[0].organizer_id
}

async function checkUserExist(user_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT id FROM user WHERE id = ?'
    const [result] = await conn.query(query, [user_id]);
    conn.release();
    return result.length > 0
}

async function get_organizer(event_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT organizer_id FROM event WHERE id = ?';
    const [result] = await conn.query(query, [event_id]);
    conn.release();
    return result[0].organizer_id
}

async function get_authorized_user(req){
    const token = req.header('X-Authorization');
    const conn = await db.getPool().getConnection();
    const query = 'SELECT id FROM user WHERE auth_token = ?';
    const [result] = await conn.query(query, [token]);
    conn.release();
    if (result.length === 0) {
        return undefined
    } else {
        return result[0].id
    }
}