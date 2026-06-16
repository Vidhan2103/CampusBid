const express = require('express');
const router = express.Router();
const {
  placeBid,
  getBidsByItem,
  getMyBids,
  getAuctionsParticipated,
  getAuctionsWon,
} = require('../controllers/bidController');
const { protect } = require('../middleware/auth');

router.post('/', protect, placeBid);
router.get('/my-bids', protect, getMyBids);
router.get('/participated', protect, getAuctionsParticipated);
router.get('/won', protect, getAuctionsWon);
router.get('/:itemId', getBidsByItem);

module.exports = router;
