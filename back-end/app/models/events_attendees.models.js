const db = require('../../config/db');
const status_type = ["accepted", "pending", "rejected"];

exports.get_attendees_by_id = async function(event_id, organizer_id, authorized_user_id) {
    //const conn = await db.getPool().getConnection();
    if (organizer_id === authorized_user_id) {
        const organizer_query = 'SELECT ea.user_id AS attendeeId, a.name AS status, u.first_name AS firstName, ' +
            'u.last_name AS lastName, ea.date_of_interest AS dateOfInterest ' +
            'FROM event_attendees ea, event e, attendance_status a, user u ' +
            'WHERE ea.event_id = ? AND ea.event_id = e.id AND ea.user_id = u.id AND ea.attendance_status_id = a.id ' +
            'ORDER BY ea.date_of_interest ASC'
        const [result] = await db.getPool().query(organizer_query, [event_id]);
        //conn.release();
        return result;
    } else {
        const accepted_query = 'SELECT ea.user_id AS attendeeId, a.name AS status, u.first_name AS firstName, ' +
            'u.last_name AS lastName, ea.date_of_interest AS dateOfInterest ' +
            'FROM event_attendees ea, event e, attendance_status a, user u ' +
            'WHERE ea.event_id = ? AND ea.event_id = e.id AND ea.user_id = u.id ' +
            '                           AND ea.attendance_status_id = 1 AND ea.attendance_status_id = a.id ' +
            'ORDER BY ea.date_of_interest ASC'
        const [result] = await db.getPool().query(accepted_query, [event_id]);

        const auth_query = 'SELECT ea.user_id AS attendeeId, a.name AS status, u.first_name AS firstName, ' +
            'u.last_name AS lastName, ea.date_of_interest AS dateOfInterest ' +
            'FROM event_attendees ea, event e, attendance_status a, user u ' +
            'WHERE ea.event_id = ? AND ea.user_id = ? AND ea.event_id = e.id AND ea.user_id = u.id ' +
            'AND ea.attendance_status_id = a.id AND (ea.attendance_status_id = 2 OR ea.attendance_status_id = 3)'
        const [auth_result] = await db.getPool().query(auth_query, [event_id, authorized_user_id]);

        //conn.release();
        return result.concat(auth_result).sort(sort_time("dateOfInterest"));
    }
}

exports.post_attendees_by_id = async function(event_id, user_id) {
    let now = new Date();
    now.setHours(now.getHours()+13);
    now = now.toISOString().replace('Z', '').replace('T', ' ')

    const timeCheck = await check_time(event_id, now);
    const userCheck = await check_user_joined(event_id, user_id);

    if (!timeCheck) {
        return "Event has closed";
    } else if (!userCheck) {
        return 'The user has already joined';
    } else {
        //const conn = await db.getPool().getConnection();
        const query = "INSERT INTO event_attendees (event_id, user_id, attendance_status_id, date_of_interest) VALUES (?,?,?,?)"
        const [result] = await db.getPool().query(query, [event_id, user_id, 2, now]);
        //conn.release();
        return result
    }
}

exports.delete_attendees = async function(event_id, user_id) {
    let now = new Date();
    now.setHours(now.getHours()+13);
    now = now.toISOString().replace('Z', '').replace('T', ' ')

    const timeCheck = await check_time(event_id, now);
    const userCheck = await check_user_joined(event_id, user_id);

    if (!timeCheck) {
        return "Event has closed";
    } else if (userCheck) {
        return 'The user has not joined this event';
    } else {
        const status = await check_status(event_id, user_id);
        if (!status) {
            return 'The user has be rejected'
        } else {
            //const conn = await db.getPool().getConnection();
            const query = "DELETE FROM event_attendees WHERE event_id = ? AND user_id = ?"
            const [result] = await db.getPool().query(query, [event_id, user_id]);
            //conn.release();
            return result
        }
    }
}

exports.set_attendees_status = async function(event_id, user_id, status){
    const userCheck = await check_user_joined(event_id, user_id);
    const status_num =  status_type.indexOf(status) + 1;

    if (userCheck) {
        return 'This user has not joined this event';
    }else if (status_type.indexOf(status) < 0 ) {
        return 'The status must be one of: "accepted", "pending", or "rejected"'
    } else {
        console.log(status_num);
        //const conn = await db.getPool().getConnection();
        const query = "UPDATE event_attendees SET attendance_status_id = ? WHERE event_id = ? AND user_id = ?"
        const [result] = await db.getPool().query(query, [status_num, event_id, user_id]);
        //conn.release();
        return result
    }
}


function sort_time(p) {
    return function(m, n) {
        var a = m[p];
        var b = n[p];
        return a - b;
    }
}

async function check_time(event_id, now) {
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT date FROM event WHERE id = ?';
    const [event_time] = await db.getPool().query(query, [event_id]);
    //conn.release();
    if (event_time[0].date < now) return false
    else return true
}

async function check_user_joined (event_id, user_id) {
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT id FROM event_attendees WHERE event_id = ? AND user_id = ?';
    const [exist] = await db.getPool().query(query, [event_id, user_id]);
    //conn.release();
    if (exist.length === 0) return true
    else return false
}

async function check_status(event_id, user_id) {
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT attendance_status_id FROM event_attendees WHERE event_id = ? AND user_id = ?';
    const [result] = await db.getPool().query(query, [event_id, user_id]);
    //conn.release();
    if (result[0].attendance_status_id === 3) return false
    else return true
}
