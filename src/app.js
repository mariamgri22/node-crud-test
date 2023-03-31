const express = require("express");

const UserRouter = require("./user/UserRouter");
const ArticleRouter = require("./article/ArticleRouter");
const ErrorHandler = require("./error/ErrorHandler");
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    lng: "en",
    fallbackLng: "en",
    backend: {
      loadPath: "./locales/{{lng}}/translate.json",
    },
  });

const app = express();

//middleware
app.use(express.json());
app.use(middleware.handle(i18next));

app.use(UserRouter);
app.use(ArticleRouter);

app.use(ErrorHandler);

module.exports = app;
