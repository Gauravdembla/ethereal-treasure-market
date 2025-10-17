import React from 'react';
import { Crown, Star, Award, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MembershipBadgeProps {
  className?: string;
  showBenefits?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MembershipBadge: React.FC<MembershipBadgeProps> = ({ 
  className, 
  showBenefits = false, 
  size = 'md' 
}) => {
  const { getMembershipTier, externalUser, getUserRole } = useAuth();
  const membershipTier = getMembershipTier();
  const role = getUserRole();

  if (!externalUser && role !== 'admin') {
    return null; // Don't show badge if no external user and not admin
  }

  const getIcon = () => {
    switch (membershipTier.name.toLowerCase()) {
      case 'diamond':
        return <Crown className={cn("text-white", getSizeClasses().icon)} />;
      case 'platinum':
        return <Star className={cn("text-white", getSizeClasses().icon)} />;
      case 'gold':
        return <Award className={cn("text-white", getSizeClasses().icon)} />;
      default:
        return <User className={cn("text-white", getSizeClasses().icon)} />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          text: 'text-xs'
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'w-5 h-5',
          text: 'text-base'
        };
      default:
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4',
          text: 'text-sm'
        };
    }
  };

  return (
    <div className={cn("inline-flex flex-col gap-2", className)}>
      {/* Membership Badge */}
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full font-semibold text-white shadow-lg",
          membershipTier.color,
          getSizeClasses().container
        )}
      >
        {getIcon()}
        <span className={getSizeClasses().text}>
          {role === 'admin' ? 'Admin' : (membershipTier.level === 0 ? 'No Membership' : `${membershipTier.name} Membership`)}
        </span>
      </div>

      {/* Benefits (optional) */}
      {showBenefits && membershipTier.benefits.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md border">
          <h4 className="font-semibold text-sm text-gray-800 mb-2">
            {membershipTier.name} Benefits:
          </h4>
          <ul className="space-y-1">
            {membershipTier.benefits.map((benefit, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                <div className="w-1 h-1 bg-primary rounded-full" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MembershipBadge;
