'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Drive = use('Drive');
const Helpers = use('Helpers');
const Sdrop = use('App/Models/Sdrop');
var XLSX = require('xlsx');
const Fs = use('fs');
const Sobreaviso = use('App/Models/Sobreaviso');
/**
 * Resourceful controller for interacting with sobreavisos
 */
class SobreavisoController {
  /**
   * Show a list of all sobreavisos.
   * GET sobreavisos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
    return await Sobreaviso.all();
  }

  /**
   * Render a form to be used for creating a new sobreaviso.
   * GET sobreavisos/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new sobreaviso.
   * POST sobreavisos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single sobreaviso.
   * GET sobreavisos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing sobreaviso.
   * GET sobreavisos/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update sobreaviso details.
   * PUT or PATCH sobreavisos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a sobreaviso with id.
   * DELETE sobreavisos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }

  async criaSobreaviso({params}){
    const {file:fileName} = params;
    const files = Fs.readdirSync(Helpers.tmpPath('uploads'));
    if (!files.includes(fileName)){
      return "file not found"
    }
    var workbook = XLSX.readFile(`${Helpers.tmpPath('uploads')}/${fileName}`);
    var sheet_name_list = workbook.SheetNames;
    var z = [];
    var unparsed = [];
    sheet_name_list.forEach(function(y) {
    var worksheet = workbook.Sheets[y];
    for(z in worksheet) {
        if(z[0] === '!') continue;
        //parse out the column, row, and value
        var tt = 0;
        for (var i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
                tt = i;
                break;
            }
        };
        var col = z.substring(0,tt);
        var row = parseInt(z.substring(tt));
        var value = (worksheet[z].v);
        if(!(unparsed[row])) {
          unparsed[row]={}
        };
        unparsed[row][col] = value;
    }
    //drop those first row which are empty
    unparsed.shift();
  });
  const data = unparsed.filter(row => row);
  const header = data.shift(data);
  const calendarStart = data.shift(data); // "A": "DDS 08:30 Segunda-feira"
  const calendarDaysOfTheWeek = data.shift(data);
  const calendarDate = data.shift(data);
  /* const index = data.findIndex(row => {
    if (row && row["A"]) {
      return row["A"] === "PROGRAMAÇÃO  DE MOTORISTAS"; // ta procurando todos A sozinhos? desse jeito nao era pra pegar todos A da lista e ficar retornando programacao de motoristas?
    }
    return false;
    });
    const restOfTable = data.slice(-(data.length - index));
   */ 
  const getServices = (data, firstColumn, secondColumn, thirdColumn, fourthColumn, fifthColumn, sixthColumn) => {
  let res = [];
    for (let item of data) {
      if (data) {
            res.push({
              Dia: item[firstColumn],
              DiaSemana: item[secondColumn],
              TotalHoras: item[thirdColumn],
              AreaUm: item[fourthColumn],
              AreaDois: item[fifthColumn],
              AreaSete: item[sixthColumn],
            });
          } 
          
      }
      
  return res;
  };

  /* const trimString = string => {
    if (typeof string === "string") {
      return string.trim();
    }
  return string;
  }; */

  const createObject = data => {
  let user = {};
  
  user["sobreaviso"] = getServices(data, "A","B","C","D","E","F");
    
  return user;
  };

  let schedule = [];
  let user = [];
  let count = 1;

  data.forEach(row => {
    if (row["A"] === count) {
     if (user.length > 0) {
      schedule.push(user);
     }
    user = [];
    count +=1
    }
   
  user.push(row);
  });
  
  const parsedDataReadyToBeSaved = [];
  
  for (let item of schedule) {
    parsedDataReadyToBeSaved.push(createObject(item));
  }
console.log('parsed: ', parsedDataReadyToBeSaved)
  /* for (const currentUser of parsedDataReadyToBeSaved){
    // fazer com for Of... verificar
    const {name, days} = currentUser;
    //preciso corrigir essa linha user_id pode não estar lá
    const foundUser = await User.findBy('username', name);
    
    const semana = header["G"];
    for (let day of days){
      const {fullDate: data, duties} = day;
      let result  = await Programacao.create({data, semana})
        for (const duty of duties){
          let {description: text, serviceOrder: numero} = duty;
          const {id: programacao_id} = result
            if (typeof numero === 'undefined'){
              numero = '0';
            }
          numero = parseInt(numero, 10);
          
          if (foundUser !== null){
            const {id: user_id} = foundUser;
            const res = await Ordem.create({numero, text, programacao_id, user_id});
          }
          else{
            const res = await Ordem.create({numero, text, programacao_id});
          }
        }
    } 
  } */

  const finalAsString = JSON.stringify(parsedDataReadyToBeSaved);

  function ExcelDateToJSDate(serial) {
   
  var utc_days = Math.floor(serial - 25569); // converter para 1970
  var utc_value = ((utc_days) * 86400); //24hrs rodando no servidor
  //var utc_value = ((utc_days+1) * 86400); //24hrs rodando no pc
  var date_info = new Date(utc_value * 1000); // data em segundos

  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
  );
   
  }
  
  /* const res2 = await Sdrop.findBy("name" , `${fileName}`);
  await res2.delete();
  Fs.unlinkSync(`${Helpers.tmpPath('uploads')}/${fileName}`); */
  return parsedDataReadyToBeSaved;
  }

}

module.exports = SobreavisoController
