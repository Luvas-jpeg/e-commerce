import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import MyCourses from './pages/MyCourses';
import OrderSuccess from './pages/OrderSuccess';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/product/:id',
    Component: ProductDetail,
  },
  {
    path: '/cart',
    Component: Cart,
  },
  {
    path: '/checkout',
    Component: Checkout,
  },
  {
    path: '/profile',
    Component: Profile,
  },
  {
    path: '/my-courses',
    Component: MyCourses,
  },
  {
    path: '/order-success',
    Component: OrderSuccess,
  },
  {
    path: '/admin',
    Component: Admin,
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600 mb-4">Página não encontrada</p>
          <a href="/" className="text-blue-600 hover:underline">
            Voltar para a página inicial
          </a>
        </div>
      </div>
    ),
  },
]);
