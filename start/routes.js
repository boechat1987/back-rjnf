"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");

Route.post("/users/authenticate", "AuthController.login");

Route.post("/users", "UserController.store")
Route.get("/users/:id", "UserController.show");
//.middleware("auth");
Route.delete("/users/:id", "UserController.destroy").middleware("auth");
Route.get("/users", "UserController.index");
//.middleware("auth");

//Route.post('/contact', "ContactController.store")

Route.post('/prog/semana', "ProgramacaoController.store")
Route.get('/prog/semana', "ProgramacaoController.index")
Route.get('/prog', "ProgramacaoController.criaProg")
Route.get('/prog/semana/:id', "ProgramacaoController.show")
Route.post('/prog/semana/:id', "ProgramacaoController.update")
Route.delete('/prog/semana/:id', "ProgramacaoController.destroy")

Route.post('/prog/ordem', "OrdemController.store")
Route.get('/prog/ordem', "OrdemController.index")
Route.get('/prog/ordem/:id', "OrdemController.show")
Route.post('/prog/ordem/:id', "OrdemController.update")
Route.delete('/prog/ordem/:id', "OrdemController.destroy")

Route.post('/prog/local', "LocalController.store")
Route.get('/prog/local', "LocalController.index")
Route.get('/prog/local/:id', "LocalController.show")
Route.post('/prog/local/:id', "LocalController.update")
Route.delete('/prog/local/:id', "LocalController.destroy")

Route.get("/", () => {

});