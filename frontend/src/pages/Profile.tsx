import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AngelicFooter from "@/components/AngelicFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import AddressForm from "@/components/AddressForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import { useAngelCoins } from "@/hooks/useAngelCoins";

import { useMembershipPricing } from "@/hooks/useMembershipPricing";
import MembershipBadge from "@/components/MembershipBadge";
import { User, Package, MapPin, Coins, Truck, LogOut, ArrowLeft, Edit, Plus, Trash2, Phone, Mail, UserCircle, Globe, Search, Building2 as BuildingIcon, Eye } from "lucide-react";

import CompanyDetailsForm, { type CompanyDetails } from '@/components/CompanyDetailsForm';
import { orderService, type OrderDto } from "@/services/orderService";

import { addressService, type UserAddress } from "@/services/addressService";
import { userProfileService } from "@/services/userProfileService";

type ProfileData = {
  fullName: string;
  email: string;
  mobile: string;
  alternativeMobile: string;
  membershipType: string;
  addresses: UserAddress[];
  orders: any[];
};

const Profile = () => {
  const { user, externalUser, logout, isAuthenticated, loading, getUserRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();



  const { angelCoins, loading: angelCoinsLoading, updateBalance, clearAngelCoinsData } = useAngelCoins();
  const { membershipTier } = useMembershipPricing();
  const [searchParams] = useSearchParams();
  const userRole = getUserRole();

  // Get user ID from URL params for unique URLs - prioritize external user
  const userId = searchParams.get('user') || externalUser?.userId || user?.id || 'default';
  const apiUserId = userId && userId !== 'default' ? userId : null;

  // Company details component (scoped inside Profile to access userId)
  const CompanyDetailsSection: React.FC = () => {
    const [data, setData] = useState<CompanyDetails | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const load = async () => {
        if (!apiUserId) return;
        setLoading(true);
        try {
          const res = await userProfileService.getCompanyDetails(apiUserId);
          setData(res);
        } catch (error) {
          console.error('Failed to fetch company details', error);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [apiUserId]);

    return (
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-600">Loading company details...</p>
        ) : data ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{data.companyName}</p>
                <p className="text-sm text-gray-600">{data.address}</p>
                {data.gstNo && <p className="text-sm text-gray-600">GST No.: {data.gstNo}</p>}
              </div>
              <Button variant="outline" onClick={() => setOpen(true)}>Edit</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-700">No company details saved.</p>
            <Button onClick={() => setOpen(true)}>Add Company Details</Button>
          </div>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{data ? 'Edit Company Details' : 'Add Company Details'}</DialogTitle>
            </DialogHeader>
            <CompanyDetailsForm
              initial={data}
              onConfirm={async (d) => {
                if (!apiUserId) return;
                try {
                  const saved = await userProfileService.upsertCompanyDetails(apiUserId, d);
                  setData(saved);
                  setOpen(false);
                  toast({ title: 'Success', description: 'Company details saved' });
                } catch (error: any) {
                  toast({ variant: 'destructive', title: 'Error', description: error?.message || 'Failed to save company details' });
                }
              }}
              onCancel={() => setOpen(false)}
              confirmText={data ? 'Save' : 'Confirm'}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Active section state
  const [activeSection, setActiveSection] = useState('profile');

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Angel Coins editing (admin only)
  const [isEditingAngelCoins, setIsEditingAngelCoins] = useState(false);
  const [angelCoinsEditValue, setAngelCoinsEditValue] = useState('');

  // Wait for auth to finish initializing; only redirect if explicitly unauthenticated and no external user
  useEffect(() => {
    if (loading) return;
    if (!user && !externalUser) {
      navigate('/');
    }
  }, [user, externalUser, loading, navigate]);

  // Orders state
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  useEffect(() => {
    if (!apiUserId) return;
    let mounted = true;
    (async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const list = await orderService.listByUser(apiUserId);
        if (!mounted) return;
        setOrders(list);
      } catch (e: any) {
        if (!mounted) return;
        setOrdersError(e?.message || 'Failed to load orders');
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [apiUserId]);

  // User data - prioritize external user data from localStorage
  const getProfileDataFromStorage = (): ProfileData => {
    try {
      const name = localStorage.getItem('AOE_name') || '';
      const profileFullStr = localStorage.getItem('AOE_profile_full');
      const membershipTier = localStorage.getItem('AOE_membership_tier') || 'none';

      let email = '';
      let mobile = '';

      if (profileFullStr) {
        const profileFull = JSON.parse(profileFullStr);
        email = profileFull.email || '';
        mobile = (profileFull.countryCode || '') + (profileFull.phone || '');
      }

      return {
        fullName: name || 'User',
        email: email || user?.email || '',
        mobile: mobile || '',
        alternativeMobile: '', // Optional field
        membershipType: membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1),
        addresses: [], // Empty - will show empty state
        orders: [] // Empty - will show empty state
      };
    } catch (error) {
      console.error('Error reading profile data from storage:', error);
      return {
        fullName: 'User',
        email: user?.email || '',
        mobile: '',
        alternativeMobile: '',
        membershipType: 'None',
        addresses: [],
        orders: []
      };
    }
  };

  const [userProfile, setUserProfile] = useState<ProfileData>(getProfileDataFromStorage());

  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  // Edit form states
  const [editForm, setEditForm] = useState({
    fullName: userProfile.fullName,
    email: userProfile.email,
    mobile: userProfile.mobile,
    alternativeMobile: userProfile.alternativeMobile,
    membershipType: userProfile.membershipType
  });
  const [newAddress, setNewAddress] = useState({
    type: '',
    customType: '',
    name: '',
    address1: '',
    address2: '',
    nearby: '',
    city: '',
    state: '',
    customState: '',
    country: '',
    zipCode: '',
    isDefault: false
  });

  const loadAddresses = useCallback(async () => {
    if (!apiUserId) {
      return;
    }

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const data = await addressService.list(apiUserId);
      setUserProfile((prev) => ({
        ...prev,
        addresses: data,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load addresses';
      console.error('Failed to load addresses', error);
      setAddressesError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setAddressesLoading(false);
    }
  }, [apiUserId, setUserProfile, toast]);

  useEffect(() => {
    if (apiUserId) {
      loadAddresses();
    }
  }, [apiUserId, loadAddresses]);

  // Country/State management temporarily disabled on Profile to avoid geo calls

  // Handler functions
  const handleSaveProfile = () => {
    // Persist membership selection into localStorage for use across the app
    try {
      const raw = (editForm.membershipType || '').toString().toLowerCase();
      let tierKey: 'diamond' | 'platinum' | 'gold' | 'none' = 'none';
      if (raw.includes('diamond')) tierKey = 'diamond';
      else if (raw.includes('platinum')) tierKey = 'platinum';
      else if (raw.includes('gold')) tierKey = 'gold';
      else tierKey = 'none'; // Treat Bronze/None/others as none
      localStorage.setItem('AOE_membership_tier', tierKey);
      // If admin is editing, lock the membership tier to prevent auto-overwrite by external auth refresh
      if (userRole === 'admin') {
        localStorage.setItem('AOE_membership_manual', 'true');
      }
    } catch (e) {
      console.error('Failed to save membership to localStorage', e);
    }

    setUserProfile(prev => ({
      ...prev,
      fullName: editForm.fullName,
      email: editForm.email,
      mobile: editForm.mobile,
      alternativeMobile: editForm.alternativeMobile,
      membershipType: editForm.membershipType
    }));
    setIsEditingProfile(false);
    toast({
      title: "Success",
      description: "Profile updated successfully"
    });
  };

  const handleAddAddress = async () => {
    if (!apiUserId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to determine user. Please sign in again.",
      });
      return;
    }

    // Validation
    const addressType = newAddress.type === 'Others' ? newAddress.customType : newAddress.type;
    const stateName = newAddress.state === 'Others' ? newAddress.customState : newAddress.state;

    if (!addressType || !newAddress.name || !newAddress.address1 || !newAddress.city || !stateName || !newAddress.country || !newAddress.zipCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    const payload = {
      userId: apiUserId,
      type: addressType,
      name: newAddress.name,
      address1: newAddress.address1,
      address2: newAddress.address2,
      nearby: newAddress.nearby,
      city: newAddress.city,
      state: stateName,
      country: newAddress.country,
      zipCode: newAddress.zipCode,
      isDefault: userProfile.addresses.length === 0 ? true : newAddress.isDefault,
    };

    try {
      await addressService.create(payload);
      await loadAddresses();

      setNewAddress({
        type: '',
        customType: '',
        name: '',
        address1: '',
        address2: '',
        nearby: '',
        city: '',
        state: '',
        customState: '',
        country: '',
        zipCode: '',
        isDefault: false
      });
      setIsAddingAddress(false);

      toast({
        title: "Success",
        description: "Address added successfully"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add address';
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };



  const handleUpdateAddress = async () => {
    if (!apiUserId || !editingAddress) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to determine user or address. Please try again.",
      });
      return;
    }

    // Validation
    const addressType = editingAddress.type === 'Others' ? editingAddress.customType : editingAddress.type;
    const stateName = editingAddress.state === 'Others' ? editingAddress.customState : editingAddress.state;

    if (!addressType || !editingAddress.name || !editingAddress.address1 || !editingAddress.city || !stateName || !editingAddress.country || !editingAddress.zipCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    const payload = {
      userId: apiUserId,
      type: addressType,
      name: editingAddress.name,
      address1: editingAddress.address1,
      address2: editingAddress.address2 || '',
      nearby: editingAddress.nearby || '',
      city: editingAddress.city,
      state: stateName,
      country: editingAddress.country,
      zipCode: editingAddress.zipCode,
      isDefault: editingAddress.isDefault || false,
    };

    try {
      await addressService.update(editingAddress.id, payload);
      await loadAddresses();
      setEditingAddress(null);
      toast({
        title: "Success",
        description: "Address updated successfully"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update address';
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!apiUserId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to determine user. Please sign in again.",
      });
      return;
    }

    try {
      await addressService.remove(addressId, apiUserId);
      await loadAddresses();
      toast({
        title: "Success",
        description: "Address deleted successfully"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete address';
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveAngelCoins = async () => {
    const newBalance = parseInt(angelCoinsEditValue);
    if (isNaN(newBalance) || newBalance < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid number"
      });
      return;
    }

    const success = await updateBalance(newBalance);
    if (success) {
      setIsEditingAngelCoins(false);
      setAngelCoinsEditValue('');
      toast({
        title: "Success",
        description: "Angel Coins balance updated successfully"
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update Angel Coins balance"
      });
    }
  };

  // Render nothing only while loading, or when both auth sources are absent
  if (loading) {
    return null;
  }
  if (!user && !externalUser) {
    return null; // Will redirect via useEffect
  }

  // Sidebar menu items
  const sidebarItems = [
    { id: 'profile', label: 'Profile Information', icon: UserCircle },
    { id: 'company', label: 'Company Details', icon: BuildingIcon as any },
    { id: 'coins', label: 'Angel Coins', icon: Coins },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'orders', label: 'Order History', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Smaller Header */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Button>
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-playfair font-bold text-gray-800">
                My Profile
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 max-w-7xl mx-auto">

          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 sticky top-24">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? 'bg-purple-100 text-purple-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'company' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <BuildingIcon className="w-6 h-6" />
                      Company Details
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CompanyDetailsSection />
                </CardContent>
              </Card>
            )}

            {activeSection === 'profile' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <UserCircle className="w-6 h-6" />
                        Profile Information
                      </CardTitle>
                      {/* Show membership badge for external users */}
                      {externalUser && (
                        <MembershipBadge size="sm" showBenefits={false} />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditForm({
                          fullName: userProfile.fullName,
                          email: userProfile.email,
                          mobile: userProfile.mobile,
                          alternativeMobile: userProfile.alternativeMobile || '',
                          membershipType: userProfile.membershipType || ''
                        });
                        setIsEditingProfile(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                          id="mobile"
                          value={editForm.mobile}
                          onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="alternativeMobile">Alternative Mobile Number (Optional)</Label>
                        <Input
                          id="alternativeMobile"
                          placeholder="Enter alternative mobile number"
                          value={editForm.alternativeMobile}
                          onChange={(e) => setEditForm(prev => ({ ...prev, alternativeMobile: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="membershipType">Membership Type</Label>
                        <Select value={editForm.membershipType} onValueChange={(value) => setEditForm(prev => ({ ...prev, membershipType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select membership type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Diamond">Diamond</SelectItem>
                            <SelectItem value="Platinum">Platinum</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                            <SelectItem value="Silver">Silver</SelectItem>
                            <SelectItem value="Bronze">Bronze</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <UserCircle className="w-5 h-5 text-gray-500" />
                        <div>
                          <label className="text-sm font-medium text-gray-600">Full Name</label>
                          <p className="text-lg font-semibold text-gray-800">{userProfile.fullName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email Address</label>
                          <p className="text-lg text-gray-800">{userProfile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                          <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                          <p className="text-lg text-gray-800">{userProfile.mobile}</p>
                        </div>
                      </div>
                      {userProfile.alternativeMobile && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-600">Alternative Mobile Number</label>
                            <p className="text-lg text-gray-800">{userProfile.alternativeMobile}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-5 h-5 p-0 flex items-center justify-center">
                          <span className="text-xs">★</span>
                        </Badge>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Membership Type</label>
                          <p className="text-lg text-gray-800 font-semibold text-primary">{userProfile.membershipType}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'coins' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Coins className="w-6 h-6" />
                      Angel Coins
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <span>Currency: INR</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-8 rounded-2xl border border-yellow-200 inline-block">
                      <div className="flex items-center gap-4">
                        <Coins className="w-12 h-12 text-yellow-500" />
                        <div>
                          <p className="text-lg font-medium text-yellow-700">Current Balance</p>
                          {isEditingAngelCoins ? (
                            <div className="flex items-center gap-2 mt-2">
                              <Input
                                type="number"
                                value={angelCoinsEditValue}
                                onChange={(e) => setAngelCoinsEditValue(e.target.value)}
                                placeholder="Enter new balance"
                                className="w-32 text-center"
                              />
                              <Button size="sm" onClick={handleSaveAngelCoins}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setIsEditingAngelCoins(false);
                                  setAngelCoinsEditValue('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-4xl font-bold text-yellow-600">
                                {angelCoinsLoading ? '...' : angelCoins.toLocaleString()}
                              </p>
                              {/* Edit only visible to admin */}
                              {userRole === 'admin' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setIsEditingAngelCoins(true);
                                    setAngelCoinsEditValue(angelCoins.toString());
                                  }}
                                  className="ml-2 text-yellow-600 hover:text-yellow-700"
                                  title="Edit Angel Coins (Admin)"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          )}
                          <p className="text-sm text-yellow-600">Angel Coins</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-gray-700 mb-2">
                        <strong>Exchange Rate:</strong> 1 Angel Coin = ₹0.05
                      </p>
                      <p className="text-gray-600 text-sm mb-3">
                        Earn Angel Coins with every purchase and redeem them for exclusive rewards!
                      </p>
                      {userRole === 'admin' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={clearAngelCoinsData}
                            className="text-xs"
                          >
                            Reset to Default (Testing)
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'addresses' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <MapPin className="w-6 h-6" />
                      Saved Addresses
                    </CardTitle>
                    <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <AddressForm
                          address={newAddress}
                          onAddressChange={setNewAddress}
                          onSave={handleAddAddress}
                          onCancel={() => setIsAddingAddress(false)}
                        />
                      </DialogContent>
                    </Dialog>
                    {/* Edit Address Dialog */}
                    <Dialog open={!!editingAddress} onOpenChange={(open) => { if (!open) setEditingAddress(null); }}>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Address</DialogTitle>
                        </DialogHeader>
                        {editingAddress && (
                          <AddressForm
                            address={editingAddress}
                            onAddressChange={setEditingAddress}
                            onSave={handleUpdateAddress}
                            onCancel={() => setEditingAddress(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {addressesLoading ? (
                      <p className="text-gray-600">Loading addresses...</p>
                    ) : addressesError ? (
                      <p className="text-red-600">{addressesError}</p>
                    ) : userProfile.addresses.length === 0 ? (
                      <p className="text-gray-600">No addresses saved yet. Add one to get started.</p>
                    ) : (
                      userProfile.addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{address.type}</h3>
                                {address.isDefault && (
                                  <Badge variant="outline" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-700">
                                {address.fullAddress}<br />
                                {address.city}, {address.state} {address.zipCode}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingAddress({ ...address, customType: '', customState: '' })}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'orders' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Package className="w-6 h-6" />
                      Order History
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ordersLoading ? (
                      <p className="text-gray-600">Loading orders...</p>
                    ) : ordersError ? (
                      <p className="text-red-600">{ordersError}</p>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-600 text-lg">No orders yet.</p>
                        <p className="text-gray-500 text-sm mt-2">Start shopping to see your orders here!</p>
                      </div>
                    ) : (
                      orders
                        .filter(o => o.status !== 'incart')
                        .map((order) => {
                          const getDeliveryStatusBadge = (deliveryStatus?: string) => {
                            if (!deliveryStatus) return null;
                            const statusConfig: Record<string, { className: string; label: string }> = {
                              order_received: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Order Received' },
                              in_packing: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'In Packing' },
                              ready_to_dispatch: { className: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Ready to Dispatch' },
                              shipped: { className: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Shipped' },
                              in_transit: { className: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'In Transit' },
                              delivered: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Delivered' },
                              returned: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Returned' },
                            };
                            const config = statusConfig[deliveryStatus] || { className: 'bg-gray-100 text-gray-800 border-gray-200', label: deliveryStatus };
                            return (
                              <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
                                <Truck className="w-3 h-3" />
                                {config.label}
                              </Badge>
                            );
                          };

                          return (
                            <div key={order.id} className="border rounded-lg p-4 hover:shadow-lg transition-all bg-white">
                              <div className="flex flex-col gap-3">
                                {/* Header Row */}
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="font-bold text-lg text-gray-900">{order.orderId || order.id}</h3>
                                      <Badge
                                        variant={order.status === 'paid' ? 'default' : (order.status === 'failed' || order.status === 'abandoned') ? 'destructive' : 'secondary'}
                                      >
                                        {order.status === 'abandoned' ? 'Cancelled' : order.status === 'paid' ? 'Paid' : order.status}
                                      </Badge>
                                      {order.deliveryStatus && getDeliveryStatusBadge(order.deliveryStatus)}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      <strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">
                                      ₹{typeof order.total === 'number' ? order.total.toFixed(2) : (typeof order.subtotal === 'number' ? order.subtotal.toFixed(2) : '0.00')}
                                    </p>
                                    <p className="text-xs text-gray-500">Total Amount</p>
                                  </div>
                                </div>

                                {/* Items Summary */}
                                <div className="text-sm text-gray-700">
                                  <strong>Items:</strong> {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                                  {order.items && order.items.length > 0 && (
                                    <span className="text-gray-500 ml-2">
                                      ({order.items.slice(0, 2).map(i => i.name).join(', ')}{order.items.length > 2 ? ` +${order.items.length - 2} more` : ''})
                                    </span>
                                  )}
                                </div>

                                {/* Action Button */}
                                <div className="flex justify-end pt-2 border-t">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setIsOrderDetailOpen(true);
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Customer Name</Label>
                  <p className="text-sm">{selectedOrder.customerName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Customer Email</Label>
                  <p className="text-sm">{selectedOrder.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Order Date</Label>
                  <p className="text-sm">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Order Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedOrder.status === 'paid' ? 'default' : 'secondary'}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
                {selectedOrder.deliveryStatus && (
                  <div>
                    <Label className="text-sm font-semibold">Delivery Status</Label>
                    <div className="mt-1">
                      {(() => {
                        const statusConfig: Record<string, { className: string; label: string }> = {
                          order_received: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Order Received' },
                          in_packing: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'In Packing' },
                          ready_to_dispatch: { className: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Ready to Dispatch' },
                          shipped: { className: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Shipped' },
                          in_transit: { className: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'In Transit' },
                          delivered: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Delivered' },
                          returned: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Returned' },
                        };
                        const config = statusConfig[selectedOrder.deliveryStatus!] || { className: 'bg-gray-100 text-gray-800 border-gray-200', label: selectedOrder.deliveryStatus!.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
                        return (
                          <Badge variant="outline" className={config.className}>
                            {config.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Order Items</Label>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Pricing Details */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Pricing Details</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{(selectedOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {selectedOrder.angelCoinsUsed && selectedOrder.angelCoinsUsed > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Angel Coins Used ({selectedOrder.angelCoinsUsed} coins)</span>
                        <span>-₹{(selectedOrder.angelCoinsDiscount || 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>GST (18%)</span>
                    <span>₹{(selectedOrder.gst || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>₹{(selectedOrder.shipping || 0).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{(selectedOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Shipping Address</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded-lg">
                      {selectedOrder.shippingAddress.type && (
                        <Badge variant="outline" className="mb-2">{selectedOrder.shippingAddress.type}</Badge>
                      )}
                      <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                      {selectedOrder.shippingAddress.address1 && <p>{selectedOrder.shippingAddress.address1}</p>}
                      {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                      {selectedOrder.shippingAddress.nearby && <p className="text-gray-600">Near: {selectedOrder.shippingAddress.nearby}</p>}
                      {/* Fallback for old address format */}
                      {!selectedOrder.shippingAddress.address1 && selectedOrder.shippingAddress.address && (
                        <p>{selectedOrder.shippingAddress.address}</p>
                      )}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Admin Remarks */}
              {selectedOrder.adminRemarks && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Admin Remarks</Label>
                    <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">{selectedOrder.adminRemarks}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>

      <AngelicFooter />
    </div>
  );
};

export default Profile;
