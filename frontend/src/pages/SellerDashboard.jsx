import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyListings, closeAuction, acceptBid, deleteItem } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SellerDashboard = () => {
  const { isSellerMode } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchListings = async () => {
    try {
      const { data } = await getMyListings();
      setListings(data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleClose = async (itemId) => {
    setActionLoading(itemId);
    try {
      await closeAuction(itemId);
      await fetchListings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to close auction');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptBid = async (itemId, bidId) => {
    if (!window.confirm('Accept this bid? The item will be marked as sold.')) return;
    setActionLoading(`${itemId}-${bidId}`);
    try {
      await acceptBid(itemId, bidId);
      await fetchListings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept bid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    setActionLoading(`delete-${itemId}`);
    try {
      await deleteItem(itemId);
      await fetchListings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete listing');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isSellerMode) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Seller Mode Required</h1>
        <p className="text-gray-600 mt-2">
          Switch to Seller Mode from the navbar to access your seller dashboard.
        </p>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    sold: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your listings and received bids</p>
        </div>
        <Link
          to="/create-listing"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium"
        >
          + New Listing
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">You haven&apos;t listed any items yet.</p>
          <Link
            to="/create-listing"
            className="text-primary-600 hover:underline mt-4 inline-block font-medium"
          >
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {listings.map(({ item, bids, highestBid }) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full sm:w-32 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/items/${item._id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="flex gap-6 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Starting: </span>
                        <span className="font-medium">${item.startingPrice}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Highest Bid: </span>
                        <span className="font-bold text-primary-600">
                          ${highestBid ?? item.startingPrice}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Bids: </span>
                        <span className="font-medium">{bids.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {bids.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Received Bids</h3>
                    <div className="space-y-2">
                      {bids.map((bid) => (
                        <div
                          key={bid._id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{bid.bidderId?.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(bid.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary-600">${bid.amount}</span>
                            {item.status === 'active' && (
                              <button
                                onClick={() => handleAcceptBid(item._id, bid._id)}
                                disabled={actionLoading === `${item._id}-${bid._id}`}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Accept
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4 pt-4 border-t">
                  {item.status === 'active' && (
                    <button
                      onClick={() => handleClose(item._id)}
                      disabled={actionLoading === item._id}
                      className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Close Auction
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={actionLoading === `delete-${item._id}`}
                    className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
