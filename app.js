const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
require('dotenv').config();
// const router = require('express').Router();
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');

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

app.use((req, res, next) => {
  req.user = {
    _id: '6231f0babe6853d24960bad7',
  };

  next();
});

app.post('/signin', login);
app.post('/signup', createUser);

app.use(express.json());

app.use('/users', auth, userRoutes);
app.use('/cards', auth, cardRoutes);

app.use(errors());

// здесь обрабатываем все ошибки
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'Произошла ошибка сервера' : message,
  });
  next();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
