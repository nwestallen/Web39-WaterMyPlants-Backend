const express = require('express');
const Plant = require('./plants-model');

const router = express.Router()

router.get('/plants', (req, res) => {
    Plant.getAll()
    .then(plants => {
        res.json(plants);
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

router.get('/plant/:plantid', (req, res) => {
    Plant.getById(req.params.plantid)
    .then(plant => {
        res.json(plant);
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

router.post('/plant', (req, res) => {
    Plant.add(req.body)
    .then(plant => {
        res.json(plant);
    })
    .catch(err => {
        res.status(500).json({ message: err.message })
    });
});

router.put('/plant/:plantid', (req, res) => {
    Plant.update(req.body)
    .then(plant => {
        res.json(plant);
    })
    .catch(err => { 
        console.log(err);
        res.status(500).json({ message: err.message })
    });
});

router.delete('/plant/:plantid', (req, res) => {
    Plant.remove(req.params.plantid)
    .then(() => {
        res.json({ message: `plant with id ${req.params.plantid} successfully deleted`})
    })
    .catch(err => { res.status(500).json({ message: err.message })});
});


module.exports = router