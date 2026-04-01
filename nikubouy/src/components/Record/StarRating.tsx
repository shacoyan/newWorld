import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (starValue: number) => {
    onRatingChange(starValue);
  };

  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          className={`text-ie-gold text-2xl transition-opacity duration-200 hover:opacity-70 ${
            star <= rating ? 'opacity-100' : 'opacity-40'
          }`}
          aria-label={`${star}つ星`}
        >
          {star <= rating ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
};
