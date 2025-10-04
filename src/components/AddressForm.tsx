import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown } from "lucide-react";
import { useCountryState } from "@/hooks/useCountryState";

interface AddressFormProps {
  address: {
    type: string;
    customType: string;
    name: string;
    address1: string;
    address2: string;
    nearby: string;
    city: string;
    state: string;
    customState: string;
    country: string;
    zipCode: string;
    isDefault: boolean;
  };
  onAddressChange: (address: any) => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
}

const ADDRESS_TYPES = [
  { value: 'Home', label: 'Home' },
  { value: 'Office', label: 'Office' },
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Others', label: 'Others' }
];

const AddressForm = ({ address, onAddressChange, onSave, onCancel }: AddressFormProps) => {
  const { selectedCountry, availableStates, loading: countryLoading, changeCountry, filterCountries, filterStates, allCountries } = useCountryState();
  
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  // Initialize country when component mounts
  useEffect(() => {
    if (selectedCountry && !address.country) {
      onAddressChange({ ...address, country: selectedCountry.name });
    }
  }, [selectedCountry]);

  const handleCountrySelect = (country: any) => {
    changeCountry(country);
    onAddressChange({ ...address, country: country.name, state: '', customState: '' });
    setShowCountryDropdown(false);
    setCountrySearch('');
  };

  const handleStateSelect = (state: any) => {
    onAddressChange({ ...address, state: state.name, customState: '' });
    setShowStateDropdown(false);
    setStateSearch('');
  };

  const filteredCountries = filterCountries(countrySearch);
  const filteredStates = filterStates(stateSearch);

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Address Type */}
      <div>
        <Label htmlFor="addressType">Address Type *</Label>
        <Select
          value={address.type}
          onValueChange={(value) => onAddressChange({ ...address, type: value, customType: '' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select address type" />
          </SelectTrigger>
          <SelectContent>
            {ADDRESS_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {address.type === 'Others' && (
          <Input
            className="mt-2"
            placeholder="Enter custom address type"
            value={address.customType}
            onChange={(e) => onAddressChange({ ...address, customType: e.target.value })}
          />
        )}
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Full name"
          value={address.name}
          onChange={(e) => onAddressChange({ ...address, name: e.target.value })}
        />
      </div>

      {/* Address 1 */}
      <div>
        <Label htmlFor="address1">Address 1 *</Label>
        <Input
          id="address1"
          placeholder="Street address, building name"
          value={address.address1}
          onChange={(e) => onAddressChange({ ...address, address1: e.target.value })}
        />
      </div>

      {/* Address 2 */}
      <div>
        <Label htmlFor="address2">Address 2 (Optional)</Label>
        <Input
          id="address2"
          placeholder="Apartment, suite, floor"
          value={address.address2}
          onChange={(e) => onAddressChange({ ...address, address2: e.target.value })}
        />
      </div>

      {/* Nearby */}
      <div>
        <Label htmlFor="nearby">Near by (Optional)</Label>
        <Input
          id="nearby"
          placeholder="Landmark, nearby location"
          value={address.nearby}
          onChange={(e) => onAddressChange({ ...address, nearby: e.target.value })}
        />
      </div>

      {/* City */}
      <div>
        <Label htmlFor="city">City *</Label>
        <Input
          id="city"
          placeholder="City"
          value={address.city}
          onChange={(e) => onAddressChange({ ...address, city: e.target.value })}
        />
      </div>

      {/* Country */}
      <div>
        <Label htmlFor="country">Country *</Label>
        <div className="relative">
          <div
            className="flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          >
            <span>{address.country || 'Select country'}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          
          {showCountryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCountrySelect(country)}
                  >
                    {country.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State */}
      <div>
        <Label htmlFor="state">State *</Label>
        <div className="relative">
          <div
            className="flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer"
            onClick={() => setShowStateDropdown(!showStateDropdown)}
          >
            <span>{address.state || 'Select state'}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          
          {showStateDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search states..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredStates.map((state) => (
                  <div
                    key={state.code}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleStateSelect(state)}
                  >
                    {state.name}
                  </div>
                ))}
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-t"
                  onClick={() => {
                    onAddressChange({ ...address, state: 'Others' });
                    setShowStateDropdown(false);
                  }}
                >
                  Others (Add custom state)
                </div>
              </div>
            </div>
          )}
        </div>
        
        {address.state === 'Others' && (
          <Input
            className="mt-2"
            placeholder="Enter custom state"
            value={address.customState}
            onChange={(e) => onAddressChange({ ...address, customState: e.target.value })}
          />
        )}
      </div>

      {/* ZIP Code */}
      <div>
        <Label htmlFor="zipCode">ZIP Code *</Label>
        <Input
          id="zipCode"
          placeholder="ZIP/Postal code"
          value={address.zipCode}
          onChange={(e) => onAddressChange({ ...address, zipCode: e.target.value })}
        />
      </div>

      {/* Default Address */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={address.isDefault}
          onChange={(e) => onAddressChange({ ...address, isDefault: e.target.checked })}
        />
        <Label htmlFor="isDefault">Set as default address</Label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button onClick={onSave} className="flex-1">
          Save Address
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddressForm;
