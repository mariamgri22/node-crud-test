const express = require("express");
const router = express.Router();
const pagination = require("../shared/pagination");
const idNumberControl = require("../shared/idNumberControl");
const UserService = require("./UserService");
const { body, validationResult } = require("express-validator");
const ValidationException = require("../shared/ValidationException");
const basicAuth = require("../shared/basicAuth");

router.post(
  "/users",
  body("username")
    .notEmpty()
    .withMessage("username_null")
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage("username_size"),
  body("email")
    .isEmail()
    .withMessage("email_invalid")
    .bail()
    .custom(async (email) => {
      const user = await UserService.findByEmail(email);
      if (user) {
        throw new Error("email_inuse");
      }
    }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }
    await UserService.create(req.body);
    res.send({ message: req.t("user_create_success") });
  }
);

router.get("/users", pagination, async (req, res) => {
  const page = await UserService.getUsers(req.pagination);
  res.send(page);
});

router.get("/users/:id", idNumberControl, async (req, res, next) => {
  try {
    const user = await UserService.getUser(req.params.id);
    res.send(user);
  } catch (err) {
    next(err);
  }
});

router.put("/users/:id", idNumberControl, basicAuth, async (req, res) => {
  const authenticatedUser = req.authenticatedUser;
  if (!authenticatedUser) {
    return res.status(403).send({ message: "Forbidden" });
  }
  if (authenticatedUser.id != req.params.id) {
    return res.status(403).send({ message: "Forbidden" });
  }
  await UserService.updateUser(req.params.id, req.body);
  res.send("updated");
});

router.delete("/users/:id", idNumberControl,basicAuth, async (req, res) => {
  const authenticatedUser = req.authenticatedUser;
  if (!authenticatedUser) {
    return res.status(403).send({ message: "Forbidden" });
  }
  if (authenticatedUser.id != req.params.id) {
    return res.status(403).send({ message: "Forbidden" });
  }
  try {
    await UserService.deleteUser(req.params.id);
    res.send("removed");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
