'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SobreavisoSchema extends Schema {
  up () {
    this.create('sobreavisos', (table) => {
      table.increments()
      table.string('date', 10)
      table.integer('totalHoras', 2)
      table.integer('telefone', 11)
      table.string('tecAreaUm', 80)
      table.string('tecAreaDois', 80)
      table.string('tecAreaSete', 80)
      table.timestamp("created_at").defaultTo(this.fn.now())
      table.timestamp("updated_at").defaultTo(this.fn.now())
    })
  }

  down () {
    this.drop('sobreavisos')
  }
}

module.exports = SobreavisoSchema
