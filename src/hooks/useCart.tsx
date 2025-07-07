import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  totalItems: 0,
  addItem: (item) => {
    const { items } = get();
    const existingItem = items.find(i => i.id === item.id);
    
    if (existingItem) {
      const updatedItems = items.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      set({ 
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    } else {
      const newItems = [...items, { ...item, quantity: 1 }];
      set({ 
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    }
  },
  removeItem: (id) => {
    const { items } = get();
    const updatedItems = items.filter(i => i.id !== id);
    set({ 
      items: updatedItems,
      totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  },
  updateQuantity: (id, quantity) => {
    const { items } = get();
    const updatedItems = items.map(i =>
      i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
    );
    set({ 
      items: updatedItems,
      totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  },
  clearCart: () => set({ items: [], totalItems: 0 }),
}));