import React, { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, PlusCircle, MinusCircle, History } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { SEO } from '../../components/SEO';

import { useToast } from '../../contexts/ToastContext';

export const AdminInventory: React.FC = () => {
  const { toast } = useToast();
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock Adjustment Form Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustType, setAdjustType] = useState<'PURCHASE' | 'DAMAGE' | 'RETURN' | 'ADJUSTMENT'>('PURCHASE');
  const [adjustQty, setAdjustQty] = useState(5);
  const [adjustNote, setAdjustNote] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [invRes, txRes] = await Promise.all([
      fetchApi<any>('/inventory'),
      fetchApi<any[]>('/inventory/transactions')
    ]);

    if (invRes.success && invRes.data) {
      setInventoryData(invRes.data);
      // Check for low stock or out of stock items
      invRes.data.inventories?.forEach((inv: any) => {
        if (inv.availableQuantity <= 0) {
          toast.error(`Product "${inv.product?.name || 'Item'}" is out of stock`);
        } else if (inv.availableQuantity <= (inv.lowStockThreshold || 3)) {
          toast.warning(`Low stock: ${inv.availableQuantity} units remaining`);
        }
      });
    }
    if (txRes.success && txRes.data) setTransactions(txRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const res = await fetchApi('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({
        productId: selectedProductId,
        type: adjustType,
        quantity: Number(adjustQty),
        note: adjustNote || `Manual ${adjustType} stock update`
      })
    });

    if (res.success) {
      toast.success('Inventory updated successfully');
      setAdjustModalOpen(false);
      setAdjustNote('');
      loadData();
    } else {
      toast.error('Failed to adjust inventory stock.');
    }
  };

  return (
    <div className="space-y-8">
      <SEO title="Inventory & Stock Control — Admin KING DAY" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Inventory Control & Audit Trail</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Monitor real-time stock levels, reserve allocations, and transactional audit history.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProductId(inventoryData?.inventories?.[0]?.productId || '');
            setAdjustModalOpen(true);
          }}
          className="px-4 py-2.5 bg-brand-purple text-white font-bold text-xs rounded-xl hover:bg-brand-pink transition-all shadow-brand-glow flex items-center space-x-2 min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Adjust Stock Levels</span>
        </button>
      </div>

      {/* Stock Overview Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <h3 className="font-extrabold text-sm uppercase text-slate-400 flex items-center space-x-2">
          <Boxes className="w-4 h-4 text-brand-purple" />
          <span>Stock Summary by Product</span>
        </h3>

        {loading ? (
          <div className="text-slate-400 text-xs py-4">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-slate-400 bg-slate-900/60 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Total Stock</th>
                  <th className="py-3 px-4">Reserved</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 font-medium">
                {inventoryData?.inventories?.map((inv: any) => {
                  const isLow = inv.availableQuantity <= inv.lowStockThreshold;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-bold text-white">{inv.product?.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{inv.product?.sku}</td>
                      <td className="py-3 px-4 text-white font-bold">{inv.quantity}</td>
                      <td className="py-3 px-4 text-amber-400 font-bold">{inv.reservedQuantity}</td>
                      <td className="py-3 px-4 text-emerald-400 font-extrabold">{inv.availableQuantity}</td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-red-500/20 text-red-400">
                            Low Stock Alert (≤{inv.lowStockThreshold})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/20 text-emerald-400">
                            Sufficient Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Log Audit Trail */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
        <h3 className="font-extrabold text-sm uppercase text-slate-400 flex items-center space-x-2">
          <History className="w-4 h-4 text-brand-pink" />
          <span>Inventory Transaction History Log</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="uppercase text-slate-400 bg-slate-900/60 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4">Qty Changed</th>
                <th className="py-3 px-4">Previous → New</th>
                <th className="py-3 px-4">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300 font-medium">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(tx.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{tx.product?.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full font-extrabold text-[10px] bg-brand-purple/20 text-brand-purple">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{tx.quantity}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {tx.previousQuantity} → <strong className="text-white">{tx.newQuantity}</strong>
                  </td>
                  <td className="py-3 px-4 text-slate-400 italic max-w-xs truncate">
                    {tx.note || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 space-y-4">
            <h3 className="font-extrabold text-base border-b border-slate-800 pb-3">
              Stock Level Adjustment
            </h3>

            <form onSubmit={handleStockAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Select Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="form-input-dark"
                >
                  {inventoryData?.inventories?.map((inv: any) => (
                    <option key={inv.productId} value={inv.productId} className="bg-slate-900 text-white">
                      {inv.product?.name} ({inv.product?.sku}) — Avail: {inv.availableQuantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Adjustment Type *</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="form-input-dark"
                  >
                    <option value="PURCHASE" className="bg-slate-900 text-white">PURCHASE (Stock In +)</option>
                    <option value="RETURN" className="bg-slate-900 text-white">RETURN (Stock In +)</option>
                    <option value="DAMAGE" className="bg-slate-900 text-white">DAMAGE (Stock Out -)</option>
                    <option value="ADJUSTMENT" className="bg-slate-900 text-white">ADJUSTMENT (Stock Out -)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value, 10))}
                    className="form-input-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Audit Note / Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Received new shipment batch #4"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="form-input-dark"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold hover:shadow-brand-glow transition-all min-h-[44px]"
                >
                  Execute Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
