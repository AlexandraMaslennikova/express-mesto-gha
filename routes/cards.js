const router = require('express').Router();
const {
  getCards,
  createCard,
  deleteCardById,
  putCardLike,
  deleteCardLike,
} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', createCard);
router.delete('/:cardId', deleteCardById);
router.put('/:cardId/likes', putCardLike);
router.delete('/:cardId/likes', deleteCardLike);

module.exports = router;
