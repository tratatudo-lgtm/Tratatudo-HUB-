import React from 'react';
import { cn } from '../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("p-6 bg-white border border-zinc-200 rounded-xl shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        <div className="p-2 bg-zinc-50 rounded-lg">
          <Icon className="w-5 h-5 text-zinc-600" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
          {trend && (
            <p className={cn(
              "text-xs font-medium mt-1",
              trend.positive ? "text-emerald-600" : "text-red-600"
            )}>
              {trend.positive ? '+' : ''}{trend.value} face ao mês anterior
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
