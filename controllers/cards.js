const Card = require('../models/card');
const ErrorNotFound = require('../errors/ErrorNotFound');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => {
      console.log(err.stack || err);
    });
};

const createCard = (req, res) => {
  console.log(req.user._id);

  const { name, link } = req.body;

  Card.create({ name, link })
    .then((cards) => res.send(cards))
    .catch((err) => {
      if (err.statusCode === 400) {
        res.status(400).send({ message: err.errorMessage });
      } else {
        res.status(500).send({ message: err.errorMessage });
      }
    });
};

const deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.id)
    .orFail(() => {
      throw new ErrorNotFound(`Нет карточки с id ${req.params.id}`);
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.statusCode === 404) {
        res.status(404).send({ message: err.errorMessage });
      }
    });
};

const putCardLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  ).orFail(() => {
    throw new ErrorNotFound(`Нет карточки с id ${req.params.id}`);
  }).then((card) => {
    res.send(card);
  }).catch((err) => {
    if (err.statusCode === 400) {
      res.status(400).send({ message: err.errorMessage });
    } else if (err.statusCode === 404) {
      res.status(404).send({ message: err.errorMessage });
    } else {
      res.status(500).send({ message: err.errorMessage });
    }
  });
};

const deleteCardLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  ).orFail(() => {
    throw new ErrorNotFound(`Нет карточки с id ${req.params.id}`);
  }).then((card) => {
    res.send(card);
  }).catch((err) => {
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
  getCards,
  createCard,
  deleteCardById,
  putCardLike,
  deleteCardLike,
};
