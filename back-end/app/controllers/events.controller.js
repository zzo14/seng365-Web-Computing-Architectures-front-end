const events = require('../models/events.model');
const db = require('../../config/db');

exports.get_events = async function(req, res) {

    const tableLength = await getTableLength();
    const cIdFomatValid = await check_cid_format(req.query.categoryIds);

    let c_id = [];
    if (typeof req.query.categoryIds === "string" && cIdFomatValid) {
        let num = req.query.categoryIds;
        c_id.push(num);
    }
    if (typeof req.query.categoryIds === "object") {
        c_id = req.query.categoryIds;
    }
    const check_category = await validCategoryId(c_id);
    const check_organizerId = await checkOrganizerCheck(req.query.organizerId);

    try {
        if (cIdFomatValid === false || check_category === false || check_organizerId === false) {
            res.statusMessage = 'Bad Request'
            res.status( 400 ).send();
        } else if (check_category === false) {
            res.statusMessage = 'Bad Request'
            res.status( 400 ).send();
        } else if (check_organizerId === false) {
            res.statusMessage = 'Bad Request'
            res.status( 400 ).send();
        } else {
            let result = await events.get_events(req.query);
            if (result.length === 0) {
                res.statusMessage = 'Bad Request'
                res.status( 400 ).send();
            } else {
                if (req.query.startIndex > tableLength - 1) {
                    result = [];
                }
                res.status( 200 ).send(result);
            }
        }
    } catch ( err ) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
};

exports.post_events = async function (req, res) {
    try {
        const flag = await checkPOST_event(req.body);
        const check_category = await check_categoryIds(req.body.categoryIds)

        if (flag != null) {
            res.statusMessage = 'Bad Request';
            res.status( 400 ).send(flag);
        } else if (check_category === false){
            res.statusMessage = 'Bad Request';
            res.status( 400 ).send();
        }
        else{
            const event_id = await events.addNewEvents(req);
            res.status(201).send({"eventId": event_id});
        }
    } catch ( err ){
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).send('The title is already exist');
        } else {
            res.statusMessage = 'Internal Server Error';
            res.status(500).send(err);
        }
    }
};

exports.getEventById = async function (req, res) {
    try {
        const event_valid = await check_event(req.params.id);
        if (event_valid === false) {
            res.statusMessage = 'Not Found';
            res.status( 404 ).send();
        } else {
            const event_info = await events.get_events_by_id(req.params.id);
            res.status(200).send(event_info);
        }
    } catch ( err ) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}

exports.changeEvent = async function (req, res) {
    try {
        const event_valid = await check_event(req.params.id);
        const organizer_id = await getUserIdByEvent(req.params.id);
        const categoryValid = await validCategoryId(req.query.categoryIds);
        const date_check = await check_date(req);

        if (date_check === false){
            res.statusMessage = 'Bad Request';
            res.status( 400 ).send("Date must be future");
        } else if (event_valid === false) {
            res.statusMessage = 'Not Found';
            res.status( 404 ).send();
        }else if (categoryValid === false){
            res.statusMessage = 'Bad Request';
            res.status( 400 ).send("categoryIds must be an existing category");
        } else if (req.authenticatedUserId != organizer_id[0].organizer_id){
            res.statusMessage = "Forbidden";
            res.status(403).send();
        } else {
            const result = await events.set_event(req);
            res.status(200).json(result);
        }

    } catch ( err ) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}

exports.deleteEvent = async function (req, res) {
    try {
        const event_valid = await check_event(req.params.id);
        const organizer_id = await getUserIdByEvent(req.params.id);
        if (event_valid === false) {
            res.statusMessage = 'Not Found';
            res.status( 404 ).send();
        } else if (req.authenticatedUserId != organizer_id[0].organizer_id){
            res.statusMessage = "Forbidden";
            res.status(403).send();
        } else {
            await events.delete_event(req.params.id);
            res.status(200).send("Deleted");
        }
    } catch (err) {
        res.statusMessage = "Internal Server Error";
        res.status(500).send(err);
    }
}

exports.getCategroy = async function (req, res) {
    try {
        const categories = await events.get_category();
        res.status(200)
            .send(categories);
    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500).send(err);
    }
}

async function check_date(req) {
    let now = new Date();
    now.setHours(now.getHours()+13);
    now = now.toISOString().replace('Z', '').replace('T', ' ')
    if (req.query.date === undefined || req.query.date < now) {
        return 'Date is not in the future'
    } else {
        return req.query.date > now
    }
}

async function check_event(event_id){
    const conn = await db.getPool().getConnection();
    const query = 'SELECT id FROM event WHERE id = ?';

    const [result] = await conn.query(query,  [event_id]);
    conn.release();

    return result.length !== 0;
}

async function checkPOST_event(param) {
    let now = new Date();
    now.setHours(now.getHours()+13);
    now = now.toISOString().replace('Z', '').replace('T', ' ')
    const exist = await check_categoryIds(param.categoryIds);

    if (param.title === undefined) {return 'title request'}
    if (param.description === undefined) {return 'description request'}
    if (param.categoryIds === undefined) {return 'categoryIds request'}
    if (param.date === undefined) {return 'date request'}
    if (param.date < now) {return 'date should be future'}
    if(!exist) {return 'categoryIds should be exist'}
    return null;
}

async function check_categoryIds(categoryId) {
    var flag = false;
    if (categoryId === undefined) {
        return flag
    } else {for (i = 0; i < categoryId.length; i++) {
        const conn = await db.getPool().getConnection();
        const query = 'SELECT id FROM category where id = ?'
        const [result] = await conn.query(query, [categoryId[i]]);
        conn.release()
        if (result[0] !== undefined) {
            flag = true
        } else {
            return false
        }
    }
        return flag}
}

async function check_cid_format(categoryIds){
    if (categoryIds === undefined) {
        return "Undefined value!";
    }
    if (typeof categoryIds === "object") {
        return true;
    }

    if (typeof categoryIds === "string") {
        return !categoryIds.includes("[");
    }
}


async function getTableLength () {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT COUNT(*) FROM event;'
    const [result] = await conn.query(query);
    conn.release();

    return result[0]['COUNT(*)'];
}

async function validCategoryId(c_id) {
    if (c_id === undefined) {
        return "empty value";
    }
    if (c_id.length === 0) {
        return "empty Aarry";
    } else {
        const promises = await c_id.map(id => categoryIdCheck(id));
        const checkRes = await Promise.all(promises);
        const res = checkRes.every(v => v === true);
        return res;
    }
}

 async function categoryIdCheck(id) {
    const conn = await db.getPool().getConnection();
    const query = "select * from `category` WHERE id=?";
    const [rows] = await conn.query(query, [id]);
    conn.release();
    return rows.length !== 0;
}

async function checkOrganizerCheck(organizerId) {
    if(organizerId === undefined){
        return 'empty value';
    } else {
        const conn = await db.getPool().getConnection();
        const sql = conn.format(`SELECT organizer_id FROM event WHERE (id = ?)`, [
            organizerId
        ]);

        const [result] = await conn.query(sql);
        conn.release();

        return result.length > 0;
    }
}

async function getUserIdByEvent(event_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT organizer_id FROM event WHERE id = ?'
    const [result] = await conn.query(query, [event_id]);
    conn.release();
    return result
}