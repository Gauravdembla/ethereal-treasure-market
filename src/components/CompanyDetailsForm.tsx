import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export type CompanyDetails = {
  companyName: string;
  address: string;
  gstNo?: string;
};

interface Props {
  initial?: CompanyDetails | null;
  onConfirm: (data: CompanyDetails) => void;
  onCancel?: () => void;
  confirmText?: string;
}

const CompanyDetailsForm: React.FC<Props> = ({ initial, onConfirm, onCancel, confirmText = 'Confirm' }) => {
  const [form, setForm] = useState<CompanyDetails>({
    companyName: '',
    address: '',
    gstNo: ''
  });

  useEffect(() => {
    if (initial) setForm({ companyName: initial.companyName || '', address: initial.address || '', gstNo: initial.gstNo || '' });
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.address.trim()) return;
    onConfirm({ companyName: form.companyName.trim(), address: form.address.trim(), gstNo: form.gstNo?.trim() || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g., Aurora Wellness Pvt Ltd" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="Full billing address" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gstNo">GST No. (Optional)</Label>
        <Input id="gstNo" name="gstNo" value={form.gstNo || ''} onChange={handleChange} placeholder="15-digit GSTIN (optional)" />
      </div>

      <div className="space-y-3 pt-2">
        <Button type="submit" className="w-full">{confirmText}</Button>
        <p className="text-xs text-gray-600 text-center">
          By Continuing, you agree to our <a href="/terms" className="underline" target="_blank" rel="noreferrer">Terms and Conditions</a>.
        </p>
        {onCancel && (
          <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
};

export default CompanyDetailsForm;

