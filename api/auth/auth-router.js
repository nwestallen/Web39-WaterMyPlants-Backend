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

router.post('/createnewuser', checkRegisterPayload, checkUsernameAvailability, checkPhoneAvailability, (req, res) => {
    const { username, password, phonenumber } = req.body;
    const hash = bcrypt.hashSync(password, 8);
    User.add({ username, password: hash, phonenumber })
      .then(user => {
        //console.log(user[0])
        const access_token = buildToken(user[0]);
        res.status(201).json({user: user[0], access_token, message: 'successful register'})
    })
       .catch(err => res.status(500).json({ message: err.message }));
});

router.post('/login', checkLoginPayload, checkUserExists, (req, res) => {
  const { username, password } = req.body;
  User.getByUsername(username)
  .then(user => {
    //console.log(user)
    if(user && bcrypt.compareSync(password, user.password)) {
      const access_token = buildToken(user);
      res.json({ message: 'successful login', access_token, user });
    } else {
      res.status(401).json({ message: 'invalid credentials' });
    }
  })
  .catch(err => res.status(500).json({ message: err.message }));
});

router.get('/logout', (req, res) => {
  res.json({ message: 'this endpoint does nothing'})
});

function buildToken(user) {
  const payload = {
    subject: user.user_id,
    user
  };
  const config = {
    expiresIn: '40min'
  };
  return jwt.sign(
    payload, JWT_SECRET, config
  );
}

module.exports = router;