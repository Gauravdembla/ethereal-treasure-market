import { useState } from "react";
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
import { Users, Package, Coins, Settings, LogOut, Menu, ShoppingCart, Plus, Edit, Trash2, Upload, Eye } from "lucide-react";

// Import product images
import amethystImage from "@/assets/product-amethyst.jpg";
import angelCardsImage from "@/assets/product-angel-cards.jpg";
import candleImage from "@/assets/product-candle.jpg";
import journalImage from "@/assets/product-journal.jpg";
import roseQuartzImage from "@/assets/product-rose-quartz.jpg";
import chakraKitImage from "@/assets/product-chakra-kit.jpg";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [activeSection, setActiveSection] = useState("users");
  
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

  const handleLogin = () => {
    if (credentials.username === "admin" && credentials.password === "divine123") {
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials! Try admin/divine123");
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h1 className="font-playfair text-2xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Angels On Earth</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            <div className="text-center text-sm text-slate-500 space-y-1">
              <p><strong>Demo Credentials:</strong></p>
              <p>Username: admin</p>
              <p>Password: divine123</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }


  const menuItems = [
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: Package },
    { id: "products", label: "Products", icon: Package },
    { id: "angelcoins", label: "Angel Coins", icon: Coins },
    { id: "checkout", label: "Checkout Settings", icon: ShoppingCart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
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
      case "settings":
        return (
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
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full justify-start ${
                          activeSection === item.id ? "bg-primary text-primary-foreground" : ""
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <div className="mt-auto p-4 border-t">
              <Button variant="outline" onClick={() => setIsLoggedIn(false)} className="w-full">
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