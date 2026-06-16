const Item = require('../models/Item');

/**
 * If auction end time has passed, mark item as closed.
 * Called whenever item details are fetched or a bid is placed.
 */
const checkAndCloseExpiredAuction = async (item) => {
  if (!item) return item;

  if (item.status === 'active' && new Date() > new Date(item.auctionEndTime)) {
    item.status = 'closed';
    await item.save();
  }

  return item;
};

const checkAndCloseExpiredAuctions = async (items) => {
  const now = new Date();
  const updates = [];

  for (const item of items) {
    if (item.status === 'active' && now > new Date(item.auctionEndTime)) {
      item.status = 'closed';
      updates.push(item.save());
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
  }

  return items;
};

module.exports = { checkAndCloseExpiredAuction, checkAndCloseExpiredAuctions };
