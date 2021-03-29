const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../users/users-model');
const { checkRegisterPayload, checkUsernameAvailability, checkPhoneAvailability } = require('../middleware/users-middleware');

const router = express.Router();

router.post('/register', checkRegisterPayload, checkUsernameAvailability, checkPhoneAvailability, (req, res) => {
    const { username, password, phone } = req.body;
    const hash = bcrypt.hashSync(password, 8);
    User.add({ username, password: hash, phone })
      .then(user => {
        res.status(201).json(user[0])
    })
       .catch(err => res.status(500).json({ message: err.message }));
});

module.exports = router;