import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Users, Package, Coins, Settings, LogOut, Menu, ShoppingCart } from "lucide-react";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [activeSection, setActiveSection] = useState("users");
  
  // Checkout settings state
  const [showAngelCoins, setShowAngelCoins] = useState(true);
  const [showCouponCode, setShowCouponCode] = useState(true);

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