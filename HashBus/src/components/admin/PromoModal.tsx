import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (promo) {
      const validFrom = promo.valid_from instanceof Date 
        ? promo.valid_from.toISOString().split('T')[0]
        : typeof promo.valid_from === 'string'
        ? promo.valid_from.split('T')[0]
        : '';
      
      const validUntil = promo.valid_until instanceof Date
        ? promo.valid_until.toISOString().split('T')[0]
        : typeof promo.valid_until === 'string'
        ? promo.valid_until.split('T')[0]
        : '';

      setFormData({
        code: promo.code,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        min_booking_amount: promo.min_booking_amount,
        max_discount: promo.max_discount,
        valid_from: validFrom,
        valid_until: validUntil,
        usage_limit: promo.usage_limit,
        is_active: promo.is_active,
      });
      setError(null);
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
      setError(null);
    }
  }, [promo, isOpen]);

  if (!isOpen) return null;

  // ✅ Check if expiry date has passed
  const isExpired = formData.valid_until && new Date(formData.valid_until) < new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // ✅ Validate form data
      if (!formData.code.trim()) {
        throw new Error('Promo code is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (formData.discount_value <= 0) {
        throw new Error('Discount value must be greater than 0');
      }
      if (!formData.valid_from || !formData.valid_until) {
        throw new Error('Valid from and until dates are required');
      }
      
      const validFromDate = new Date(formData.valid_from);
      const validUntilDate = new Date(formData.valid_until);
      
      if (validUntilDate <= validFromDate) {
        throw new Error('Valid until date must be after valid from date');
      }

      // ✅ Auto-deactivate if expired
      const shouldBeActive = formData.is_active && !isExpired;

      await onSubmit({
        ...formData,
        is_active: shouldBeActive,
        valid_from: validFromDate.toISOString(),
        valid_until: validUntilDate.toISOString(),
        // ✅ Set default values for removed fields
        min_booking_amount: 0,
        max_discount: null,
        usage_limit: null,
      });
      onClose();
    } catch (err: any) {
      console.error('❌ Promo submission error:', err);
      setError(err.message || 'Failed to submit promo code');
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

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 m-6 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* ✅ Show warning if expired */}
        {isExpired && (
          <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 p-4 m-6 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>
              This promo code has expired. It will be automatically deactivated when saved.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Promo Code <span className="text-red-400">*</span>
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
                Discount Type <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({ ...formData, discount_type: e.target.value as 'flat' | 'percentage' })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Discount Value ({formData.discount_type === 'percentage' ? '%' : '₹'}) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })
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
                Valid From <span className="text-red-400">*</span>
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
                Valid Until <span className="text-red-400">*</span>
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
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              placeholder="Enter promo code description (e.g., Get 10% off on all bookings)"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active && !isExpired}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked && !isExpired })}
              disabled={isExpired}
              className="w-4 h-4 text-amber-500 bg-slate-800 border-slate-600 rounded focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="is_active" className={`text-sm font-medium ${isExpired ? 'text-slate-500' : 'text-slate-300'}`}>
              {isExpired ? 'Expired - Will be automatically deactivated' : 'Active'}
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