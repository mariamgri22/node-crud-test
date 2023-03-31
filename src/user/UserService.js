const User = require("./User");
const UserNotFoundException = require("./UserNotFoundException");
const bcrypt = require("bcrypt");

const create = async (body) => {
  const { username, email, password } = body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashedPassword });
};
const getUsers = async (pagination) => {
  const { page, size } = pagination;

  const usersWithCount = await User.findAndCountAll({
    limit: size,
    offset: page * size,
    attributes: ["id", "username", "email"],
  });
  return {
    content: usersWithCount.rows,
    totalPages: Math.ceil(usersWithCount.count / Number.parseInt(size)),
  };
};

const getUser = async (id) => {
  const user = await User.findOne({
    where: { id: id },
    attributes: ["id", "username", "email"],
  });
  if (!user) {
    throw new UserNotFoundException();
  }

  // const userAsJSON = user.get();
  // console.log("🚀 ~ file: UserService.js:30 ~ getUser ~ userAsJSON:", user);
  // delete userAsJSON.password;
  // return userAsJSON;
  return user;
};
const updateUser = async (id, body) => {
  const user = await User.findOne({ where: { id: id } });
  user.username = body.username;
  await user.save();
};
const deleteUser = async (id) => {
  await User.destroy({ where: { id: id } });
};
const findByEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
};
module.exports = {
  create,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  findByEmail,
};
