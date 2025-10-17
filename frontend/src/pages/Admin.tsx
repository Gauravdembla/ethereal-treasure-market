import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Users, Package, Coins, Settings, LogOut, Menu, ShoppingCart, Plus, Edit, Trash2, Upload, Eye, BarChart3, Trophy, FileText, Calendar, MessageSquare, ChevronDown, ChevronRight, Contact, CreditCard, GraduationCap, Radio, Video, Database } from "lucide-react";
import { useSearchParams } from "react-router-dom";

// AngelThon Components
import FacilitatorsManagement from "@/components/angelthon/FacilitatorsManagement";
import AchievementsManagement from "@/components/angelthon/AchievementsManagement";
import ResourcesManagement from "@/components/angelthon/ResourcesManagement";
import TeamManagement from "@/components/angelthon/TeamManagement";
import SecuritySettings from "@/components/angelthon/SecuritySettings";
import EmailSettings from "@/components/angelthon/EmailSettings";
import RolesManagement from "@/components/angelthon/RolesManagement";
import LeaderboardManagement from "@/components/angelthon/LeaderboardManagement";
import CalendarManagement from "@/components/angelthon/CalendarManagement";

// Shop Management Components
import ProductsManagement from "@/components/shop/ProductsManagement";
import HeroSectionManagement from "@/components/shop/HeroSectionManagement";
import NavigationManagement from "@/components/shop/NavigationManagement";
import FooterManagement from "@/components/shop/FooterManagement";
import TestimonialsManagement from "@/components/shop/TestimonialsManagement";
import OrdersManagement from "@/components/shop/OrdersManagement";
import ShopSettingsManagement from "@/components/shop/ShopSettingsManagement";
import DatabaseMigration from "@/components/admin/DatabaseMigration";
import ReviewsManagement from "@/components/admin/ReviewsManagement";

