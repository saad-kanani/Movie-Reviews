import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Star } from 'lucide-react';
// import { supabase } from '../services/supabase';
import { Movie, Review } from '../types';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';
import Loading from '../components/Loading';
import api from '../services/api';

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchMovieData();
  }, [id]);

  const fetchMovieData = async () => {
    try {
      const movieResponse = await api.get<Movie>(`/movies/${id}`);
      const reviewsResponse = await api.get<Review[]>(`/reviews/movie/${id}`);

      setMovie(movieResponse.data);
      setReviews(reviewsResponse.data || []);
    } catch (err) {
      setError('Failed to load movie details. Please try again later.');
      console.error('Error fetching movie data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm({ ...reviewForm, rating });
    setSubmitError('');
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewForm({ ...reviewForm, comment: e.target.value });
    setSubmitError('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setSubmitError('Please register first to submit a review.');
      return;
    }

    if (reviewForm.rating === 0) {
      setSubmitError('Please select a rating.');
      return;
    }

    if (!reviewForm.comment.trim()) {
      setSubmitError('Please write a comment.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await api.post(`/reviews`, {
        user_id: userId,
        movie_id: Number(id),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });

      setSubmitSuccess(true);
      setReviewForm({ rating: 0, comment: '' });

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);

      await fetchMovieData();
    } catch (err) {
      setSubmitError('Failed to submit review. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Loading />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Movie not found'}</p>
          <button
            onClick={() => navigate('/movies')}
            className="text-red-600 hover:text-red-500"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/movies')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back to Movies</span>
        </button>

        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 mb-8">
          <div className="h-96 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-9xl">🎬</div>
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>

            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center text-gray-400">
                <Calendar size={20} className="mr-2" />
                <span>{movie.release_year}</span>
              </div>

              {reviews.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold text-lg">
                    {calculateAverageRating()}
                  </span>
                  <span className="text-gray-400">({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            <p className="text-gray-300 text-lg leading-relaxed">
              {movie.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">
              Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
                <p className="text-gray-400">
                  No reviews yet. Be the first to review this movie!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-8">
              <h3 className="text-xl font-bold text-white mb-6">Add Your Review</h3>

              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-900/50 border border-green-600 rounded-lg text-green-300 text-sm">
                  Review submitted successfully!
                </div>
              )}

              {submitError && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-sm">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Rating
                  </label>
                  <StarRating
                    rating={reviewForm.rating}
                    onRatingChange={handleRatingChange}
                    interactive
                    size={32}
                  />
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    value={reviewForm.comment}
                    onChange={handleCommentChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                    placeholder="Share your thoughts about this movie..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
