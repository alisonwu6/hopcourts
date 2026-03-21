import React from 'react';

interface VenueBadgeProps {
    children: React.ReactNode;
    variant?: 'emerald' | 'amber' | 'red' | 'indigo' | 'slate' | 'default' | 'published' | 'draft';
    size?: 'xs' | 'sm';
    className?: string;
}

export const VenueBadge: React.FC<VenueBadgeProps> = ({ 
    children, 
    variant = 'default',
    size = 'sm',
    className = ''
}) => {
    const baseStyles = "inline-flex items-center justify-center font-black uppercase tracking-widest rounded-md border";
    
    const variants = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        published: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        red: "bg-red-50 text-red-600 border-red-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        slate: "bg-slate-50 text-slate-400 border-slate-100",
        draft: "bg-slate-50 text-slate-400 border-slate-100",
        default: "bg-white text-slate-500 border-slate-200"
    };

    const sizes = {
        xs: "px-1.5 py-0.5 text-[8px]",
        sm: "px-2 py-0.5 text-[10px]"
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};
