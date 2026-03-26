import { useState } from 'react';

export interface User {
  id: string;
  username: string;
  isMember: boolean;
}

export const useStore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<string[]>([]);

  const addToCart = (productId: string) => {
    setCart(prev => [...prev, productId]);
  };

  return {
    user,
    setUser,
    cart,
    addToCart
  };
};
