const db = require('../data/db-config');

const getAll = () => {
    return db('users');
};

const getById = (id) => {
    return db('users').where({ id }).first();
};

const getByUsername = (username) => {
    return db('users').where({ username }).first();
};

const add = async user => {
    return await db('users').insert(user, ['user_username', 'user_phone'])
};

module.exports = {
    getAll,
    getById,
    getByUsername,
    add
};