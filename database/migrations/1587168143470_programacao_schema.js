'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProgramacaoSchema extends Schema {
  up () {
    this.create('programacaos', (table) => {
      table.increments()
      table.integer('semana', 2).notNullable()      
      table.date('data', 10).notNullable()
      table.timestamp("created_at").defaultTo(this.fn.now())
      table.timestamp("updated_at").defaultTo(this.fn.now())
    })
  }

  down () {
    this.drop('programacaos')
  }
}

module.exports = ProgramacaoSchema
