import { History, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import OrderCard from '../components/OrderCard';

const OrderHistory = () => {
  const { state } = useApp();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <History className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order History</h1>
          <p className="text-muted-foreground">View all your past orders</p>
        </div>
      </div>

      {/* Orders List */}
      {state.orders.length > 0 ? (
        <div className="grid gap-4">
          {state.orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground">
            When you place orders, they will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;