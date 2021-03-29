const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../users/users-model');

const router = express.Router();

router.post('/register', (req, res) => {
    const { user_username, user_password, user_phone } = req.body;
    const hash = bcrypt.hashSync(user_password, 8);
    User.add({ user_username, user_password: hash, user_phone })
      .then(user => {
        res.status(201).json(user[0])
    })
       .catch(err => res.status(500).json({ message: err.message }));
});

module.exports = router;