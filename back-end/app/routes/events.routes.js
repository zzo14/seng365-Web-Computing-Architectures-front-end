const events = require('../controllers/events.controller');
const authenticate = require('../middleware/user.middleware');
const events_image = require('../controllers/events_image.controller');
const attendees = require('../controllers/events_attendees.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/events')
        .get(events.get_events)
        .post(authenticate.loginRequired, events.post_events);

    app.route(app.rootUrl + '/events/categories')
        .get(events.getCategroy);

    app.route(app.rootUrl + '/events/:id')
        .get(events.getEventById)
        .patch(authenticate.loginRequired,events.changeEvent)
        .delete(authenticate.loginRequired,events.deleteEvent);

    app.route(app.rootUrl + '/events/:id/image')
        .get(events_image.getEventImage)
        .put(authenticate.loginRequired, events_image.setEventImage);

    app.route(app.rootUrl + '/events/:id/attendees')
        .get(attendees.getAttendees)
        .post(authenticate.loginRequired, attendees.postAttendees)
        .delete(authenticate.loginRequired, attendees.deleteAttendees);

    app.route(app.rootUrl + '/events/:event_id/attendees/:user_id')
        .patch(authenticate.loginRequired,attendees.setAttendees);
}
