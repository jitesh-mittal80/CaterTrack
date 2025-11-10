import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Console } from 'console';
import { dataTagSymbol } from '@tanstack/react-query';
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
  transaction_id?: number;
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
  token?: string;

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
  token?: string;
  user: {
    cust_id: string;
    name: string;
    email: string;
    password: string;
    mobile_no: string;
  }
}

//Create Account
// interface CreateAccountResponse {
//   success: boolean;
//   message: string;
//   user?: {
//     cust_id: string;
//     name: string;
//     email: string;
//     mobile: string;
//   };
// }



interface AppContextType {
  state: AppState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setAccountDetails: (details: AccountDetails) => void;
  signup: (name: string, email: string, mobile_no: string, password: string) => Promise<boolean>;
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

// const loadOrders = async (userId: string) => {
//   try {
//     const res = await fetch(`${env.VITE_user_history_api}/${userId}`, {
//       headers: { 'Content-Type': 'application/json' }
//     });
//     if (!res.ok) throw new Error('Failed to fetch orders');

//     const data = await res.json();
//     console.log("Order data fetched:", data);

//   const mappedOrders: Order[] = (Array.isArray(data) ? data : []).map((o: any) => {
//   const orderDateStr = (o.order_date || o.order_time || '').replace(/\s*at\s*/i, ' ');
//   const parsedDate = new Date(orderDateStr);
//   const validDate = !isNaN(parsedDate.getTime());

//   const itemsArray = Array.isArray(o.items)
//     ? o.items.map((item: string) => item.trim())
//     : String(o.items || '')
//         .split(',')
//         .map((item: string) => item.trim())
//         .filter(Boolean);
//   const itemCount = parseInt(o.total_items?.replace(/\D/g, '') || String(itemsArray.length));

//   const price = parseFloat(o.total_price?.replace(/[^\d.]/g, '') || '0');

//   return {
//     id: String(o.transaction_id || o.order_id),
//     orderNumber: o.transaction_id || o.cust_id,
//     items: itemsArray,
//     itemCount,
//     price,
//     date: validDate ? parsedDate.toISOString().split('T')[0] : '',
//     time: validDate
//       ? parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//       : '',
//     status: (o.status?.toLowerCase() || 'placed') as 'placed' | 'preparing' | 'ready' | 'delivered'
//   };
// });

//     setState(prev => ({ ...prev, orders: mappedOrders }));
//   } catch (err) {
//     console.error('Failed to load orders:', err);
//   }
// };

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

// const login = async (email: string, password: string): Promise<boolean> => {
//   try {
//     const response = await fetch(env.VITE_login_api, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, password }),
//     });

//     const data: LoginResponse = await response.json();

//     if (!data.success) {
//       throw new Error(data.message || 'Login failed');
//     }
//     localStorage.setItem("auth_token", data.token);

//     const user: User = {
//       id: data.user.cust_id,
//       name: data.user.name,
//       email: data.user.email
//     };

//     setState(prev => ({ ...prev, user }));
//     loadOrders(user.id);
//     return true;
//   } catch (error) {
//     console.error('Login error:', error);
//     return false;
//   }
// };


// const login = async (email: string, password: string): Promise<boolean> => {
//   try {
//     const response = await fetch(env.VITE_login_api || "http://localhost:4000/auth/signin", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await response.json();

//     if (!response.ok || !data.token) throw new Error(data.message || "Login failed");

//     // ✅ Save JWT token in localStorage
//     localStorage.setItem("auth_token", data.token);

//     // ✅ Verify token with /auth/me (optional but ensures clean user data)
//     const verifyRes = await fetch(env.VITE_me_api || "http://localhost:4000/auth/me", {
//       headers: { Authorization: `Bearer ${data.token}` },
//     });

//     const verifyData = await verifyRes.json();

//     if (verifyRes.ok && verifyData.success) {
//       const user: User = {
//         id: verifyData.user.cust_id,
//         name: verifyData.user.name,
//         email: verifyData.user.email,
//       };

//       setState((prev) => ({ ...prev, user }));
//       loadOrders(user.id);
//       loadCart(user.id);
//       return true;
//     } else {
//       throw new Error("Failed to verify user token");
//     }
//   } catch (error) {
//     console.error("Login error:", error);
//     return false;
//   }
// };

const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(env.VITE_login_api || "http://localhost:4000/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok || !data.token) throw new Error(data.message || "Login failed");

    localStorage.setItem("auth_token", data.token);

    const verifyRes = await fetch(env.VITE_me_api || "http://localhost:4000/auth/me", {
      headers: { Authorization: `Bearer ${data.token}` },
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success) throw new Error("Failed to verify user");

    const user: User = {
      id: verifyData.user.cust_id,
      name: verifyData.user.name,
      email: verifyData.user.email,
      mobile: verifyData.user.mobile_no,
    };

    // 🧹 Reset app state before loading new data
    setState({
      user,
      accountDetails: null,
      orders: [],
      menuItems: state.menuItems, // keep cached
      cart: [],
      cartCount: 0,
    });

    await loadOrders(user.id);
    await loadCart(user.id);

    return true;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};




// const signup = async (
//   name: string,
//   email: string,
//   password: string,
//   mobile_no: string
// ): Promise<boolean> => {
//   try {
//     const response = await fetch(env.VITE_signup_api, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, email, password, mobile_no}),
//     });

//     const data: SignupResponse = await response.json();

//     if (!data.success) {
//       throw new Error(data.message || 'Signup failed');
//     }
//     const user: User = {
//       id: data.user.cust_id,
//       name: data.user.name,
//       email: data.user.email
//     };
    
    
//     setState(prev => ({ ...prev, user }));
//     loadOrders(user.id);
//     return true;
//   } catch (error) {
//     console.error('Signup error:', error);
//     return false;
//   }
// };

// const signup = async (
//   name: string,
//   email: string,
//   mobile_no: string,
//   password: string
// ): Promise<boolean> => {
//   try {
//     const response = await fetch(env.VITE_signup_api || 'http://localhost:4000/auth/signup', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, email, mobile_no, password }),
//     });
//     const data: SignupResponse = await response.json();
//     if (!data.success) throw new Error(data.message || 'Account creation failed');
//     console.log(data)
//     if (data.user) {
//       const user: User = {
//         id: data.user.cust_id,
//         name: data.user.name,
//         email: data.user.email,
//         mobile : data.user.mobile_no,
//       };
//       setState(prev => ({ ...prev, user }));
//     }
//     return true;
//   } catch (error) {
//     console.error('Signup error:', error);
//     return false;
//   }
// };

// const signup = async (
//   name: string,
//   email: string,
//   mobile_no: string,
//   password: string
// ): Promise<boolean> => {
//   try {
//     const response = await fetch(env.VITE_signup_api || 'http://localhost:4000/auth/signup', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, email, mobile_no, password }),
//     });

//     const data: SignupResponse = await response.json();

//     if (!data.success) {
//       throw new Error(data.message || 'Account creation failed');
//     }

//     // 🧠 Store JWT token in localStorage (for future auto-login)
//     if (data.token) {
//       localStorage.setItem('auth_token', data.token);
//     }

//     // 🧍‍♂️ Set user state immediately
//     if (data.user) {
//       const user: User = {
//         id: data.user.cust_id,
//         name: data.user.name,
//         email: data.user.email,
//         mobile: data.user.mobile_no,
//       };
//       setState(prev => ({ ...prev, user }));
//       if (data.user) {
//         loadCart(data.user.cust_id);
//       }
//     }

//     return true;
//   } catch (error) {
//     console.error('Signup error:', error);
//     return false;
//   }
// };
const signup = async (
  name: string,
  email: string,
  mobile_no: string,
  password: string
): Promise<boolean> => {
  try {
    const response = await fetch(env.VITE_signup_api || "http://localhost:4000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile_no, password }),
    });

    const data: SignupResponse = await response.json();
    if (!data.success) throw new Error(data.message || "Signup failed");

    if (data.token) localStorage.setItem("auth_token", data.token);

    const user: User = {
      id: data.user.cust_id,
      name: data.user.name,
      email: data.user.email,
      mobile: data.user.mobile_no,
    };

    // 🧹 Reset previous session data
    setState({
      user,
      accountDetails: null,
      orders: [],
      menuItems: state.menuItems, // keep menu cached
      cart: [],
      cartCount: 0,
    });

    await loadOrders(user.id);
    await loadCart(user.id);

    return true;
  } catch (error) {
    console.error("Signup error:", error);
    return false;
  }
};

