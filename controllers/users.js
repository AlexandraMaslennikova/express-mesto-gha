const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const ErrorNotFound = require('../errors/ErrorNotFound');
// const ValidationError = require('../errors/ValidationError');
const ConflictError = require('../errors/ConflictError');

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
      throw new ErrorNotFound(`Пользователь с id ${req.params.id} не найден`);
    })
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.statusCode === 404) {
        return res
          .status(404)
          .send({ message: 'Пользователь с таким id не найден' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({
          message: 'Нет пользователя с таким id. Данные введены неверно',
        });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

// создание пользователя
const createUser = (req, res) => {
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
      .then(() => res.status(200).send({ message: `Пользователь ${email} успешно создан!` }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return res
            .status(400)
            .send({ message: 'Вы ввели неверные данные пользователя' });
        }
        return res
          .status(500)
          .send({ message: 'На сервере произошла ошибка' });
      }));
  });
};

const login = (req, res) => {
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
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};

// обновление информации пользователя
const updateUserInfo = (req, res) => {
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
      if (err.statusCode === 404) {
        return res
          .status(404)
          .send({ message: 'Пользователь c таким id не найден' });
      }
      if (err.name === 'ValidationError') {
        return res
          .status(400)
          .send({ message: 'Переданы некорректные данные' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

// обновление аватара
const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { avatar }, { runValidators: true, new: true })
    .orFail(() => {
      throw new ErrorNotFound(`Пользователь с id ${req.params.id} не найден`);
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.statusCode === 400) {
        return res
          .status(400)
          .send({ message: 'Переданы некорректные данные' });
      }
      if (err.statusCode === 404) {
        return res
          .status(404)
          .send({ message: 'Пользователь с таким id не найден' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
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
