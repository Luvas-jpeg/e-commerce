import { useNavigate, useParams } from 'react-router';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useAdmin } from '../context/AdminContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Calendar, MapPin, User, Package, Award, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/formatters';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useAdmin();

  const product = products.find((p) => p.id === id);
  const stockLabel = product
    ? (() => {
        if (product.stock === undefined) return null;
        if (product.stock <= 0) return product.type === 'course' ? 'Turma esgotada' : 'Esgotado';
        if (product.stock <= 5) return product.type === 'course' ? `Últimas ${product.stock} vagas` : `Últimas ${product.stock} unidades`;
        return product.type === 'course' ? `${product.stock} vagas disponíveis` : `${product.stock} disponíveis`;
      })()
    : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
          <Button onClick={() => navigate('/')}>Voltar para a página inicial</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 sticky top-24">
              <img
                src={product.image}
                alt={product.name}
                className="size-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <Badge className="mb-4">
              {product.type === 'equipment' ? 'Equipamento' : 'Curso Presencial'}
            </Badge>

            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {product.category && (
              <p className="text-gray-600 mb-4">Categoria: {product.category}</p>
            )}

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                {formatCurrency(product.price)}
              </span>
              {product.stock !== undefined && (
                <span className="text-gray-500">
                  {stockLabel}
                </span>
              )}
            </div>

            <Separator className="my-6" />

            <div className="mb-6">
              <h2 className="font-semibold mb-3">Descrição</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {product.type === 'course' && (
              <>
                <Separator className="my-6" />
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="font-semibold mb-4">Informações do Curso</h2>
                    
                    {product.date && (
                      <div className="flex items-start gap-3">
                        <Calendar className="size-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Data</p>
                          <p className="text-gray-600">{product.date}</p>
                        </div>
                      </div>
                    )}

                    {product.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="size-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Local</p>
                          <p className="text-gray-600">{product.location}</p>
                        </div>
                      </div>
                    )}

                    {product.instructor && (
                      <div className="flex items-start gap-3">
                        <User className="size-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Instrutor</p>
                          <p className="text-gray-600">{product.instructor}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Award className="size-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Certificado</p>
                        <p className="text-gray-600">Certificado reconhecido nacionalmente</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {product.type === 'equipment' && (
              <>
                <Separator className="my-6" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Package className="size-5 text-red-600" />
                    <span className="text-gray-700">Entrega rápida e segura</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="size-5 text-red-600" />
                    <span className="text-gray-700">Certificação ANVISA</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="size-5 text-red-600" />
                    <span className="text-gray-700">Garantia de 12 meses</span>
                  </div>
                </div>
              </>
            )}

            <Separator className="my-6" />

            <div className="space-y-3">
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="size-5" />
                {product.type === 'course' ? 'Inscrever-se no curso' : 'Adicionar ao carrinho'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => {
                  const wasAdded = addToCart(product);
                  if (!wasAdded) {
                    toast.error(product.type === 'course' ? 'Não há vagas disponíveis' : 'Produto sem estoque disponível');
                    return;
                  }
                  navigate('/cart');
                }}
                disabled={product.stock === 0}
              >
                {product.type === 'course' ? 'Inscrever-se e finalizar' : 'Comprar agora'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
