const express = require('express');
const User = require('./users-model');
const Plant = require('../plants/plants-model');

const router = express.Router();

router.get('/users', (req, res) => {
    User.getAll()
    .then(users => {
        res.json(users);
    })
    .catch(err => res.status(500).json({ message: err.message }))
});

router.get('user/:id', (req, res) => {
    const userid = req.params.id 
    User.getById(userid)
    .then(user => {
        res.json(user);
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

router.get('/user/:id/plants', (req, res) => {
    const userid = req.params.id;
    Plant.getUserPlants(userid)
    .then(plants => {
        res.json(plants);
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

module.exports = router;
