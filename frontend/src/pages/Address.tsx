import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

const Address = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState("default");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    tag: "Home"
  });

  // Mock saved addresses
  const savedAddresses = [
    {
      id: "default",
      name: "Sarah Angel",
      phone: "+91 9876543210",
      addressLine1: "123 Divine Street",
      addressLine2: "Near Temple",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      tag: "Home"
    },
    {
      id: "office",
      name: "Sarah Angel",
      phone: "+91 9876543210", 
      addressLine1: "456 Corporate Plaza",
      addressLine2: "Business District",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400005",
      tag: "Office"
    }
  ];

  const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId) || savedAddresses[0];

  const handlePlaceOrder = () => {
    alert("Order placed successfully!");
    clearCart();
    navigate("/");
  };

  const handleAddNewAddress = () => {
    // Add new address logic would go here
    setIsAddingNew(false);
    alert("Address saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-angelic-cream/30 to-white/50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/checkout")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Checkout
          </Button>
          <h1 className="font-playfair text-3xl text-angelic-deep">Delivery Address</h1>
        </div>

        <div className="space-y-6">
          {/* Address Selection */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-xl text-angelic-deep">Select Address</h2>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New
              </Button>
            </div>

            <div className="space-y-4">
              <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose saved address" />
                </SelectTrigger>
                <SelectContent>
                  {savedAddresses.map((addr) => (
                    <SelectItem key={addr.id} value={addr.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{addr.tag} - {addr.addressLine1}, {addr.city}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Address Display */}
              <div className="p-4 bg-angelic-cream/20 rounded-lg border-2 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                    {selectedAddress.tag}
                  </span>
                </div>
                <h3 className="font-medium text-angelic-deep">{selectedAddress.name}</h3>
                <p className="text-sm text-angelic-deep/70">+91 {selectedAddress.phone}</p>
                <p className="text-sm text-angelic-deep/70 mt-1">
                  {selectedAddress.addressLine1}, {selectedAddress.addressLine2}<br />
                  {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                </p>
              </div>
            </div>
          </Card>

          {/* Add New Address Form */}
          {isAddingNew && (
            <Card className="p-6">
              <h2 className="font-playfair text-xl text-angelic-deep mb-4">Add New Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input
                    id="address1"
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                    placeholder="House/Flat/Office No., Building Name"
                  />
                </div>

                <div>
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input
                    id="address2"
                    value={newAddress.addressLine2}
                    onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                    placeholder="Street, Area, Landmark"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                      placeholder="Pincode"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tag">Address Tag</Label>
                  <Select value={newAddress.tag} onValueChange={(value) => setNewAddress({...newAddress, tag: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Hotel">Hotel</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleAddNewAddress} className="flex-1">
                    Save Address
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Order Actions */}
          <Card className="p-6">
            <div className="space-y-4">
              <Button 
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Confirm Order & Pay
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/checkout")}
                className="w-full"
              >
                Back to Checkout
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Address;