import { PRODUCTS, type Product } from "@/data/products";
import { productApi, type ApiProduct } from "@/services/productApi";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";
import externalAuthService from "@/services/externalAuthService";
type AdminProduct = {
  id: string;
  sku: string;
  name: string;
  description: string;
  detailedDescription: string;
  price: string;
  priceValue: number;
  originalPrice?: string;
  originalPriceValue?: number;
  image: string;
  rating: number;
  benefits: string[];
  specifications: Record<string, string>;
  category: string;
  inStock: boolean;
  featured: boolean;
  availableQuantity: number;
  tags: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProductSeed = Product & { availableQuantity?: number };

type NewProductForm = {
  id?: string;
  sku: string;
  name: string;
  description: string;
  detailedDescription: string;
  price: string;
  originalPrice: string;
  category: string;
  tags: string;
  availableQuantity: string;
  specifications: Record<string, string>;
  image: string;
  rating: number;
  benefits: string[];
  featured: boolean;
  inStock: boolean;
};

const numberFormatter = new Intl.NumberFormat("en-IN");

const CATEGORY_LABELS: Record<string, string> = {
  "crystals": "Crystals",
  "oracle-cards": "Oracle Cards",
  "candles": "Candles",
  "journals": "Journals",
  "crystal-sets": "Crystal Sets",
};

const formatCategoryLabel = (category: string) => {
  if (!category) return "Uncategorized";
  if (CATEGORY_LABELS[category]) {
    return CATEGORY_LABELS[category];
  }

  return category
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const categoryToSlug = (category: string) =>
  category
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

const parseNumberFromString = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toTagString = (tags?: string[] | string) => {
  if (!tags) return "";
  if (Array.isArray(tags)) return tags.join(", ");
  return tags;
};

const splitTags = (tags: string) =>
  tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const computeSeedQuantity = (productId: string) => {
  if (!productId) return 0;
  const hash = productId.split("").reduce((acc, char) => {
    acc = (acc << 5) - acc + char.charCodeAt(0);
    return acc & acc;
  }, 0);
  return Math.abs(hash % 16) + 5;
};

const seedProductToAdmin = (product: ProductSeed): AdminProduct => {
  const priceValue = parseNumberFromString(product.price) ?? 0;
  const originalPriceValue = parseNumberFromString(product.originalPrice);
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    detailedDescription: product.detailedDescription || product.description,
    price: numberFormatter.format(priceValue),
    priceValue,
    originalPrice: originalPriceValue ? numberFormatter.format(originalPriceValue) : undefined,
    originalPriceValue: originalPriceValue ?? undefined,
    image: product.image,
    rating: product.rating ?? 5,
    benefits: product.benefits ?? [],
    specifications: product.specifications ?? {},
    category: formatCategoryLabel(product.category),
    inStock: product.inStock ?? ((product.availableQuantity ?? computeSeedQuantity(product.id)) > 0),
    featured: product.featured,
    availableQuantity: product.availableQuantity ?? computeSeedQuantity(product.id),
    tags: "",
  };
};

const apiProductToAdminProduct = (product: ApiProduct): AdminProduct => {
  const stableId = product.id || product._id || "";
  const originalPriceValue = product.originalPrice ?? undefined;
  return {
    id: stableId,
    sku: product.sku,
    name: product.name,
    description: product.description,
    detailedDescription: product.detailedDescription || product.description,
    price: numberFormatter.format(product.price ?? 0),
    priceValue: product.price ?? 0,
    originalPrice: originalPriceValue ? numberFormatter.format(originalPriceValue) : undefined,
    originalPriceValue,
    image: product.image,
    rating: product.rating ?? 5,
    benefits: product.benefits ?? [],
    specifications: product.specifications ?? {},
    category: formatCategoryLabel(product.category),
    inStock: product.inStock,
    featured: product.featured,
    availableQuantity: product.availableQuantity ?? 0,
    tags: toTagString(product.tags),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const SEED_ADMIN_PRODUCTS: AdminProduct[] = PRODUCTS.map(seedProductToAdmin);

const createEmptyFormState = (): NewProductForm => ({
  id: "",
  sku: "",
  name: "",
  description: "",
  detailedDescription: "",
  price: "",
  originalPrice: "",
  category: "",
  tags: "",
  availableQuantity: "",
  specifications: {},
  image: "",
  rating: 5,
  benefits: [],
  featured: false,
  inStock: true,
});

const productToFormState = (product: AdminProduct): NewProductForm => ({
  id: product.id,
  sku: product.sku,
  name: product.name,
  description: product.description,
  detailedDescription: product.detailedDescription,
  price: product.priceValue.toString(),
  originalPrice: product.originalPriceValue?.toString() ?? "",
  category: product.category,
  tags: product.tags,
  availableQuantity: product.availableQuantity.toString(),
  specifications: product.specifications || {},
  image: product.image,
  rating: product.rating ?? 5,
  benefits: product.benefits ?? [],
  featured: product.featured,
  inStock: product.inStock,
});

const formToApiPayload = (form: NewProductForm) => {
  const price = Number(form.price);
  if (Number.isNaN(price)) {
    throw new Error("Invalid price value");
  }

  const availableQuantity = parseInt(form.availableQuantity || "0", 10);
  const safeAvailableQuantity = Number.isNaN(availableQuantity) ? 0 : availableQuantity;

  const originalPrice = form.originalPrice ? Number(form.originalPrice) : undefined;

  return {
    sku: form.sku,
    name: form.name,
    description: form.description,
    detailedDescription: form.detailedDescription || form.description,
    price,
    originalPrice,
    image: form.image || "/assets/product-placeholder.jpg",
    rating: form.rating ?? 5,
    benefits: form.benefits,
    specifications: form.specifications,
    category: form.category ? categoryToSlug(form.category) : "",
    inStock: form.inStock,
    featured: form.featured,
    availableQuantity: safeAvailableQuantity,
    tags: splitTags(form.tags),
  };
};

const Admin = () => {
  const { user, isAuthenticated, loading, login, logout, initialize } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Get active section from URL params, default to dashboard
  const activeSection = searchParams.get('section') || 'dashboard';
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    angelthon: false,
    'angelthon-7': false,
    shop: false
  });

  // Initialize auth on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    let isActive = true;

    const loadProducts = async () => {
      setProductLoading(true);
      try {
        const apiProducts = await productApi.list();
        if (!isActive) return;

        if (apiProducts.length === 0) {
          setProductList([]);
        } else {
          setProductList(apiProducts.map(apiProductToAdminProduct));
        }
        setProductError(null);
      } catch (error: unknown) {
        console.error("Failed to load products", error);
        if (!isActive) return;

        setProductError(error instanceof Error ? error.message : "Failed to load products");
        if (SEED_ADMIN_PRODUCTS.length > 0) {
          setProductList(SEED_ADMIN_PRODUCTS);
        }
      } finally {
        if (isActive) {
          setProductLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isActive = false;
    };
  }, []);

  // Function to handle section changes with URL updates
  const handleSectionChange = (sectionId: string) => {
    setSearchParams({ section: sectionId });
  };
  
  // Checkout settings state
  const [showAngelCoins, setShowAngelCoins] = useState(true);
  const [showCouponCode, setShowCouponCode] = useState(true);

  // Product management state
  const [productList, setProductList] = useState<AdminProduct[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [newProduct, setNewProduct] = useState<NewProductForm>(createEmptyFormState());

  // Mock data
  const mockUsers = [
    { id: "1", name: "Gaurav Dembla", email: "gaurav262001@gmail.com", angelCoins: 10000, orders: 5 },
    { id: "2", name: "John Divine", email: "john@example.com", angelCoins: 7500, orders: 3 },
    { id: "3", name: "Mary Grace", email: "mary@example.com", angelCoins: 15000, orders: 8 },
  ];

  const mockOrders = [
    { id: "ORD001", customer: "Gaurav Dembla", total: 1299, status: "completed", angelCoinsRedeemed: 200 },
    { id: "ORD002", customer: "John Divine", total: 899, status: "pending", angelCoinsRedeemed: 0 },
    { id: "ORD003", customer: "Mary Grace", total: 2499, status: "completed", angelCoinsRedeemed: 500 },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // CRITICAL: Admin login with dual authentication system
    if (credentials.email === "admin@angelsonearth.com" && credentials.password === "divine123") {
      // Set admin user ID in localStorage for strict access control
      externalAuthService.setAdminUser();

      // Set a demo admin user in the auth store
      const demoUser = {
        id: "demo-admin-id",
        email: "admin@angelsonearth.com",
        user_metadata: { role: "admin", name: "Admin User" },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as unknown as User;

      // Manually set the auth state for demo with persistence
      useAuth.setState({
        user: demoUser,
        isAuthenticated: true,
        loading: false
      });

      // Also store in localStorage for persistence
      localStorage.setItem('demo-auth', JSON.stringify({
        user: demoUser,
        isAuthenticated: true
      }));

      console.log('Admin login successful, admin user ID set');
      return;
    }

    try {
      const success = await login(credentials.email, credentials.password);
      if (!success) {
        setLoginError("Invalid email or password. Please try demo credentials: gaurav262001@gmail.com / divine123");
      }
    } catch (error) {
      setLoginError("Login failed. Please try demo credentials: gaurav262001@gmail.com / divine123");
    }
  };

  // Product management functions
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.sku) {
      alert("Please fill in required fields: Name, SKU, and Price");
      return;
    }

    try {
      const payload = formToApiPayload(newProduct);
      const created = await productApi.create(payload);
      const adminProduct = apiProductToAdminProduct(created);

      setProductList((prev) => [adminProduct, ...prev.filter((p) => p.id !== adminProduct.id)]);
      setEditingProduct(null);
      setNewProduct(createEmptyFormState());
      setIsAddProductOpen(false);
      alert("Product added successfully!");
    } catch (error: unknown) {
      console.error("Failed to add product", error);
      const message = error instanceof Error ? error.message : "Failed to add product";
      alert(message);
    }
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setNewProduct(productToFormState(product));
    setIsAddProductOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) {
      return;
    }

    if (!newProduct.name || !newProduct.price || !newProduct.sku) {
      alert("Please fill in required fields: Name, SKU, and Price");
      return;
    }

    try {
      const payload = formToApiPayload({ ...newProduct, featured: editingProduct.featured });
      const updated = await productApi.update(editingProduct.id, payload);
      const adminProduct = apiProductToAdminProduct(updated);

      setProductList((prev) => prev.map((p) => (p.id === adminProduct.id ? adminProduct : p)));
      setEditingProduct(null);
      setNewProduct(createEmptyFormState());
      setIsAddProductOpen(false);
      alert("Product updated successfully!");
    } catch (error: unknown) {
      console.error("Failed to update product", error);
      const message = error instanceof Error ? error.message : "Failed to update product";
      alert(message);
    }
  };

  const handleToggleInStock = async (product: AdminProduct, value: boolean) => {
    try {
      const updated = await productApi.update(product.id, { inStock: value });
      const adminProduct = apiProductToAdminProduct(updated);
      setProductList((prev) => prev.map((p) => (p.id === adminProduct.id ? adminProduct : p)));
      if (editingProduct && editingProduct.id === product.id) {
        setEditingProduct(adminProduct);
        setNewProduct(productToFormState(adminProduct));
      }
    } catch (error: unknown) {
      console.error("Failed to update stock status", error);
      const message = error instanceof Error ? error.message : "Failed to update stock status";
      alert(message);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await productApi.remove(productId);
      setProductList((prev) => prev.filter((p) => p.id !== productId));
      alert("Product deleted successfully!");
    } catch (error: unknown) {
      console.error("Failed to delete product", error);
      const message = error instanceof Error ? error.message : "Failed to delete product";
      alert(message);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h1 className="font-playfair text-2xl font-bold text-slate-800 mb-2">Unified Admin Dashboard</h1>
            <p className="text-slate-600">AngelThon & Ethereal Treasure Market</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-600 text-center">{loginError}</p>
            )}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-500">Demo Credentials:</p>
              <div className="bg-slate-50 p-3 rounded text-sm">
                <p><strong>Email:</strong> admin@angelsonearth.com</p>
                <p><strong>Password:</strong> divine123</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCredentials({
                    email: "admin@angelsonearth.com",
                    password: "divine123"
                  });
                }}
                className="text-xs"
              >
                Fill Demo Credentials
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }


  const menuItems = [
    // Main Menu Items
    { id: "dashboard", label: "Dashboard", icon: BarChart3, type: "single" },
    { id: "contacts", label: "Contacts", icon: Contact, type: "single" },
    { id: "payments", label: "Payments", icon: CreditCard, type: "single" },
    { id: "courses", label: "Courses", icon: GraduationCap, type: "single" },

    // AngelThon Dropdown
    {
      id: "angelthon",
      label: "AngelThon",
      icon: Trophy,
      type: "dropdown",
      children: [
        { id: "angelthon-setup", label: "Setup AngelThon", icon: Settings },
        {
          id: "angelthon-7",
          label: "AngelThon 7.0",
          icon: Trophy,
          type: "nested-dropdown",
          children: [
            { id: "angelthon-leaderboard", label: "Leaderboard", icon: Trophy },
            { id: "angelthon-facilitators", label: "Facilitators", icon: Users },
            { id: "angelthon-achievements", label: "Achievements", icon: Trophy },
            { id: "angelthon-resources", label: "Resources", icon: FileText },
            { id: "angelthon-events", label: "Events", icon: Calendar },
            { id: "angelthon-calendar", label: "Calendar", icon: Calendar },
          ]
        },
      ]
    },

    // Shop Dropdown
    {
      id: "shop",
      label: "Shop",
      icon: ShoppingCart,
      type: "dropdown",
      children: [
        { id: "shop-products", label: "Products", icon: Package },
        { id: "shop-orders", label: "Orders", icon: ShoppingCart },
        { id: "shop-customers", label: "Customers", icon: Users },
        { id: "shop-angelcoins", label: "Angel Coins", icon: Coins },
        { id: "shop-reviews", label: "Reviews", icon: MessageSquare },
        { id: "shop-hero", label: "Hero Section", icon: Eye },
        { id: "shop-navigation", label: "Navigation", icon: Menu },
        { id: "shop-footer", label: "Footer", icon: Contact },
        { id: "shop-testimonials", label: "Testimonials", icon: MessageSquare },
        { id: "shop-settings", label: "Shop Settings", icon: Settings },
      ]
    },

    // Additional Menu Items
    { id: "database-migration", label: "Database Migration", icon: Database, type: "single" },
    { id: "send-broadcast", label: "Send Broadcast", icon: Radio, type: "single" },
    { id: "setup-sessions", label: "Setup Sessions", icon: Video, type: "single" },
    { id: "settings", label: "Settings", icon: Settings, type: "single" },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Users</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Orders</p>
                    <p className="text-2xl font-bold">567</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Angel Coins Issued</p>
                    <p className="text-2xl font-bold">89,123</p>
                  </div>
                  <Coins className="h-8 w-8 text-yellow-600" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Products</p>
                    <p className="text-2xl font-bold">45</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </Card>
            </div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span>New user registration: Sarah Angel</span>
                  <span className="text-sm text-slate-500">2 minutes ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span>Order completed: #ORD001</span>
                  <span className="text-sm text-slate-500">5 minutes ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span>Product added: Crystal Healing Set</span>
                  <span className="text-sm text-slate-500">10 minutes ago</span>
                </div>
              </div>
            </Card>
          </div>
        );

      case "leaderboard":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AngelThon Leaderboard</h2>
            <p className="text-slate-600 mb-4">Manage leaderboard rankings and points</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">This section will integrate with the AngelThon leaderboard system.</p>
            </div>
          </Card>
        );

      case "participants":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AngelThon Participants</h2>
            <p className="text-slate-600 mb-4">Manage participant registrations and profiles</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">This section will show all AngelThon participants.</p>
            </div>
          </Card>
        );

      case "achievements":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Achievements & Badges</h2>
            <p className="text-slate-600 mb-4">Manage achievement system and badge awards</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">This section will manage the achievement system.</p>
            </div>
          </Card>
        );

      case "resources":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Learning Resources</h2>
            <p className="text-slate-600 mb-4">Manage educational content and resources</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">This section will manage learning resources.</p>
            </div>
          </Card>
        );

      case "events":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Events Management</h2>
            <p className="text-slate-600 mb-4">Schedule and manage AngelThon events</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">This section will manage events and scheduling.</p>
            </div>
          </Card>
        );

      case "contacts":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contacts Management</h2>
            <p className="text-slate-600 mb-4">Manage user contacts and communication</p>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-purple-800">Contact management functionality will be implemented here.</p>
            </div>
          </Card>
        );

      case "payments":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payments Management</h2>
            <p className="text-slate-600 mb-4">Manage payment transactions and billing</p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">Payment management functionality will be implemented here.</p>
            </div>
          </Card>
        );

      case "courses":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Courses Management</h2>
            <p className="text-slate-600 mb-4">Manage educational courses and content</p>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-indigo-800">Course management functionality will be implemented here.</p>
            </div>
          </Card>
        );

      case "send-broadcast":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Send Broadcast</h2>
            <p className="text-slate-600 mb-4">Send broadcast messages to users</p>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-orange-800">Broadcast messaging functionality will be implemented here.</p>
            </div>
          </Card>
        );

      case "setup-sessions":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Setup Sessions</h2>
            <p className="text-slate-600 mb-4">Configure and manage user sessions</p>
            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="text-teal-800">Session management functionality will be implemented here.</p>
            </div>
          </Card>
        );

      // AngelThon Sections
      case "angelthon-setup":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Setup AngelThon</h2>
            <p className="text-slate-600 mb-4">Configure AngelThon settings and initial setup</p>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-purple-800">AngelThon setup and configuration functionality will be implemented here.</p>
            </div>
          </Card>
        );

      case "angelthon-leaderboard":
        return <LeaderboardManagement />;

      case "angelthon-participants":
        return <TeamManagement />;

      case "angelthon-achievements":
        return <AchievementsManagement />;

      case "angelthon-resources":
        return <ResourcesManagement />;

      case "angelthon-events":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Events Management</h2>
            <p className="text-slate-600 mb-4">Schedule and manage AngelThon events</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">Events management functionality will be implemented here.</p>
            </div>
          </Card>
        );

      case "angelthon-facilitators":
        return <FacilitatorsManagement />;

      case "angelthon-calendar":
        return <CalendarManagement />;

      case "shop-products":
        return <ProductsManagement />;

      case "users":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Angel Coins</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.angelCoins.toLocaleString()}</TableCell>
                    <TableCell>{user.orders}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Add Coins</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        );
      case "orders":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Management</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Angel Coins Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>₹{order.total}</TableCell>
                    <TableCell>{order.angelCoinsRedeemed}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        );
      case "angelcoins":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Angel Coins Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Bulk Add Angel Coins</h3>
                <div className="space-y-2">
                  <Label>User Email</Label>
                  <Input placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input placeholder="1000" type="number" />
                </div>
                <Button>Add Angel Coins</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Settings</h3>
                <div className="space-y-2">
                  <Label>Angel Coin Value (₹)</Label>
                  <Input defaultValue="0.05" type="number" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Required for Redemption</Label>
                  <Input defaultValue="7500" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Max Redemption % of Order</Label>
                  <Input defaultValue="10" type="number" max="100" />
                </div>
                <Button>Update Settings</Button>
              </div>
            </div>
            
          </Card>
        );
      case "checkout":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Checkout Page Settings</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Checkout Features Control</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Show Angel Coins Section</Label>
                      <p className="text-sm text-muted-foreground">Allow customers to redeem Angel Coins during checkout</p>
                    </div>
                    <Switch
                      checked={showAngelCoins}
                      onCheckedChange={setShowAngelCoins}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Show Coupon Code Section</Label>
                      <p className="text-sm text-muted-foreground">Allow customers to apply coupon codes during checkout</p>
                    </div>
                    <Switch
                      checked={showCouponCode}
                      onCheckedChange={setShowCouponCode}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Product Redirection Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input placeholder="Amethyst Cluster" />
                  </div>
                  <div className="space-y-2">
                    <Label>Redirect URL</Label>
                    <Input placeholder="/product/amethyst-cluster" />
                  </div>
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Button className="w-full">Update</Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Current Settings Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Angel Coins: <Badge variant={showAngelCoins ? "default" : "secondary"}>{showAngelCoins ? "Enabled" : "Disabled"}</Badge></div>
                  <div>Coupon Codes: <Badge variant={showCouponCode ? "default" : "secondary"}>{showCouponCode ? "Enabled" : "Disabled"}</Badge></div>
                </div>
              </div>
            </div>
          </Card>
        );
      case "shop-orders":
        return <OrdersManagement />;

      case "shop-customers":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shop Customers</h2>
            <p className="text-slate-600 mb-4">Manage customer accounts and purchase history</p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">Customer management functionality will be implemented here.</p>
            </div>
          </Card>
        );

      case "shop-angelcoins":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shop Angel Coins</h2>
            <p className="text-slate-600 mb-4">Manage Angel Coins for e-commerce rewards and discounts</p>
            {/* This will contain the existing angel coins management code */}
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">Angel Coins management functionality will be moved here.</p>
            </div>
          </Card>
        );

      case "shop-reviews":
        return <ReviewsManagement />;

      case "shop-hero":
        return <HeroSectionManagement />;

      case "shop-navigation":
        return <NavigationManagement />;

      case "shop-footer":
        return <FooterManagement />;

      case "shop-testimonials":
        return <TestimonialsManagement />;

      case "shop-settings":
        return <ShopSettingsManagement />;

      // System Cases
      case "database-migration":
        return <DatabaseMigration />;

      case "settings":
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">System Settings</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Coupon Codes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input placeholder="WELCOME10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount %</Label>
                      <Input placeholder="10" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Button className="w-full">Active</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">OTP Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>WhatsApp OTP Template</Label>
                      <Input placeholder="Your OTP is: {otp}" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email OTP Template</Label>
                      <Input placeholder="Your verification code is: {otp}" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <SecuritySettings />
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Email Settings</h3>
                <EmailSettings />
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Roles Management</h3>
              <RolesManagement />
            </Card>
          </div>
        );
      case "products":
        return (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Product Management</h2>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingProduct(null);
                    setNewProduct(createEmptyFormState());
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SKU *</Label>
                      <Input
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                        placeholder="AME-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Product Name *</Label>
                      <Input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Amethyst Cluster"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price *</Label>
                      <Input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="2499"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Original Price</Label>
                      <Input
                        type="number"
                        value={newProduct.originalPrice}
                        onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                        placeholder="3499"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Crystals">Crystals</SelectItem>
                          <SelectItem value="Oracle Cards">Oracle Cards</SelectItem>
                          <SelectItem value="Candles">Candles</SelectItem>
                          <SelectItem value="Journals">Journals</SelectItem>
                          <SelectItem value="Crystal Sets">Crystal Sets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Available Quantity</Label>
                      <Input
                        type="number"
                        value={newProduct.availableQuantity}
                        onChange={(e) => setNewProduct({...newProduct, availableQuantity: e.target.value})}
                        placeholder="10"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="new-product-instock"
                        checked={newProduct.inStock}
                        onCheckedChange={(checked) => setNewProduct({...newProduct, inStock: checked})}
                      />
                      <Label htmlFor="new-product-instock" className="font-medium">In Stock</Label>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Divine Protection & Peace - Enhance your spiritual connection..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Tags (comma separated)</Label>
                      <Input
                        value={newProduct.tags}
                        onChange={(e) => setNewProduct({...newProduct, tags: e.target.value})}
                        placeholder="amethyst,crystal,healing,meditation"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Image URL</Label>
                      <Input
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                        placeholder="/assets/product-amethyst.jpg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct} className="flex-1">
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {productLoading && (
              <div className="mb-4 text-sm text-muted-foreground">
                Loading products...
              </div>
            )}

            {productError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                {productError}
                {productList.length > 0 && " – showing local seed data."}
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productList.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>
                        <Badge variant={product.availableQuantity > 10 ? "default" : product.availableQuantity > 0 ? "secondary" : "destructive"}>
                          {product.availableQuantity || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={product.inStock}
                          onCheckedChange={(checked) => handleToggleInStock(product, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Product Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>Total Products: <Badge>{productList.length}</Badge></div>
                <div>In Stock: <Badge variant="default">{productList.filter(p => p.inStock).length}</Badge></div>
                <div>Low Stock: <Badge variant="secondary">{productList.filter(p => p.inStock && p.availableQuantity <= 10).length}</Badge></div>
                <div>Out of Stock: <Badge variant="destructive">{productList.filter(p => !p.inStock).length}</Badge></div>
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar className="w-64">
          <SidebarContent>
            <div className="p-4 border-b">
              <h1 className="font-playfair text-xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Angels On Earth</p>
            </div>
            
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      {item.type === "single" ? (
                        <SidebarMenuButton
                          onClick={() => handleSectionChange(item.id)}
                          className={`w-full justify-start ${
                            activeSection === item.id ? "bg-primary text-primary-foreground" : ""
                          }`}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </SidebarMenuButton>
                      ) : (
                        <div>
                          <SidebarMenuButton
                            onClick={() => toggleSection(item.id)}
                            className="w-full justify-between"
                          >
                            <div className="flex items-center">
                              <item.icon className="w-4 h-4 mr-3" />
                              {item.label}
                            </div>
                            {expandedSections[item.id] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </SidebarMenuButton>
                          {expandedSections[item.id] && item.children && (
                            <div className="ml-6 mt-1 space-y-1">
                              {item.children.map((child) => (
                                <div key={child.id}>
                                  {child.type === "nested-dropdown" ? (
                                    <div>
                                      <SidebarMenuButton
                                        onClick={() => toggleSection(child.id)}
                                        className="w-full justify-between text-sm"
                                      >
                                        <div className="flex items-center">
                                          <child.icon className="w-3 h-3 mr-2" />
                                          {child.label}
                                        </div>
                                        {expandedSections[child.id] ? (
                                          <ChevronDown className="w-3 h-3" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3" />
                                        )}
                                      </SidebarMenuButton>
                                      {expandedSections[child.id] && child.children && (
                                        <div className="ml-4 mt-1 space-y-1">
                                          {child.children.map((nestedChild) => (
                                            <SidebarMenuButton
                                              key={nestedChild.id}
                                              onClick={() => handleSectionChange(nestedChild.id)}
                                              className={`w-full justify-start text-xs ${
                                                activeSection === nestedChild.id ? "bg-primary text-primary-foreground" : ""
                                              }`}
                                            >
                                              <nestedChild.icon className="w-3 h-3 mr-2" />
                                              {nestedChild.label}
                                            </SidebarMenuButton>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <SidebarMenuButton
                                      onClick={() => handleSectionChange(child.id)}
                                      className={`w-full justify-start text-sm ${
                                        activeSection === child.id ? "bg-primary text-primary-foreground" : ""
                                      }`}
                                    >
                                      <child.icon className="w-3 h-3 mr-2" />
                                      {child.label}
                                    </SidebarMenuButton>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <div className="mt-auto p-4 border-t">
              <Button variant="outline" onClick={logout} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="font-playfair text-2xl font-bold text-slate-800">
                    {menuItems.find(item => item.id === activeSection)?.label}
                  </h1>
                  <p className="text-slate-600">Angels On Earth Management</p>
                </div>
              </div>

              {/* Preview Frontend Button */}
              <Button
                variant="outline"
                onClick={() => window.open('http://localhost:8080/', '_blank')}
                className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
              >
                <Eye className="w-4 h-4" />
                Preview Frontend
              </Button>
            </div>
          </div>

          <div className="flex-1 p-6">
            {/* Content */}
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
