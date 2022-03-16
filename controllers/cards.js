const mongoose = require('mongoose');
const Card = require('../models/card');
const ErrorNotFound = require('../errors/ErrorNotFound');

// получение всех карточек
const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch((err) => {
      console.log(err.stack || err);
    });
};

// создание карточки
const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Данные введены неправильно' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

// удаление карточки
const deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.id)
    .orFail(() => {
      throw new ErrorNotFound(`Нет карточки с id ${req.params.id}`);
    })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.message === '404') {
        return res.status(404).send({ message: 'Карточка не найдена' });
      } if (err instanceof mongoose.CastError) {
        return res.status(400).send({ message: 'Переданы некорректные данные!' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

// лайк карточки
const putCardLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  ).orFail(() => {
    throw new ErrorNotFound(`Нет карточки с id ${req.params.id}`);
  }).then((like) => res.status(200).send({ data: like }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Переданы некорректные данные карточки' });
      } if (err.statusCode === 404) {
        return res.status(404).send({ message: 'Передан несуществующий _id карточки' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

// удаление лайка
const deleteCardLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  ).orFail(() => {
    throw new ErrorNotFound(`Нет карточки с id ${req.params.id}`);
  }).then((card) => {
    res.status(200).send({ data: card });
  }).catch((err) => {
    if (err.statusCode === 400) {
      return res.status(400).send({ message: err.errorMessage });
    } if (err.statusCode === 404) {
      return res.status(404).send({ message: err.errorMessage });
    }
    return res.status(500).send({ message: err.errorMessage });
  });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  putCardLike,
  deleteCardLike,
};
