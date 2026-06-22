import { PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { AdminOrder, useAdmin } from '../../context/AdminContext';

const statusLabels: Record<AdminOrder['status'], string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const statusClasses: Record<AdminOrder['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const paymentLabels: Record<AdminOrder['paymentMethod'], string> = {
  debit: 'Debito',
  credit: 'Credito',
  pix: 'PIX',
};

export function OrdersManager() {
  const { orders, updateOrderStatus } = useAdmin();

  const handleStatusChange = async (id: string, status: AdminOrder['status']) => {
    try {
      await updateOrderStatus(id, status);
      toast.success('Status do pedido atualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar o pedido');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageCheck className="size-5 text-purple-600" />
          Pedidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            Nenhum pedido encontrado.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      {order.customerEmail && (
                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs space-y-1 whitespace-normal">
                      {order.items.map((item) => (
                        <p key={`${order.id}-${item.productId}`} className="text-sm text-gray-600">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell>
                    {paymentLabels[order.paymentMethod]}
                    {order.paymentMethod === 'credit' && order.installments && order.installments > 1
                      ? ` ${order.installments}x`
                      : ''}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={statusClasses[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as AdminOrder['status'])}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
