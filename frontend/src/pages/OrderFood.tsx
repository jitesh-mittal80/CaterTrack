import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { useToast } from '../hooks/use-toast';
import MenuCard from '../components/MenuCard';
import CartPopup from '../components/CartPopup';

const OrderFood = () => {
  const { state, addToCart } = useApp();
  const { toast } = useToast();

  const handleAddToCart = (item: any) => {
    addToCart(item);
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  return (
    <div className="p-6">
      {/* Header with Cart */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Food</h1>
          <p className="text-muted-foreground">Choose from our delicious menu</p>
        </div>
        
        <CartPopup />
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.menuItems.map(item => (
          <MenuCard 
            key={item.id} 
            item={item} 
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* Empty State */}
      {state.menuItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No menu items available</p>
        </div>
      )}
    </div>
  );
};

export default OrderFood;