import React, { useEffect } from 'react';
import { getLiminalStyle, SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastSemantic = 'success' | 'warning' | 'danger' | 'info';

export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  semantic?: ToastSemantic;
  duration?: number;
}

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
};

export function Toast({
  isOpen,
  onClose,
  title,
  description,
  semantic = 'success',
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!isOpen || !duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const toastStyle = getLiminalStyle({
    surfaceLevel: 4,
    isFloating: true,
    elevation: 4,
    isFeatured: true,
  });

  const semKey = semantic.toUpperCase() as keyof typeof LiminalColorEngine.SEMANTICS;
  const sem = LiminalColorEngine.SEMANTICS[semKey];
  const IconComponent = ICONS[semantic];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm p-3.5 sm:p-4 z-50 flex items-center justify-between font-mono text-xs animate-in slide-in-from-bottom-5 duration-200"
      style={{
        ...toastStyle.style,
        borderRadius: `${LiminalLayoutEngine.RADIUS.card}px`,
      }}
    >
      <div className="flex items-center gap-3">
        <IconComponent className="w-4 h-4 shrink-0" style={{ color: sem.solid }} />
        <div>
          <div
            className="font-bold tracking-tight text-xs"
            style={{ color: SpecEngine.getTextStyle('primary', 4).color }}
          >
            {title}
          </div>
          {description && (
            <div
              className="text-[10px] mt-0.5"
              style={getTextStyle('tertiary', 4)}
            >
              {description}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-md transition-opacity hover:opacity-100 opacity-60 cursor-pointer shrink-0 ml-2"
        style={{ color: SpecEngine.getTextStyle('tertiary', 4).color }}
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
