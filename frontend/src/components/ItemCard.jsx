import { Link } from 'react-router-dom';

const ItemCard = ({ item, highestBid }) => {
  const currentPrice = highestBid ?? item.startingPrice;
  const timeLeft = new Date(item.auctionEndTime) - new Date();
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

  return (
    <Link
      to={`/items/${item._id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
          <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full whitespace-nowrap">
            {item.category}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-xs text-gray-500">Current Bid</p>
            <p className="text-lg font-bold text-primary-600">${currentPrice}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Time Left</p>
            <p className="text-sm font-medium text-gray-700">
              {daysLeft > 0 ? `${daysLeft}d` : 'Ending soon'}
            </p>
          </div>
        </div>
        {item.createdBy?.name && (
          <p className="text-xs text-gray-400 mt-2">Seller: {item.createdBy.name}</p>
        )}
      </div>
    </Link>
  );
};

export default ItemCard;
