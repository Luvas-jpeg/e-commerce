import { useNavigate } from 'react-router';
import { Calendar, GraduationCap, MapPin, Package, User } from 'lucide-react';
import { Header } from '../components/Header';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAdmin } from '../context/AdminContext';
import { useUser } from '../context/UserContext';

const courseStatusLabels: Record<string, string> = {
  active: 'Ativo',
  completed: 'Concluido',
  cancelled: 'Cancelado',
};

export default function MyCourses() {
  const navigate = useNavigate();
  const { isAuthenticated, orders } = useUser();
  const { products } = useAdmin();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <GraduationCap className="mx-auto mb-4 size-12 text-purple-600" />
          <h1 className="mb-3 text-2xl font-bold">Meus Cursos</h1>
          <p className="mb-6 text-gray-600">Faça login para ver os cursos comprados.</p>
          <Button onClick={() => navigate('/login')}>Entrar</Button>
        </div>
      </div>
    );
  }

  const courses = orders.flatMap((order) =>
    order.items
      .filter((item) => item.type === 'course')
      .map((item) => ({
        ...item,
        product: products.find((product) => product.id === item.id),
        orderId: order.id,
        status: item.status ?? order.status,
        createdAt: order.createdAt,
      }))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
            Meus Cursos
          </h1>
          <p className="mt-2 text-gray-600">Acompanhe suas inscrições em cursos comprados.</p>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="mx-auto mb-4 size-12 text-gray-400" />
              <p className="mb-6 text-gray-500">Você ainda não comprou nenhum curso.</p>
              <Button onClick={() => navigate('/')}>Ver cursos disponíveis</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <Card key={`${course.orderId}-${course.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <Badge>{courseStatusLabels[course.status] ?? course.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">Pedido #{course.orderId}</p>
                  {course.product?.date && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="size-4" />
                      {course.product.date}
                    </p>
                  )}
                  {course.product?.location && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="size-4" />
                      {course.product.location}
                    </p>
                  )}
                  {course.product?.instructor && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="size-4" />
                      {course.product.instructor}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="size-4" />
                    Compra em {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {course.quantity} {course.quantity === 1 ? 'inscrição' : 'inscrições'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
