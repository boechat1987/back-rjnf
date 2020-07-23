"use strict";
const User = use("App/Models/User");

class AuthController {
  async login({ request, auth, response }) {
    let { username, password } = request.all();

    try {
      if (await auth.attempt(username, password)) {
        let user = await User.findBy("username", username);
        let token = await auth.generate(user);

        Object.assign(user, token);
        return response.json(user);
      }
    } catch (e) {
     // return response.unauthorized("You are not registered!");
     return response.status(401).json({
       name: username,
       message: "nao autorizado"
       //name: e.name,
       //message: e.message
     });
    }
  }
  async getPosts({ request, response }) {
    let posts = await Post.query().with("user").fetch();

    return response.json(posts);
  }
}

module.exports = AuthController;