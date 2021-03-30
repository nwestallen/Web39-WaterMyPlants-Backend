const User = require('../users/users-model');

const checkRegisterPayload = (req, res, next) => {
    const { username, password, phonenumber } = req.body;
    if(!username || !password || !phonenumber) {
        res.status(400).json({ message: 'username, password, and phonenumber are required' });
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
    User.getByPhone(req.body.phonenumber)
    .then(user => {
        if (user) {
            res.status(400).json({ message: 'phonenumber is already taken' });
        } else {
            next();
        }
    })
    .catch(err => next(err));
};

const checkLoginPayload = (req, res, next) => {
    const { username, password } = req.body;
    if(!username || !password) {
        res.status(400).json({ message: 'username and password required' });
    } else {
        next();
    }
};

const checkUserExists = (req, res, next) => {
    User.getByUsername(req.body.username)
    .then(user => {
        if (!user) {
            res.status(401).json({ message: 'invalid credentials' });
        } else {
            next()
        }
    })
    .catch(err => next(err));
};

const checkUserId = (req, res, next) => {
    User.getById(req.params.id)
    .then(user => {
        if (!user) {
            res.status(400).json({ message: `user with id ${req.params.id} not found`})
        }
        else {
            next();
        }
    })
    .catch(err => next(err));
};

module.exports = {
    checkRegisterPayload,
    checkUsernameAvailability,
    checkPhoneAvailability,
    checkLoginPayload,
    checkUserExists,
    checkUserId
};