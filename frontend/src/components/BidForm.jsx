import { useState } from 'react';
import { placeBid } from '../services/api';

const BidForm = ({ itemId, minBid, onBidPlaced, disabled }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await placeBid({ itemId, amount: Number(amount) });
      setAmount('');
      onBidPlaced();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
        Bidding is closed for this auction.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Bid (min: ${minBid + 1})
        </label>
        <input
          type="number"
          step="0.01"
          min={minBid + 1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Enter amount greater than $${minBid}`}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
      >
        {loading ? 'Placing Bid...' : 'Place Bid'}
      </button>
    </form>
  );
};

export default BidForm;
