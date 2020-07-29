"use strict";
const User = use("App/Models/User");

class AuthController {
  async login({ request, auth, response }) {
    let { users} = request.all();
    try {
      if (await auth.attempt(users.username, users.password)) {
        let user = await User.findBy("username", users.username);
        let accessToken = await auth.generate(user);

        Object.assign(user, accessToken);
        return response.json({"user":user, "access_token": accessToken});
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