  const logout = () => {
    localStorage.removeItem('auth_token');
    setState(prev => ({ ...prev, user: null, accountDetails: null, cart: [], cartCount: 0 }));
  };
  const loadCart = async (userId: string) => {
    try {
      const response = await fetch(`${env.VITE_API_URL || 'http://localhost:4000'}/cart/getCart/${userId}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      const items: CartItem[] = (data.items || []).map((item: any) => ({
        id: String(item.food_id),
        name: item.food_name,
        price: Number(item.price),
        rating: 0,
        image: '/placeholder.svg',
        category: 'General',
        quantity: Number(item.qty),
        transaction_id: item.transaction_id
      }));

      const cartCount = items.reduce((total, item) => total + item.quantity, 0);
      setState(prev => ({ ...prev, cart: items, cartCount }));
    } catch (error) {
      console.error('Error loading cart:', error);
      setState(prev => ({ ...prev, cart: [], cartCount: 0 }));
    }
  };

//   useEffect(() => {
//   const checkAuth = async () => {
//     const token = localStorage.getItem("auth_token");
//     if (!token) return;

//     try {
//       const res = await fetch(env.VITE_me_api || "http://localhost:4000/auth/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();

//       if (res.ok && data.success) {
//         const user: User = {
//           id: data.user.cust_id,
//           name: data.user.name,
//           email: data.user.email,
//           mobile: data.user.mobile_no,
//         };
//         setState(prev => ({ ...prev, user }));
//         loadOrders(user.id);
//         loadCart(user.id);
//       } else {
//         localStorage.removeItem("auth_token");
//       }
//     } catch (err) {
//       console.error("Auth check failed:", err);
//       localStorage.removeItem("auth_token");
//     }
//   };

//   checkAuth();
// }, []);
const [authLoading, setAuthLoading] = useState(true);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch(env.VITE_me_api || "http://localhost:4000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const user: User = {
          id: data.user.cust_id,
          name: data.user.name,
          email: data.user.email,
          mobile: data.user.mobile_no,
        };
        setState(prev => ({ ...prev, user }));
        await Promise.all([loadOrders(user.id), loadCart(user.id)]);
      } else {
        localStorage.removeItem("auth_token");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      localStorage.removeItem("auth_token");
    } finally {
      setAuthLoading(false);
    }
  };

  checkAuth();
}, []);


  const setAccountDetails = (details: AccountDetails) => {
    setState(prev => ({ ...prev, accountDetails: details }));
  };

  // const signup = async (accountData: AccountDetails & { password: string }): Promise<boolean> => {
  //   try {
  //     const response = await fetch(env.VITE_signup_api || 'http://localhost:4000/auth/signup', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         name: accountData.name,
  //         email: accountData.email,
  //         mobile: accountData.mobile,
  //         password: accountData.password
  //       }),
  //     });
  
  //     const data: CreateAccountResponse = await response.json();
  
  //     if (!data.success) {
  //       throw new Error(data.message || 'Account creation failed');
  //     }
  
  //     if (data.user) {
  //       const user: User = {
  //         id: data.user.cust_id,
  //         name: data.user.name,
  //         email: data.user.email
  //       };
  //       setState(prev => ({ ...prev, user }));
  //     }
  
  //     return true;
  //   } catch (error) {
  //     console.error('Create account error:', error);
  //     return false;
  //   }
  // };

  const addToCart = async (item: MenuItem) => {
    if (!state.user) {
      console.error("User must be logged in to add items to cart");
      return;
    }

    try {
      const response = await fetch(`${env.VITE_API_URL || 'http://localhost:4000'}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cust_id: state.user.id,
          food_id: item.id,
          qty: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }

      // Reload cart from database
      await loadCart(state.user.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const decreaseQuantity = async (itemId: string) => {
    if (!state.user) {
      console.error("User must be logged in to update cart");
      return;
    }

    const cartItem = state.cart.find(item => item.id === itemId);
    if (!cartItem) return;

    const newQuantity = cartItem.quantity - 1;
    if (newQuantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      // Find transaction_id from cart item (we'll need to store it)
      const response = await fetch(`${env.VITE_API_URL || 'http://localhost:4000'}/cart/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: (cartItem as any).transaction_id,
          food_id: itemId,
          qty: newQuantity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quantity');
      }

      // Reload cart from database
      await loadCart(state.user.id);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!state.user) {
      console.error("User must be logged in to remove items from cart");
      return;
    }

    const cartItem = state.cart.find(item => item.id === itemId);
    if (!cartItem) return;

    try {
      const response = await fetch(`${env.VITE_API_URL || 'http://localhost:4000'}/cart/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: (cartItem as any).transaction_id,
          food_id: itemId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from cart');
      }

      // Reload cart from database
      await loadCart(state.user.id);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = () => {
    setState(prev => ({ ...prev, cart: [], cartCount: 0 }));
  };

  const placeOrder = async () => {
    if (state.cart.length === 0 || !state.user) return;

    try {
      // Get transaction_id from first cart item
      const transaction_id = (state.cart[0] as any).transaction_id;
      if (!transaction_id) {
        throw new Error("No transaction ID found");
      }

      const response = await fetch(`${env.VITE_API_URL || 'http://localhost:4000'}/cart/placeOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id,
          cust_id: state.user.id,
          status: 'Confirmed'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      // Clear cart and reload orders
      setState(prev => ({
        ...prev,
        cart: [],
        cartCount: 0
      }));
      
      await loadOrders(state.user.id);
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  };

  if (authLoading) return null;
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