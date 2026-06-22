import { useNavigate } from 'react-router';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Product } from '../context/CartContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Calendar, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const stockLabel = (() => {
    if (product.stock === undefined) return null;
    if (product.stock <= 0) return product.type === 'course' ? 'Turma esgotada' : 'Esgotado';
    if (product.stock <= 5) return product.type === 'course' ? `Últimas ${product.stock} vagas` : `Últimas ${product.stock} unidades`;
    return product.type === 'course' ? `${product.stock} vagas disponíveis` : `${product.stock} disponíveis`;
  })();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasAdded = addToCart(product);

    if (!wasAdded) {
      toast.error(product.type === 'course' ? 'Não há vagas disponíveis' : 'Produto sem estoque disponível');
      return;
    }

    toast.success(
      product.type === 'course' 
        ? 'Curso adicionado ao carrinho!' 
        : 'Produto adicionado ao carrinho!'
    );
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover transition-transform hover:scale-105"
        />
        <Badge className="absolute top-2 right-2">
          {product.type === 'equipment' ? 'Equipamento' : 'Curso'}
        </Badge>
      </div>

      <CardContent className="p-4">
        {product.category && (
          <p className="text-xs text-gray-500 mb-1">{product.category}</p>
        )}
        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

        {product.type === 'course' && (
          <div className="space-y-1 mb-3">
            {product.date && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="size-3" />
                <span>{product.date}</span>
              </div>
            )}
            {product.location && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin className="size-3" />
                <span>{product.location}</span>
              </div>
            )}
            {product.instructor && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User className="size-3" />
                <span>{product.instructor}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
              {formatCurrency(product.price)}
            </p>
            {product.stock !== undefined && (
              <p className="text-xs text-gray-500">
                {stockLabel}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full gap-2" 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="size-4" />
          {product.type === 'course' ? 'Inscrever-se' : 'Adicionar'}
        </Button>
      </CardFooter>
    </Card>
  );
}
