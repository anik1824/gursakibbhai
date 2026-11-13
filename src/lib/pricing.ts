import { DeliveryArea, DeliverySettings } from '../types';

export interface PricedLine {
  price: number;
  quantity: number;
  weight_kg?: number;
  free_delivery?: boolean;
}

// সার্ভারের place_order ফাংশনের সাথে একই নিয়ম
export function calcTotals(lines: PricedLine[], area: DeliveryArea, d: DeliverySettings) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const kg = lines.reduce((s, l) => s + (l.weight_kg ?? 1) * l.quantity, 0);
  const isFree =
    lines.length > 0 &&
    (lines.some((l) => l.free_delivery) ||
      (d.free_min_kg > 0 && kg >= d.free_min_kg) ||
      (d.free_min_amount > 0 && subtotal >= d.free_min_amount));
  const baseFee = area === 'inside_dhaka' ? d.inside_dhaka : d.outside_dhaka;
  const fee = lines.length === 0 || isFree ? 0 : baseFee;
  return { subtotal, kg, isFree, fee, total: subtotal + fee };
}
