const db = require('../data/db-config');

const getAll = () => {
    return db('plants');    
};

const getById = (plantid) => {
    return db('plants').where({ plantid }).first();
};

const getUserPlants = (userid) => {
    return db('plants').where({ userid }); 
};

const add = plant => {
    return db('plants').insert(plant, ['nickname', 'plantid']);
};

const update = plant => {
    const { plantid } = plant
    return db('plants').where({ plantid }).update(plant, ['nickname', 'plantid']);
};

const remove = plantid => {
    return db('plants').where({ plantid }).del();
};

module.exports = {
    getAll,
    getById,
    getUserPlants,
    add,
    update,
    remove
}