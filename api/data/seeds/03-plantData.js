
exports.seed = async knex => {
    await knex('plants').insert([
        {nickname: 'steve', species: 'aloe vera', h2ofrequency: '7', userid: 1},
        {nickname: 'rubber plant', species: 'ficus elastica', h2ofrequency: '4', userid: 1}
    ])
};