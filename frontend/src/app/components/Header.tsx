import { Link, useNavigate } from 'react-router';
import { ShoppingCart, User, Heart, Menu, LayoutDashboard, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function Header() {
  const { cart } = useCart();
  const { isAuthenticated, isAdmin, logout } = useUser();
  const navigate = useNavigate();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-pink-600">
              <Heart className="size-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-none">MediShop</span>
              <span className="text-xs text-gray-500">Equipamentos & Cursos</span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-pink-600">
              Início
            </Link>
            {isAuthenticated && (
              <Link to="/my-courses" className="text-sm font-medium transition-colors hover:text-pink-600 flex items-center gap-1">
                <GraduationCap className="size-4" />
                Meus Cursos
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/profile" className="text-sm font-medium transition-colors hover:text-pink-600">
                Meu Perfil
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-purple-600 flex items-center gap-1"
              >
                <LayoutDashboard className="size-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/cart')}
              className="relative"
            >
              <ShoppingCart className="size-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -right-1 -top-1 size-5 flex items-center justify-center rounded-full p-0 text-[10px]">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>

            {isAuthenticated ? (
              <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                <User className="size-5" />
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')} className="hidden md:inline-flex">
                Entrar
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/" className="text-lg font-medium transition-colors hover:text-pink-600">
                    Início
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/my-courses"
                        className="text-lg font-medium transition-colors hover:text-pink-600 flex items-center gap-2"
                      >
                        <GraduationCap className="size-5" />
                        Meus Cursos
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="text-lg font-medium transition-colors hover:text-purple-600 flex items-center gap-2"
                        >
                          <LayoutDashboard className="size-5" />
                          Admin
                        </Link>
                      )}
                      <Link to="/profile" className="text-lg font-medium transition-colors hover:text-pink-600 flex items-center gap-2">
                        <User className="size-5" />
                        Meu Perfil
                      </Link>
                      <Button onClick={handleLogout} variant="outline" className="w-full mt-4">
                        Sair
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => navigate('/login')} className="w-full mt-4">
                      Entrar
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
