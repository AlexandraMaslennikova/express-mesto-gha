const User = require('../models/user');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ValidationError = require('../errors/ValidationError');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      console.log(err.stack || err);
    });
};

const getUserById = (req, res) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new ErrorNotFound(`Нет пользователя с id ${req.params.id}`);
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.statusCode === 404) {
        res.status(400).send({ message: err.errorMessage });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .orFail(() => {
      throw new ValidationError('Неверно введены данные пользователя');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.statusCode === 400) {
        res.status(400).send({ message: err.errorMessage });
      } else {
        res.status(500).send({ message: err.errorMessage });
      }
    });
};

const updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { name, about })
    .orFail(() => {
      throw new ErrorNotFound(`Пользователь с id ${req.params.id} не найден`);
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.statusCode === 400) {
        res.status(400).send({ message: err.errorMessage });
      } else if (err.statusCode === 404) {
        res.status(404).send({ message: err.errorMessage });
      } else {
        res.status(500).send({ message: err.errorMessage });
      }
    });
};

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
        res.status(400).send({ message: err.errorMessage });
      } else if (err.statusCode === 404) {
        res.status(404).send({ message: err.errorMessage });
      } else {
        res.status(500).send({ message: err.errorMessage });
      }
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserInfo,
  updateAvatar,
};
