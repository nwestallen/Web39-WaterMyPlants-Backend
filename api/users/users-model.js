const db = require('../data/db-config');
const bcrypt = require('bcryptjs')

const getAll = () => {
    return db('users').select('userid', 'username', 'phonenumber');
};

const getById = (userid) => {
    return db('users').where({ userid }).first();
};

const getByUsername = (username) => {
    return db('users').where({ username }).first();
};

const getByPhone = (phonenumber) => {
    return db('users').where({ phonenumber }).first();
};

const add = async user => {
    return await db('users').insert(user, ['userid', 'username', 'phonenumber'])
};

const update = async user => {
    const { userid, password } = user
    const newUser = user
    if (password) { newUser.password = bcrypt.hashSync(password, 8) }
    return await db('users').where({ userid }).update(newUser, ['userid', 'username', 'phonenumber']);
};

module.exports = {
    getAll,
    getById,
    getByUsername,
    getByPhone,
    add,
    update
};