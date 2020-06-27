'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class S3Schema extends Schema {
  up () {
    this.create('s_3_s', (table) => {
      table.increments()
      table.string("name")
      table.timestamps()
    })
  }

  down () {
    this.drop('s_3_s')
  }
}

module.exports = S3Schema
