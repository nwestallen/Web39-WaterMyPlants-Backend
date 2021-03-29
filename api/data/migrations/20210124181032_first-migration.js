exports.up = async (knex) => {
  await knex.schema
    .createTable('users', (users) => {
      users.increments('userid')
      users.string('username', 200).notNullable()
      users.string('password', 200).notNullable()
      users.string('phone', 200).notNullable()
      users.timestamps(false, true)
    })
    .createTable('plants', (plants) => {
      plants.increments('plantid')
      plants.string('nickname', 200).notNullable()
      plants.string('species', 200).notNullable()
      plants.string('h2oFrequency', 200).notNullable()
      plants.integer('userid')
        .unsigned()
        .references('userid')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .notNullable()
    })
}

exports.down = async (knex) => {
  await knex.schema
    .dropTableIfExists('plants')
    .dropTableIfExists('users')
}
