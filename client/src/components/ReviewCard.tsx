import { Review } from '../types';
import StarRating from './StarRating';
import { MessageSquare } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <StarRating rating={review.rating} size={18} />
        {review.createdAt && (
          <span className="text-sm text-gray-500">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <MessageSquare size={18} className="text-gray-500 mt-1 flex-shrink-0" />
        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
      </div>
    </div>
  );
}
