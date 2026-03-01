import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/movies" className="flex items-center space-x-2">
            <Film className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-white">MovieReview</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/movies"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Movies
            </Link>
            <Link
              to="/register"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors duration-200 font-medium"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
