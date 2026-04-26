export interface Movie {
  id: number;
  title: string;
  description: string;
  release_year: number;
  type: string;
  image: string;
}

export interface Review {
  id: number;
  movie_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
