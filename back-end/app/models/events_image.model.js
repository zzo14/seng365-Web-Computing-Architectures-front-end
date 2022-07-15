const db = require('../../config/db');
const fs = require('mz/fs');
const image_directory = './storage/images/';

exports.get_image = async function (event_id) {
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT image_filename FROM event WHERE id = ?';
    const [result] = await db.getPool().query(query, [event_id]);
    //conn.release();
    return result[0].image_filename;
}

exports.set_image = async function (event_id, content_type, image) {
    const current_image = await getCurrentImage(event_id);
    const create_image = createImage(event_id, content_type);
    //const conn = await db.getPool().getConnection();
    const query = 'UPDATE event SET image_filename = ? WHERE id = ?';
    await db.getPool().query(query, [create_image, event_id]);
    //conn.release();
    fs.writeFileSync(image_directory+create_image, image);
    return current_image[0].image_filename;
}

async function getCurrentImage(event_id) {
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT image_filename FROM event WHERE id = ?'
    const [result] = await db.getPool().query(query, [event_id]);
    //conn.release();
    return result
}

function createImage(event_id, content_type) {
    /* Creates a filename based on the current time and user_id */
    let minutes = new Date().getMinutes();
    let seconds = new Date().getSeconds();
    return 'user' + '_' + event_id + '_' + minutes + seconds + '.' + content_type.slice(6);
}
