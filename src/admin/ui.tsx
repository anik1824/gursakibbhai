import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { OrderStatus } from '../types';
import { uploadImage } from '../lib/supabase';
import { errorMessage } from '../lib/format';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

// ---------- Toast ----------
type Toast = { id: number; kind: 'success' | 'error'; text: string };
const ToastCtx = createContext<(kind: Toast['kind'], text: string) => void>(() => undefined);
export const useToast = () => useContext(ToastCtx);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] space-y-2 sm:w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              'px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white',
              t.kind === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

// ---------- Basic controls ----------
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'yellow';
const btnStyles: Record<BtnVariant, string> = {
  primary: 'bg-[#0B6B47] hover:bg-[#095a3b] text-white',
  secondary: 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'hover:bg-gray-100 text-gray-700',
  yellow: 'bg-[#FCD34D] hover:bg-[#FBBF24] text-[#3b2a00]',
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean; size?: 'sm' | 'md' }
> = ({ variant = 'primary', loading, size = 'md', className, children, disabled, ...rest }) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={cx(
      'inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm',
      btnStyles[variant],
      className
    )}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

const fieldCls =
  'w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B6B47]/40 focus:border-[#0B6B47]';

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode; className?: string }> = ({
  label,
  hint,
  children,
  className,
}) => (
  <label className={cx('block', className)}>
    <span className="block text-xs font-semibold text-gray-700 mb-1">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-gray-500 mt-1">{hint}</span>}
  </label>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} {...p} className={cx(fieldCls, className)} />
));

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...p }) => (
  <textarea {...p} className={cx(fieldCls, className)} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, ...p }) => (
  <select {...p} className={cx(fieldCls, className)} />
);

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="inline-flex items-center gap-2 cursor-pointer select-none"
    role="switch"
    aria-checked={checked}
  >
    <span className={cx('w-10 h-6 rounded-full p-0.5 transition-colors', checked ? 'bg-[#0B6B47]' : 'bg-gray-300')}>
      <span className={cx('block w-5 h-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-4')} />
    </span>
    {label && <span className="text-sm text-gray-700">{label}</span>}
  </button>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; accent?: string }> = ({ children, className, accent }) => (
  <div
    className={cx('bg-white rounded-2xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]', className)}
    style={accent ? { borderTop: `3px solid ${accent}` } : undefined}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
    <div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const PageTitle: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {right && <div className="flex items-center gap-2 flex-wrap">{right}</div>}
  </div>
);

export const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean; footer?: React.ReactNode }> = ({
  open,
  onClose,
  title,
  children,
  wide,
  footer,
}) => {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={cx('bg-white w-full rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer" aria-label="বন্ধ করুন">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 flex-wrap">{footer}</div>}
      </div>
    </div>
  );
};

export const Empty: React.FC<{ text: string }> = ({ text }) => <div className="py-14 text-center text-sm text-gray-500">{text}</div>;

export const Spinner: React.FC = () => (
  <div className="py-14 flex justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-[#0B6B47]" />
  </div>
);

// ---------- Status ----------
export const STATUS: Record<OrderStatus, { label: string; cls: string; color: string }> = {
  pending: { label: 'পেন্ডিং', cls: 'bg-amber-100 text-amber-800', color: '#F59E0B' },
  confirmed: { label: 'কনফার্মড', cls: 'bg-emerald-100 text-emerald-800', color: '#0B8A5A' },
  shipped: { label: 'শিপড', cls: 'bg-violet-100 text-violet-800', color: '#8B5CF6' },
  delivered: { label: 'ডেলিভারড', cls: 'bg-sky-100 text-sky-800', color: '#0EA5E9' },
  cancelled: { label: 'বাতিল', cls: 'bg-red-100 text-red-700', color: '#EF4444' },
};
export const STATUS_KEYS = Object.keys(STATUS) as OrderStatus[];

export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span className={cx('inline-block px-2.5 py-0.5 rounded-full text-xs font-bold', STATUS[status].cls)}>{STATUS[status].label}</span>
);

// ---------- Image upload ----------
export const ImageInput: React.FC<{ value: string; onChange: (url: string) => void; folder: string; label?: string }> = ({
  value,
  onChange,
  folder,
  label = 'ছবি',
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const onFile = async (f?: File) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast('error', 'ছবির সাইজ ৫MB এর কম হতে হবে');
      return;
    }
    setBusy(true);
    try {
      onChange(await uploadImage(f, folder));
    } catch (e) {
      toast('error', errorMessage(e));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div>
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#0B6B47] bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
        >
          {busy ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          ) : value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-6 h-6 text-gray-400" />
          )}
        </button>
        <div className="flex-1 min-w-0 space-y-1.5">
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="ছবি আপলোড করুন বা লিংক দিন" />
          <p className="text-[11px] text-gray-500">বক্সে ক্লিক করে ছবি আপলোড করুন (সর্বোচ্চ ৫MB)</p>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
};

export const ListEditor: React.FC<{ value: string[]; onChange: (v: string[]) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <div className="space-y-2">
    {value.map((v, i) => (
      <div key={i} className="flex gap-2">
        <Input value={v} placeholder={placeholder} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
        <Button type="button" variant="secondary" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="মুছুন">
          <X className="w-4 h-4" />
        </Button>
      </div>
    ))}
    <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...value, ''])}>
      + নতুন যোগ করুন
    </Button>
  </div>
);
