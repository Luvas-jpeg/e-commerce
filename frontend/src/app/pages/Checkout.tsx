import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, CreditCard, MapPin, Smartphone, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { useAdmin } from '../context/AdminContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatCEP, formatCurrency } from '../utils/formatters';

const emptyAddress = {
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const { addOrder, isAuthenticated, user, updateProfile } = useUser();
  const { validatePromoCode, refreshProducts } = useAdmin();

  const [paymentMethod, setPaymentMethod] = useState<'debit' | 'credit' | 'pix'>('credit');
  const [installments, setInstallments] = useState('1');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [address, setAddress] = useState(() => user?.address ?? emptyAddress);

  if (cart.length === 0) {
    navigate('/');
    return null;
  }

  const discount = appliedPromo
    ? appliedPromo.type === 'percentage'
      ? total * (appliedPromo.discount / 100)
      : appliedPromo.discount
    : 0;
  const finalTotal = Math.max(0, total - discount);
  const installmentValue = finalTotal / parseInt(installments);
  const isAddressComplete = [
    address.street,
    address.number,
    address.neighborhood,
    address.city,
    address.state,
    address.zipCode,
  ].every((field) => field.trim());

  const handleApplyPromo = async () => {
    setPromoError('');
    setIsApplyingPromo(true);

    try {
      const validated = await validatePromoCode(promoCode);
      if (!validated) {
        setPromoError('Código inválido, expirado ou já utilizado');
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo({
        code: validated.code,
        discount: validated.discount,
        type: validated.discountType,
      });
      toast.success('Código promocional aplicado!');
    } catch (error) {
      setPromoError(error instanceof Error ? error.message : 'Não foi possível validar o código');
      setAppliedPromo(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!isAddressComplete) {
      toast.error('Preencha os campos obrigatórios do endereço');
      return false;
    }

    if (user) {
      await updateProfile({ address });
    }

    setIsAddressDialogOpen(false);
    toast.success('Endereço salvo');
    return true;
  };

  const handleFinishOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para finalizar o pedido');
      navigate('/login');
      return;
    }

    if (!isAddressComplete) {
      setIsAddressDialogOpen(true);
      toast.error('Preencha o endereço de entrega para finalizar o pedido');
      return;
    }

    setIsSubmitting(true);

    try {
      if (user) {
        await updateProfile({ address });
      }

      await addOrder({
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type,
        })),
        total,
        discount,
        finalTotal,
        paymentMethod,
        installments: paymentMethod === 'credit' ? parseInt(installments) : undefined,
        promoCode: appliedPromo?.code,
        status: 'pending',
      });

      await refreshProducts();
      clearCart();
      toast.success('Pedido realizado com sucesso!');
      navigate('/order-success');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível finalizar o pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
          Finalizar Pedido
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-purple-600">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-5 text-purple-600" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {isAddressComplete ? (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">
                      {address.street}, {address.number}
                    </p>
                    <p>
                      {address.neighborhood} - {address.city}/{address.state}
                    </p>
                    <p>CEP {address.zipCode}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Informe o endereço para entrega antes de finalizar o pedido.
                  </p>
                )}
                <Button variant="outline" onClick={() => setIsAddressDialogOpen(true)}>
                  {isAddressComplete ? 'Alterar endereço' : 'Adicionar endereço'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="size-5 text-pink-600" />
                  Código Promocional
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!appliedPromo ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o código"
                        value={promoCode}
                        onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button onClick={handleApplyPromo} variant="outline" disabled={isApplyingPromo}>
                        {isApplyingPromo ? 'Validando...' : 'Aplicar'}
                      </Button>
                    </div>
                    {promoError && (
                      <p className="flex items-center gap-1 text-sm text-red-600">
                        <X className="size-4" />
                        {promoError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center gap-2">
                      <Check className="size-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{appliedPromo.code}</p>
                        <p className="text-sm text-green-600">
                          {appliedPromo.type === 'percentage'
                            ? `${appliedPromo.discount}% de desconto`
                            : `${formatCurrency(appliedPromo.discount)} de desconto`}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoCode('');
                        setPromoError('');
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)}>
                  <div className="flex cursor-pointer items-center space-x-2 rounded-lg border p-4 hover:bg-gray-50">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit" className="flex flex-1 cursor-pointer items-center gap-2">
                      <CreditCard className="size-5 text-purple-600" />
                      Cartão de Crédito
                    </Label>
                  </div>

                  <div className="flex cursor-pointer items-center space-x-2 rounded-lg border p-4 hover:bg-gray-50">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label htmlFor="debit" className="flex flex-1 cursor-pointer items-center gap-2">
                      <CreditCard className="size-5 text-red-600" />
                      Cartão de Débito
                    </Label>
                  </div>

                  <div className="flex cursor-pointer items-center space-x-2 rounded-lg border p-4 hover:bg-gray-50">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex flex-1 cursor-pointer items-center gap-2">
                      <Smartphone className="size-5 text-pink-600" />
                      PIX
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'credit' && (
                  <div className="border-t pt-4">
                    <Label htmlFor="installments">Número de Parcelas</Label>
                    <Select value={installments} onValueChange={setInstallments}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}x de {formatCurrency(finalTotal / num)}
                            {num === 1 ? ' à vista' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto ({appliedPromo.code})</span>
                    <span className="font-medium">- {formatCurrency(discount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-purple-600">{formatCurrency(finalTotal)}</span>
                </div>

                {paymentMethod === 'credit' && parseInt(installments) > 1 && (
                  <p className="text-center text-sm text-gray-600">
                    {installments}x de {formatCurrency(installmentValue)}
                  </p>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  size="lg"
                  onClick={handleFinishOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Finalizando...' : 'Finalizar Pedido'}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Ao finalizar, você concorda com nossos termos de serviço
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Endereço de Entrega</DialogTitle>
            <DialogDescription>
              Preencha o endereço para finalizar o pedido. Ele também ficará salvo no seu perfil.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="checkout-street">Rua</Label>
              <Input
                id="checkout-street"
                value={address.street}
                onChange={(event) => setAddress({ ...address, street: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-number">Número</Label>
              <Input
                id="checkout-number"
                value={address.number}
                onChange={(event) => setAddress({ ...address, number: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-complement">Complemento</Label>
              <Input
                id="checkout-complement"
                value={address.complement ?? ''}
                onChange={(event) => setAddress({ ...address, complement: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-neighborhood">Bairro</Label>
              <Input
                id="checkout-neighborhood"
                value={address.neighborhood}
                onChange={(event) => setAddress({ ...address, neighborhood: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-city">Cidade</Label>
              <Input
                id="checkout-city"
                value={address.city}
                onChange={(event) => setAddress({ ...address, city: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-state">Estado</Label>
              <Input
                id="checkout-state"
                value={address.state}
                onChange={(event) => setAddress({ ...address, state: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-zipCode">CEP</Label>
              <Input
                id="checkout-zipCode"
                value={address.zipCode}
                onChange={(event) => setAddress({ ...address, zipCode: formatCEP(event.target.value) })}
                maxLength={9}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAddress}>Salvar endereço</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
