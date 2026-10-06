import React from 'react';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { SpecEngine } from '../../engine/spec-engine';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type AlertSemantic = 'success' | 'warning' | 'danger' | 'info';

export interface AlertProps {
  semantic?: AlertSemantic;
  title?: React.ReactNode;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
};

export function Alert({
  semantic = 'info',
  title,
  children,
  onClose,
  className = '',
}: AlertProps) {
  const semKey = semantic.toUpperCase() as keyof typeof LiminalColorEngine.SEMANTICS;
  const sem = LiminalColorEngine.SEMANTICS[semKey];
  const IconComponent = ICONS[semantic];

  return (
    <div
      role="alert"
      className={`font-mono p-3.5 sm:p-4 flex items-start gap-3 transition-all ${className}`}
      style={{
        backgroundColor: sem.subtle,
        border: `1px solid ${sem.border}`,
        borderRadius: `${LiminalLayoutEngine.RADIUS.card}px`, // 16px card
      }}
    >
      <div className="shrink-0 pt-0.5">
        <IconComponent className="w-4 h-4" style={{ color: sem.solid }} />
      </div>

      <div className="flex-1 text-xs space-y-0.5">
        {title && (
          <div className="font-bold tracking-tight" style={{ color: sem.text }}>
            {title}
          </div>
        )}
        <div
          className="leading-relaxed"
          style={{ color: SpecEngine.getTextStyle('secondary', 1).color }}
        >
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md transition-opacity hover:opacity-100 opacity-60 cursor-pointer shrink-0"
          style={{ color: sem.text }}
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
