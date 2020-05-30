'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrdemSchema extends Schema {
  up () {
    this.create('ordems', (table) => {
      table.increments()
      table.integer('numero', 8).notNullable()
      table.string('text', 80).notNullable()
      table.integer('programacao_id').unsigned().references('id').inTable('programacaos')
      table.integer('user_id').unsigned().references('id').inTable('users')
     // table.integer('local_id').unsigned().references('id').inTable('locals')
      table.timestamp("created_at").defaultTo(this.fn.now())
      table.timestamp("updated_at").defaultTo(this.fn.now())
    })
  }

  down () {
    this.drop('ordems')
  }
}

module.exports = OrdemSchema
