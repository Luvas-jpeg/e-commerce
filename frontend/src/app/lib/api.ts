import type { Product } from '../context/CartContext';
import type { Order } from '../context/UserContext';
import type { AdminOrder, PromoCode, Student } from '../context/AdminContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5278/api';
const TOKEN_KEY = 'medishop_token';
export const AUTH_TOKEN_CHANGED_EVENT = 'medishop:auth-token-changed';

export interface ApiUser {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  role: 'Cliente' | 'Admin';
}

export interface ApiProduct {
  id: number;
  nome: string;
  preco: number;
  tipoProduto: 'equipment' | 'course';
  estoque: number;
  description: string;
  image: string;
  category: string;
  date: string;
  location: string;
  instructor: string;
}

export interface ApiOrderItem {
  produtoId: number;
  nome?: string;
  tipoProduto?: 'equipment' | 'course';
  quantidade: number;
  precoUnitario: number;
  status?: 'active' | 'completed' | 'cancelled' | null;
}

export interface ApiOrder {
  id: number;
  dataPedido: string;
  status: string;
  total: number;
  valorFrete: number;
  paymentMethod?: 'debit' | 'credit' | 'pix';
  installments?: number | null;
  promoCode?: string;
  itens: ApiOrderItem[];
}

export interface ApiAdminOrder extends ApiOrder {
  usuario?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}

interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface ApiStudent {
  id: number;
  name: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface ApiPromoCode {
  id: number;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAuthToken();

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const hasJsonBody = contentType?.includes('application/json');
  const data = hasJsonBody ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(data?.message ?? `Erro ${response.status} na API.`, response.status);
  }

  return data as T;
}

export function toProduct(product: ApiProduct): Product {
  return {
    id: product.id.toString(),
    name: product.nome,
    price: Number(product.preco),
    type: product.tipoProduto,
    image: product.image,
    description: product.description,
    category: product.category,
    date: product.date,
    location: product.location,
    instructor: product.instructor,
    stock: product.estoque,
  };
}

export function toProductRequest(product: Omit<Product, 'id'> | Partial<Product>) {
  return {
    nome: product.name ?? '',
    preco: product.price ?? 0,
    tipoProduto: product.type ?? 'equipment',
    estoque: product.stock ?? 0,
    description: product.description ?? '',
    image: product.image ?? '',
    category: product.category ?? '',
    date: product.date ?? '',
    location: product.location ?? '',
    instructor: product.instructor ?? '',
  };
}

function normalizeStatus(status: string): Order['status'] {
  const normalized = status.toLowerCase();

  if (normalized.includes('process')) return 'processing';
  if (normalized.includes('conclu')) return 'completed';
  if (normalized.includes('cancel')) return 'cancelled';
  return 'pending';
}

function toApiStatus(status: AdminOrder['status']) {
  const map: Record<AdminOrder['status'], string> = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  };

  return map[status];
}

export function toOrder(order: ApiOrder): Order {
  const items = order.itens.map((item) => ({
    id: item.produtoId.toString(),
    name: item.nome ?? `Produto #${item.produtoId}`,
    price: Number(item.precoUnitario),
    quantity: item.quantidade,
    type: item.tipoProduto ?? 'equipment',
    status: item.status ?? undefined,
  }));
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = Number(order.total);
  const discount = Math.max(0, total - finalTotal);

  return {
    id: order.id.toString(),
    userId: '',
    items,
    total,
    discount,
    finalTotal,
    paymentMethod: order.paymentMethod ?? 'credit',
    installments: order.installments ?? undefined,
    promoCode: order.promoCode || undefined,
    status: normalizeStatus(order.status),
    createdAt: order.dataPedido,
  };
}

function toAdminOrder(order: ApiAdminOrder): AdminOrder {
  return {
    id: order.id.toString(),
    customerName: order.usuario?.nome ?? 'Cliente não identificado',
    customerEmail: order.usuario?.email ?? '',
    createdAt: order.dataPedido,
    status: normalizeStatus(order.status),
    total: Number(order.total),
    shipping: Number(order.valorFrete),
    paymentMethod: order.paymentMethod ?? 'credit',
    installments: order.installments ?? undefined,
    items: order.itens.map((item) => ({
      productId: item.produtoId.toString(),
      name: item.nome ?? `Produto #${item.produtoId}`,
      type: item.tipoProduto ?? 'equipment',
      quantity: item.quantidade,
      unitPrice: Number(item.precoUnitario),
    })),
  };
}

function toStudent(student: ApiStudent): Student {
  return {
    id: student.id.toString(),
    name: student.name,
    email: student.email,
    phone: student.phone,
    courseId: student.courseId,
    courseName: student.courseName,
    enrollmentDate: student.enrollmentDate,
    status: student.status,
  };
}

function toStudentRequest(student: Omit<Student, 'id'> | Partial<Student>) {
  return {
    name: student.name ?? '',
    email: student.email ?? '',
    phone: student.phone ?? '',
    courseId: student.courseId ?? '',
    courseName: student.courseName ?? '',
    enrollmentDate: student.enrollmentDate ?? '',
    status: student.status ?? 'active',
  };
}

function toPromoCode(promoCode: ApiPromoCode): PromoCode {
  return {
    id: promoCode.id.toString(),
    code: promoCode.code,
    discount: Number(promoCode.discount),
    discountType: promoCode.discountType,
    startDate: promoCode.startDate,
    endDate: promoCode.endDate,
    isActive: promoCode.isActive,
    usageLimit: promoCode.usageLimit,
    usageCount: promoCode.usageCount,
  };
}

