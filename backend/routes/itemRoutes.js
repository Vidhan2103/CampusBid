const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyListings,
  closeAuction,
  acceptBid,
  getCategories,
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/my-listings', protect, getMyListings);
router.post('/', protect, createItem);
router.get('/', getItems);
router.get('/:id', getItemById);
router.put('/:id/close', protect, closeAuction);
router.put('/:id/acceptBid', protect, acceptBid);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
