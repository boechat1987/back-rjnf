'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LocalSchema extends Schema {
  up () {
    this.create('locals', (table) => {
      table.increments()
      table.string('text', 80).notNullable()
      table.timestamp("created_at").defaultTo(this.fn.now())
      table.timestamp("updated_at").defaultTo(this.fn.now())
    })
  }

  down () {
    this.drop('locals')
  }
}

module.exports = LocalSchema
