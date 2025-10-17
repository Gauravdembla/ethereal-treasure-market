import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { shopSettingsApi, ShopSettings } from "@/services/shopSettingsApi";
import { addressService, type ApiAddress } from "@/services/addressService";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Trash2, Gift, Coins, ArrowLeft, User, UserCircle, ShoppingCart, Star, MapPin } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useAngelCoins } from "@/hooks/useAngelCoins";
import { useNavigate, Link } from "react-router-dom";
import { useMembershipPricing } from "@/hooks/useMembershipPricing";
import LoginDialog from "@/components/LoginDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddressForm from "@/components/AddressForm";
import CompanyDetailsForm from "@/components/CompanyDetailsForm";

import { PRODUCTS } from "@/data/products";
import { supabase, type Product, productHelpers } from "@/integrations/supabase/client";
import appConfig from "@/services/appConfig";
import { userProfileService } from "@/services/userProfileService";
import MembershipBadge from "@/components/MembershipBadge";
import { orderService } from "@/services/orderService";
import { productApi, type ApiProduct } from "@/services/productApi";

import { Checkbox } from "@/components/ui/checkbox";
import PaymentThankYou from "@/components/PaymentThankYou";
import PaymentFailureModal from "@/components/PaymentFailureModal";
import {
  createPaymentSession,
  ensureRazorpayScript,
  openRazorpayCheckout,
  type PaymentConfig,
  type PaymentResponse,
} from "@/services/razorpayService";


