const db = require('../../config/db');

exports.get_events = async function(params) {
    //const conn = await db.getPool().getConnection();
    let sql1 = '';
    let sql2 = ''
    let sql_value = [];
    let sort_line = ''
    if (params.q !== undefined) {
        sql1 += 'AND title LIKE "%"?"%"';
        sql_value.push(params.q);
    }
    if (params.categoryIds !== undefined) {
        sql1 += ' AND (';
        for (i = 0; i < params.categoryIds.length; i ++) {
            if (i === 0) {
                sql1 += 'event_category.category_id = ?'
            } else {
                sql1 += ' OR event_category.category_id = ?'
            }
            sql_value.push(params.categoryIds[i]);
        }
        sql1 += ') ';
    }
    if (params.organizerId !== undefined) {
        sql1 += ' AND user.id = ?';
        sql_value.push(params.organizerId);
    }
    if (params.sortBy !== undefined){
        sort_line += (() => {
            switch (params.sortBy) {
                case "ALPHABETICAL_ASC":
                    return "ORDER BY title ASC ";
                case "ALPHABETICAL_DESC":
                    return "ORDER BY title DESC ";
                case "DATE_ASC":
                    return "ORDER BY event.date ASC ";
                case "DATE_DESC":
                    return "ORDER BY event.date DESC ";
                case "ATTENDEES_ASC":
                    return "ORDER BY numAcceptedAttendees ASC ";
                case "ATTENDEES_DESC":
                    return "ORDER BY numAcceptedAttendees DESC ";
                case "CAPACITY_ASC":
                    return "ORDER BY capacity ASC ";
                case "CAPACITY_DESC":
                    return "ORDER BY capacity DESC ";
                default:
                    return "ORDER BY event.date ASC ";
            }
        })();
    }
    if (params.startIndex !== undefined) {
        sql2 += 'LIMIT ?';
        sql_value.push(Number(params.startIndex));
    }
    if (params.count !== undefined) {
        sql2 += ', ?';
        sql_value.push(Number(params.count));
    }
    const query = 'SELECT event.id AS eventId, event.title AS title ,event_category.category_id AS categories, ' +
        'user.first_name AS organizerFirstName, user.last_name AS organizerLastName, ' +
        '(SELECT SUM(event_attendees.attendance_status_id) FROM event_attendees WHERE ' +
        'event_attendees.attendance_status_id = 1 AND event_attendees.event_id = eventId) AS numAcceptedAttendees, ' +
        'event.capacity AS capacity\n' +
        'FROM event,event_category,user,event_attendees\n' +
        'WHERE event.id = event_category.event_id AND event_category.event_id = event_attendees.event_id AND user.id = event.organizer_id ' +
        sql1 + ' GROUP BY event.id '+ sort_line + sql2;
    const [result] = await db.getPool().query(query, sql_value);
    let eventIdArr = [];
    if (result.length !== 0) {
        result.forEach(element => eventIdArr.push(element.eventId));
    }

    if(eventIdArr.length > 0) {
        for(i = 0; i<eventIdArr.length; i++) {
            let c_query = 'SELECT category_id FROM event_category WHERE event_id = ?';
            let [c_result] = await db.getPool().query(c_query, [eventIdArr[i]]);
            let c_array = [];
            for (j = 0; j < c_result.length; j++){
                let c_Id = c_result[j].category_id;
                c_array.push(c_Id);
            }
            result[i].categories = c_array;
            result[i].numAcceptedAttendees = Number(result[i].numAcceptedAttendees);
            }
        }
    return result;
}

exports.addNewEvents = async function(req) {
    const title = req.body.title;
    const description = req.body.description;
    const date = req.body.date;
    const is_online = req.body.isOnline || 0;
    const url = req.body.url;
    const venue = req.body.venue;
    const capacity = req.body.capacity;
    const requires_attendance_control = req.body.requiresAttendanceControl || 0;
    const fee = req.body.fee || 0.0;
    const organizer_id = req.authenticatedUserId;
    const categoryIds = req.body.categoryIds;

    //const conn = await db.getPool().getConnection();
    const add_event_query = 'INSERT INTO event (title, description, date, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
    const [add_event] = await db.getPool().query(add_event_query, [
        title, description, date, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id
    ]);

    if (categoryIds !== undefined) {
        for (i = 0; i < categoryIds.length;i++){
            const add_category_query = `INSERT INTO event_category(event_id, category_id) VALUES(${add_event.insertId}, ${categoryIds[i]})`
            await db.getPool().query(add_category_query);
        }
    }
    //conn.release();
    return add_event.insertId;
}

