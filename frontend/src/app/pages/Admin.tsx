import { useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Package,
  Tag,
  Users,
} from "lucide-react";
import { Header } from "../components/Header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { ProductsManager } from "../components/admin/ProductsManager";
import { CoursesManager } from "../components/admin/CoursesManager";
import { StudentsManager } from "../components/admin/StudentsManager";
import { OrdersManager } from "../components/admin/OrdersManager";
import { PromoCodesManager } from "../components/admin/PromoCodesManager";
import { Button } from "../components/ui/button";
import { useAdmin } from "../context/AdminContext";
import { useUser } from "../context/UserContext";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("products");
  const { isAuthenticated, isAdmin } = useUser();
  const {
    isProductsLoading,
    isProtectedDataLoading,
    productsError,
    protectedDataError,
  } = useAdmin();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
            <LayoutDashboard className="mx-auto mb-4 size-10 text-purple-600" />
            <h1 className="text-2xl font-bold">Acesso administrativo</h1>
            <p className="mt-3 text-gray-600">
              Faça login para gerenciar produtos, cursos, alunos, pedidos e promoções.
            </p>
            <Button className="mt-6" onClick={() => navigate("/login")}>
              Entrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto mb-4 size-10 text-red-600" />
            <h1 className="text-2xl font-bold">Acesso restrito</h1>
            <p className="mt-3 text-gray-600">
              Esta área está disponível somente para administradores. Se você
              acha que deveria ter acesso, entre em contato com o suporte.
            </p>
            <Button className="mt-6" onClick={() => navigate("/")}>
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-gradient-to-br from-red-600 via-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="size-8" />
            <h1 className="text-4xl font-bold">Painel Administrativo</h1>
          </div>
          <p className="text-pink-100 text-lg">
            Gerencie produtos, cursos, alunos, pedidos e promoções da plataforma
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isProtectedDataLoading && (
          <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
            Carregando dados administrativos...
          </div>
        )}

        {isProductsLoading && (
          <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
            Carregando catálogo...
          </div>
        )}

        {(productsError || protectedDataError) && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">
                Falha ao carregar dados administrativos
              </p>
              {productsError && <p>{productsError}</p>}
              {protectedDataError && <p>{protectedDataError}</p>}
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-2 gap-1 md:grid-cols-5 mb-8">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="size-4" />
              Equipamentos
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <GraduationCap className="size-4" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="size-4" />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ClipboardList className="size-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="promocodes" className="flex items-center gap-2">
              <Tag className="size-4" />
              Promoções
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>

          <TabsContent value="courses">
            <CoursesManager />
          </TabsContent>

          <TabsContent value="students">
            <StudentsManager />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="promocodes">
            <PromoCodesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
