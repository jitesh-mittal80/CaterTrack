import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// import { apiFetch } from '../lib/api';
// import { Console } from 'console';
// import { dataTagSymbol } from '@tanstack/react-query';
const env = import.meta.env;
// User type
interface User {
  id: string;
  name: string;
  email: string;
  mobile? : string;
}

// Account details type
interface AccountDetails {
  name: string;
  email: string;
  mobile: string;
}

// Order type
interface Order {
  id: string;
  orderNumber: string;
  items: string[]; // Array of food item names
  itemCount: number; // Total count for display
  price: number;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  eta?: string; // Estimated time of arrival
}

// Menu item type
interface MenuItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: string;
}

// Cart item type
interface CartItem extends MenuItem {
  quantity: number;
}

// App state type
interface AppState {
  user: User | null;
  accountDetails: AccountDetails | null;
  orders: Order[];
  menuItems: MenuItem[];
  cart: CartItem[];
  cartCount: number;
  cartTransactionId?: string | null;
}
//login response type
interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    cust_id: string;
    name: string;
    email: string;
    password: string;
  }
}
//signup response type
interface SignupResponse {
  success: boolean;
  message: string;
  user: {
    cust_id: string;
    name: string;
    email: string;
    password: string;
    mobile_no: string;
  }
}

