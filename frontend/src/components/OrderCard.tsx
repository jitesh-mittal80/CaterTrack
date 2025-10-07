interface Order {
  id: string;
  orderNumber: string;
  items: string[];
  itemCount: number;
  price: number;
  date: string;
  time: string;
  status: 'placed' | 'preparing' | 'ready' | 'delivered';
}

interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-status-preparing text-white';
      case 'placed': return 'bg-status-placed text-white';
      case 'ready': return 'bg-status-ready text-white';
      case 'delivered': return 'bg-status-delivered text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-md hover:shadow-hover transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
          <p className="text-sm text-muted-foreground">
            {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-foreground font-medium">Items:</p>
        <p className="text-sm text-muted-foreground">{order.items.join(', ')}</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg text-foreground">₹{order.price.toFixed(0)}</p>
          <p className="text-sm text-muted-foreground">{order.date} at {order.time}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;