const UserService = require("../user/UserService");
const bcrypt = require("bcrypt");

module.exports = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const encoded = authorization.substring(6);
    const decoded = Buffer.from(encoded, "base64").toString("ascii");
    const [email, password] = decoded.split(":"); // email password
    const authenticatedUser = await UserService.findByEmail(email);
    if (authenticatedUser) {
      const match = await bcrypt.compare(password, authenticatedUser.password);
      if (match) {
        req.authenticatedUser = authenticatedUser;
      }
    }
  }
  next();
};
