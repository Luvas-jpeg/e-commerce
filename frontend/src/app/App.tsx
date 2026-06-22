import { RouterProvider } from 'react-router';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { UserProvider } from './context/UserContext';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';

export default function App() {
  return (
    <UserProvider>
      <AdminProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster />
        </CartProvider>
      </AdminProvider>
    </UserProvider>
  );
}