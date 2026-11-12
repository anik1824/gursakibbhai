import React from 'react';
import { X, Trash2, Phone, MessageCircle, Clock, CheckCircle2, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import { CustomerOrder } from '../types';

interface OrderListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
  onUpdateStatus: (orderId: string, status: CustomerOrder['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  onClearAll: () => void;
}

export const OrderListDrawer: React.FC<OrderListDrawerProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateStatus,
  onDeleteOrder,
  onClearAll,
}) => {
  if (!isOpen) return null;

  // Convert numbers to Bengali digits
  const toBengaliNumber = (str: string | number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str
      .toString()
      .replace(/[0-9]/g, (w) => bengaliDigits[parseInt(w, 10)]);
  };

  const getStatusBadge = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 border border-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> অপেক্ষমান (Pending)
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> নিশ্চিত (Confirmed)
          </span>
        );
      case 'shipped':
        return (
          <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Truck className="w-3 h-3" /> কুরিয়ারে পাঠানো (Shipped)
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-green-100 text-green-800 border border-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <PackageCheck className="w-3 h-3" /> সম্পন্ন (Delivered)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-[#FFFDF9] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#DFCBB5]">
        {/* Drawer Header */}
        <div className="p-4 bg-[#78350F] text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold font-bengali-serif text-lg">
              গৃহীত অর্ডারের তালিকা ({toBengaliNumber(orders.length)})
            </h3>
            <p className="text-xs text-amber-200">
              ওয়েবসাইটে কাস্টমারদের দেওয়া অর্ডারের লাইভ ডাটা
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-[#78350F]/70 space-y-2">
              <AlertCircle className="w-10 h-10 mx-auto text-[#B45309]/50" />
              <p className="font-bold text-sm">এখনো কোনো নতুন অর্ডার নেই</p>
              <p className="text-xs max-w-xs mx-auto">
                অর্ডার ফর্ম পূরণ করে 'অর্ডার নিশ্চিত করুন' বাটনে ক্লিক করলে এখানে অর্ডারের রেকর্ড যুক্ত হবে।
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-3.5 rounded-xl border border-[#DFCBB5] shadow-xs space-y-2 text-xs"
              >
                {/* Header: ID, Date & Status */}
                <div className="flex items-center justify-between border-b border-[#F0E3D3] pb-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#92400E]">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      {new Date(ord.createdAt).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>{getStatusBadge(ord.status)}</div>
                </div>

                {/* Customer Details */}
                <div className="space-y-1 text-[#2D180B]">
                  <p className="font-bold text-sm text-[#3D1A07]">
                    {ord.customerName}
                  </p>
                  <p className="text-[#5C2B14] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#B45309]" />
                    <a href={`tel:${ord.customerPhone}`} className="hover:underline font-semibold">
                      {ord.customerPhone}
                    </a>
                  </p>
                  <p className="text-[#78350F]/80">
                    📍 {ord.customerAddress}
                  </p>
                  {ord.note && (
                    <p className="text-[11px] bg-[#FEF3C7] text-[#92400E] p-1.5 rounded-md">
                      নোট: {ord.note}
                    </p>
                  )}
                </div>

                {/* Items & Billing */}
                <div className="bg-[#FBF4E8] p-2 rounded-lg border border-[#EADBCE] flex items-center justify-between">
                  <div>
                    {ord.items && ord.items.length > 0 ? (
                      <span className="font-medium text-[#451A03] block">
                        {ord.items.map((it) => `${it.name} (${toBengaliNumber(it.quantity)})`).join(', ')}
                      </span>
                    ) : ord.selectedPackage ? (
                      <span className="font-medium text-[#451A03] block">
                        {ord.selectedPackage.name}
                      </span>
                    ) : null}
                    <span className="text-[11px] text-[#78350F]/70">
                      ডেলিভারি: {ord.deliveryArea === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'}
                    </span>
                  </div>
                  <span className="font-black text-sm text-[#92400E]">
                    ৳{toBengaliNumber(ord.total)}
                  </span>
                </div>

                {/* Status Selector & Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F0E3D3]">
                  <select
                    value={ord.status}
                    onChange={(e) =>
                      onUpdateStatus(ord.id, e.target.value as CustomerOrder['status'])
                    }
                    className="px-2 py-1 rounded border border-[#DFCBB5] bg-white text-[11px] text-[#5C2B14] font-medium"
                  >
                    <option value="pending">অপেক্ষমান (Pending)</option>
                    <option value="confirmed">নিশ্চিত (Confirmed)</option>
                    <option value="shipped">কুরিয়ারে (Shipped)</option>
                    <option value="delivered">সম্পন্ন (Delivered)</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `আসসালামু আলাইকুম ${ord.customerName}, আপনার অর্ডারটি (${ord.orderNumber}) নিশ্চিত করার জন্য কল করা হয়েছিল...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#25D366]/20 text-[#128C7E] hover:bg-[#25D366]/30"
                      title="WhatsApp মেসেজ"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => onDeleteOrder(ord.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      title="অর্ডার মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {orders.length > 0 && (
          <div className="p-3 bg-[#FAF3E9] border-t border-[#DFCBB5] flex justify-between items-center text-xs">
            <span className="text-[#78350F]/70">
              সর্বমোট: <strong>{toBengaliNumber(orders.length)}</strong> টি অর্ডার
            </span>
            <button
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              সব অর্ডার ক্লিয়ার করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
