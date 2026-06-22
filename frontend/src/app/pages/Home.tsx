import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { useAdmin } from '../context/AdminContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertTriangle, Search } from 'lucide-react';

export default function Home() {
  const { products, isProductsLoading, productsError } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'equipment' | 'course'>('all');

  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'equipment' || filterParam === 'course') {
      setFilter(filterParam);
    }
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || product.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleFilterChange = (value: string) => {
    setFilter(value as 'all' | 'equipment' | 'course');
    if (value === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter: value });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Equipamentos e Cursos Médicos de Qualidade
            </h1>
            <p className="text-xl mb-8 text-pink-100">
              Tudo que você precisa para sua carreira na área da saúde em um só lugar
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  placeholder="Buscar produtos ou cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <Button variant="secondary">Buscar</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={handleFilterChange} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
            <TabsTrigger value="course">Cursos</TabsTrigger>
          </TabsList>
        </Tabs>

        {isProductsLoading ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Carregando catálogo...</p>
          </div>
        ) : productsError ? (
          <div className="mx-auto max-w-xl rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 size-8 text-red-600" />
            <h2 className="font-semibold text-red-800">Não foi possível carregar o catálogo</h2>
            <p className="mt-2 text-sm text-red-700">{productsError}</p>
            <p className="mt-3 text-sm text-red-700">
              Confirme se o backend está rodando e se VITE_API_BASE_URL está correto.
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                    setSearchParams({});
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Por que escolher a MediShop?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="size-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="size-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Produtos Certificados</h3>
              <p className="text-gray-600">Equipamentos com certificação ANVISA e qualidade garantida</p>
            </div>
            <div className="text-center">
              <div className="size-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="size-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Cursos Reconhecidos</h3>
              <p className="text-gray-600">Certificações reconhecidas nacionalmente com instrutores qualificados</p>
            </div>
            <div className="text-center">
              <div className="size-16 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="size-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Pagamento Seguro</h3>
              <p className="text-gray-600">Diversas formas de pagamento com total segurança</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
