import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModeSwitch from './ModeSwitch';

const Navbar = () => {
  const { user, logout, isAuthenticated, isSellerMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600">CampusBid</span>
            <span className="text-xs text-gray-500 hidden sm:inline">Student Marketplace</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium">
              Marketplace
            </Link>

            {isAuthenticated ? (
              <>
                <ModeSwitch />
                {isSellerMode ? (
                  <>
                    <Link
                      to="/seller"
                      className="text-gray-600 hover:text-primary-600 font-medium"
                    >
                      Seller Dashboard
                    </Link>
                    <Link
                      to="/create-listing"
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium text-sm"
                    >
                      + List Item
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/buyer"
                    className="text-gray-600 hover:text-primary-600 font-medium"
                  >
                    My Bids
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-primary-600 font-medium"
                >
                  {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 font-medium text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
