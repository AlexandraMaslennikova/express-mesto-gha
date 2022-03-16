/* eslint-disable max-len */
const User = require('../models/user');
const ErrorNotFound = require('../errors/ErrorNotFound');

// получение всех пользователей
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.log(err.stack || err);
    });
};

// получение данных пользователя
const getUserById = (req, res) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new ErrorNotFound('404');
    })
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.message === '404') {
        return res.status(404).send({ message: 'Пользователь с таким id не найден' });
      } if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Нет пользователя с таким id. Данные введены неверно' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

// создание пользователя
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Вы ввели неверные данные пользователя' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

// обновление информации пользователя
const updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { name, about })
    .orFail(() => {
      throw new ErrorNotFound(`Пользователь с id ${req.params.id} не найден`);
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === '404') {
        return res.status(404).send({ message: 'Пользователь c таким id не найден' });
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

// обновление аватара
const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { avatar })
    .orFail(() => {
      throw new ErrorNotFound(`Пользователь с id ${req.params.id} не найден`);
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.statusCode === 400) {
        return res.status(400).send({ message: err.errorMessage });
      } if (err.statusCode === 404) {
        return res.status(404).send({ message: err.errorMessage });
      }
      return res.status(500).send({ message: err.errorMessage });
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserInfo,
  updateAvatar,
};
