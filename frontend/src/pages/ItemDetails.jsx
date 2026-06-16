import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getItemById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BidForm from '../components/BidForm';
import BidHistory from '../components/BidHistory';
import CountdownTimer from '../components/CountdownTimer';

const ItemDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchItem = async () => {
    try {
      const { data: itemData } = await getItemById(id);
      setData(itemData);
    } catch (error) {
      console.error('Failed to fetch item:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!data?.item) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Item not found.</p>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const { item, highestBid, bids } = data;
  const currentPrice = highestBid ?? item.startingPrice;
  const isActive = item.status === 'active';
  const isOwner = user?._id === item.createdBy?._id;
  const canBid = isAuthenticated && isActive && !isOwner;

  const statusBadge = {
    active: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    sold: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
        ← Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full aspect-video object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=No+Image';
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full">
                {item.category}
              </span>
              <span
                className={`text-sm px-3 py-1 rounded-full capitalize ${statusBadge[item.status]}`}
              >
                {item.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
            <p className="text-gray-600 mt-3">{item.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Seller: <span className="font-medium">{item.createdBy?.name}</span>
            </p>
          </div>

          <CountdownTimer endTime={item.auctionEndTime} />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Starting Price</p>
                <p className="text-xl font-semibold">${item.startingPrice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Highest Bid</p>
                <p className="text-xl font-bold text-primary-600">${currentPrice}</p>
              </div>
            </div>
          </div>

          {canBid && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Place a Bid</h2>
              <BidForm
                itemId={item._id}
                minBid={currentPrice}
                onBidPlaced={fetchItem}
                disabled={!isActive}
              />
            </div>
          )}

          {!isAuthenticated && isActive && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-amber-800">
                <Link to="/login" className="font-medium underline">
                  Sign in
                </Link>{' '}
                to place a bid on this item.
              </p>
            </div>
          )}

          {isOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800">
                This is your listing.{' '}
                <Link to="/seller" className="font-medium underline">
                  Manage it in Seller Dashboard
                </Link>
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Bid History</h2>
            <BidHistory bids={bids} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
