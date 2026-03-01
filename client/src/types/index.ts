export interface Movie {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
}

export interface Review {
  id: number;
  movieId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
