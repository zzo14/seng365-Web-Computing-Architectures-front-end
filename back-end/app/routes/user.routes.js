const user = require('../controllers/user.controller');
const authenticate = require('../middleware/user.middleware');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
        .post(user.userRegister);

    app.route(app.rootUrl + '/users/login')
        .post(user.userLogin);

    app.route(app.rootUrl + '/users/logout')
        .post(authenticate.loginRequired, user.userLogout);

    app.route(app.rootUrl + '/users/:id')
        .get(user.userInfo)
        .patch(authenticate.loginRequired, user.userChange);

    app.route(app.rootUrl + '/users/:id/image')
        .get(user.userPhotoGet)
        .put(authenticate.loginRequired, user.userPhotoSet)
        .delete(authenticate.loginRequired,user.userPhotoDelete);
}