interface AppContextType {
  state: AppState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setAccountDetails: (details: AccountDetails) => void;
  signup: (name: string, email: string, mobile_no: string, password: string) => Promise<boolean>;
  addToCart: (item: MenuItem) => Promise<void>;
  decreaseQuantity: (itemId: string) => Promise<void>;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

interface OrderApiResponse {
  order_id: number;
  cust_id: string;
  total_items: string;
  items: string;
  total_price: string;
  order_time: string;
  status: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    accountDetails: null,
    orders: [],
    menuItems: [],
    cart: [],
    cartCount: 0,
    cartTransactionId: null
  });

  useEffect(() => {
    const API_URL = env.VITE_menu_items_api || `http://localhost:4000/Food_items` ; 
    const loadMenu = async () => {
      try {
        const res = await fetch(API_URL, { headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data = await res.json();

        const mapped = (Array.isArray(data) ? data : []).map((row: any) => ({
          id: String(row.food_id),
          name: row.food_name,
          price: Number(row.price),
          rating: Number(row.rating ?? 0),
          image: row.Img || '/placeholder.svg',
          category: 'General'
        }));
        setState(prev => ({ ...prev, menuItems: mapped }));
      }
      catch (err) {
        console.error('Failed to load menu:', err);
      }
    };

    loadMenu();
  }, []);

const loadOrders = async (userId: string) => {
  try {
    const res = await fetch(`${env.VITE_user_history_api}/${userId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');

    const data = await res.json();
    console.log("Order data fetched:", data);

    const mappedOrders: Order[] = (Array.isArray(data) ? data : []).map((o: any) => {

      const orderDateStr = (o.order_date || o.order_time || '').replace(/\s*at\s*/i, ' ');
      const parsedDate = new Date(orderDateStr);
      const validDate = !isNaN(parsedDate.getTime());
  
      const itemsArray = Array.isArray(o.items)
        ? o.items.map((item: string) => item.trim())
        : String(o.items || '')
            .split(',')
            .map((item: string) => item.trim())
            .filter(Boolean);
  
      const itemCount = parseInt(o.total_items?.replace(/\D/g, '') || String(itemsArray.length));
      const price = parseFloat(o.total_price?.replace(/[^\d.]/g, '') || '0');
  
      // Normalize to the 4 allowed statuses; default older/unknown to Delivered
      const raw = String(o.status || '').toLowerCase();
      const status: Order['status'] =
        raw === 'pending' ? 'Pending' :
        raw === 'confirmed' ? 'Confirmed' :
        raw === 'delivered' ? 'Delivered' :
        raw === 'cancelled' ? 'Cancelled' :
        'Delivered';
  
      // ETA only for newly placed orders (recent Confirmed)
      let eta: string | undefined;
      if (status === 'Confirmed') {
        const minutesSince = validDate ? (Date.now() - parsedDate.getTime()) / 60000 : 0;
        if (!validDate || minutesSince <= 120) { // treat as "new" within ~2 hours
          const baseMinutes = 20;
          const additionalMinutes = Math.min(itemCount * 3, 20);
          const etaMinutes = baseMinutes + additionalMinutes;
          const baseTime = validDate ? parsedDate : new Date();
          const etaTime = new Date(baseTime.getTime() + etaMinutes * 60000);
          eta = etaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
  
      return {
        id: String(o.transaction_id || o.order_id),
        orderNumber: o.transaction_id || o.cust_id,
        items: itemsArray,
        itemCount,
        price,
        date: validDate ? parsedDate.toISOString().split('T')[0] : '',
        time: validDate
          ? parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        status,
        eta,
      };
    });

    setState(prev => ({ ...prev, orders: mappedOrders }));
 } catch (err) {
    console.error('Failed to load orders:', err);
  }
};

const fetchUserOrders = async (userId: string) => {
  try {
    const response = await fetch(`${env.VITE_user_history_api}/${userId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
 
    console.log("Fetched orders:", response);
  } catch (error) {
    console.error('Error fetching orders:', error);
  }

};

const syncCartFromServer = async (custId: string) => {
  try {
    const { VITE_getCart_api } = import.meta.env as Record<string, string | undefined>;
    if (!VITE_getCart_api) return;

    const base = VITE_getCart_api.endsWith('/') ? VITE_getCart_api : VITE_getCart_api + '/';
    const res = await fetch(`${base}${custId}`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('Failed to load cart');

    const data = await res.json();

    // Support both shapes: array or { items: [...] }
    const rows = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];

    const mapped: CartItem[] = rows.map((item: any) => ({
      id: String(item.food_id),
      name: item.food_name,
      price: Number(item.price),
      rating: Number(item.rating || 0),
      image: item.Img || '/placeholder.svg',
      category: item.category || 'General',
      quantity: Number(item.qty ?? item.quantity ?? 1),
    }));

    const cartCount = mapped.reduce((sum, i) => sum + i.quantity, 0);
    const txnId = rows[0]?.transaction_id || null;

    setState(prev => ({ ...prev, cart: mapped, cartCount, cartTransactionId: txnId }));
  } catch (err) {
    console.error('Failed to fetch cart:', err);
  }
};

const refreshCart = async () => {
  if (state.user?.id) {
    await syncCartFromServer(state.user.id);
  }
};

const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(env.VITE_login_api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    const user: User = {
      id: data.user.cust_id,
      name: data.user.name,
      email: data.user.email
    };

    setState(prev => ({ ...prev, user }));
    loadOrders(user.id);
    await syncCartFromServer(user.id);
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

const signup = async (
  name: string,
  email: string,
  mobile_no: string,
  password: string
): Promise<boolean> => {
  try {
    const response = await fetch(env.VITE_signup_api || 'http://localhost:4000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, mobile_no, password }),
    });
    const data: SignupResponse = await response.json();
    if (!data.success) throw new Error(data.message || 'Account creation failed');
    console.log(data)
    if (data.user) {
      const user: User = {
        id: data.user.cust_id,
        name: data.user.name,
        email: data.user.email,
        mobile : data.user.mobile_no,
      };
      setState(prev => ({ ...prev, user }));
    }
    return true;
  } catch (error) {
    console.error('Signup error:', error);
    return false;
  }

};

  const logout = () => {
    setState(prev => ({ ...prev, user: null, accountDetails: null, cart: [], cartCount: 0 }));
  };

  const setAccountDetails = (details: AccountDetails) => {
    setState(prev => ({ ...prev, accountDetails: details }));
  };

  const addToCart = async (item: MenuItem) => {
    if (!state.user) {
      console.warn('addToCart: User not logged in');
      return;
    }
    setState(prev => {
      const existing = prev.cart.find(ci => ci.id === item.id);
      const newCart = existing
        ? prev.cart.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci)
        : [...prev.cart, { ...item, quantity: 1 }];
      const cartCount = newCart.reduce((t, i) => t + i.quantity, 0);
      return { ...prev, cart: newCart, cartCount };
    });

    try {
      const res = await fetch(env.VITE_addToCart_api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cust_id: state.user.id,
          food_id: item.id,
          qty: 1,
        }),
      });
      const data = await res.json();
      console.log('Added to cart:', data);
      await syncCartFromServer(state.user.id);
    } catch (e) {
      console.error('addToCart error:', e);
    }
  };

  const decreaseQuantity = async (itemId: string) => {
    if (!state.user) return;

    const currentItem = state.cart.find(ci => ci.id === itemId);
    if (!currentItem) return;

    // Prevent going below 1 (your UI already disables at <= 1)
    // if (currentItem.quantity <= 1) return;

    // const newQty = currentItem.quantity - 1;
    if (currentItem.quantity <= 1) {
      await removeFromCart(itemId);
      return;
    }
    
    const newQty = currentItem.quantity - 1;
    

    // Optimistic local update
    setState(prev => {
      const newCart = prev.cart.map(ci =>
        ci.id === itemId ? { ...ci, quantity: newQty } : ci
      );
      const cartCount = newCart.reduce((t, i) => t + i.quantity, 0);
      return { ...prev, cart: newCart, cartCount };
    });

    try {
// Call server only if a transaction exists; otherwise skip gracefully
if (state.cartTransactionId) {
  await fetch(env.VITE_updateOrder_api, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_id: state.cartTransactionId,
      food_id: itemId,
      qty: newQty,
    }),
  });
}

