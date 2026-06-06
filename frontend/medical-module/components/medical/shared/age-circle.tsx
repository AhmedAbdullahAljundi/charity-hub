"use client";

import { getAgeCircleColor, getAgeGroupLabel } from "@/lib/medical/utils";

interface AgeCircleProps {
  age: number;
  size?: "sm" | "md" | "lg";
}

export function AgeCircle({ age, size = "md" }: AgeCircleProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm font-medium",
    lg: "w-12 h-12 text-base font-semibold",
  };

  const colorClass = getAgeCircleColor(age);
  const label = getAgeGroupLabel(age);

  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center`} title={`${age} سنة - ${label}`}>
      {age}
    </div>
  );
}
