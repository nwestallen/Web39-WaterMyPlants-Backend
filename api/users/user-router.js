const express = require('express');
const User = require('./users-model');
const Plant = require('../plants/plants-model');
const { checkUserId } = require('../middleware/users-middleware');

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
    User.update({...req.body, userid})
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

module.exports = router;
