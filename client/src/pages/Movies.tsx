import { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import api from '../services/api';

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const { data } = await api.get<Movie[]>('/movies');      
      setMovies(data || []);
    } catch (err) {
      setError('Failed to load movies. Please try again later.');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Film size={32} className="text-red-600" />
            <h1 className="text-4xl font-bold text-white">Discover Movies</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Explore our collection and share your thoughts
          </p>
        </div>

        {error ? (
          <div className="p-6 bg-red-900/50 border border-red-600 rounded-lg text-red-300">
            {error}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No movies available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
