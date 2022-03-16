const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');

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

app.use(express.json());

app.use('/users', userRoutes);
app.use('/cards', cardRoutes);

app.use((req, res, next) => {
  res.status(404).send({ message: 'К сожалению, такой страницы не существует' });

  next();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