// Re-sync to ensure server and client are consistent
await syncCartFromServer(state.user.id);
} catch (e) {
console.error('decreaseQuantity error:', e);

// Optional: revert optimistic update on failure
await syncCartFromServer(state.user.id);
}
};
  // const removeFromCart = (itemId: string) => {
  //   setState(prev => {
  //     const newCart = prev.cart.filter(item => item.id !== itemId);
  //     const cartCount = newCart.reduce((t, i) => t + i.quantity, 0);
  //     return { ...prev, cart: newCart, cartCount };
  //   });
  // };

  // ...existing code...
interface AppContextType {
  state: AppState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setAccountDetails: (details: AccountDetails) => void;
  signup: (name: string, email: string, mobile_no: string, password: string) => Promise<boolean>;
  addToCart: (item: MenuItem) => Promise<void>;
  decreaseQuantity: (itemId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>; // changed to async
  clearCart: () => void;
  placeOrder: () => Promise<void>;
  refreshCart: () => Promise<void>;
}
const removeFromCart = async (itemId: string) => {
  if (!state.user) return;

  // Optimistic frontend update
  setState(prev => {
    const newCart = prev.cart.filter(item => item.id !== itemId);
    const cartCount = newCart.reduce((t, i) => t + i.quantity, 0);
    return { ...prev, cart: newCart, cartCount };
  });

  try {
    const removeApi = env.VITE_removeFromCart_api;
    if (removeApi && state.cartTransactionId) {
      const res = await fetch(removeApi, {
        method: 'DELETE', // ✅ FIXED
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: state.cartTransactionId,
          food_id: itemId,
        }),
      });

      if (!res.ok) throw new Error('Server failed to remove item');
    }

    await new Promise(res => setTimeout(res, 200));
    await syncCartFromServer(state.user.id);
  } catch (err) {
    console.error('removeFromCart error:', err);
    await syncCartFromServer(state.user.id);
  }
};


//   const removeFromCart = async (itemId: string) => {
//   if (!state.user) return;

//   // --- Optimistic frontend update ---
//   setState(prev => {
//     const newCart = prev.cart.filter(item => item.id !== itemId);
//     const cartCount = newCart.reduce((t, i) => t + i.quantity, 0);
//     return { ...prev, cart: newCart, cartCount };
//   });

//   try {
//     const removeApi =
//       env.VITE_removeFromCart_api ;

//     if (removeApi && state.cartTransactionId) {
//       const res = await fetch(removeApi, {
//         method: 'PUT', // Change to DELETE if your backend expects DELETE
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           transaction_id: state.cartTransactionId,
//           food_id: itemId,
//           qty: 0, // qty 0 means remove
//         }),
//       });

//       if (!res.ok) throw new Error('Server failed to remove item');
//     }

//     // Wait a small delay to ensure backend finishes transaction
//     await new Promise(res => setTimeout(res, 200));

