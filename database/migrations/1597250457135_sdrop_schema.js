'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SdropSchema extends Schema {
  up () {
    this.create('sdrops', (table) => {
      table.increments()
      table.string("name")
      table.timestamps()
    })
  }

  down () {
    this.drop('sdrops')
  }
}

module.exports = SdropSchema
