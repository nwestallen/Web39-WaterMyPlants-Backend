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

const getByPhone = (phone) => {
    return db('users').where({ phone }).first();
};

const add = async user => {
    return await db('users').insert(user, ['username', 'phone'])
};

module.exports = {
    getAll,
    getById,
    getByUsername,
    getByPhone,
    add
};