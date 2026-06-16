import { useAuth } from '../context/AuthContext';
import ModeSwitch from '../components/ModeSwitch';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Current Mode</h3>
          <div className="flex items-center gap-4">
            <ModeSwitch />
            <p className="text-sm text-gray-500">
              {user?.currentMode === 'seller'
                ? 'You can create listings and manage auctions.'
                : 'You can browse items and place bids.'}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Account Info</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium">{user?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium">{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Mode</dt>
              <dd className="font-medium capitalize">{user?.currentMode}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Profile;