function toPromoCodeRequest(promoCode: Omit<PromoCode, 'id'> | Partial<PromoCode>) {
  return {
    code: promoCode.code ?? '',
    discount: promoCode.discount ?? 0,
    discountType: promoCode.discountType ?? 'percentage',
    startDate: promoCode.startDate ?? '',
    endDate: promoCode.endDate ?? '',
    isActive: promoCode.isActive ?? true,
    usageLimit: promoCode.usageLimit,
    usageCount: promoCode.usageCount ?? 0,
  };
}

export const authApi = {
  login(email: string, senha: string) {
    return apiRequest<LoginResponse>('/Auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, senha }),
    });
  },
  register(nome: string, email: string, senha: string, cpf: string, phone: string) {
    return apiRequest<{ message: string; userId: number }>('/Auth/cadastrar', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ nome, email, senha, cpf, phone }),
    });
  },
  updateProfile(profile: {
    nome: string;
    email: string;
    cpf: string;
    phone: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  }) {
    return apiRequest<ApiUser>('/Auth/perfil', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },
};

export const productsApi = {
  async list(tipo?: 'equipment' | 'course') {
    const query = tipo ? `?tipo=${tipo}` : '';
    const products = await apiRequest<ApiProduct[]>(`/Products${query}`, { auth: false });
    return products.map(toProduct);
  },
  async create(product: Omit<Product, 'id'>) {
    const created = await apiRequest<ApiProduct>('/Products', {
      method: 'POST',
      body: JSON.stringify(toProductRequest(product)),
    });
    return toProduct(created);
  },
  async update(id: string, product: Partial<Product>) {
    const updated = await apiRequest<ApiProduct>(`/Products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toProductRequest(product)),
    });
    return toProduct(updated);
  },
  delete(id: string) {
    return apiRequest<void>(`/Products/${id}`, { method: 'DELETE' });
  },
};

export const ordersApi = {
  async listMine() {
    const orders = await apiRequest<ApiOrder[]>('/Orders/my');
    return orders.map(toOrder);
  },
  create(
    items: { productId: string; quantity: number; unitPrice: number }[],
    options: {
      promoCode?: string;
      paymentMethod: 'debit' | 'credit' | 'pix';
      installments?: number;
    },
  ) {
    return apiRequest<{ message: string; orderId: number; total: number }>('/Orders', {
      method: 'POST',
      body: JSON.stringify({
        valorFrete: 0,
        promoCode: options.promoCode ?? '',
        paymentMethod: options.paymentMethod,
        installments: options.installments,
        itens: items.map((item) => ({
          produtoId: Number(item.productId),
          quantidade: item.quantity,
          precoUnitario: item.unitPrice,
        })),
      }),
    });
  },
};

export const ordersAdminApi = {
  async list() {
    const orders = await apiRequest<ApiAdminOrder[]>('/Orders');
    return orders.map(toAdminOrder);
  },
  async updateStatus(id: string, status: AdminOrder['status']) {
    const updated = await apiRequest<{ id: number; status: string }>(`/Orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: toApiStatus(status) }),
    });

    return {
      id: updated.id.toString(),
      status: normalizeStatus(updated.status),
    };
  },
};

export const studentsApi = {
  async list() {
    const students = await apiRequest<ApiStudent[]>('/Students');
    return students.map(toStudent);
  },
  async create(student: Omit<Student, 'id'>) {
    const created = await apiRequest<ApiStudent>('/Students', {
      method: 'POST',
      body: JSON.stringify(toStudentRequest(student)),
    });
    return toStudent(created);
  },
  async update(id: string, student: Partial<Student>) {
    const updated = await apiRequest<ApiStudent>(`/Students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toStudentRequest(student)),
    });
    return toStudent(updated);
  },
  delete(id: string) {
    return apiRequest<void>(`/Students/${id}`, { method: 'DELETE' });
  },
};

export const promoCodesApi = {
  async list() {
    const promoCodes = await apiRequest<ApiPromoCode[]>('/PromoCodes');
    return promoCodes.map(toPromoCode);
  },
  async create(promoCode: Omit<PromoCode, 'id' | 'usageCount'>) {
    const created = await apiRequest<ApiPromoCode>('/PromoCodes', {
      method: 'POST',
      body: JSON.stringify(toPromoCodeRequest({ ...promoCode, usageCount: 0 })),
    });
    return toPromoCode(created);
  },
  async update(id: string, promoCode: Partial<PromoCode>) {
    const updated = await apiRequest<ApiPromoCode>(`/PromoCodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toPromoCodeRequest(promoCode)),
    });
    return toPromoCode(updated);
  },
  delete(id: string) {
    return apiRequest<void>(`/PromoCodes/${id}`, { method: 'DELETE' });
  },
  async validate(code: string) {
    try {
      const promoCode = await apiRequest<ApiPromoCode>(
        `/PromoCodes/validate?code=${encodeURIComponent(code)}`,
        { auth: false },
      );
      return toPromoCode(promoCode);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  },
  async use(id: string) {
    const promoCode = await apiRequest<ApiPromoCode>(`/PromoCodes/${id}/use`, {
      method: 'POST',
    });
    return toPromoCode(promoCode);
  },
};
