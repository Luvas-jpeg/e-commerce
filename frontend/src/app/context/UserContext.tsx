import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, clearAuthToken, ordersApi, setAuthToken } from '../lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Cliente' | 'Admin';
  cpf: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'equipment' | 'course';
  status?: 'active' | 'completed' | 'cancelled';
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  discount: number;
  finalTotal: number;
  paymentMethod: 'debit' | 'credit' | 'pix';
  installments?: number;
  promoCode?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  orders: Order[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, cpf: string, phone: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const USER_KEY = 'medishop_user';

const emptyAddress: UserProfile['address'] = {
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
};

function getStoredUser(): UserProfile | null {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;

  const parsed = JSON.parse(stored) as Partial<UserProfile>;
  return {
    ...parsed,
    role: parsed.role === 'Admin' ? 'Admin' : 'Cliente',
    cpf: parsed.cpf ?? '',
    phone: parsed.phone ?? '',
    address: { ...emptyAddress, ...parsed.address },
  } as UserProfile;
}

function toUserProfile(user: {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  phone?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role?: string;
}): UserProfile {
  return {
    id: user.id.toString(),
    name: user.nome,
    email: user.email,
    role: user.role === 'Admin' ? 'Admin' : 'Cliente',
    cpf: user.cpf ?? '',
    phone: user.phone ?? '',
    address: {
      street: user.street ?? '',
      number: user.number ?? '',
      complement: user.complement ?? '',
      neighborhood: user.neighborhood ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
      zipCode: user.zipCode ?? '',
    },
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    const apiOrders = await ordersApi.listMine();
    setOrders(apiOrders.map((order) => ({ ...order, userId: user.id })));
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshOrders().catch(() => setOrders([]));
    }
  }, [refreshOrders, user]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const profile = toUserProfile(response.user);

    setAuthToken(response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);
  };

  const register = async (name: string, email: string, password: string, cpf: string, phone: string) => {
    await authApi.register(name, email, password, cpf, phone);
    await login(email, password);
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setOrders([]);
  };

  const updateProfile = async (profileUpdate: Partial<UserProfile>) => {
    if (user) {
      const merged = { ...user, ...profileUpdate };
      const apiUser = await authApi.updateProfile({
        nome: merged.name,
        email: merged.email,
        cpf: merged.cpf,
        phone: merged.phone,
        street: merged.address.street,
        number: merged.address.number,
        complement: merged.address.complement ?? '',
        neighborhood: merged.address.neighborhood,
        city: merged.address.city,
        state: merged.address.state,
        zipCode: merged.address.zipCode,
      });
      const updated = {
        ...merged,
        ...toUserProfile(apiUser),
      };
      setUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'userId' | 'createdAt'>) => {
    await ordersApi.create(
      orderData.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      {
        promoCode: orderData.promoCode,
        paymentMethod: orderData.paymentMethod,
        installments: orderData.installments,
      },
    );

    await refreshOrders();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        orders,
        login,
        register,
        logout,
        updateProfile,
        addOrder,
        refreshOrders,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
