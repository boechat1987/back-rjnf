"use strict";
const Token = use("App/Models/Token");
const User = use("App/Models/User");
const { validate } = use("Validator");

class UserController {
  async store({ request, response, auth }) {
    try {
      const messages = {
        "username.required": "Esse campo é obrigatorio",
        "username.unique": "Esse usuário já existe",
        "username.min": "O username deve ter mais que 3 caracteres",
      };

      const rules = {
        username: "required|min:3|unique:users",
        email: "required|email|unique:users",
        password: "required|min:6",
      };

      const validation = await validate(request.all(), rules, messages);

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() });
      }
      const data = request.only(["username", "email", "password"]);
      const user = await User.create(data);
      let accessToken = await auth.generate(user)
      return response.json({"user": user, "access_token": accessToken});
    } catch (err) {
      console.log(err);
      return response.status(err.status).send(err);
    }
  }

  async index() {
    return await User.all();
  }

  async show({auth, params }) {
    if (auth.user.id !== Number(params.id)) {
      return "Não é o seu profile"
    }
    return auth.user
    //return await User.findOrFail(params.id);
  }
    
  

  async login ({ request, auth, response }) {
   /* const { username, password } = request.all()
    try {
      if (await auth.attempt(username, password)) {
        let user = await User.findBy('username', username)
        let token = await auth.generate(user)
        user.password = undefined
        Object.assign(user, token)
        //------------------------------------------
        try{
        const assignedToken = await Token.create({
          user_id: user.id,
          token,
        })
      } catch (error){
        return error
        }
        
        return response.json({
          success: true,
          user
        })
      }
    } catch(e) {
        return response.json({
          success: false,
          message: 'login_failed'
        })
    } */
  }
  async login ({ request, auth, response }) {
    try {
      return await auth.getUser()
    } catch (error) {
      response.send('Missing or invalid jwt token')
    }
  }

  async destroy({ params }) {
    const user = await User.findOrFail(params.id);

    await user.delete();
  }
}

module.exports = UserController;