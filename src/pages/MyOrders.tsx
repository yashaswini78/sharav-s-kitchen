import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Loader2, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  items: OrderItem[];
  total: number;
  created_at: string;
  order_type: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-amber-500', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-blue-500', icon: Package },
  preparing: { label: 'Preparing', color: 'bg-purple-500', icon: Package },
  ready: { label: 'Ready', color: 'bg-green-500', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'bg-primary', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-destructive', icon: Clock },
};

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('my-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchOrders()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Cast items from Json to OrderItem[]
      const typedOrders = data.map(order => ({
        ...order,
        items: order.items as unknown as OrderItem[],
      })) as Order[];
      setOrders(typedOrders);
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view your orders</h2>
            <p className="text-muted-foreground mb-4">
              Login to see your order history and track current orders.
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-display font-bold">My Orders</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-4">
                Start ordering delicious food from our menu!
              </p>
              <Link to="/">
                <Button>Browse Menu</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                      <Badge variant="outline" className={`${status.color} text-white border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} × {item.quantity}
                          </span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">₹{order.total}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {order.order_type === 'dine-in' ? 'Dine In' : order.order_type === 'takeaway' ? 'Takeaway' : 'Delivery'}
                      </Badge>
                      <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'} className="text-xs">
                        {order.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;