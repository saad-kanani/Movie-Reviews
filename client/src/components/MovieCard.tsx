import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-600 transition-all duration-300 transform hover:scale-105">
      <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-6xl text-gray-700">🎬</div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
          {movie.title}
        </h3>

        <div className="flex items-center text-gray-400 mb-3">
          <Calendar size={16} className="mr-2" />
          <span className="text-sm">{movie.releaseYear}</span>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {movie.description}
        </p>

        <Link
          to={`/movies/${movie.id}`}
          className="block w-full text-center bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors duration-200 font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
