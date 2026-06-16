import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBids, getAuctionsParticipated, getAuctionsWon } from '../services/api';

const tabs = [
  { id: 'my-bids', label: 'My Bids' },
  { id: 'participated', label: 'Auctions Participated' },
  { id: 'won', label: 'Auctions Won' },
];

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('my-bids');
  const [myBids, setMyBids] = useState([]);
  const [participated, setParticipated] = useState([]);
  const [won, setWon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bidsRes, participatedRes, wonRes] = await Promise.all([
          getMyBids(),
          getAuctionsParticipated(),
          getAuctionsWon(),
        ]);
        setMyBids(bidsRes.data);
        setParticipated(participatedRes.data);
        setWon(wonRes.data);
      } catch (error) {
        console.error('Failed to fetch buyer data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    sold: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Dashboard</h1>
      <p className="text-gray-600 mb-8">Track your bids and auction activity</p>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          {activeTab === 'my-bids' && (
            <div className="space-y-4">
              {myBids.length === 0 ? (
                <EmptyState message="You haven't placed any bids yet." />
              ) : (
                myBids.map(({ bid, item, highestBid, isWinning }) => (
                  <BidCard
                    key={bid._id}
                    item={item}
                    bid={bid}
                    highestBid={highestBid}
                    isWinning={isWinning}
                    statusColors={statusColors}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'participated' && (
            <div className="space-y-4">
              {participated.length === 0 ? (
                <EmptyState message="You haven't participated in any auctions yet." />
              ) : (
                participated.map(({ item, myBids: userBids, highestBid, isWinning }) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/items/${item._id}`}
                          className="font-semibold text-gray-900 hover:text-primary-600"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Seller: {item.createdBy?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[item.status]}`}
                        >
                          {item.status}
                        </span>
                        {isWinning && item.status === 'active' && (
                          <p className="text-xs text-green-600 font-medium mt-1">
                            You&apos;re winning!
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-6 mt-3 text-sm">
                      <span>
                        Your bids: <strong>{userBids.length}</strong>
                      </span>
                      <span>
                        Highest: <strong className="text-primary-600">${highestBid}</strong>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'won' && (
            <div className="space-y-4">
              {won.length === 0 ? (
                <EmptyState message="You haven't won any auctions yet. Keep bidding!" />
              ) : (
                won.map(({ item, winningBid }) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm border border-green-200 p-5"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x60?text=No+Image';
                        }}
                      />
                      <div className="flex-1">
                        <Link
                          to={`/items/${item._id}`}
                          className="font-semibold text-gray-900 hover:text-primary-600"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Seller: {item.createdBy?.name}
                        </p>
                        <p className="text-sm mt-2">
                          Winning bid:{' '}
                          <span className="font-bold text-green-600">
                            ${winningBid?.amount}
                          </span>
                        </p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full h-fit">
                        Won
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const BidCard = ({ item, bid, highestBid, isWinning, statusColors }) => {
  if (!item) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <Link
            to={`/items/${item._id}`}
            className="font-semibold text-gray-900 hover:text-primary-600"
          >
            {item.title}
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            Your bid: <span className="font-medium text-primary-600">${bid.amount}</span>
            {' · '}
            {new Date(bid.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[item.status]}`}
          >
            {item.status}
          </span>
          {isWinning && item.status === 'active' && (
            <p className="text-xs text-green-600 font-medium mt-1">Highest bidder</p>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Current highest: <strong>${highestBid}</strong>
      </p>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
    <p className="text-gray-500">{message}</p>
    <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block font-medium">
      Browse Marketplace
    </Link>
  </div>
);

export default BuyerDashboard;
