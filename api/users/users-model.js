const db = require('../data/db-config');
const bcrypt = require('bcryptjs')

const getAll = () => {
    return db('users').select('userid', 'username', 'phone');
};

const getById = (userid) => {
    return db('users').where({ userid }).first();
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

const update = async user => {
    const { userid, password } = user
    const hash = bcrypt.hashSync(password, 8);
    return await db('users').where({ userid }).update({ ...user, password: hash }, ['username', 'phone']);
};

module.exports = {
    getAll,
    getById,
    getByUsername,
    getByPhone,
    add,
    update
};