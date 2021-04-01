const express = require('express');
const User = require('./users-model');
const Plant = require('../plants/plants-model');
const { checkUserId } = require('../middleware/users-middleware');
const { JWT_SECRET } = require('../auth/secrets');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/users', (req, res) => {
    User.getAll()
    .then(users => {
        res.json(users);
    })
    .catch(err => res.status(500).json({ message: err.message }))
});

router.get('/user/:id', checkUserId, (req, res) => {
    const userid = req.params.id 
    User.getById(userid)
    .then(user => {
        res.json({ username: user.username, phonenumber: user.phonenumber });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

router.put('/user/:id', checkUserId, (req, res) => {
    const userid = req.params.id;
    const newUser = { ...req.body, userid };
    User.update(newUser)
    .then(user => {
        res.json({ message: 'user info successfully updated', user: user[0] });
    })
    .catch(err => {
        res.status(500).json({ message: err.message })
    })
})

router.get('/user/:id/plants', checkUserId, (req, res) => {
    const userid = req.params.id;
    Plant.getUserPlants(userid)
    .then(plants => {
        res.json(plants);
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

router.get('/getuserinfo', async (req, res) => {
    const token = req.headers.authorization
    console.log('getuserinfo function')
    if (!token) { 
        res.status(400).json({ message: 'no access token detected, no one is logged in' })
    } else {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(401).json({ message: 'token invalid' });
            } else {
                Plant.getUserPlants(decoded.user.userid)
                .then(plants => {
                    console.log({...decoded.user, plants })
                    res.json({...decoded.user, plants}); 
                })
                .catch(err => res.status(500).json({ message: err.message }));
            }
        });
    }
});

module.exports = router;
