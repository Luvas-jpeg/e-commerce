import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import type { Product } from './CartContext';
import { ordersAdminApi, productsApi, promoCodesApi, studentsApi } from '../lib/api';
import { useUser } from './UserContext';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

export interface AdminOrderItem {
  productId: string;
  name: string;
  type: 'equipment' | 'course';
  quantity: number;
  unitPrice: number;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  shipping: number;
  paymentMethod: 'debit' | 'credit' | 'pix';
  installments?: number;
  items: AdminOrderItem[];
}

interface AdminContextType {
  products: Product[];
  students: Student[];
  promoCodes: PromoCode[];
  orders: AdminOrder[];
  isProductsLoading: boolean;
  isProtectedDataLoading: boolean;
  productsError: string | null;
  protectedDataError: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addPromoCode: (promoCode: Omit<PromoCode, 'id' | 'usageCount'>) => Promise<void>;
  updatePromoCode: (id: string, promoCode: Partial<PromoCode>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: AdminOrder['status']) => Promise<void>;
  validatePromoCode: (code: string) => Promise<PromoCode | null>;
  usePromoCode: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isProtectedDataLoading, setIsProtectedDataLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [protectedDataError, setProtectedDataError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setIsProductsLoading(true);
    setProductsError(null);

    try {
      const apiProducts = await productsApi.list();
      setProducts(apiProducts);
    } catch (error) {
      setProducts([]);
      setProductsError(error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.');
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  const refreshStudents = useCallback(async () => {
    const apiStudents = await studentsApi.list();
    setStudents(apiStudents);
  }, []);

  const refreshPromoCodes = useCallback(async () => {
    const apiPromoCodes = await promoCodesApi.list();
    setPromoCodes(apiPromoCodes);
  }, []);

  const refreshOrders = useCallback(async () => {
    const apiOrders = await ordersAdminApi.list();
    setOrders(apiOrders);
  }, []);

  useEffect(() => {
    refreshProducts();

    const refreshProtectedAdminData = async () => {
      if (!isAdmin) {
        setStudents([]);
        setPromoCodes([]);
        setOrders([]);
        setProtectedDataError(null);
        setIsProtectedDataLoading(false);
        return;
      }

      setIsProtectedDataLoading(true);
      setProtectedDataError(null);

      const results = await Promise.allSettled([
        refreshStudents(),
        refreshPromoCodes(),
        refreshOrders(),
      ]);

      const failed = results.find((result) => result.status === 'rejected');
      if (failed) {
        setStudents([]);
        setPromoCodes([]);
        setOrders([]);
        setProtectedDataError('Não foi possível carregar alunos e promoções.');
      }

      setIsProtectedDataLoading(false);
    };

    refreshProtectedAdminData();
  }, [isAdmin, refreshProducts, refreshStudents, refreshPromoCodes, refreshOrders]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const created = await productsApi.create(product);
    setProducts((prev) => [...prev, created]);
  };

  const updateProduct = async (id: string, productUpdate: Partial<Product>) => {
    const currentProduct = products.find((product) => product.id === id);
    if (!currentProduct) return;

    const updated = await productsApi.update(id, { ...currentProduct, ...productUpdate });
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? updated : product
      )
    );
  };

  const deleteProduct = async (id: string) => {
    await productsApi.delete(id);
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    const created = await studentsApi.create(student);
    setStudents((prev) => [...prev, created]);
  };

  const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    const currentStudent = students.find((student) => student.id === id);
    if (!currentStudent) return;

    const updated = await studentsApi.update(id, { ...currentStudent, ...studentUpdate });
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? updated : student
      )
    );
  };

  const deleteStudent = async (id: string) => {
    await studentsApi.delete(id);
    setStudents((prev) => prev.filter((student) => student.id !== id));
  };

  const addPromoCode = async (promoCode: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const created = await promoCodesApi.create(promoCode);
    setPromoCodes((prev) => [...prev, created]);
  };

  const updatePromoCode = async (id: string, promoCodeUpdate: Partial<PromoCode>) => {
    const currentPromoCode = promoCodes.find((promoCode) => promoCode.id === id);
    if (!currentPromoCode) return;

    const updated = await promoCodesApi.update(id, { ...currentPromoCode, ...promoCodeUpdate });
    setPromoCodes((prev) =>
      prev.map((promoCode) =>
        promoCode.id === id ? updated : promoCode
      )
    );
  };

  const deletePromoCode = async (id: string) => {
    await promoCodesApi.delete(id);
    setPromoCodes((prev) => prev.filter((promoCode) => promoCode.id !== id));
  };

  const validatePromoCode = (code: string) => {
    return promoCodesApi.validate(code);
  };

  const usePromoCode = async (id: string) => {
    const updated = await promoCodesApi.use(id);
    setPromoCodes((prev) =>
      prev.map((promoCode) =>
        promoCode.id === id ? updated : promoCode
      )
    );
  };

  const updateOrderStatus = async (id: string, status: AdminOrder['status']) => {
    const updated = await ordersAdminApi.updateStatus(id, status);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: updated.status } : order
      )
    );
  };

  return (
    <AdminContext.Provider
      value={{
        products,
        students,
        promoCodes,
        orders,
        isProductsLoading,
        isProtectedDataLoading,
        productsError,
        protectedDataError,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        addStudent,
        updateStudent,
        deleteStudent,
        addPromoCode,
        updatePromoCode,
        deletePromoCode,
        updateOrderStatus,
        validatePromoCode,
        usePromoCode,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
