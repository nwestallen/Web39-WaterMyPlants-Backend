
exports.seed = async knex => {
    await knex('users').insert([
        { username: 'OldMan', password: 'password', phone: '444-444-4444'}
    ])
};