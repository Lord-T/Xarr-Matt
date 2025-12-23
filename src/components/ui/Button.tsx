import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    fullWidth?: boolean;
}

export function Button({
    className = '',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    ...props
}: ButtonProps) {

    // Construct class names manually (could use clsx/cn in future)
    let classes = 'btn';

    // Variants
    if (variant === 'primary') classes += ' btn-primary';
    else if (variant === 'secondary') classes += ' btn-secondary';
    // outline/ghost would need CSS classes defined in globals.css, defaulting to primary styles or adding inline for now if missing

    // Sizes (simplified for now)
    // if (size === 'lg') classes += ' btn-lg';

    if (fullWidth) classes += ' btn-full';

    if (className) classes += ` ${className}`;

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}
