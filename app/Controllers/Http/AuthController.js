"use strict";
const User = use("App/Models/User");

class AuthController {
  async login({ request, auth, response }) {
    let { users} = request.all();
    //caso o usuário queira fazer login pela chave, precisa pegar a chave do usuário na planilha primeiro - pendente
    if (users.username === "TC7B"){users.username = "Affonso"}else if (users.username === "T5BD"){users.username = "Boechat"}
    else if (users.username === "TS3M"){users.username = "Caio"}else if (users.username === "TT3T"){users.username = "Daniel"}
    else if (users.username === "TS3P"){users.username = "Davi"}else if (users.username === "TTOB"){users.username = "Fábio Bertuzzi"}
    else if (users.username === "TZU0"){users.username = "Jorge"}else if (users.username === "TT54"){users.username = "José Rodrigo"}
    else if (users.username === "TZ6J"){users.username = "Manhães"}else if (users.username === "T3JE"){users.username = "Wallace"};
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
       name: users.username,
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