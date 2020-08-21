'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Database = use('Database');
const Programacao = use('App/Models/Programacao');
const User = use('App/Models/User');
const Ordem = use('App/Models/Ordem');
var XLSX = require('xlsx');
const { isNull } = require('underscore');
const Drive = use('Drive');
const Helpers = use('Helpers');
const S3 = use('App/Models/S3');

const Fs = use('fs');

/**
 * Resourceful controller for interacting with programacaos
 */
class ProgramacaoController {
  /**
   * Show a list of all programacaos.
   * GET programacaos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  
  async index ({ request, response, view }) {
        return Programacao.all()
  }

  /**
   * Render a form to be used for creating a new programacao.
   * GET programacaos/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
    
  }

  /**
   * Create/save a new programacao.
   * POST programacaos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    
    const data = request.only(["semana", "data"])
    return Programacao.create(data)
    
  }

  /**
   * Display a single programacao.
   * GET programacaos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
    const {id} = params
    return Programacao.find(id)
  }

  async showProg ({params, response}) {
    const {semana} = params
    const prog = await Programacao
    .query()
    .table('programacaos')
    .where('semana', `${semana}`)
    .fetch()
    return prog
  }

  /**
   * Render a form to update an existing programacao.
   * GET programacaos/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update programacao details.
   * PUT or PATCH programacaos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    const {id} = params
    const prog = await Programacao.findOrFail(id)
    const data = request.only(["semana", "data"])
    prog.semana = data.semana
    prog.data = data.data
    return prog.save()
  }

  /**
   * Delete a programacao with id.
   * DELETE programacaos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
    const {id} = params
    const prog = await Programacao.findOrFail(id)
    return prog.delete()
  }

  async storeProg(data){
  }

  async criaProg({params}){
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
  
  const index = data.findIndex(row => {
    if (row && row["A"]) {
      return row["A"] === "PROGRAMAÇÃO  DE MOTORISTAS";
    }
    return false;
    });
    const restOfTable = data.slice(-(data.length - index));
   
  const getServices = (data, firstColumn, secondColumn = false) => {
  let res = [];
    for (let item of data) {
      if (item["A"] !== "Local" && item["A"] !== "Apoio / Motorista") {
        if (secondColumn) {
          if (item[firstColumn] && item[secondColumn]) {
            res.push({
              description: item[firstColumn],
              serviceOrder: item[secondColumn]
            });
          } else if (item[firstColumn]) {
            res.push({ description: item[firstColumn] });
            }
            else if (item[firstColumn] === undefined && item[secondColumn] != undefined) {
              res.push({
                description: "0",
                serviceOrder: item[secondColumn]
              });
              }
        } else {
          if (item[firstColumn]) {
            res.push({ description: item[firstColumn] });
            }
          }
      }
    }
  return res;
  };

  const trimString = string => {
    if (typeof string === "string") {
      return string.trim();
    }
  return string;
  };

  const createObject = data => {
  let user = {};
  const heading = data[1]["A"].split("\n");
  user["name"] = trimString(heading[0]);
  user["code1"] = trimString(heading[1]);
  user["code2"] = trimString(heading[2]);
  user["phone"] = trimString(heading[3]);
  user["days"] = [
    {
      day: 1,
      dayOfTheWeek: calendarDaysOfTheWeek["B"],
      fullDate: ExcelDateToJSDate(calendarDate["B"]),
      duties: getServices(data, "B", "C")
    },
    {
      day: 2,
      dayOfTheWeek: calendarDaysOfTheWeek["D"],
      fullDate: ExcelDateToJSDate(calendarDate["D"]),
      duties: getServices(data, "D", "E")
    },
    {
      day: 3,
      dayOfTheWeek: calendarDaysOfTheWeek["F"],
      fullDate: ExcelDateToJSDate(calendarDate["F"]),
      duties: getServices(data, "F", "G")
    },
    {
      day: 4,
      dayOfTheWeek: calendarDaysOfTheWeek["H"],
      fullDate: ExcelDateToJSDate(calendarDate["H"]),
      duties: getServices(data, "H", "I")
    },
    {
      day: 5,
      dayOfTheWeek: calendarDaysOfTheWeek["J"],
      fullDate: ExcelDateToJSDate(calendarDate["J"]),
      duties: getServices(data, "J", "K")
    },
    {
      day: 6,
      dayOfTheWeek: calendarDaysOfTheWeek["L"],
      fullDate: ExcelDateToJSDate(calendarDate["L"]),
      duties: getServices(data, "L", "M")
    },
    {
      day: 7,
      dayOfTheWeek: calendarDaysOfTheWeek["N"],
      fullDate: ExcelDateToJSDate(calendarDate["N"]),
      duties: getServices(data, "N", "O")
    }
  ];
  return user;
  };

  let schedule = [];
  let user = [];
  
  data.forEach(row => {
    if (row["A"] === "Local" || row["A"] === "TÉC. SEGURANÇA") {
     if (user.length > 0) {
      schedule.push(user);
     }
    user = [];
    }
   
  user.push(row);
  });
  
  const parsedDataReadyToBeSaved = [];
  
  for (let item of schedule) {
    parsedDataReadyToBeSaved.push(createObject(item));
  }

  for (const currentUser of parsedDataReadyToBeSaved){
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
          //pegar as OS´s excedentes
          let numeroParsedToString = numero.toString();
          let totalCaracteres = numeroParsedToString.length;
          let numero_extra = null;
            if (totalCaracteres > 8){
             numeroParsedToString = numeroParsedToString.trim();
             numeroParsedToString = numeroParsedToString.replace(/\s/g,'');
             numero_extra = numeroParsedToString.slice(8,numeroParsedToString.length);
            }
          
          numero = parseInt(numero, 10);
          
          if (foundUser !== null){
            const {id: user_id} = foundUser;
            const res = await Ordem.create({numero, text, programacao_id, user_id, numero_extra});
          }
          else{
            const res = await Ordem.create({numero, text, programacao_id, numero_extra});
          }
        }
    } 
  }

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
  
  const res2 = await S3.findBy("name" , `${fileName}`);
  await res2.delete();
  Fs.unlinkSync(`${Helpers.tmpPath('uploads')}/${fileName}`);
  return parsedDataReadyToBeSaved;
  }
}

module.exports = ProgramacaoController
