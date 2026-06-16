import { useState, useEffect } from 'react';
import { getItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import SearchFilter from '../components/SearchFilter';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data } = await getItems({ search, category, sort });
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchItems, 300);
    return () => clearTimeout(debounce);
  }, [search, category, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Campus Marketplace</h1>
        <p className="text-gray-600 mt-2">
          Browse active auctions from students on your campus. Find great deals on used items!
        </p>
      </div>

      <SearchFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No active listings found.</p>
          <p className="text-gray-400 text-sm mt-2">Check back later or try different filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
