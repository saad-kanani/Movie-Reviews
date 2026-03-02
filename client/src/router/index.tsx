import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Register from '../pages/Register';
import Movies from '../pages/Movies';
import MovieDetails from '../pages/MovieDetails';
import Login from '../pages/Login';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/movies" replace />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'movies',
        element: <Movies />,
      },
      {
        path: 'movies/:id',
        element: <MovieDetails />,
      },
    ],
  },
]);
