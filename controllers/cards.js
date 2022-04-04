const Card = require('../models/card');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ForbiddenError = require('../errors/ForbiddenError');
const DataError = require('../errors/DataError');

// получение всех карточек
const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(next);
};

// создание карточки
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new DataError('Данные карточки невалидны'));
      }
      next(err);
    });
};

// удаление карточки
const deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new ErrorNotFound(`Нет карточки с id ${req.params.cardId}`);
    })
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        return next(new ForbiddenError('Нельзя удалить чужую карточку'));
      }
      return card.remove()
        .then(() => res.status(200).send({ data: card, message: 'Карточка удалена' }));
    })
    .catch(next);
};

// лайк карточки
const putCardLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => {
      throw new ErrorNotFound(`Нет карточки с id ${req.params.cardId}`);
    }).then((like) => res.status(200).send({ data: like }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new DataError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

// удаление лайка
const deleteCardLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      throw new ErrorNotFound(`Нет карточки с id ${req.user._id}`);
    })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.message === 'CastError') {
        next(new DataError('Переданые неверные данные'));
      } else {
        next(err);
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
