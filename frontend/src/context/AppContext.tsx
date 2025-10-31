import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
const env = import.meta.env;
import { apiFetch } from '../lib/api';

// User type
interface User {
  id: string;
  name: string;
  email: string;
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
  status: 'placed' | 'preparing' | 'ready' | 'delivered';
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
  signup: (name: string, email: string, password: string, mobile_no: string)=> Promise<boolean>;
  addToCart: (item: MenuItem) => void;
  decreaseQuantity: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: () => void;
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
    cartCount: 0
  });

  useEffect(() => {
    const API_URL = env.VITE_menu_items_api || `http://localhost:8080/Food_items` ; 
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
    status: (o.status?.toLowerCase() || 'placed') as 'placed' | 'preparing' | 'ready' | 'delivered'
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
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};
const signup = async (
  name: string,
  email: string,
  password: string,
  mobile_no: string
): Promise<boolean> => {
  try {
    const response = await fetch(env.VITE_signup_api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, mobile_no}),
    });

    const data: SignupResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Signup failed');
    }
    const user: User = {
      id: data.user.cust_id,
      name: data.user.name,
      email: data.user.email
    };
    
    
    setState(prev => ({ ...prev, user }));
    loadOrders(user.id);
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
  const addToCart = (item: MenuItem) => {
    setState(prev => {
      const existingItem = prev.cart.find(cartItem => cartItem.id === item.id);
      let newCart;
      
      if (existingItem) {
        newCart = prev.cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        newCart = [...prev.cart, { ...item, quantity: 1 }];
      }
      
      const cartCount = newCart.reduce((total, cartItem) => total + cartItem.quantity, 0);
      
      return { ...prev, cart: newCart, cartCount };
    });
  };

  const decreaseQuantity = (itemId: string) => {
    setState(prev => {
      const newCart = prev.cart.map(cartItem =>
        cartItem.id === itemId && cartItem.quantity > 1
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
      const cartCount = newCart.reduce((total, cartItem) => total + cartItem.quantity, 0);
      return { ...prev, cart: newCart, cartCount };
    });
  };

  const removeFromCart = (itemId: string) => {
    setState(prev => {
      const newCart = prev.cart.filter(item => item.id !== itemId);
      const cartCount = newCart.reduce((total, cartItem) => total + cartItem.quantity, 0);
      return { ...prev, cart: newCart, cartCount };
    });
  };

  const clearCart = () => {
    setState(prev => ({ ...prev, cart: [], cartCount: 0 }));
  };

  const placeOrder = () => {
    if (state.cart.length === 0) return;
    
    const itemNames = state.cart.map(item => item.name);

    const baseMinutes = 20;
    const additionalMinutes = Math.min(state.cartCount * 3, 20);
    const etaMinutes = baseMinutes + additionalMinutes;
    const etaTime = new Date(Date.now() + etaMinutes * 60000);
    const etaString = etaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `NSU${String(state.orders.length + 1).padStart(3, '0')}`,
      items: itemNames,
      itemCount: state.cartCount,
      price: state.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'placed',
      eta: etaString
    };

    setState(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      cart: [],
      cartCount: 0
    }));
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
      placeOrder
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