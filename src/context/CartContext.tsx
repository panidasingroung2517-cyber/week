import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Book, CartItem, Coupon } from '../types';
import { INITIAL_COUPONS } from '../data/initialBooks';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (book: Book, format: 'physical' | 'ebook', quantity?: number) => void;
  removeFromCart: (bookId: string, format: 'physical' | 'ebook') => void;
  updateQuantity: (bookId: string, format: 'physical' | 'ebook', quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('chotthean_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('chotthean_coupon');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('chotthean_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('chotthean_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('chotthean_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (book: Book, format: 'physical' | 'ebook', quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.book.id === book.id && item.format === format
      );
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: format === 'ebook' ? 1 : Math.min(newQty, book.stock || 99),
        };
        return next;
      }
      return [...prev, { book, format, quantity: format === 'ebook' ? 1 : quantity }];
    });
  };

  const removeFromCart = (bookId: string, format: 'physical' | 'ebook') => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.book.id === bookId && item.format === format))
    );
  };

  const updateQuantity = (bookId: string, format: 'physical' | 'ebook', quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId, format);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.book.id === bookId && item.format === format) {
          return {
            ...item,
            quantity: format === 'ebook' ? 1 : Math.min(quantity, item.book.stock || 99),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const totalItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.book.price * item.quantity, 0),
    [cartItems]
  );

  const hasPhysicalBooks = useMemo(
    () => cartItems.some((item) => item.format === 'physical'),
    [cartItems]
  );

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minSpend) return 0;

    if (appliedCoupon.discountType === 'percentage') {
      const calculated = (subtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maxDiscount ? Math.min(calculated, appliedCoupon.maxDiscount) : calculated;
    } else {
      return Math.min(appliedCoupon.discountValue, subtotal);
    }
  }, [appliedCoupon, subtotal]);

  const shippingFee = useMemo(() => {
    if (!hasPhysicalBooks || cartItems.length === 0) return 0;
    // Free shipping if subtotal >= 400 or FREESHIP coupon used
    if (appliedCoupon?.code === 'FREESHIP' || subtotal >= 400) return 0;
    return 40;
  }, [hasPhysicalBooks, cartItems.length, subtotal, appliedCoupon]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + shippingFee);
  }, [subtotal, discountAmount, shippingFee]);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find(
      (c) => c.code.toUpperCase() === cleanCode && c.isActive
    );

    if (!found) {
      return { success: false, message: 'ไม่พบโค้ดส่วนลดนี้ หรือโค้ดหมดอายุแล้ว' };
    }

    if (subtotal < found.minSpend) {
      return {
        success: false,
        message: `ยอดสั่งซื้อขั้นต่ำสำหรับโค้ดนี้คือ ฿${found.minSpend} (ปัจจุบัน ฿${subtotal})`,
      };
    }

    setAppliedCoupon(found);
    return {
      success: true,
      message: `ใช้โค้ดส่วนลด "${found.code}" เรียบร้อยแล้ว`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingFee,
        discountAmount,
        finalTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
