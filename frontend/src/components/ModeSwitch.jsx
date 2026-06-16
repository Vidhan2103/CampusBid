import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ModeSwitch = () => {
  const { user, switchMode, isSellerMode } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSwitch = async () => {
    const newMode = isSellerMode ? 'buyer' : 'seller';
    setLoading(true);
    try {
      await switchMode(newMode);
    } catch (error) {
      console.error('Failed to switch mode:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSwitch}
      disabled={loading}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isSellerMode
          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      }`}
      title={`Currently in ${user?.currentMode} mode. Click to switch.`}
    >
      {loading ? '...' : isSellerMode ? '🏪 Seller Mode' : '🛒 Buyer Mode'}
    </button>
  );
};

export default ModeSwitch;
