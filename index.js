const sequelize = require("./src/config/database");
const User = require("./src/user/User");
const Article = require("./src/article/Article");
const app = require("./src/app");

sequelize.sync({ force: true }).then(async () => {
  for (let i = 0; i < 25; i++) {
    const user = {
      username: `user${i}`,
      email: `user${i}@mail.com`,
      password: `password`,
    };
    await User.create(user);
    const article = {
      content: `content ${i}`,
    };
    await Article.create(article);
  }
});

app.listen(5000, () => {
  console.log("app is running");
});
