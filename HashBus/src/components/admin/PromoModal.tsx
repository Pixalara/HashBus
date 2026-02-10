import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button';

interface PromoCode {
  id?: string;
  code: string;
  description: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  min_booking_amount: number;
  max_discount: number | null;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  is_active: boolean;
}

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promo: Omit<PromoCode, 'id' | 'used_count'>) => Promise<void>;
  promo?: PromoCode | null;
}

export const PromoModal: React.FC<PromoModalProps> = ({ isOpen, onClose, onSubmit, promo }) => {
  const [formData, setFormData] = useState<Omit<PromoCode, 'id' | 'used_count'>>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_booking_amount: 0,
    max_discount: null,
    valid_from: '',
    valid_until: '',
    usage_limit: null,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (promo) {
      setFormData({
        code: promo.code,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        min_booking_amount: promo.min_booking_amount,
        max_discount: promo.max_discount,
        valid_from: promo.valid_from.split('T')[0],
        valid_until: promo.valid_until.split('T')[0],
        usage_limit: promo.usage_limit,
        is_active: promo.is_active,
      });
    } else {
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_booking_amount: 0,
        max_discount: null,
        valid_from: '',
        valid_until: '',
        usage_limit: null,
        is_active: true,
      });
    }
  }, [promo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-2xl font-bold text-white">
            {promo ? 'Edit Promo Code' : 'Create Promo Code'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Promo Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors uppercase"
                placeholder="e.g., SUMMER2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Discount Type
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({ ...formData, discount_type: e.target.value as 'flat' | 'percentage' })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Discount Value ({formData.discount_type === 'percentage' ? '%' : '₹'})
              </label>
              <input
                type="number"
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Min Booking Amount
              </label>
              <input
                type="number"
                value={formData.min_booking_amount}
                onChange={(e) =>
                  setFormData({ ...formData, min_booking_amount: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Discount (optional)
              </label>
              <input
                type="number"
                value={formData.max_discount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_discount: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="No limit"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Usage Limit (optional)
              </label>
              <input
                type="number"
                value={formData.usage_limit || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usage_limit: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Unlimited"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Valid From
              </label>
              <input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Valid Until
              </label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              placeholder="Enter promo code description"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-700 rounded focus:ring-amber-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-300">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : promo ? 'Update Promo' : 'Create Promo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
