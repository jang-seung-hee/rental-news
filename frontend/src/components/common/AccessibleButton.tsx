import React from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  role?: string;
  tabIndex?: number;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  role,
  tabIndex,
  ...props
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn('focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2', className)}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      role={role}
      tabIndex={tabIndex}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AccessibleButton; 