exports.get_events_by_id = async function(id){
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT event.id AS eventId, event.title, event_category.category_id as categories, user.first_name as organizerFirstName, user.last_name as organizerLastName, (SELECT SUM(event_attendees.attendance_status_id) FROM event_attendees WHERE event_attendees.attendance_status_id = 1 AND event_attendees.event_id = eventId) AS numAcceptedAttendees, event.capacity, event.description, event.organizer_id AS organizerId, event.date, event.is_online as isOnline, event.url, event.venue, event.requires_attendance_control as requiresAttendanceControl, event.fee\n' +
        'FROM event\n' +
        'LEFT JOIN event_category ON event_category.event_id = event.id\n' +
        'LEFT JOIN user ON user.id = event.organizer_id\n' +
        'WHERE event.id = ?'
    const [result] = await db.getPool().query(query, [id]);

    let arr = []
    for (i = 0; i < result.length; i++){
        arr.push(result[i].categories)
    }
    var obj = {};
    let reduce_result = result.reduce((current, next) => {
        obj[next.eventId] ? "" : obj[next.eventId] = current.push(next);
        return current;
    }, [])
    reduce_result[0].categories = arr;
    reduce_result[0].numAcceptedAttendees = Number(reduce_result[0].numAcceptedAttendees);
    reduce_result[0].fee = Number(reduce_result[0].fee);
    reduce_result[0].isOnline = reduce_result[0].isOnline !== 0;
    reduce_result[0].requiresAttendanceControl = reduce_result[0].requiresAttendanceControl !== 0;
    //conn.release();
    return reduce_result
}

exports.set_event = async function(req) {
    const eventId = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const date = req.body.date;
    const is_online = req.body.isOnline;
    const url = req.body.url;
    const venue = req.body.venue;
    const capacity = req.body.capacity;
    const requires_attendance_control = req.body.requiresAttendanceControl || 0;
    const fee = req.body.fee;
    const categoryIds = req.body.categoryIds;

    let sql_set = '';
    let sql_value = [];

    if (title !== undefined) {
        sql_set += ' title = ?';
        sql_value.push(title);
    }
    if (description !== undefined) {
        if (sql_value.length < 1) {
            sql_set += ' description = ?';
        } else {
            sql_set += ', description = ?';
        }
        sql_value.push(description);
    }
    if (date !== undefined) {
        if (sql_value.length < 1) {
            sql_set += ' date = ?';
        } else {
            sql_set += ', date = ?';
        }
        sql_value.push(date);
    }
    if (is_online !== undefined) {
        if (sql_value.length < 1) {
            sql_set += ' is_online = ?';
        } else {
            sql_set += ', is_online = ?';
        }
        sql_value.push(is_online);
    }
    if (url !== undefined) {
        if (sql_value.length < 1) {
            sql_set += ' url = ?';
        } else {
            sql_set += ', url = ?';
        }
        sql_value.push(url);
    }
    if (capacity !== undefined) {
        if (sql_value.length < 1) {
            sql_set += ' capacity = ?';
        } else {
            sql_set += ', capacity = ?';
        }
        sql_value.push(capacity);
    }
    if (venue !== undefined) {
        if (sql_value.length < 1) {
            sql_set += ' venue = ?';
        } else {
            sql_set += ', venue = ?';
        }
        sql_value.push(venue);
    }
    if (requires_attendance_control !== undefined) {
        if (sql_value.length < 1) {
            sql_set += ' requires_attendance_control = ?';
        } else {
            sql_set += ', requires_attendance_control = ?';
        }
        sql_value.push(requires_attendance_control);
    }
    if (fee !== undefined) {
        if (sql_value.length < 1) {
            sql_set += ' fee = ?';
        } else {
            sql_set += ', fee = ?';
        }
        sql_value.push(fee);
    }
    sql_value.push(eventId);

    //const conn = await db.getPool().getConnection();
    const setEventQuery = 'UPDATE event SET ' + sql_set + ' WHERE id = ?';
    await db.getPool().query(setEventQuery, sql_value);

    let c_id = [];
    if (categoryIds !== undefined) {
        const delete_category_query = 'DELETE FROM event_category WHERE event_id = ?'
        await db.getPool().query(delete_category_query, [eventId]);
        for (i = 0; i < categoryIds.length;i++){
            c_id.push(categoryIds[i]);
            const add_category_query = 'INSERT INTO event_category(event_id, category_id) VALUES(?, ?)';
            await conn.query(add_category_query, [eventId, categoryIds[i]]);
        }
    }
    let [result] = await db.getPool().query(`SELECT * FROM event WHERE id = "${eventId}"`);
    //conn.release();
    result[0].categoryIds = c_id;
    return result;
}

exports.delete_event = async function(event_id) {
    //const conn = await db.getPool().getConnection();

    const delete_attendees_query = 'DELETE FROM event_attendees WHERE event_id = ?'
    await db.getPool().query(delete_attendees_query, [event_id]);

    const delete_category_query = 'DELETE FROM event_category WHERE event_id = ?'
    await db.getPool().query(delete_category_query, [event_id]);

    const delete_event_query = 'DELETE FROM event WHERE id = ?'
    const [result] = await conn.query(delete_event_query, [event_id]);

    //conn.release();
    return result;
}

exports.get_category = async function(){
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT id AS categoryId, name FROM category ORDER BY categoryId'
    const [ result ] = await db.getPool().query(query);
    //conn.release();
    return result
}
