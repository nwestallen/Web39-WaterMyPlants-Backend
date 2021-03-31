const Plant = require('../plants/plants-model');
const User = require('../users/users-model');

const checkPlantExists = (req, res, next) => {
    const { plantid } = req.params;
    Plant.getById(plantid)
    .then(plant => {
        if (!plant) {
            res.status(400).json({ message: `plant with id ${plantid} does not exist`});
        } else {
            next();
        }
    })
    .catch(err => next(err));
};

const checkUserExists = (req, res, next) => {
    const { userid } = req.params;
    User.getById(userid)
    .then(user => {
        if (!user) {
            res.status(400).json({ message: `user with id ${userid} does not exist` })
        } else {
            next();
        }
    })
    .catch(err => next(err));
};

const checkPlantPayload = (req, res, next) => {
    const { nickname, species, h2oFrequency } = req.body;
    if ( !nickname || !species || !h2oFrequency ) {
        res.status(400).json({ message: 'nickname, species, and h2oFrequency fields are required'});
    } else {
        next()
    }
};

module.exports = {
    checkPlantExists,
    checkUserExists,
    checkPlantPayload
};