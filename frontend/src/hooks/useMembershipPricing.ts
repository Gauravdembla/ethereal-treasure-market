import { useAuth } from '@/hooks/useAuth';
import appConfig from '@/services/appConfig';

export interface PricingInfo {
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  discountPercentage: number;
  savings: number;
  membershipTier: string;
}

export const useMembershipPricing = () => {
  const { getMembershipTier, externalUser } = useAuth();
  const membershipTier = getMembershipTier();

  // Respect global feature flag for membership discounts
  const membershipDiscountEnabled = appConfig.isMembershipDiscountEnabled();
  const effectiveDiscountPercentage = membershipDiscountEnabled ? (membershipTier.discount || 0) : 0;

  const calculatePrice = (basePrice: string | number): PricingInfo => {
    // Convert price to number
    const originalPrice = typeof basePrice === 'string'
      ? parseFloat(basePrice.replace(/[₹,]/g, ''))
      : basePrice;

    // Use effective discount percentage (0 when disabled)
    const discountPercentage = effectiveDiscountPercentage;

    // Calculate discounted price
    const discount = (originalPrice * discountPercentage) / 100;
    const discountedPrice = originalPrice - discount;
    const savings = discount;

    return {
      originalPrice,
      discountedPrice,
      discount,
      discountPercentage,
      savings,
      membershipTier: membershipTier.name
    };
  };

  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const hasDiscount = (): boolean => {
    return membershipDiscountEnabled && effectiveDiscountPercentage > 0;
  };

  const getMembershipBenefits = () => {
    return membershipTier.benefits;
  };

  const isAuthenticated = (): boolean => {
    return !!externalUser;
  };

  return {
    calculatePrice,
    formatPrice,
    hasDiscount,
    getMembershipBenefits,
    isAuthenticated,
    membershipTier,
    discountPercentage: effectiveDiscountPercentage
  };
};

export default useMembershipPricing;
