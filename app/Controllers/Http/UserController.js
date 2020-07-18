"use strict";

const User = use("App/Models/User");
const { validate } = use("Validator");

class UserController {
  async store({ request, response }) {
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

      return user;
    } catch (err) {
      console.log(err);
      return response.status(err.status).send(err);
    }
  }

  async index() {
    return await User.all();
  }

  async show({ params }) {
    return await User.findOrFail(params.id);
  }

  async destroy({ params }) {
    const user = await User.findOrFail(params.id);

    await user.delete();
  }
}

module.exports = UserController;