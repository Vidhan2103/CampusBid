const Bid = require('../models/Bid');
const Item = require('../models/Item');
const { checkAndCloseExpiredAuction } = require('../utils/checkAuctionExpiry');

const placeBid = async (req, res) => {
  try {
    const { itemId, amount } = req.body;

    if (!itemId || amount == null) {
      return res.status(400).json({ message: 'Please provide itemId and amount' });
    }

    let item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item = await checkAndCloseExpiredAuction(item);

    if (item.status !== 'active') {
      return res.status(400).json({ message: 'This auction is closed' });
    }

    if (item.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own listing' });
    }

    const existingBids = await Bid.find({ itemId }).sort({ amount: -1 });
    const currentHighest = existingBids.length > 0 ? existingBids[0].amount : item.startingPrice;

    if (Number(amount) <= currentHighest) {
      return res.status(400).json({
        message: `Bid must be greater than current highest bid ($${currentHighest})`,
      });
    }

    const bid = await Bid.create({
      itemId,
      bidderId: req.user._id,
      amount: Number(amount),
    });

    const populatedBid = await Bid.findById(bid._id).populate('bidderId', 'name email');
    res.status(201).json(populatedBid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBidsByItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item = await checkAndCloseExpiredAuction(item);

    const bids = await Bid.find({ itemId: req.params.itemId })
      .populate('bidderId', 'name email')
      .sort({ amount: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidderId: req.user._id })
      .populate({
        path: 'itemId',
        populate: { path: 'createdBy', select: 'name email' },
      })
      .sort({ timestamp: -1 });

    const enrichedBids = await Promise.all(
      bids.map(async (bid) => {
        let item = bid.itemId;
        if (item) {
          item = await checkAndCloseExpiredAuction(item);
        }
        const allBids = await Bid.find({ itemId: bid.itemId?._id }).sort({ amount: -1 });
        const highestBid = allBids.length > 0 ? allBids[0].amount : item?.startingPrice;
        const isWinning = allBids.length > 0 && allBids[0].bidderId.toString() === req.user._id.toString();
        return {
          bid,
          item,
          highestBid,
          isWinning,
        };
      })
    );

    res.json(enrichedBids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuctionsParticipated = async (req, res) => {
  try {
    const bids = await Bid.find({ bidderId: req.user._id }).distinct('itemId');

    let items = await Item.find({ _id: { $in: bids } })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    items = await Promise.all(items.map((item) => checkAndCloseExpiredAuction(item)));

    const result = await Promise.all(
      items.map(async (item) => {
        const itemBids = await Bid.find({ itemId: item._id })
          .populate('bidderId', 'name email')
          .sort({ amount: -1 });
        const myBids = itemBids.filter((b) => b.bidderId._id.toString() === req.user._id.toString());
        const highestBid = itemBids.length > 0 ? itemBids[0].amount : item.startingPrice;
        const isWinning = itemBids.length > 0 && itemBids[0].bidderId._id.toString() === req.user._id.toString();
        return { item, bids: itemBids, myBids, highestBid, isWinning };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuctionsWon = async (req, res) => {
  try {
    let items = await Item.find({
      winningBidderId: req.user._id,
      status: 'sold',
    })
      .populate('createdBy', 'name email')
      .populate('winningBidderId', 'name email')
      .sort({ createdAt: -1 });

    items = await Promise.all(items.map((item) => checkAndCloseExpiredAuction(item)));

    const result = await Promise.all(
      items.map(async (item) => {
        const winningBid = await Bid.findOne({
          itemId: item._id,
          bidderId: req.user._id,
        }).sort({ amount: -1 });
        return { item, winningBid };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeBid,
  getBidsByItem,
  getMyBids,
  getAuctionsParticipated,
  getAuctionsWon,
};
