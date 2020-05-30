'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Ordem extends Model {

    programacaos () {
        return this.hasMany('App/Models/Programacao')
      }

    ordems () {
        return this.hasMany('App/Models/Ordem')
    }
}

module.exports = Ordem
