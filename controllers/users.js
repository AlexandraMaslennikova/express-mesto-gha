/* eslint-disable no-shadow */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ConflictError = require('../errors/ConflictError');
const DataError = require('../errors/DataError');
const AuthError = require('../errors/AuthError');

// получение всех пользователей
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

// получение данных пользователя
const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new ErrorNotFound(`Пользователь с id ${req.params.id} не найден`);
    })
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new DataError('Неверные данные запроса'));
      }
      next(err);
    });
};

// создание пользователя
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  User.findOne({ email }).then((user) => {
    if (user) {
      throw new ConflictError('Пользователь с таким email уже существует');
    }
    bcrypt.hash(password, 10).then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((user) => res.status(200).send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new DataError('Неверный запрос или данные.'));
        } else if (err.name === 'MongoError' && err.code === 11000) {
          next(new ConflictError('Пользователь с таким email уже существует'));
        } else {
          next(err);
        }
      }));
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password);
    })
    // eslint-disable-next-line consistent-return
    .then((matched) => {
      if (!matched) {
        // хеши не совпали — отклоняем промис
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      // аутентификация успешна
      const token = jwt.sign({ _id: req.user._id }, 'secret-key', {
        expiresIn: '7d',
      });
      res.status(201).send({ token });
    })
    .catch(() => next(new AuthError('Неверный логин или пароль')));
};

// обновление информации пользователя
const updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { runValidators: true, new: true },
  )
    .orFail(() => {
      throw new ErrorNotFound(`Пользователь с id ${req.user._id} не найден`);
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new DataError('Неверный запрос или данные.'));
      } else {
        next(err);
      }
    });
};

// обновление аватара
const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { avatar }, { runValidators: true, new: true })
    .orFail(() => {
      throw new ErrorNotFound(`Пользователь с id ${req.params.id} не найден`);
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new DataError('Данные внесены некорректно или запрос неверный.'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  login,
  updateUserInfo,
  updateAvatar,
};
