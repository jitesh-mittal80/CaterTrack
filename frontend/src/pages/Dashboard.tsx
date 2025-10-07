import { TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import OrderCard from '../components/OrderCard';

const Dashboard = () => {
  const { state } = useApp();

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = state.orders.filter(order => order.date === today);
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const weekOrders = state.orders.filter(order => 
    new Date(order.date) >= thisWeekStart
  );

  const recentOrders = state.orders.slice(0, 3);

  return (
    <div className="p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-primary rounded-lg p-6 text-white mb-6 shadow-lg">
        <h1 className="text-2xl font-bold">Welcome to NsutCater, {state.user?.name}!</h1>
        <p className="mt-2 opacity-90">Manage your food orders and track deliveries</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Today's Orders</h3>
              <p className="text-2xl font-bold text-foreground mt-1">{todayOrders.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {todayOrders.length > 0 ? '+2 from yesterday' : 'No orders today'}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">This Week</h3>
              <p className="text-2xl font-bold text-foreground mt-1">{weekOrders.length} orders</p>
              <p className="text-sm text-muted-foreground mt-1">
                {weekOrders.length > 0 ? '+12% from last week' : 'No orders this week'}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Orders</h2>
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="grid gap-4">
            {recentOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;