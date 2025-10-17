import { useEffect, useRef } from 'react';
import { useCart } from './useCart';
import { useAuth } from './useAuth';
import { orderService } from '@/services/orderService';

/**
 * Hook to sync cart with backend orders (status: incart)
 * This should be used in App.tsx to ensure cart is always synced
 */
export const useCartSync = () => {
  const { items, clearCart, addItem } = useCart();
  const { user, externalUser } = useAuth();
  const hasLoadedFromBackend = useRef(false);
  const isSyncing = useRef(false);
  const justClearedDueTo404 = useRef(false);

  // Get user ID from external auth or Supabase
  const apiUserId = externalUser?.userId || user?.id;
  const userName = externalUser?.name || user?.user_metadata?.name || user?.email || '';
  const userEmail = user?.email || '';

  // Load cart from backend on initial mount (only once)
  useEffect(() => {
    if (!apiUserId || hasLoadedFromBackend.current) return;

    let cancelled = false;
    hasLoadedFromBackend.current = true;

    (async () => {
      try {
        const existing = await orderService.getInCart(apiUserId);
        if (!existing || cancelled) {
          // No in-cart order found - clear the local cart
          console.log('[CartSync] No in-cart order found, clearing local cart');
          clearCart();
          return;
        }

        if (!existing.items || existing.items.length === 0) {
          // Order exists but has no items - clear the local cart
          console.log('[CartSync] In-cart order has no items, clearing local cart');
          clearCart();
          return;
        }

        console.log('[CartSync] Loading cart from backend:', existing.items.length, 'items');

        // Replace local cart with server state
        clearCart();
        existing.items.forEach((it) => {
          const priceStr = typeof it.price === 'number' ? it.price.toString() : String(it.price ?? '0');
          addItem({
            id: it.productId,
            name: it.name,
            price: priceStr,
            image: it.image || ''
          }, it.quantity);
        });
      } catch (e: any) {
        console.log('[CartSync] No existing order found or error loading:', e);
        // If 404 (no in-cart order), clear the local cart
        if (e?.response?.status === 404 || e?.message?.includes('No in-cart order')) {
          console.log('[CartSync] 404 - No in-cart order, clearing local cart');
          justClearedDueTo404.current = true;
          clearCart();
        }
        // Otherwise ignore the error (network issues, etc.)
      }
    })();

    return () => { cancelled = true; };
  }, [apiUserId]); // Only run when apiUserId changes

  // Save cart to backend whenever items change (debounced)
  // If cart is empty, delete the backend order instead of saving
  useEffect(() => {
    if (!apiUserId || !hasLoadedFromBackend.current || isSyncing.current) return;

    const timer = setTimeout(() => {
      // If cart was just cleared due to 404, don't try to delete or save
      if (justClearedDueTo404.current) {
        console.log('[CartSync] Cart was cleared due to 404, skipping sync');
        justClearedDueTo404.current = false;
        return;
      }

      isSyncing.current = true;

      // If cart is empty, delete the backend order
      if (items.length === 0) {
        console.log('[CartSync] Cart is empty, deleting backend order');
        orderService.deleteInCartOrder(apiUserId)
          .then(() => {
            console.log('[CartSync] Backend order deleted successfully');
          })
          .catch((err) => {
            console.error('[CartSync] Error deleting backend order:', err);
          })
          .finally(() => {
            isSyncing.current = false;
          });
        return;
      }

      // Otherwise, save the cart to backend
      const toNumber = (p: any) => {
        const s = String(p ?? '0');
        const n = parseFloat(s.replace(/,/g, ''));
        return isNaN(n) ? 0 : n;
      };

      const payload = items.map((i) => ({
        productId: i.id,
        name: i.name,
        price: toNumber(i.price),
        image: i.image,
        quantity: i.quantity,
      }));

      const subtotal = items.reduce((sum, i) => sum + toNumber(i.price) * i.quantity, 0);

      console.log('[CartSync] Saving cart to backend:', payload.length, 'items');
      orderService.saveInCart(apiUserId, payload, subtotal, undefined, undefined, userName, userEmail)
        .then(() => {
          console.log('[CartSync] Cart saved successfully');
        })
        .catch((err) => {
          console.error('[CartSync] Error saving cart:', err);
        })
        .finally(() => {
          isSyncing.current = false;
        });
    }, 800); // Debounce for 800ms

    return () => clearTimeout(timer);
  }, [apiUserId, items, userName, userEmail]);

  return {
    isReady: hasLoadedFromBackend.current,
  };
};

