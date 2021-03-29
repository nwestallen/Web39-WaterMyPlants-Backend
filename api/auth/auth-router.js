const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../users/users-model');

const { 
  checkRegisterPayload,
  checkUsernameAvailability,
  checkPhoneAvailability, 
  checkLoginPayload,
  checkUserExists
} = require('../middleware/users-middleware');

const { JWT_SECRET }= require('./secrets');
const jwt = require('jsonwebtoken');

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

router.post('/login', checkLoginPayload, checkUserExists, (req, res) => {
  const { username, password } = req.body;
  User.getByUsername(username)
  .then(user => {
    if(user && bcrypt.compareSync(password, user.password)) {
      const token = buildToken(user);
      res.json({ message: 'successful login', token: token });
    } else {
      res.status(401).json({ message: 'invalid credentials' });
    }
  })
  .catch(err => res.status(500).json({ message: err.message }));
});

function buildToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username
  };
  const config = {
    expiresIn: '40min'
  };
  return jwt.sign(
    payload, JWT_SECRET, config
  );
}

module.exports = router;