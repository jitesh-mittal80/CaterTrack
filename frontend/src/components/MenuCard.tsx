import { Star, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: string;
}

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const MenuCard = ({ item, onAddToCart }: MenuCardProps) => {
  const { state, decreaseQuantity } = useApp();
  
  // Find if item is in cart and get its quantity
  const cartItem = state.cart.find(cartItem => cartItem.id === item.id);
  const isInCart = !!cartItem;
  const quantity = cartItem?.quantity || 0;

  const handleDecrease = () => {
    decreaseQuantity(item.id);
  };

  const handleIncrease = () => {
    onAddToCart(item);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-md hover:shadow-hover transition-all duration-200 group">
      <div className="aspect-square bg-gradient-card overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground">{item.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">₹{item.price}</span>
          
          {!isInCart ? (
            <Button 
              onClick={() => onAddToCart(item)}
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground min-w-[80px] h-9"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-muted rounded-md p-1 min-w-[80px] h-9">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDecrease}
                className="h-7 w-7 p-0 hover:bg-accent"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="font-medium text-foreground min-w-[1.5rem] text-center text-sm">
                {quantity}
              </span>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleIncrease}
                className="h-7 w-7 p-0 hover:bg-accent"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;