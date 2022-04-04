const express = require('express');
const mongoose = require('mongoose');

const { celebrate, Joi, errors } = require('celebrate');

const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');
const { createUser, login } = require('./controllers/users');
const ErrorNotFound = require('./errors/ErrorNotFound');

const auth = require('./middlewares/auth');

require('dotenv').config();

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/https?:\/\/(www\.)?[a-zA-Z\d\-.]{1,}\.[a-z]{1,6}([/a-z0-9\-._~:?#[\]@!$&'()*+,;=]*)/),
  }),
}), createUser);

app.use(express.json());

app.use(auth);

app.use('/users', userRoutes);
app.use('/cards', cardRoutes);

app.use(errors());

// обработка неправильного
app.use((req, res, next) => {
  next(new ErrorNotFound('Данный путь не найден'));
});

// здесь обрабатываем все ошибки
app.use((err, req, res, next) => {
  console.log(err.stack || err);
  const status = err.statusCode || 500;
  res.status(status).send({
    err,
    message: err.message,
  });
  next();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
