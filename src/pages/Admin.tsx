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
import { Users, Package, Coins, Settings, LogOut, Menu, ShoppingCart, Plus, Edit, Trash2, Upload, Eye, BarChart3, Trophy, FileText, Calendar, MessageSquare, ChevronDown, ChevronRight, Contact, CreditCard, GraduationCap, Radio, Video } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";

// Import product images
import amethystImage from "@/assets/product-amethyst.jpg";
import angelCardsImage from "@/assets/product-angel-cards.jpg";
import candleImage from "@/assets/product-candle.jpg";
import journalImage from "@/assets/product-journal.jpg";
import roseQuartzImage from "@/assets/product-rose-quartz.jpg";
import chakraKitImage from "@/assets/product-chakra-kit.jpg";

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

  // Function to handle section changes with URL updates
  const handleSectionChange = (sectionId: string) => {
    setSearchParams({ section: sectionId });
  };
  
  // Checkout settings state
  const [showAngelCoins, setShowAngelCoins] = useState(true);
  const [showCouponCode, setShowCouponCode] = useState(true);

  // Initial products data
  const initialProducts = [
    {
      id: "amethyst-cluster",
      sku: "654567652",
      image: amethystImage,
      name: "Amethyst Cluster",
      description: "Divine Protection & Peace - Enhance your spiritual connection",
      price: "2,499",
      originalPrice: "3,199",
      rating: 5,
      category: "Crystals",
      availableQuantity: 12
    },
    {
      id: "angel-oracle-cards",
      sku: "789123456",
      image: angelCardsImage,
      name: "Angel Oracle Cards",
      description: "Celestial Guidance - Connect with your guardian angels",
      price: "1,899",
      originalPrice: "2,499",
      rating: 5,
      category: "Oracle Cards",
      availableQuantity: 8
    },
    {
      id: "healing-candle",
      sku: "321987654",
      image: candleImage,
      name: "Healing Candle",
      description: "Lavender Serenity - Aromatherapy for mind & soul",
      price: "899",
      originalPrice: "1,199",
      rating: 5,
      category: "Candles",
      availableQuantity: 15
    },
    {
      id: "chakra-journal",
      sku: "456789123",
      image: journalImage,
      name: "Chakra Journal",
      description: "Sacred Writing - Manifest your dreams & intentions",
      price: "1,299",
      originalPrice: "1,699",
      rating: 5,
      category: "Journals",
      availableQuantity: 6
    },
    {
      id: "rose-quartz-heart",
      sku: "987654321",
      image: roseQuartzImage,
      name: "Rose Quartz Heart",
      description: "Unconditional Love - Open your heart chakra",
      price: "1,599",
      originalPrice: "1,999",
      rating: 5,
      category: "Crystals",
      availableQuantity: 20
    },
    {
      id: "chakra-stone-set",
      sku: "147258369",
      image: chakraKitImage,
      name: "Chakra Stone Set",
      description: "Complete Balance - Seven sacred stones for alignment",
      price: "3,499",
      originalPrice: "4,499",
      rating: 5,
      category: "Crystal Sets",
      availableQuantity: 5
    }
  ];

  // Product management state
  const [productList, setProductList] = useState(initialProducts);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    id: "",
    sku: "",
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    tags: "",
    availableQuantity: "",
    specifications: {},
    image: "",
    rating: 5
  });

  // Mock data
  const mockUsers = [
    { id: "1", name: "Sarah Angel", email: "sarah@example.com", angelCoins: 10000, orders: 5 },
    { id: "2", name: "John Divine", email: "john@example.com", angelCoins: 7500, orders: 3 },
    { id: "3", name: "Mary Grace", email: "mary@example.com", angelCoins: 15000, orders: 8 },
  ];

  const mockOrders = [
    { id: "ORD001", customer: "Sarah Angel", total: 1299, status: "completed", angelCoinsRedeemed: 200 },
    { id: "ORD002", customer: "John Divine", total: 899, status: "pending", angelCoinsRedeemed: 0 },
    { id: "ORD003", customer: "Mary Grace", total: 2499, status: "completed", angelCoinsRedeemed: 500 },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // Demo login fallback
    if (credentials.email === "admin@angelsonearth.com" && credentials.password === "divine123") {
      // Set a demo user in the auth store
      const demoUser = {
        id: "demo-admin-id",
        email: "admin@angelsonearth.com",
        user_metadata: { role: "admin", name: "Demo Admin" },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any;

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
      return;
    }

    try {
      const success = await login(credentials.email, credentials.password);
      if (!success) {
        setLoginError("Invalid email or password. Please try demo credentials: admin@angelsonearth.com / divine123");
      }
    } catch (error) {
      setLoginError("Login failed. Please try demo credentials: admin@angelsonearth.com / divine123");
    }
  };

  // Product management functions
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.sku) {
      alert("Please fill in required fields: Name, SKU, and Price");
      return;
    }

    const productId = newProduct.sku.toLowerCase().replace(/\s+/g, '-');
    const product = {
      ...newProduct,
      id: productId,
      price: newProduct.price,
      originalPrice: newProduct.originalPrice || undefined,
      availableQuantity: parseInt(newProduct.availableQuantity) || 0,
      image: newProduct.image || '/assets/product-placeholder.jpg'
    };

    setProductList([...productList, product]);
    setNewProduct({
      id: "",
      sku: "",
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      tags: "",
      availableQuantity: "",
      specifications: {},
      image: "",
      rating: 5
    });
    setIsAddProductOpen(false);
    alert("Product added successfully!");
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      ...product,
      price: product.price,
      originalPrice: product.originalPrice || "",
      availableQuantity: product.availableQuantity?.toString() || "0"
    });
    setIsAddProductOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.sku) {
      alert("Please fill in required fields: Name, SKU, and Price");
      return;
    }

    const updatedProduct = {
      ...newProduct,
      price: newProduct.price,
      originalPrice: newProduct.originalPrice || undefined,
      availableQuantity: parseInt(newProduct.availableQuantity) || 0,
      image: newProduct.image || '/assets/product-placeholder.jpg'
    };

    setProductList(productList.map(p => p.id === editingProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    setNewProduct({
      id: "",
      sku: "",
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      tags: "",
      availableQuantity: "",
      specifications: {},
      image: "",
      rating: 5
    });
    setIsAddProductOpen(false);
    alert("Product updated successfully!");
  };

  const handleDeleteProduct = (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProductList(productList.filter(p => p.id !== productId));
      alert("Product deleted successfully!");
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
        { id: "shop-settings", label: "Shop Settings", icon: Settings },
      ]
    },

    // Additional Menu Items
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

      case "shop-products":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shop Products</h2>
            <p className="text-slate-600 mb-4">This is the existing product management from Ethereal Treasure Market</p>
            {/* This will contain the existing product management code */}
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">Product management functionality will be moved here.</p>
            </div>
          </Card>
        );

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
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shop Orders</h2>
            <p className="text-slate-600 mb-4">Manage e-commerce orders from Ethereal Treasure Market</p>
            {/* This will contain the existing order management code */}
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">Order management functionality will be moved here.</p>
            </div>
          </Card>
        );

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
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Product Reviews</h2>
            <p className="text-slate-600 mb-4">Moderate and manage customer product reviews</p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">Review management functionality will be implemented here.</p>
            </div>
          </Card>
        );

      case "shop-settings":
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shop Settings</h2>
            <p className="text-slate-600 mb-4">Configure e-commerce settings and checkout options</p>
            {/* This will contain the existing checkout settings code */}
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">Shop settings functionality will be moved here.</p>
            </div>
          </Card>
        );

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
                    setNewProduct({
                      id: "",
                      sku: "",
                      name: "",
                      description: "",
                      price: "",
                      originalPrice: "",
                      category: "",
                      tags: "",
                      availableQuantity: "",
                      specifications: {},
                      image: "",
                      rating: 5
                    });
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

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
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
                <div>In Stock: <Badge variant="default">{productList.filter(p => p.availableQuantity > 0).length}</Badge></div>
                <div>Low Stock: <Badge variant="secondary">{productList.filter(p => p.availableQuantity > 0 && p.availableQuantity <= 10).length}</Badge></div>
                <div>Out of Stock: <Badge variant="destructive">{productList.filter(p => p.availableQuantity === 0).length}</Badge></div>
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
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="font-playfair text-2xl font-bold text-slate-800">
                  {menuItems.find(item => item.id === activeSection)?.label}
                </h1>
                <p className="text-slate-600">Angels On Earth Management</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Users</p>
                    <p className="text-2xl font-bold">{mockUsers.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Orders</p>
                    <p className="text-2xl font-bold">{mockOrders.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Coins className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Angel Coins Issued</p>
                    <p className="text-2xl font-bold">32.5K</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Settings className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Revenue</p>
                    <p className="text-2xl font-bold">₹45.2K</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;