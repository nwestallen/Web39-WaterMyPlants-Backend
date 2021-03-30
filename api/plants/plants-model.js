const db = require('../data/db-config');

const getAll = () => {
    return db('plants');    
};

const getUserPlants = (userid) => {
    console.log(userid)
    return db('plants').where({ userid }); 
};

module.exports = {
    getAll,
    getUserPlants
}