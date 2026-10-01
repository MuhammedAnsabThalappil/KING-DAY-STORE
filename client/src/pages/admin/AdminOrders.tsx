import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, Eye, CheckCircle, Truck, XCircle, Printer } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { Order, OrderStatus } from '../../types';
import { SEO } from '../../components/SEO';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const res = await fetchApi<{ orders: Order[] }>(`/orders?search=${encodeURIComponent(search)}`);
    if (res.success && res.data) setOrders(res.data.orders);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [search]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const res = await fetchApi(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    if (res.success) {
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Order Pipeline — Admin KING DAY" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Order Pipeline & Fulfillment</h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage customer orders, update shipping status, and view receipts.</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center space-x-2 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by order #, customer name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-slate-400 bg-slate-900/60 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status Update</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-bold text-white">#{o.orderNumber}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{o.customer?.name || 'Guest'}</span>
                      <span className="text-[10px] text-slate-500">{o.customer?.phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-brand-purple"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${o.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {o.paymentMethod} ({o.paymentStatus})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-xl w-full text-slate-100 space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-lg text-white">Order Details</h3>
                <span className="text-xs text-brand-purple font-mono font-bold">#{selectedOrder.orderNumber}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 block uppercase">Customer</span>
                <span className="font-bold text-white block">{selectedOrder.customer?.name}</span>
                <span className="text-slate-400 block">{selectedOrder.customer?.email}</span>
                <span className="text-slate-400 block">{selectedOrder.customer?.phone}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 block uppercase">Shipping Address</span>
                <span className="text-slate-300 block font-medium">
                  {selectedOrder.shippingAddressSnapshot?.addressLine1}, {selectedOrder.shippingAddressSnapshot?.city}, {selectedOrder.shippingAddressSnapshot?.state} - {selectedOrder.shippingAddressSnapshot?.pincode}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Items</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs p-2 bg-slate-950 rounded-lg">
                    <span className="font-bold text-white">{item.productName} × {item.quantity}</span>
                    <span className="font-bold text-white">₹{Number(item.total).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Amount</span>
                <span className="text-xl font-black text-emerald-400">
                  ₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
