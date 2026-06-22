import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useUser } from '../context/UserContext';
import { formatCPF, formatPhone, formatCEP, formatCurrency, isValidCPF } from '../utils/formatters';
import { User, Package, Edit, Save, X, Calendar, CreditCard, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export default function Profile() {
  const { user, orders, updateProfile, logout } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Faça login para acessar seu perfil</h2>
          <Button onClick={() => window.location.href = '/login'}>Fazer Login</Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    // Validações básicas
    if (!formData.name || !formData.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    if (formData.email && !formData.email.includes('@')) {
      toast.error('Email inválido');
      return;
    }

    if (!isValidCPF(formData.cpf ?? '')) {
      toast.error('CPF invalido');
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar o perfil');
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleZipCodeChange = async (value: string) => {
    const zipCode = formatCEP(value);
    const digits = zipCode.replace(/\D/g, '');

    setFormData((current) => ({
      ...current,
      address: { ...current.address!, zipCode }
    }));

    if (digits.length !== 8) {
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const address = await response.json();

      if (address.erro) {
        toast.error('CEP nao encontrado');
        return;
      }

      setFormData((current) => ({
        ...current,
        address: {
          ...current.address!,
          zipCode,
          street: address.logradouro || current.address?.street || '',
          neighborhood: address.bairro || current.address?.neighborhood || '',
          city: address.localidade || current.address?.city || '',
          state: address.uf || current.address?.state || ''
        }
      }));
    } catch {
      toast.error('Nao foi possivel buscar o CEP');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-yellow-100 text-yellow-700', label: 'Pendente' },
      processing: { className: 'bg-blue-100 text-blue-700', label: 'Em Processamento' },
      completed: { className: 'bg-green-100 text-green-700', label: 'Concluído' },
      cancelled: { className: 'bg-red-100 text-red-700', label: 'Cancelado' }
    };

    const config = variants[status] || variants.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPaymentMethodLabel = (method: string, installments?: number) => {
    const labels: Record<string, string> = {
      debit: 'Débito',
      credit: installments && installments > 1 ? `Crédito ${installments}x` : 'Crédito',
      pix: 'PIX'
    };
    return labels[method] || method;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Meu Perfil
          </h1>
          <Button variant="outline" onClick={handleLogout} className="gap-2 self-start sm:self-auto">
            <LogOut className="size-4" />
            Sair da conta
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="size-4" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="size-4" />
              Meus Pedidos
            </TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Informações Pessoais</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit className="size-4" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="gap-2"
                    >
                      <X className="size-4" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Save className="size-4" />
                      Salvar
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                      disabled={!isEditing}
                      maxLength={14}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                      disabled={!isEditing}
                      maxLength={15}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        value={formData.address?.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address!, street: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={formData.address?.number}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address!, number: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={formData.address?.complement || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address!, complement: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={formData.address?.neighborhood}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address!, neighborhood: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.address?.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address!, city: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.address?.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address!, state: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={formData.address?.zipCode}
                        onChange={(e) => handleZipCodeChange(e.target.value)}
                        disabled={!isEditing}
                        inputMode="numeric"
                        maxLength={9}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meus Pedidos */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="size-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Você ainda não tem pedidos</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="size-3" />
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Itens */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Resumo */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>

                        {order.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>
                              Desconto {order.promoCode && `(${order.promoCode})`}
                            </span>
                            <span>- {formatCurrency(order.discount)}</span>
                          </div>
                        )}

                        <div className="flex justify-between font-semibold text-base pt-2 border-t">
                          <span>Total</span>
                          <span className="text-purple-600">
                            {formatCurrency(order.finalTotal)}
                          </span>
                        </div>
                      </div>

                      {/* Pagamento */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                        <CreditCard className="size-4" />
                        {getPaymentMethodLabel(order.paymentMethod, order.installments)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
