const express = require("express");
const sequelize = require("./database");
const User = require("./User");

sequelize.sync({ force: true }).then(async () => {
  for (let i = 0; i < 25; i++) {
    const user = {
      username: `user${i}`,
      email: `user${i}@mail.com`,
      password: `password`,
    };
    await User.create(user);
  }
});

const app = express();

app.use(express.json());

app.post("/users", async (req, res) => {
  await User.create(req.body);
  res.send("success");
});

app.get("/users", async (req, res) => {
  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);

  let page = 0;
  if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
    page = pageAsNumber;
  }

  let size = 10;
  if (
    !Number.isNaN(sizeAsNumber) &&
    !(sizeAsNumber > 10) &&
    !(sizeAsNumber < 1)
  ) {
    size = sizeAsNumber;
  }

  const usersWithCount = await User.findAndCountAll({
    limit: size,
    offset: page * size,
  });
  res.send({
    content: usersWithCount.rows,
    totalPages: Math.ceil(usersWithCount.count / Number.parseInt(size)),
  });
});

function InvalidIdException() {
  this.status = 400;
  this.message = "Invalid ID";
}

function UserNotFoundException() {
  this.status = 404;
  this.message = "User not found";
}

app.get("/users/:id", async (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if (Number.isNaN(id)) {
    next(new InvalidIdException());
  }
  const user = await User.findOne({ where: { id: id } });
  if (!user) {
    next(new UserNotFoundException());
  }
  res.send(user);
});

app.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({ where: { id: id } });
  user.username = req.body.username;
  await user.save();
  res.send("updated");
});

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  await User.destroy({ where: { id: id } });
  res.send("removed");
});

app.use((err, req, res, next) => {
  res.status(err.status).send({
    message: err.message,
    timestamp: Date.now(),
    path: req.originalUrl,
  });
});

app.listen(5000, () => {
  console.log("app is running");
});