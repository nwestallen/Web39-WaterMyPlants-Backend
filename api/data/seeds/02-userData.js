const bcrypt = require('bcryptjs')
const hash = bcrypt.hashSync('password', 8)

exports.seed = async knex => {
    await knex('users').insert([
        { username: 'OldMan', password: hash, phone: '444-444-4444'}
    ])
};