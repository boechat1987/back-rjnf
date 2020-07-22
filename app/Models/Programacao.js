'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Programacao extends Model { 
    programacaos () {
        return this.hasMany('App/Models/Programacao')
      }   
}

module.exports = Programacao
