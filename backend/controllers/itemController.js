const Item = require('../models/Item');
const Bid = require('../models/Bid');
const { CATEGORIES } = require('../models/Item');
const { checkAndCloseExpiredAuction, checkAndCloseExpiredAuctions } = require('../utils/checkAuctionExpiry');

const createItem = async (req, res) => {
  try {
    if (req.user.currentMode !== 'seller') {
      return res.status(403).json({ message: 'Switch to Seller Mode to create listings' });
    }

    const { title, description, category, image, startingPrice, auctionDuration } = req.body;

    if (!title || !description || !category || !image || startingPrice == null || !auctionDuration) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    if (![1, 3, 7].includes(Number(auctionDuration))) {
      return res.status(400).json({ message: 'Auction duration must be 1, 3, or 7 days' });
    }

    const auctionEndTime = new Date();
    auctionEndTime.setDate(auctionEndTime.getDate() + Number(auctionDuration));

    const item = await Item.create({
      title,
      description,
      category,
      image,
      startingPrice: Number(startingPrice),
      auctionDuration: Number(auctionDuration),
      createdBy: req.user._id,
      auctionEndTime,
      status: 'active',
    });

    const populatedItem = await Item.findById(item._id).populate('createdBy', 'name email');
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getItems = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = { status: 'active' };

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    let query = Item.find(filter).populate('createdBy', 'name email');

    if (sort === 'newest' || !sort) {
      query = query.sort({ createdAt: -1 });
    }

    let items = await query;

    items = await checkAndCloseExpiredAuctions(items);

    // Filter out items that were just closed by expiry check
    items = items.filter((item) => item.status === 'active');

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getItemById = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id).populate('createdBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item = await checkAndCloseExpiredAuction(item);

    const bids = await Bid.find({ itemId: item._id })
      .populate('bidderId', 'name email')
      .sort({ amount: -1 });

    const highestBid = bids.length > 0 ? bids[0].amount : null;

    res.json({
      item,
      highestBid,
      bids,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ message: 'Cannot update a closed or sold item' });
    }

    const { title, description, category, image, startingPrice } = req.body;

    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (image) item.image = image;
    if (startingPrice != null) item.startingPrice = Number(startingPrice);

    await item.save();

    const populatedItem = await Item.findById(item._id).populate('createdBy', 'name email');
    res.json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Bid.deleteMany({ itemId: item._id });
    await item.deleteOne();

    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyListings = async (req, res) => {
  try {
    let items = await Item.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    items = await checkAndCloseExpiredAuctions(items);

    const itemsWithBids = await Promise.all(
      items.map(async (item) => {
        const bids = await Bid.find({ itemId: item._id })
          .populate('bidderId', 'name email')
          .sort({ amount: -1 });
        const highestBid = bids.length > 0 ? bids[0].amount : null;
        return { item, bids, highestBid };
      })
    );

    res.json(itemsWithBids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const closeAuction = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to close this auction' });
    }

    item = await checkAndCloseExpiredAuction(item);

    if (item.status === 'sold') {
      return res.status(400).json({ message: 'Auction already sold' });
    }

    item.status = 'closed';
    await item.save();

    const populatedItem = await Item.findById(item._id).populate('createdBy', 'name email');
    res.json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.body;

    if (!bidId) {
      return res.status(400).json({ message: 'Please provide bidId' });
    }

    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept bids on this item' });
    }

    item = await checkAndCloseExpiredAuction(item);

    if (item.status === 'sold') {
      return res.status(400).json({ message: 'Auction already sold' });
    }

    const bid = await Bid.findById(bidId);
    if (!bid || bid.itemId.toString() !== item._id.toString()) {
      return res.status(404).json({ message: 'Bid not found for this item' });
    }

    item.status = 'sold';
    item.winningBidderId = bid.bidderId;
    await item.save();

    const populatedItem = await Item.findById(item._id)
      .populate('createdBy', 'name email')
      .populate('winningBidderId', 'name email');

    res.json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  res.json(CATEGORIES);
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyListings,
  closeAuction,
  acceptBid,
  getCategories,
};
