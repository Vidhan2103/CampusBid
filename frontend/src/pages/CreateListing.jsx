import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Electronics',
  'Books',
  'Furniture',
  'Sports',
  'Stationery',
  'Miscellaneous',
];

const CreateListing = () => {
  const { isSellerMode } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    image: '',
    startingPrice: '',
    auctionDuration: '3',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await createItem({
        ...form,
        startingPrice: Number(form.startingPrice),
        auctionDuration: Number(form.auctionDuration),
      });
      navigate(`/items/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (!isSellerMode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Seller Mode Required</h1>
        <p className="text-gray-600 mt-2">
          Switch to Seller Mode from the navbar to create listings.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
      <p className="text-gray-600 mb-8">List an item for auction on the campus marketplace.</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g. Calculus Textbook - 3rd Edition"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe the condition, features, and any other details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auction Duration
            </label>
            <select
              name="auctionDuration"
              value={form.auctionDuration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            name="image"
            value={form.image}
            onChange={handleChange}
            required
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Paste a direct link to an image (e.g. from Imgur or Google Drive).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Starting Price ($)
          </label>
          <input
            type="number"
            name="startingPrice"
            value={form.startingPrice}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {form.image && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Image Preview</p>
            <img
              src={form.image}
              alt="Preview"
              className="w-full max-h-48 object-cover rounded-lg border"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
        >
          {loading ? 'Creating Listing...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;
