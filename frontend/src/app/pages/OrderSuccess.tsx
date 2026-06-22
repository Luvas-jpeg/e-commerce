import { useNavigate } from 'react-router';
import { CheckCircle2, GraduationCap, PackageSearch } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-xl">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto mb-5 size-16 text-green-600" />
            <h1 className="mb-3 text-3xl font-bold">Pedido realizado com sucesso</h1>
            <p className="mx-auto mb-8 max-w-md text-gray-600">
              Seu pedido foi registrado. Cursos comprados já aparecem em Meus Cursos.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <Button onClick={() => navigate('/profile')} variant="outline">
                Meus Pedidos
              </Button>
              <Button onClick={() => navigate('/my-courses')} className="gap-2">
                <GraduationCap className="size-4" />
                Meus Cursos
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
                <PackageSearch className="size-4" />
                Catálogo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
