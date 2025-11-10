// import { useState } from 'react';
// import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
// import { Button } from './ui/button';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
// import { useApp } from '../context/AppContext';
// import { useToast } from '../hooks/use-toast';

// const CartPopup = () => {
//   const { state, addToCart, decreaseQuantity, removeFromCart, placeOrder } = useApp();
//   const { toast } = useToast();
//   const [isOpen, setIsOpen] = useState(false);
//   const [isOrdering, setIsOrdering] = useState(false);

//   const handleQuantityIncrease = (item: any) => {
//     addToCart(item);
//   };

//   const handleQuantityDecrease = (itemId: string) => {
//     decreaseQuantity(itemId);
//   };

//   const handleRemoveItem = (itemId: string) => {
//     removeFromCart(itemId);
//   };

//   // const handlePlaceOrder = async () => {
//   //   if (state.cart.length === 0) {
//   //     toast({
//   //       title: "Cart is empty",
//   //       description: "Please add items to cart before placing an order.",
//   //       variant: "destructive",
//   //     });
//   //     return;
//   //   }

//   //   setIsOrdering(true);
//   //   try {
//   //     // Simulate API call
//   //     await new Promise(resolve => setTimeout(resolve, 1000));
//   //     placeOrder();
//   //     setIsOpen(false);
//   //     toast({
//   //       title: "Order placed successfully!",
//   //       description: "Your order has been submitted and is being prepared.",
//   //     });
//   //   } catch (error) {
//   //     toast({
//   //       title: "Error",
//   //       description: "Failed to place order. Please try again.",
//   //       variant: "destructive",
//   //     });
//   //   } finally {
//   //     setIsOrdering(false);
//   //   }
//   // };
//   const handlePlaceOrder = async () => {
//     if (state.cart.length === 0) {
//       toast({
//         title: "Cart is empty",
//         description: "Please add items to cart before placing an order.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsOrdering(true);
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       placeOrder();
//       setIsOpen(false);
//       toast({
//         title: "Order placed successfully!",
//         description: "Your order has been submitted and is being prepared.",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to place order. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsOrdering(false);
//     }
//   };

//   const totalPrice = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button 
//           className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
//           disabled={state.cartCount === 0}
//         >
//           <ShoppingCart className="h-4 w-4 mr-2" />
//           Cart ({state.cartCount})
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <ShoppingCart className="h-5 w-5" />
//             Your Cart
//           </DialogTitle>
//         </DialogHeader>
        
//         <div className="flex-1 overflow-y-auto pr-2">
//           {state.cart.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-muted-foreground">Your cart is empty</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {state.cart.map((item) => (
//                 <div key={item.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
//                   <div className="flex-1">
//                     <h4 className="font-medium text-foreground">{item.name}</h4>
//                     <p className="text-sm text-muted-foreground">₹{item.price} each</p>
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => handleQuantityDecrease(item.id)}
//                       className="h-8 w-8 p-0"
//                       disabled={item.quantity <= 1}
//                     >
//                       <Minus className="h-3 w-3" />
//                     </Button>
                    
//                     <span className="font-medium min-w-[2rem] text-center">
//                       {item.quantity}
//                     </span>
                    
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => handleQuantityIncrease(item)}
//                       className="h-8 w-8 p-0"
//                     >
//                       <Plus className="h-3 w-3" />
//                     </Button>
//                   </div>
                  
//                   <div className="text-right">
//                     <p className="font-bold text-primary mb-1">
//                       ₹{(item.price * item.quantity).toFixed(0)}
//                     </p>
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       onClick={() => handleRemoveItem(item.id)}
//                       className="h-6 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
//                     >
//                       <X className="h-3 w-3 mr-1" />
//                       Remove
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
        
//         {state.cart.length > 0 && (
//           <div className="border-t pt-4 mt-4">
//             <div className="flex justify-between items-center mb-4">
//               <span className="text-lg font-bold">Total:</span>
//               <span className="text-lg font-bold text-primary">₹{totalPrice.toFixed(0)}</span>
//             </div>
            
//             <Button 
//               onClick={handlePlaceOrder}
//               disabled={isOrdering}
//               className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3"
//               size="lg"
//             >
//               {isOrdering ? 'Placing Order...' : 'Place Order'}
//             </Button>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CartPopup;


import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useApp } from '../context/AppContext';
import { useToast } from '../hooks/use-toast';

const CartPopup = () => {
  const { state, addToCart, decreaseQuantity, removeFromCart, placeOrder, refreshCart } = useApp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityIncrease = async (item: any) => {
    await addToCart(item);
  };

  const handleQuantityDecrease = async (itemId: string) => {
    await decreaseQuantity(itemId);
  };

  // const handleRemoveItem = (itemId: string) => {
  //   removeFromCart(itemId);
  // };

    const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast({
        title: "Removed",
        description: "Item removed from your cart.",
      });
    } catch (err) {
      console.error('Remove item failed', err);
      toast({
        title: "Error",
        description: "Failed to remove item. Try again.",
        variant: "destructive",
      });
    }
  };
  const handlePlaceOrder = async () => {
    if (state.cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    setIsOrdering(true);
    try {
      await placeOrder();
      setIsOpen(false);
      toast({
        title: "Order placed successfully!",
        description: "Your order has been placed and is being prepared.",
      });
    } catch (error: any) {
      console.error('Place order error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const totalPrice = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // --- Fetch cart when dialog opens ---
  useEffect(() => {
    const fetchCart = async () => {
      if (!state.user) return; // don't call API if not logged in
      setIsLoading(true);
      try {
        await refreshCart(); // this calls syncCartFromServer in AppContext
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCart();
    }
    // run when open state changes or user changes
  }, [isOpen, state.user, refreshCart, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
          disabled={state.cartCount === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart ({state.cartCount})
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
           {/* {isLoading && state.cart.length > 0 && (
               <RefreshCw className="h-4 w-4 ml-2 animate-spin text-muted-foreground" />
                            )} */}
            {/* inline refresh button */}
            {/* <Button
              size="sm"
              variant="ghost"
              onClick={async (e) => {
                e.stopPropagation();
                if (!state.user) {
                  toast({ title: "Not logged in", description: "Please login to view cart." });
                  return;
                }
                setIsLoading(true);
                try {
                  await refreshCart();
                } catch (err) {
                  console.error(err);
                  toast({ title: "Refresh failed", description: "Unable to refresh cart." , variant: "destructive" });
                } finally {
                  setIsLoading(false);
                }
              }}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button> */}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading && state.cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cart Is empty</p>
            </div>
          ) : state.cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityDecrease(item.id)}
                      className="h-8 w-8 p-0"
                      disabled={item.quantity <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <span className="font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityIncrease(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary mb-1">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-6 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.cart.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-lg font-bold text-primary">₹{totalPrice.toFixed(0)}</span>
            </div>

            <Button 
              onClick={handlePlaceOrder}
              disabled={isOrdering}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3"
              size="lg"
            >
              {isOrdering ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartPopup;
