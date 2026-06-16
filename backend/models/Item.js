const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics',
  'Books',
  'Furniture',
  'Sports',
  'Stationery',
  'Miscellaneous',
];

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: CATEGORIES,
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: 0,
  },
  auctionDuration: {
    type: Number,
    required: true,
    enum: [1, 3, 7],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  auctionEndTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'sold'],
    default: 'active',
  },
  winningBidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
