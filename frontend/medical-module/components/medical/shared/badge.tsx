"use client";

interface BadgeProps {
  label: string;
  color: string;
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function Badge({ label, color, size = "md", icon }: BadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <div className={`${sizeClasses[size]} ${color} rounded-md border inline-flex items-center gap-1.5 font-medium`}>
      {icon}
      {label}
    </div>
  );
}
