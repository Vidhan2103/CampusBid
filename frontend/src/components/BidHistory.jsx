const BidHistory = ({ bids }) => {
  if (!bids || bids.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-4 text-center">
        No bids yet. Be the first to bid!
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {bids.map((bid, index) => (
        <div
          key={bid._id}
          className={`flex items-center justify-between p-3 rounded-lg ${
            index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
          }`}
        >
          <div>
            <p className="font-medium text-gray-900">
              {bid.bidderId?.name || 'Anonymous'}
              {index === 0 && (
                <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                  Highest
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(bid.timestamp).toLocaleString()}
            </p>
          </div>
          <p className="font-bold text-primary-600">${bid.amount}</p>
        </div>
      ))}
    </div>
  );
};

export default BidHistory;
