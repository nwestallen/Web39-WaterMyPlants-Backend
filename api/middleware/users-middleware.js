const User = require('../users/users-model');

const checkRegisterPayload = (req, res, next) => {
    const { username, password, phone } = req.body;
    if(!username || !password || !phone) {
        res.status(400).json({ message: 'username, password, and phone are required' });
    } else {
        next();
    }
};

const checkUsernameAvailability = (req, res, next) => {
    User.getByUsername(req.body.username)
    .then(user => {
        if (user) {
            res.status(400).json({ message: 'username is already taken' });
        } else {
            next();
        }
    })
    .catch(err => next(err));
};

const checkPhoneAvailability = (req, res, next) => {
    User.getByPhone(req.body.phone)
    .then(user => {
        if (user) {
            res.status(400).json({ message: 'phone number is already taken' });
        } else {
            next();
        }
    })
    .catch(err => next(err));
};

module.exports = {
    checkRegisterPayload,
    checkUsernameAvailability,
    checkPhoneAvailability
};