const Checkout = () => {
  const { items, updateQuantity, removeItem, clearCart, addItem } = useCart();
  const { user, externalUser, getUserRole } = useAuth();
  const { angelCoins, exchangeRateINR, getMaxRedeemableCoins, getMaxRedemptionValue, calculateGSTBreakdown, calculateRedemptionValue, loading: angelCoinsLoading, getTierKey } = useAngelCoins();
  const userRole = getUserRole();
  const navigate = useNavigate();

  // Get user information (prefer external user)
  const userName = externalUser?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  // Get email from multiple sources
  // For external user, email is in profile_full.email
  const userEmail = externalUser?.profile_full?.email || user?.email || '';

  // Get mobile number and extract just the phone part (without country code)
  let userMobile = '';
  let userMobileWithoutCountryCode = '';
  try {
    const pfRaw = localStorage.getItem('AOE_profile_full');
    if (pfRaw) {
      const pf = JSON.parse(pfRaw);
      const countryCode = pf.countryCode || '';
      const phone = pf.phone || '';
      userMobile = countryCode + phone;
      // Extract phone without country code
      userMobileWithoutCountryCode = phone;
    }
  } catch {}

  if (!userMobile) {
    userMobile = (user?.user_metadata as any)?.mobile || '';
    // If we have mobile but no country code extracted, try to extract it
    if (userMobile && !userMobileWithoutCountryCode) {
      // Remove country code if present (e.g., +91 or 91)
      userMobileWithoutCountryCode = userMobile.replace(/^\+?91/, '').replace(/^91/, '');
    }
  }

  // Fallback: if still no phone without country code, use the full mobile
  if (!userMobileWithoutCountryCode && userMobile) {
    userMobileWithoutCountryCode = userMobile.replace(/^\+?91/, '').replace(/^91/, '');
  }


	  // User ID for API calls (prefer external user id to match Profile)
	  const apiUserId = externalUser?.userId || localStorage.getItem('AOE_userId') || user?.id || user?.email || 'default';


  // Delivery address state
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Current order state
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [currentOrderDbId, setCurrentOrderDbId] = useState<string>('');

  // Load order IDs from backend on mount
  useEffect(() => {
    if (!apiUserId) return;
    let cancelled = false;
    (async () => {
      try {
        const existing = await orderService.getInCart(apiUserId);
        console.log('Loaded existing order:', existing);
        if (!existing || cancelled) {
          // No in-cart order found - clear order IDs
          console.log('No in-cart order found, clearing order IDs');
          setCurrentOrderId('');
          setCurrentOrderDbId('');
          setGstInvoiceEnabled(false);
          setAngelCoinsToRedeem([0]);
          return;
        }
        // Store order IDs, GST invoice status, and Angel Coins
        console.log('Setting initial order IDs:', existing.orderId, existing.id);
        console.log('Setting GST invoice status:', existing.gstInvoice);
        console.log('Setting Angel Coins from backend - Used:', existing.angelCoinsUsed, 'Discount:', existing.angelCoinsDiscount);
        setCurrentOrderId(existing.orderId || '');
        setCurrentOrderDbId(existing.id || '');
        setGstInvoiceEnabled(existing.gstInvoice || false);

        // Load Angel Coins redemption from backend
        if (typeof existing.angelCoinsUsed === 'number' && existing.angelCoinsUsed > 0) {
          console.log('Restoring Angel Coins redemption:', existing.angelCoinsUsed);
          setAngelCoinsToRedeem([existing.angelCoinsUsed]);
          setHasLoadedAngelCoinsFromBackend(true);

          // Reset the flag after 2 seconds to allow auto-adjustment to work again
          setTimeout(() => {
            console.log('[Backend Load] Resetting hasLoadedAngelCoinsFromBackend flag');
            setHasLoadedAngelCoinsFromBackend(false);
          }, 2000);
        } else {
          setAngelCoinsToRedeem([0]);
          setHasLoadedAngelCoinsFromBackend(true);

          // Reset the flag after 2 seconds
          setTimeout(() => {
            setHasLoadedAngelCoinsFromBackend(false);
          }, 2000);
        }
      } catch (e: any) {
        console.log('No existing order found:', e);
        // If 404 (no in-cart order), clear order IDs
        if (e?.response?.status === 404 || e?.message?.includes('No in-cart order')) {
          console.log('404 - No in-cart order, clearing order IDs');
          setCurrentOrderId('');
          setCurrentOrderDbId('');
          setGstInvoiceEnabled(false);
          setAngelCoinsToRedeem([0]);
        }
        // Otherwise ignore the error
      }
    })();
    return () => { cancelled = true; };
  }, [apiUserId]);

  const [addressesLoading, setAddressesLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: '', customType: '', name: '', address1: '', address2: '', nearby: '', city: '', state: '', customState: '', country: '', zipCode: '', isDefault: false,
  });

  const [companyDetails, setCompanyDetails] = useState<any>(null);
  useEffect(() => {
    if (!apiUserId) return;
    let mounted = true;
    (async () => {
      try {
        const details = await userProfileService.getCompanyDetails(apiUserId);
        if (mounted) setCompanyDetails(details);
      } catch (e) {
        console.warn('No company details found for user', apiUserId);
      }
    })();
    return () => { mounted = false; };
  }, [apiUserId]);
  const [gstInvoiceEnabled, setGstInvoiceEnabled] = useState<boolean>(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [hasLoadedAngelCoinsFromBackend, setHasLoadedAngelCoinsFromBackend] = useState(false);

  // Mock user profile data (in real app, this would come from user profile API)
  const userAlternativeMobile = user?.user_metadata?.alternativeMobile || '';
  const userMembershipType = user?.user_metadata?.membershipType || 'Diamond';
  const [couponCode, setCouponCode] = useState("");
  const [angelCoinsToRedeem, setAngelCoinsToRedeem] = useState([0]);
  const [discount, setDiscount] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);

  // Load addresses from API (matching Profile page)
  const loadAddresses = async () => {
    if (!apiUserId) {
      return;
    }

    setAddressesLoading(true);

    try {
      const data = await addressService.list(apiUserId);
      setAddresses(data);

      // Auto-select default address or first address
      const defaultAddr = data.find((a) => a.isDefault) || data[0];
      if (defaultAddr) {
        setSelectedAddressId(String(defaultAddr.id));
      }
    } catch (error) {
      console.error('Failed to load addresses for checkout', error);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (apiUserId) {
      loadAddresses();
    }
  }, [apiUserId]);

  const handleSaveNewAddress = async () => {
    // minimal validation
    if (!newAddress.type || !newAddress.name || !newAddress.address1 || !newAddress.city || (!newAddress.state && !newAddress.customState) || !newAddress.country || !newAddress.zipCode) {
      alert('Please fill required address fields');
      return;
    }

    if (!apiUserId) {
      alert('Unable to determine user. Please sign in again.');
      return;
    }

    const stateName = newAddress.state === 'Others' ? newAddress.customState : newAddress.state;

    const payload = {
      userId: apiUserId,
      type: newAddress.type === 'Others' ? newAddress.customType : newAddress.type,
      name: newAddress.name,
      address1: newAddress.address1,
      address2: newAddress.address2 || '',
      nearby: newAddress.nearby || '',
      city: newAddress.city,
      state: stateName,
      country: newAddress.country,
      zipCode: newAddress.zipCode,
      isDefault: addresses.length === 0 ? true : newAddress.isDefault,
    };

    try {
      await addressService.create(payload);
      await loadAddresses();
      setIsAddingAddress(false);
      setNewAddress({ type: '', customType: '', name: '', address1: '', address2: '', nearby: '', city: '', state: '', customState: '', country: '', zipCode: '', isDefault: false });
    } catch (error) {
      console.error('Failed to add address', error);
      alert('Failed to add address. Please try again.');
    }
  };

  // Related Products state (matching ProductDetail.tsx)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedProductsStartIndex, setRelatedProductsStartIndex] = useState(0);
  const [relatedProductQuantities, setRelatedProductQuantities] = useState<{[key: string]: number}>({});
  const [showAsCard, setShowAsCard] = useState(false);

  // Products state - to get actual available quantities from backend
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Load products from backend to get actual available quantities
  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const apiProducts = await productApi.list();
        if (mounted) {
          setProducts(apiProducts);
          console.log('[Checkout] Loaded products from backend:', apiProducts.length);
        }
      } catch (error) {
        console.error('[Checkout] Failed to load products:', error);
      } finally {
        if (mounted) setProductsLoading(false);
      }
    };
    loadProducts();
    return () => { mounted = false; };
  }, []);

  // Admin settings - in real app, these would come from API/context
  const [showAngelCoinsSection, setShowAngelCoinsSection] = useState(true);
  const [showCouponSection, setShowCouponSection] = useState(true);

  // Minimum Angel Coins required to redeem (configurable)
  const minAngelCoinsRequired = appConfig.getMinAngelCoinsRequired();

  // Helper function to get available quantity from backend products
  const getAvailableQuantity = (productId: string) => {
    const product = products.find(p => p.id === productId || p._id === productId);
    if (product && typeof product.availableQuantity === 'number') {
      console.log(`[Checkout] Found product ${productId} with availableQuantity:`, product.availableQuantity);
      return product.availableQuantity;
    }
    // Fallback to computed value if product not found or quantity not set
    console.log(`[Checkout] Product ${productId} not found in backend, using computed quantity`);
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 16) + 5; // Consistent quantity between 5-20
  };

  // Helper function to create product slug
  const createProductSlug = (name: string, sku: string) => {
    const spacesRegex = new RegExp('\\s+', 'g');
    return name.toLowerCase().replace(spacesRegex, '-') + '_' + sku;
  };

  // Helper function to clean price string
  const cleanPriceString = (price: string) => {
    const commaRegex = new RegExp(',', 'g');
    return price.replace(commaRegex, '');
  };

  const { calculatePrice, hasDiscount, isAuthenticated } = useMembershipPricing();

  const originalSubtotal = items.reduce((sum, item) => {
    const cleanPrice = cleanPriceString(item.price);
    return sum + (parseFloat(cleanPrice) * item.quantity);
  }, 0);

  const discountedSubtotal = items.reduce((sum, item) => {
    const effective = (isAuthenticated() && hasDiscount())
      ? calculatePrice(item.price).discountedPrice
      : parseFloat(cleanPriceString(item.price));
    return sum + (effective * item.quantity);
  }, 0);

  const membershipDiscount = Math.max(0, originalSubtotal - discountedSubtotal);
  const subtotal = discountedSubtotal;

  // Calculate GST breakdown
  const gstBreakdown = calculateGSTBreakdown(subtotal);
  const { baseAmount, gstAmount } = gstBreakdown;

  // Calculate max redeemable coins (tier-based % of base amount)
  const maxRedeemableCoins = getMaxRedeemableCoins(subtotal);

  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentOutcome, setPaymentOutcome] = useState<{
    status: "success" | "failed" | "abandoned" | null;
    data?: PaymentResponse;
    error?: any;
  }>({ status: null });
  const [paymentFailureMessage, setPaymentFailureMessage] = useState('');
  const [showPaymentFailure, setShowPaymentFailure] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const selectedAddress = addresses.find(a => String(a.id) === selectedAddressId) || null;

  const handleCheckout = () => {
    if (!user && !externalUser) {
      setShowLoginDialog(true);
      return;
    }
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    setShowSummary(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
  };

  const maxRedemptionValue = getMaxRedemptionValue(subtotal);

  // Calculate theoretical maximum based on 5% rule only (not limited by user balance)
  const tierKey = getTierKey();
  const isMembershipEligible = tierKey !== 'none';

  const theoreticalMaxCoins = Math.floor(maxRedemptionValue / exchangeRateINR);

  // Check if user has enough coins and meets minimum requirement
  const canRedeemAngelCoins = !angelCoinsLoading && angelCoins >= minAngelCoinsRequired;

  // For slider maximum, use theoretical max but ensure user has enough coins
  const actualMaxRedeemableCoins = canRedeemAngelCoins ?
    Math.min(theoreticalMaxCoins, angelCoins) : 0;

  // Calculate Angel Coins discount (applied to base amount)
  const angelCoinsDiscount = calculateRedemptionValue(angelCoinsToRedeem[0]);

  // Calculate final amounts
  const discountedBaseAmount = Math.max(0, baseAmount - discount - angelCoinsDiscount);
  const finalGstAmount = discountedBaseAmount * 0.18;
  const total = discountedBaseAmount + finalGstAmount;

  // Fetch shop settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await shopSettingsApi.getSettings();
        setShopSettings(settings);
      } catch (error) {
        console.error('Failed to fetch shop settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Persist full order details including pricing and addresses (debounced)
  useEffect(() => {
    if (!apiUserId || items.length === 0) return;

    const t = setTimeout(async () => {
      try {
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

        // Get selected address
        const selectedAddr = addresses.find(a => a.id === selectedAddressId);

        const meta = {
          discount: membershipDiscount + discount,
          angelCoinsUsed: angelCoinsToRedeem[0] || 0,
          angelCoinsDiscount,
          gst: finalGstAmount,
          shipping: 0,
          shippingAddress: selectedAddr ? {
            type: selectedAddr.type,
            name: selectedAddr.name,
            address1: selectedAddr.address1,
            address2: selectedAddr.address2 || '',
            nearby: selectedAddr.nearby || '',
            city: selectedAddr.city,
            state: selectedAddr.state,
            zipCode: selectedAddr.zipCode,
            country: selectedAddr.country,
          } : undefined,
          billingAddress: selectedAddr ? {
            type: selectedAddr.type,
            name: selectedAddr.name,
            address1: selectedAddr.address1,
            address2: selectedAddr.address2 || '',
            nearby: selectedAddr.nearby || '',
            city: selectedAddr.city,
            state: selectedAddr.state,
            zipCode: selectedAddr.zipCode,
            country: selectedAddr.country,
          } : undefined,
        };

        console.log('[Checkout] Saving order with gstInvoiceEnabled:', gstInvoiceEnabled, 'Type:', typeof gstInvoiceEnabled);
        const savedOrder = await orderService.saveInCart(apiUserId, payload, subtotal, total, meta, userName, userEmail, gstInvoiceEnabled);
        // Update order IDs after saving
        console.log('Saved order:', savedOrder);
        if (savedOrder) {
          console.log('Setting order IDs:', savedOrder.orderId, savedOrder.id);
          setCurrentOrderId(savedOrder.orderId || '');
          setCurrentOrderDbId(savedOrder.id || '');
        }
      } catch (e) {
        console.error('Failed to persist order details', e);
      }
    }, 800);

    return () => clearTimeout(t);
  }, [apiUserId, items, userName, userEmail, angelCoinsToRedeem, discount, selectedAddressId, addresses, subtotal, total, membershipDiscount, angelCoinsDiscount, finalGstAmount, gstInvoiceEnabled]);

  // Load Angel Coins selection from localStorage on component mount
  // Only load from localStorage if we haven't loaded from backend
  useEffect(() => {
    if (hasLoadedAngelCoinsFromBackend) {
      console.log('Already loaded Angel Coins from backend, skipping localStorage load');
      return;
    }

    if (true) {
      const extId = localStorage.getItem('AOE_userId');
      const userId = extId || user?.id || user?.email || 'default';
      const storageKey = `angelCoinsRedemption_${userId}`;
      const savedRedemption = localStorage.getItem(storageKey);

      if (savedRedemption) {
        const savedValue = parseInt(savedRedemption, 10);
        if (!isNaN(savedValue) && savedValue >= 0) {
          console.log('Loading Angel Coins from localStorage:', savedValue);
          setAngelCoinsToRedeem([savedValue]);
        }
      }
    }
  }, [user, hasLoadedAngelCoinsFromBackend]);

  // Save Angel Coins selection to localStorage whenever it changes
  useEffect(() => {
    if (angelCoinsToRedeem[0] !== undefined) {
      const extId = localStorage.getItem('AOE_userId');
      const userId = extId || user?.id || user?.email || 'default';
      const storageKey = `angelCoinsRedemption_${userId}`;
      localStorage.setItem(storageKey, angelCoinsToRedeem[0].toString());
    }
  }, [user, angelCoinsToRedeem]);

  // Auto-adjust Angel Coins when cart value changes
  useEffect(() => {
    // Don't auto-adjust if Angel Coins are still loading or if we just loaded from backend
    if (angelCoinsLoading) {
      console.log('[Auto-adjust] Skipping - Angel Coins still loading');
      return;
    }

    // Don't auto-adjust immediately after loading from backend
    // Give it time to stabilize
    if (hasLoadedAngelCoinsFromBackend && angelCoinsToRedeem[0] > 0) {
      console.log('[Auto-adjust] Skipping - Just loaded from backend');
      return;
    }

    const currentMaxRedemptionValue = getMaxRedemptionValue(subtotal);
    const currentTheoreticalMaxCoins = Math.floor(currentMaxRedemptionValue / exchangeRateINR);
    const currentMaxRedeemableCoins = Math.min(currentTheoreticalMaxCoins, angelCoins);
    const currentRedemption = angelCoinsToRedeem[0];

    // If current redemption exceeds new maximum, adjust it down
    if (currentRedemption > currentMaxRedeemableCoins) {
      console.log('[Auto-adjust] Adjusting Angel Coins from', currentRedemption, 'to', currentMaxRedeemableCoins);
      setAngelCoinsToRedeem([currentMaxRedeemableCoins]);
    }
  }, [subtotal, getMaxRedemptionValue, exchangeRateINR, angelCoins, angelCoinsToRedeem, angelCoinsLoading, hasLoadedAngelCoinsFromBackend]);

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "welcome10") {
      setDiscount(subtotal * 0.1);
    } else if (couponCode.toLowerCase() === "angel20") {
      setDiscount(subtotal * 0.2);
    }
  };


  // Fetch related products from backend API
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Get all products from backend
        const apiProducts = await productApi.list();

        // Filter out products that are already in the cart
        const cartProductIds = items.map(item => item.id);
        const filteredProducts = apiProducts
          .filter(p => {
            const productId = p.id || p._id;
            return !cartProductIds.includes(productId as string);
          })
          .slice(0, 20); // Limit to 20 products

        console.log('[Checkout] Loaded related products from backend:', filteredProducts.length);
        console.log('[Checkout] First related product availableQuantity:', filteredProducts[0]?.availableQuantity);

        // Convert to Product format expected by the UI
        const convertedProducts = filteredProducts.map(p => ({
          product_id: (p.id || p._id) as string,
          name: p.name,
          description: p.description,
          price: p.price,
          original_price: p.originalPrice,
          rating: p.rating ?? 5,
          sku: p.sku,
          images: p.images?.map(img => ({
            url: img.url,
            alt_text: img.altText,
            is_primary: img.isPrimary,
            sort_order: img.sortOrder
          })) || [{ url: p.image, is_primary: true }],
          available_quantity: p.availableQuantity, // Include available quantity from backend
        }));

        setRelatedProducts(convertedProducts as any);
      } catch (err) {
        console.error('Error fetching related products from backend:', err);
        // Fallback to local products data on error
        const { PRODUCTS } = await import('@/data/products');
        const cartProductIds = items.map(item => item.id);
        const fallbackProducts = PRODUCTS
          .filter(product => !cartProductIds.includes(product.id))
          .slice(0, 20)
          .map(product => ({
            product_id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            original_price: product.originalPrice,
            rating: product.rating,
            sku: product.sku,
            images: [{ url: product.image, is_primary: true }],
            available_quantity: product.availableQuantity, // Include from fallback too
          }));
        setRelatedProducts(fallbackProducts as any);
      }
    };

    fetchRelatedProducts();
  }, [items]); // Re-fetch when cart items change

  // Check height comparison between Order Items and Order Summary
  useEffect(() => {
    const checkHeights = () => {
      const orderItemsElement = document.querySelector('[data-order-items]');
      const orderSummaryElement = document.querySelector('[data-order-summary]');

      if (orderItemsElement && orderSummaryElement) {
        const orderItemsHeight = orderItemsElement.clientHeight;
        const orderSummaryHeight = orderSummaryElement.clientHeight;

        // For mobile/tablet: Show as card if Order Items height is less than Order Summary height
        // For desktop: Always show as slider (full-width layout)
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        setShowAsCard(isMobile && orderItemsHeight < orderSummaryHeight);
      }
    };

    // Check heights after component mounts and when items change
    const timer = setTimeout(checkHeights, 100);
    return () => clearTimeout(timer);
  }, [items]);

  // Navigation functions for related products - Updated for more products
  const nextRelatedProducts = () => {
    // Show more products: 6 on desktop, 4 on tablet, 2 on mobile
    const visibleProducts = window.innerWidth >= 1024 ? 6 : window.innerWidth >= 768 ? 4 : 2;
    const maxStartIndex = Math.max(0, relatedProducts.length - visibleProducts);
    setRelatedProductsStartIndex((prev) => Math.min(prev + 1, maxStartIndex));
  };

  const prevRelatedProducts = () => {
    setRelatedProductsStartIndex((prev) => Math.max(prev - 1, 0));
  };

  // Initialize Razorpay script on mount
  useEffect(() => {
    ensureRazorpayScript();
  }, []);

  // Manage focus and z-index when payment modal opens
  useEffect(() => {
    if (showPayment) {
      // Ensure the modal is focused and on top
      setTimeout(() => {
        const dialogContent = document.querySelector('[role="dialog"]');
        if (dialogContent) {
          (dialogContent as HTMLElement).focus();
        }
      }, 100);
    }
  }, [showPayment]);

  // Handle payment initiation
  const handlePaymentClick = async () => {
    try {
      setIsProcessingPayment(true);

      // Validate required fields
      if (!userName || !userEmail || !userMobileWithoutCountryCode || !currentOrderId) {
        console.log("[Checkout] Missing payment fields:", {
          name: userName,
          email: userEmail,
          phone: userMobileWithoutCountryCode,
          orderId: currentOrderId,
        });
        alert("Please ensure all payment details are available");
        setIsProcessingPayment(false);
        return;
      }

      // Create payment config with phone number without country code
      const paymentConfig: PaymentConfig = {
        amount: Math.round(total * 100) / 100, // Ensure 2 decimal places
        name: userName,
        email: userEmail,
        phone: userMobileWithoutCountryCode, // Send only the phone number without country code
        clientOrderId: currentOrderId,
      };

      console.log("[Checkout] Initiating payment with config:", paymentConfig);

      // Create session with backend
      const sessionData = await createPaymentSession(paymentConfig);

      if (!sessionData.ok) {
        console.error("[Checkout] Failed to create payment session:", sessionData);
        alert("Failed to initialize payment. Please try again.");
        setIsProcessingPayment(false);
        return;
      }

      console.log("[Checkout] Payment session created:", sessionData);

      // Open Razorpay checkout
      openRazorpayCheckout(
        sessionData,
        paymentConfig,
        // On success
        (response: PaymentResponse) => {
          console.log("[Checkout] Payment successful:", response);
          setPaymentOutcome({
            status: "success",
            data: response,
          });
          setShowPayment(false);
          setIsProcessingPayment(false);
        },
        // On failed
        (error: any) => {
          console.log("[Checkout] Payment failed:", error);
          const errorMsg =
            error?.description || error?.reason || "Payment failed";
          setPaymentFailureMessage(errorMsg);
          setShowPaymentFailure(true);
          setPaymentOutcome({
            status: "failed",
            error,
          });
          setShowPayment(false);
          setIsProcessingPayment(false);
        },
        // On dismiss
        () => {
          console.log("[Checkout] Payment dismissed");
          setPaymentOutcome({
            status: "abandoned",
          });
          setShowPayment(false);
          setIsProcessingPayment(false);
        }
      );
    } catch (error) {
      console.error("[Checkout] Payment error:", error);
      alert("An error occurred during payment. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  // If payment was successful, show thank you page
  if (paymentOutcome.status === "success" && paymentOutcome.data) {
    return (
      <PaymentThankYou
        name={userName}
        amount={total}
        clientOrderId={currentOrderId}
        paymentId={paymentOutcome.data.razorpay_payment_id}
        onViewOrder={() => {
          // Navigate to order details page
          navigate(`/order/${currentOrderId}`);
        }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-angelic-cream/30 to-white/50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-playfair text-2xl text-angelic-deep mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate("/")} variant="angelic">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-angelic-cream/30 to-white/50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Button>
          {/* Admin-only Membership Override for testing */}
          {userRole === 'admin' && (
            <div className="flex items-center gap-2">
              <Select
                onValueChange={(v) => {
                  if (v === 'no-override') {
                    localStorage.removeItem('AOE_admin_membership_override');
                  } else {
                    localStorage.setItem('AOE_admin_membership_override', v);
                  }
                  // Force recalculation by triggering state change
                  setAngelCoinsToRedeem((prev) => [...prev]);
                }}
                defaultValue={localStorage.getItem('AOE_admin_membership_override') || ''}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Test as Membership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-override">No Override</SelectItem>
                  <SelectItem value="gold">Gold Membership</SelectItem>
                  <SelectItem value="platinum">Platinum Membership</SelectItem>
                  <SelectItem value="diamond">Diamond Membership</SelectItem>
                  <SelectItem value="none">No Membership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

            <div className="flex-1">
              <h1 className="font-playfair text-3xl text-angelic-deep">Checkout</h1>
              {currentOrderId ? (
                <p className="text-sm text-gray-600 mt-1">Order ID: <span className="font-semibold text-primary">{currentOrderId}</span></p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Order ID will appear after saving...</p>
              )}
            </div>
            {/* Cancel Order button - hidden for now */}
            {false && currentOrderDbId && items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!confirm('Are you sure you want to cancel this order? This will mark it as abandoned.')) return;
                  try {
                    await orderService.updateStatus(currentOrderDbId, 'abandoned');
                    clearCart();
                    setCurrentOrderId('');
                    setCurrentOrderDbId('');
                    alert('Order cancelled successfully');
                    navigate('/');
                  } catch (e) {
                    console.error('Failed to cancel order', e);
                    alert('Failed to cancel order');
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Cancel Order
              </Button>
            )}
          </div>

          {/* User Block: Membership badge, profile pic/name, profile icon */}
          {(user || externalUser) && (
            <div className="flex items-center gap-3">
              {/* Membership Badge for external users */}
              {(externalUser || userRole === 'admin') && <MembershipBadge size="sm" />}

              {/* Profile picture from external auth if available */}
              {externalUser?.pic && (
                <img
                  src={externalUser.pic}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              {/* Name */}
              <span className="text-sm text-angelic-deep font-medium hidden sm:inline">
                {userName}
              </span>

              {/* Profile button */}
              <Button
                variant="ghost"
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 text-angelic-deep hover:text-primary"
                title="My Profile"
              >
                <UserCircle className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Items & Customers Also Bought */}
          <div className="space-y-6" data-order-items>
            <Card className="p-6">
              <h2 className="font-playfair text-xl text-angelic-deep mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-angelic-cream/20 rounded-lg">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                      <h4 className="font-medium text-angelic-deep">{item.name}</h4>
                      <p className="text-primary font-semibold">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const availableQuantity = getAvailableQuantity(item.id);
                          const maxSelectQuantity = 15;
                          const maxAllowed = Math.min(availableQuantity, maxSelectQuantity);

                          if (item.quantity >= maxAllowed) {
                            alert(`Maximum quantity allowed: ${maxAllowed} (Available: ${availableQuantity})`);
                            return;
                          }
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                        className="w-8 h-8 p-0"
                        disabled={item.quantity >= Math.min(getAvailableQuantity(item.id), 15)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Customers Also Bought - Show under Order Items when cart has 1-6 items */}
            {relatedProducts.length > 0 && items.length < 7 && (
              <Card className="p-6">
                <h3 className="font-playfair font-bold text-xl text-angelic-deep mb-6">
                  Customers Also Bought
                </h3>
                <div className="space-y-4">
                  {relatedProducts.slice(0, 7 - items.length).map((relatedProduct) => { // Show (7 - cart items) products
                    const relatedProductId = relatedProduct.product_id;
                    const relatedProductSlug = createProductSlug(relatedProduct.name, relatedProduct.sku);

                    // Fix image URL with multiple fallbacks
                    let relatedImageUrl = '/placeholder.svg'; // Default fallback

                    if (relatedProduct.images && Array.isArray(relatedProduct.images) && relatedProduct.images.length > 0) {
                      try {
                        relatedImageUrl = productHelpers.getPrimaryImageUrl(relatedProduct.images);
                      } catch (error) {
                        console.error('Error getting primary image URL:', error);
                        relatedImageUrl = '/placeholder.svg';
                      }
                    }

                    return (
                      <div key={relatedProductId} className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-300">
                        {/* Product Image */}
                        <Link to={`/product/${relatedProductSlug}`} className="flex-shrink-0">
                          <img
                            src={relatedImageUrl}
                            alt={relatedProduct.name}
                            className="w-16 h-16 object-cover rounded-md transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              console.error('Image failed to load:', e.currentTarget.src);
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(relatedProduct.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-angelic-gold text-angelic-gold" />
                            ))}
                          </div>

                          {/* Product Name */}
                          <Link to={`/product/${relatedProductSlug}`}>
                            <h4 className="font-playfair font-semibold text-base text-angelic-deep hover:text-primary transition-colors line-clamp-1 mb-1">
                              {relatedProduct.name}
                            </h4>
                          </Link>

                          {/* Description */}
                          <p className="text-sm text-angelic-deep/70 line-clamp-2 mb-2">
                            {relatedProduct.description?.slice(0, 80)}...
                          </p>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-bold text-primary text-lg">₹{relatedProduct.price}</span>
                            {relatedProduct.original_price && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{relatedProduct.original_price}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add Button */}
                        <div className="flex-shrink-0">
                          <Button
                            variant="default"
                            size="sm"
                            className="px-4 py-2"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addItem({
                                id: relatedProductId,
                                name: relatedProduct.name,
                                price: relatedProduct.price,
                                image: relatedImageUrl
                              }, 1);
                            }}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    );
                  })}


                </div>
              </Card>

            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6" data-order-summary>
            {/* Customer Information - Hidden as per user request */}
            {false && (user || externalUser) && (
              <Card className="p-6">
                <h2 className="font-playfair text-xl text-angelic-deep mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <span className="text-sm text-gray-800">{userName}</span>
                  </div>
                  {userEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-sm text-gray-800">{userEmail}</span>
                    </div>
                  )}
                  {userMobile && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Mobile:</span>
                      <span className="text-sm text-gray-800">{userMobile}</span>
                    </div>
                  )}
                  {userAlternativeMobile && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Alternative Mobile:</span>
                      <span className="text-sm text-gray-800">{userAlternativeMobile}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Membership Type:</span>
                    <span className="text-sm text-gray-800 font-semibold text-primary">{userMembershipType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Account Type:</span>
                    <span className="text-sm text-gray-800 capitalize">
                      {userRole === 'admin' ? 'Administrator' : userRole === 'team' ? 'Team Member' : 'Customer'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Angel Coins:</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {angelCoinsLoading ? '...' : angelCoins.toLocaleString()} coins
                    </span>
                  </div>

                </div>
              </Card>
            )}


	            {/* Delivery Address */}
	            <Card className="p-6">
	              <h2 className="font-playfair text-xl text-angelic-deep mb-4">Delivery Details</h2>
	              <div className="space-y-2">
	                <Label className="flex items-center gap-2 text-angelic-deep">
	                  <MapPin className="w-4 h-4" />
	                  <span>Select Delivery Address</span>
	                </Label>
	                <div className="flex items-center gap-2">
	                  <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
	                    <SelectTrigger className="w-full truncate whitespace-nowrap overflow-hidden text-ellipsis">
	                      <SelectValue placeholder={addresses.length ? 'Choose saved address' : 'No saved addresses'} />
	                    </SelectTrigger>
	                    <SelectContent>
	                      {addresses.map((addr) => (
	                        <SelectItem key={addr.id} value={String(addr.id)}>
	                          <div className="flex items-center gap-2">
	                            <MapPin className="w-4 h-4" />
	                            <span>{addr.type} - {addr.address1}, {addr.city}</span>
	                          </div>
	                        </SelectItem>
	                      ))}
	                    </SelectContent>
	                  </Select>
	                  <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
	                    <DialogTrigger asChild>
	                      <Button variant="outline">Add New</Button>
	                    </DialogTrigger>
	                    <DialogContent className="max-w-2xl">
	                      <DialogHeader>
	                        <DialogTitle>Add New Address</DialogTitle>
	                      </DialogHeader>
	                      <AddressForm
	                        address={newAddress}
	                        onAddressChange={setNewAddress}
	                        onSave={handleSaveNewAddress}
	                        onCancel={() => setIsAddingAddress(false)}
                      />

	                    </DialogContent>

            {/* Company Details Dialog (add/edit) */}
            <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{companyDetails ? 'Edit Company Details' : 'Add Company Details'}</DialogTitle>
                </DialogHeader>
                <CompanyDetailsForm
                  initial={companyDetails}
                  confirmText={companyDetails ? 'Save' : 'Confirm'}
                  onConfirm={async (d) => {
                    if (!apiUserId) return;
                    try {
                      const saved = await userProfileService.upsertCompanyDetails(apiUserId, d);
                      setCompanyDetails(saved);
                      setShowCompanyDialog(false);
                    } catch (e) {
                      console.error('Failed to save company details', e);
                    }
                  }}
                  onCancel={() => setShowCompanyDialog(false)}
                />
              </DialogContent>
            </Dialog>

	                  </Dialog>
	                </div>
	                {selectedAddressId && (
	                  <div className="text-xs text-angelic-deep/70">
	                    {(() => {
	                      const addr = addresses.find((a) => String(a.id) === selectedAddressId);
	                      return addr ? `${addr.name}, ${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city}, ${addr.state}, ${addr.country} - ${addr.zipCode}` : '';
	                    })()}
	                  </div>
	                )}

                        <div className="text-xs text-angelic-deep/70">Mobile: {userMobile || 'Not provided'}</div>



	              </div>
	            </Card>

            {/* Loyalty Tier - Separate section after Delivery Details */}
            {tierKey !== 'none' && shopSettings?.angelCoinsCashbackCapEnabled && (
              <Card className="p-6">
                <h2 className="font-playfair text-xl text-angelic-deep mb-4">Loyalty Tier</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Your Tier:</span>
                    <div className="flex items-center gap-2">
                      {tierKey === 'gold' && (
                        <>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-sm font-bold text-yellow-600">Gold</span>
                        </>
                      )}
                      {tierKey === 'platinum' && (
                        <>
                          <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                          <span className="text-sm font-bold text-slate-600">Platinum</span>
                        </>
                      )}
                      {tierKey === 'diamond' && (
                        <>
                          <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                          <span className="text-sm font-bold text-cyan-600">Diamond</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Angel Coins Earned:</span>
                      <span className="font-semibold text-purple-700">
                        {(() => {
                          // Get earn rate from shop settings
                          const earnPercent = shopSettings?.angelCoinsEarnRateByTier?.[tierKey as 'gold' | 'platinum' | 'diamond'] || 0;
                          const orderAmount = discountedBaseAmount;
                          const coinsCap = shopSettings?.angelCoinsCashbackCapAmount || 1500;
                          return `${earnPercent}% of ₹${orderAmount.toFixed(2)} (Max Coins ${coinsCap.toLocaleString()})`;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-600">You'll earn:</span>
                      <span className="font-semibold text-purple-700">
                        {(() => {
                          // Get earn rate from shop settings
                          const earnPercent = shopSettings?.angelCoinsEarnRateByTier?.[tierKey as 'gold' | 'platinum' | 'diamond'] || 0;

                          // Calculate on DISCOUNTED BASE AMOUNT (after Angel Coins redemption)
                          // This is the actual amount customer pays (excluding GST)
                          const orderAmount = discountedBaseAmount;

                          // Calculate Angel Coins earned (percentage of order amount)
                          // Coins are earned directly as percentage, not converted via exchange rate
                          let coinsEarned = (orderAmount * earnPercent) / 100;

                          // Round off the coins
                          coinsEarned = Math.round(coinsEarned);

                          // Get cap from shop settings
                          const coinsCap = shopSettings?.angelCoinsCashbackCapAmount || 1500;
                          const isCapped = coinsEarned > coinsCap;
                          if (isCapped) {
                            coinsEarned = coinsCap;
                          }

                          return `${coinsEarned.toLocaleString()} coins${isCapped ? ' (max limit)' : ''}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* GST Invoice - standalone section */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-playfair text-xl text-angelic-deep">GST Invoice</h2>
                <div className="flex items-center gap-3">
                  {companyDetails?.gstNo && (
                    <button className="text-sm underline" onClick={() => setShowCompanyDialog(true)}>Edit</button>
                  )}
                  <Checkbox checked={gstInvoiceEnabled} onCheckedChange={(v) => setGstInvoiceEnabled(!!v)} disabled={!companyDetails?.gstNo} />
                </div>
              </div>
              <div className="mt-3 text-sm">
                {companyDetails?.gstNo ? (
                  <>
                    <p>{gstInvoiceEnabled ? "GST invoice enabled for this order." : "Enable GST invoice for this order."}</p>
                    <p className="text-xs text-gray-600">GSTIN: {companyDetails.gstNo}</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <button className="underline" onClick={() => setShowCompanyDialog(true)}>Add GSTIN</button>
                      <span className="ml-2 text-gray-600">Claim GST input up to 18%</span>
                    </div>

                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-playfair text-xl text-angelic-deep mb-4">Order Summary</h2>

              {/* Coupon Code - Only show if enabled by admin */}


              {showCouponSection && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label className="flex items-center gap-2 text-angelic-deep">
                      <Gift className="w-4 h-4" />
                      Coupon Code
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={applyCoupon} variant="outline">
                        Apply
                      </Button>
                    </div>
                    <p className="text-xs text-angelic-deep/60">Try: WELCOME10 or ANGEL20</p>
                  </div>
                  <Separator className="my-4" />
                </>
              )}

              {/* Angel Points Redemption - Only show if enabled by admin */}
              {showAngelCoinsSection && (
                <>
                  {!canRedeemAngelCoins && (
                    <div className="space-y-2 mb-4">
                      <Label className="flex items-center gap-2 text-angelic-deep">
                        <Coins className="w-4 h-4" />
                        Angel Coins Redemption

                      </Label>
                      {!isMembershipEligible ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800 font-semibold">
                            This facility is only available for Gold, Platinum and Diamond Members.
                          </p>
                          <p className="text-xs text-red-700 mt-1">
                            Kindly upgrade membership to avail this benefit.
                          </p>
                          <p className="text-xs text-red-700 mt-2 underline cursor-pointer" onClick={() => window.open('/faq', '_self')}>
                            For more info click here
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Minimum {minAngelCoinsRequired.toLocaleString()} Angel Coins required for redemption.</strong>
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            You currently have {angelCoinsLoading ? '...' : angelCoins.toLocaleString()} Angel Coins.
                            Keep shopping to earn more Angel Coins!
                          </p>
                          <p className="text-xs text-yellow-700 mt-2">
                            <strong>Note:</strong> Angel Coins redemption limit depends on your membership tier.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {canRedeemAngelCoins && (
                <div className="space-y-4 mb-4">
                  <Label className="flex items-center gap-2 text-angelic-deep">
                    <Coins className="w-4 h-4" />
                    Redeem Angel Coins
                  </Label>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Available Angel Coins:</span>
                      <span className="font-medium">
                        {angelCoinsLoading ? '...' : angelCoins.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Redeem:</span>
                          <span className="font-medium">
                            {angelCoinsToRedeem[0].toLocaleString()} coins (₹{angelCoinsDiscount.toFixed(2)})
                          </span>
                        </div>
                        <Slider
                          value={angelCoinsToRedeem}
                          onValueChange={setAngelCoinsToRedeem}
                          max={actualMaxRedeemableCoins}
                          min={0}
                          step={100}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-angelic-deep/60">
                          <span>0</span>
                          <span>Max: {actualMaxRedeemableCoins.toLocaleString()} coins</span>
                        </div>
                      </div>
                      <div className="text-xs text-angelic-deep/60 space-y-1">
                        <p>1 Angel Coin = ₹{exchangeRateINR.toFixed(2)}</p>
                        <p>Max based on your Membership ({(getTierKey() === 'gold' ? '5%' : getTierKey() === 'platinum' ? '10%' : getTierKey() === 'diamond' ? '20%' : '0%')} of ₹{baseAmount.toFixed(2)}) = ₹{maxRedemptionValue.toFixed(2)}</p>
                        <p>Max redeemable: {theoreticalMaxCoins.toLocaleString()} coins</p>
                      </div>
                    </div>
                  </div>
                </div>
                  )}
                </>
              )}

              <Separator className="my-4" />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Amount</span>
                  <span>₹{baseAmount.toFixed(2)}</span>
                </div>
                {membershipDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Membership Discount</span>
                    <span>-₹{membershipDiscount.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {angelCoinsDiscount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Angel Coins ({angelCoinsToRedeem[0]} redeemed, {(getTierKey() === 'gold' ? '5' : getTierKey() === 'platinum' ? '10' : getTierKey() === 'diamond' ? '20' : '0')}%)</span>
                    <span>-₹{angelCoinsDiscount.toFixed(2)}</span>
                  </div>
                )}
                {angelCoinsDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Discounted Amount</span>
                    <span>₹{discountedBaseAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{finalGstAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Actions */}
              <div className="space-y-3 pt-6">
                <Button
                  onClick={handleCheckout}
                  disabled={!selectedAddress}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Order
                </Button>
                <Button
                  onClick={async () => {
                    if (!confirm('Are you sure you want to clear your cart? This will remove all items and delete the order.')) return;
                    try {
                      // Delete the backend order if it exists
                      if (apiUserId) {
                        await orderService.deleteInCartOrder(apiUserId);
                        console.log('[Checkout] Deleted in-cart order from backend');
                      }
                      // Clear the local cart
                      clearCart();
                      // Clear order IDs
                      setCurrentOrderId('');
                      setCurrentOrderDbId('');
                      console.log('[Checkout] Cart cleared successfully');
                    } catch (e) {
                      console.error('[Checkout] Failed to clear cart:', e);
                      // Still clear the local cart even if backend deletion fails
                      clearCart();
                      setCurrentOrderId('');
                      setCurrentOrderDbId('');
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Cart
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Customers Also Bought - Show at bottom when cart has 7+ items */}
        {relatedProducts.length > 0 && items.length >= 7 && (
          <div className="mt-16">
            <h2 className="font-playfair font-bold text-2xl text-angelic-deep mb-8 text-center">
              Customers Also Bought
            </h2>
            <div className="w-full">
              <div className="overflow-x-auto scroll-smooth">
                <div className="flex gap-4 pb-4 px-2 sm:px-4" style={{ width: 'max-content' }}>
                  {relatedProducts.slice(0, 12).map((relatedProduct) => { // Show up to 12 products in horizontal scroll
                    const relatedProductId = relatedProduct.product_id;
                    const relatedProductSlug = createProductSlug(relatedProduct.name, relatedProduct.sku);
                    // Fix image URL with multiple fallbacks
                    let relatedImageUrl = '/placeholder.svg'; // Default fallback

                    if (relatedProduct.images && Array.isArray(relatedProduct.images) && relatedProduct.images.length > 0) {
                      try {
                        relatedImageUrl = productHelpers.getPrimaryImageUrl(relatedProduct.images);
                      } catch (error) {
                        console.error('Error getting primary image URL:', error);
                        relatedImageUrl = '/placeholder.svg';
                      }
                    }

                    return (
                      <div key={relatedProductId} className="w-64 sm:w-72 md:w-80 lg:w-72 xl:w-80 flex-shrink-0">
                        <Card className="related-product-card overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                          <Link to={`/product/${relatedProductSlug}`}>
                            <div className="relative group/image">
                              <img
                                src={relatedImageUrl}
                                alt={relatedProduct.name}
                                className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover/image:scale-105"
                                onError={(e) => {
                                  console.error('Image failed to load:', e.currentTarget.src);
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                          </Link>
                          <div className="related-product-content p-5">
                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(relatedProduct.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-angelic-gold text-angelic-gold" />
                              ))}
                            </div>
                            <h3 className="font-playfair font-semibold text-xl text-angelic-deep mb-3 group-hover:text-primary transition-colors line-clamp-2">
                              {relatedProduct.name}
                            </h3>
                            <div className="related-product-description mb-4">
                              <p className="text-sm text-angelic-deep/70 mb-2 line-clamp-3 leading-relaxed">
                                {relatedProduct.description?.slice(0, 120) || 'Experience divine guidance and spiritual enlightenment with this premium product'}...
                              </p>
                              <div className="related-product-read-more">
                                <Link to={`/product/${relatedProductSlug}`} className="inline">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-primary hover:text-white hover:bg-primary hover:px-2 hover:py-0.5 hover:rounded-full text-sm transition-all duration-300 ease-in-out transform hover:scale-105"
                                  >
                                    Read More→
                                  </Button>
                                </Link>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="font-bold text-primary text-lg">₹{relatedProduct.price}</span>
                              {relatedProduct.original_price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ₹{relatedProduct.original_price}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                              {(() => {
                                const cartItem = items.find(item => item.id === relatedProductId);
                                const currentQuantity = cartItem?.quantity || 0;
                                const selectedQuantity = relatedProductQuantities[relatedProductId] || 1;
                                const availableQuantity = relatedProduct.available_quantity || 10;

                                const handleAddToCart = (e: React.MouseEvent) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  if (selectedQuantity > availableQuantity) {
                                    alert(`Can't select quantity more than available. Available: ${availableQuantity}`);
                                    return;
                                  }

                                  addItem({
                                    id: relatedProductId,
                                    name: relatedProduct.name,
                                    price: relatedProduct.price,
                                    image: relatedImageUrl
                                  }, selectedQuantity);
                                };

                                return (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-center gap-3">
                                      <label className="text-sm font-medium text-angelic-deep">Qty:</label>
                                      <Select
                                        value={(currentQuantity || selectedQuantity).toString()}
                                        onValueChange={(value) => setRelatedProductQuantities(prev => ({
                                          ...prev,
                                          [relatedProductId]: parseInt(value)
                                        }))}
                                      >
                                        <SelectTrigger className="w-20 h-10">
                                          <SelectValue placeholder="1" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                                            <SelectItem
                                              key={num}
                                              value={num.toString()}
                                              disabled={num > availableQuantity}
                                              className={num > availableQuantity ? "text-gray-400" : ""}
                                            >
                                              {num} {num > availableQuantity ? "(Out of stock)" : ""}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <Button
                                      variant="default"
                                      size="default"
                                      className="w-full py-3 font-medium text-sm"
                                      onClick={handleAddToCart}
                                    >
                                      <ShoppingCart className="w-4 h-4 mr-2" />
                                      Add to Cart {currentQuantity > 0 && `(${currentQuantity})`}
                                    </Button>

                                    <div className="text-center">
                                      <span className="text-sm text-angelic-deep/70">
                                        Available: <span className="font-semibold text-green-600">{availableQuantity}</span>
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>




      {/* Ensure we keep user on checkout after login */}

      {/* Order Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Delivery Details:</strong>
              <div>{selectedAddress ? `${selectedAddress.name}, ${selectedAddress.address1}${selectedAddress.address2 ? ', ' + selectedAddress.address2 : ''}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country} - ${selectedAddress.zipCode}` : 'N/A'}</div>
              <div>Mobile: {userMobile || 'Not provided'}</div>
            </div>
            {gstInvoiceEnabled && companyDetails?.gstNo && (
              <div className="pt-2">
                <strong>GST Details:</strong>
                <div className="text-xs text-angelic-deep/80">
                  {companyDetails?.companyName && <div>{companyDetails.companyName}</div>}
                  {companyDetails?.address && <div>{companyDetails.address}</div>}
                  <div>GSTIN: {companyDetails.gstNo}</div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <strong>Items:</strong>
              {(() => {
                const gridCols = { gridTemplateColumns: '64px 1fr 120px 120px' } as React.CSSProperties;
                return (
                  <>
                    <div className="grid text-xs font-medium text-angelic-deep/70 px-1" style={gridCols}>
                      <span>Qty</span>
                      <span>Product</span>
                      <span className="text-left">Price</span>
                      <span className="text-left">Amount</span>
                    </div>
                    <div className="divide-y">
                      {items.map((it) => {
                        // Normalize price; apply membership discount if active, like the subtotal calculation
                        const raw = typeof it.price === 'string' ? cleanPriceString(it.price) : String(it.price);
                        const baseUnit = parseFloat(raw);
                        const unit = (isAuthenticated() && hasDiscount())
                          ? calculatePrice(it.price).discountedPrice
                          : baseUnit;
                        const amt = unit * it.quantity;
                        return (
                          <div key={it.id} className="grid py-2 text-sm items-center px-1" style={gridCols}>
                            <span>{it.quantity}</span>
                            <span className="pr-2 truncate">{it.name}</span>
                            <span className="text-left">₹{unit.toFixed(2)}</span>
                            <span className="text-left">₹{amt.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
            {(() => {
              const gridCols = { gridTemplateColumns: '64px 1fr 120px 120px' } as React.CSSProperties;
              const Label = ({ children }: { children: React.ReactNode }) => (
                <span className="col-span-3">{children}</span>
              );
              const Value = ({ children, bold = false }: { children: React.ReactNode; bold?: boolean }) => (
                <span className={bold ? "col-span-1 font-semibold text-right tabular-nums" : "col-span-1 text-right tabular-nums"}>{children}</span>
              );
              return (
                <div className="space-y-1 mt-2">
                  <div className="grid items-center" style={gridCols}>
                    <Label>Base Amount</Label>
                    <Value>₹{baseAmount.toFixed(2)}</Value>
                  </div>
                  <div className="grid items-center" style={gridCols}>
                    <Label>Coupon Discount</Label>
                    <Value>-₹{discount.toFixed(2)}</Value>
                  </div>
                  <div className="grid items-center" style={gridCols}>
                    <Label>Angel Coins Redeemed ({angelCoinsToRedeem[0].toLocaleString()} coins)</Label>
                    <Value>-₹{angelCoinsDiscount.toFixed(2)}</Value>
                  </div>
                  <div className="grid items-center" style={gridCols}>
                    <Label>GST (18%)</Label>
                    <Value>₹{finalGstAmount.toFixed(2)}</Value>
                  </div>
                  <div className="grid items-center" style={gridCols}>
                    <Label><span className="font-semibold">Total</span></Label>
                    <Value bold>₹{total.toFixed(2)}</Value>
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowSummary(false)}>Back</Button>
            <Button className="ml-auto" onClick={() => { setShowSummary(false); setShowPayment(true); }}>Make Payment</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md z-[9999] pointer-events-auto cursor-auto">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-angelic-cream/30 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-angelic-deep/70">Order ID:</span>
                <span className="font-semibold text-angelic-deep">
                  {currentOrderId}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-angelic-deep/70">Amount:</span>
                <span className="font-semibold text-primary">
                  ₹{total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-angelic-deep/70">Name:</span>
                <span className="font-semibold text-angelic-deep">
                  {userName}
                </span>
              </div>
            </div>

            <p className="text-sm text-angelic-deep/70">
              Click the button below to proceed with payment via Razorpay.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPayment(false)}
                disabled={isProcessingPayment}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                className="ml-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold cursor-pointer"
                onClick={handlePaymentClick}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </div>

            {/* Dummy buttons for testing */}
            <div className="border-t pt-3 mt-3">
              <p className="text-xs text-angelic-deep/60 mb-2">Testing Options:</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-green-600 border-green-600 hover:bg-green-50 cursor-pointer"
                  onClick={() => {
                    console.log("[Checkout] Dummy: Mark Complete");
                    setPaymentOutcome({
                      status: "success",
                      data: {
                        razorpay_order_id: `order_${Date.now()}`,
                        razorpay_payment_id: `pay_${Date.now()}`,
                        razorpay_signature: `sig_${Date.now()}`,
                      },
                    });
                    setShowPayment(false);
                  }}
                >
                  ✓ Mark Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={() => {
                    console.log("[Checkout] Dummy: Mark Failed");
                    setPaymentFailureMessage("Test payment failure - Demo mode");
                    setShowPaymentFailure(true);
                    setPaymentOutcome({
                      status: "failed",
                      error: { description: "Test payment failure - Demo mode" },
                    });
                    setShowPayment(false);
                  }}
                >
                  ✗ Mark Failed
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Failure Modal */}
      <PaymentFailureModal
        isOpen={showPaymentFailure}
        errorMessage={paymentFailureMessage}
        onClose={() => {
          setShowPaymentFailure(false);
          setShowPayment(false);
        }}
      />

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Checkout;