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
    const {id} = params
    return Sobreaviso.find(id)
  }

  async showSobreaviso ({params, request, response}) {
    const {date} = request.only(["date"])
    const sobreavisoResponse = await Sobreaviso
    .query()
    .table('sobreavisos')
    .where('date', `${date}`)
    .fetch()
    return sobreavisoResponse
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
/*       console.log(res) */
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
  /* const month = calendarDaysOfTheWeek["B"]; */
   user = getServices(data, "A","B","C","D","E","F");
   return user;
  };

  let schedule = [];
  let user = [];
  let count = 1;

  data.forEach(row => {
    user = [];
    if (row["A"] === count) {
    schedule.push(user);
    count +=1
    }
  user.push(row);
  });
  const parsedDataReadyToBeSaved = [];
  for (let item of schedule) {
    parsedDataReadyToBeSaved.push(createObject(item));
  }
/* console.log('parsed: ', parsedDataReadyToBeSaved) */
   for (const currentUser of parsedDataReadyToBeSaved){
    const year = calendarStart["B"];
    let month = null;
    if (calendarDaysOfTheWeek["B"] === "Agosto"){month = "08"}
    else if (calendarDaysOfTheWeek["B"] === "Setembro"){month = "09"}
    else if (calendarDaysOfTheWeek["B"] === "Outubro"){month = "10"}
    else if (calendarDaysOfTheWeek["B"] === "Novembro"){month = "11"}
    else if (calendarDaysOfTheWeek["B"] === "Dezembro"){month = "12"}
    else if (calendarDaysOfTheWeek["B"] === "Dezembro"){month = "01"}
    else if (calendarDaysOfTheWeek["B"] === "Dezembro"){month = "02"}
    else if (calendarDaysOfTheWeek["B"] === "Dezembro"){month = "03"}
    else if (calendarDaysOfTheWeek["B"] === "Dezembro"){month = "04"}
    else if (calendarDaysOfTheWeek["B"] === "Dezembro"){month = "05"}
    else if (calendarDaysOfTheWeek["B"] === "Dezembro"){month = "06"}
    else if (calendarDaysOfTheWeek["B"] === "Dezembro"){month = "07"}
    const day = currentUser[0].Dia
    const totalHoras = currentUser[0].TotalHoras
    const tecAreaUm = currentUser[0].AreaUm
    const tecAreaDois = currentUser[0].AreaDois
    const tecAreaSete = currentUser[0].AreaSete
    const date = day+"/"+month+"/"+year;
    //falta pegar os telefones dos tecnicos na planilha
    let result  = await Sobreaviso.create({date, totalHoras, tecAreaUm, tecAreaDois, tecAreaSete})
  } 

  const finalAsString = JSON.stringify(parsedDataReadyToBeSaved);
  
  const res2 = await Sdrop.findBy("name" , `${fileName}`);
  await res2.delete();
  Fs.unlinkSync(`${Helpers.tmpPath('uploads')}/${fileName}`);
  return parsedDataReadyToBeSaved;
  }

}

module.exports = SobreavisoController