//     // ✅ Now safely re-sync cart after backend deletion
//     await syncCartFromServer(state.user.id);
//   } catch (err) {
//     console.error('removeFromCart error:', err);
//     // Restore the original cart if the deletion fails
//     await syncCartFromServer(state.user.id);
//   }
// };

  const clearCart = () => {
    setState(prev => ({ ...prev, cart: [], cartCount: 0, cartTransactionId: null }));
  };

  // ======================= PLACE ORDER ==========================
  const placeOrder = async () => {
    // if (!state.user || !state.cartTransactionId) return;
    if (!state.user) {
      throw new Error('User not logged in');
    }
    
    if (!state.cartTransactionId) {
      throw new Error('No transaction ID found. Please refresh your cart.');
    }
    
    if (state.cart.length === 0) {
      throw new Error('Cart is empty');
    }
    // try {
    //   const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    //   const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    //   const itemsList = state.cart.map(item => `${item.name} x${item.quantity}`).join(', ');
    //   // const res = await fetch(env.VITE_placeOrder_api, {
    //     const apiUrl = env.VITE_placeOrder_api || 'http://localhost:4000/cart/placeOrder';
    //     const res = await fetch(apiUrl, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       transaction_id: state.cartTransactionId,
    //       cust_id: state.user.id,
    //       status: 'Confirmed',
    //     }),
    //   });
    //   // if (!res.ok) throw new Error('Order placement failed');
    //   if (!res.ok) {
    //     const errorText = await res.text();
    //     console.error('Place order API error:', errorText);
    //     throw new Error(`Order placement failed: ${res.status} ${res.statusText}`);
    //   }
      
    //       // Calculate ETA (20-40 minutes from now based on item count)
    // const baseMinutes = 20;
    // const additionalMinutes = Math.min(state.cartCount * 3, 20);
    // const etaMinutes = baseMinutes + additionalMinutes;
    // const etaTime = new Date(Date.now() + etaMinutes * 60000);
    // const etaString = etaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    //   const responseData = await res.json();
    //   console.log('Order placed successfully:', responseData);
    //   await loadOrders(state.user.id);
    //   await syncCartFromServer(state.user.id);
    //   setState(prev => ({ ...prev, cart: [], cartCount: 0, cartTransactionId: null }));
    //   // console.log('Order placed successfully');
    // } 


    // catch (e) {
    //   console.error('placeOrder error:', e);
    //   throw e; // Re-throw so the caller can handle it
    // }

    try {
      const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
      const itemNames = state.cart.map(item => item.name);
    
      const apiUrl = env.VITE_placeOrder_api || 'http://localhost:4000/cart/placeOrder';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: state.cartTransactionId,
          cust_id: state.user.id,
          status: 'Confirmed',
        }),
      });
    
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Place order API error:', errorText);
        throw new Error(`Order placement failed: ${res.status} ${res.statusText}`);
      }
    
      // Calculate ETA (20–40 minutes from now based on item count)
      const baseMinutes = 20;
      const additionalMinutes = Math.min(state.cartCount * 3, 20);
      const etaMinutes = baseMinutes + additionalMinutes;
      const etaTime = new Date(Date.now() + etaMinutes * 60000);
      const etaString = etaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
      const responseData = await res.json();
      console.log('Order placed successfully:', responseData);
    
      // Optimistic order for immediate UI feedback (will be reconciled on refresh)
      const now = new Date();
      const newOrder: Order = {
        id: String(responseData?.order_id ?? Date.now()),
        orderNumber: String(state.cartTransactionId ?? responseData?.transaction_id ?? ''),
        items: itemNames,
        itemCount: totalItems,
        price: totalPrice,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Confirmed',
        eta: etaString,
      };
    
      setState(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }));
    
      await loadOrders(state.user.id);         // reconcile with backend
      await syncCartFromServer(state.user.id); // clear cart server-side too
      setState(prev => ({ ...prev, cart: [], cartCount: 0, cartTransactionId: null }));
    } catch (e) {
      console.error('placeOrder error:', e);
      throw e;
    }
  };
  return (
    <AppContext.Provider value={{
      state,
      login,
      logout,
      setAccountDetails,
      signup,
      addToCart,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      placeOrder,
      refreshCart
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
