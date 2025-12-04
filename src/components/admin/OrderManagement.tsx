import { useState, useEffect } from 'react';
import { MessageCircle, Phone, MapPin, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'paid';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  order_type: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  delivery_time: string | null;
  notes: string | null;
  created_at: string;
}

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-500/20 text-amber-600' },
  { value: 'accepted', label: 'Accepted', color: 'bg-blue-500/20 text-blue-600' },
  { value: 'preparing', label: 'Preparing', color: 'bg-primary/20 text-primary' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-500/20 text-purple-600' },
  { value: 'delivered', label: 'Delivered', color: 'bg-veg/20 text-veg' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-destructive/20 text-destructive' },
];

const generateWhatsAppMessage = (order: Order): string => {
  const itemsList = order.items.map(item => `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join('\n');
  
  return encodeURIComponent(
    `🍽️ *Order Update - ${order.order_number}*\n\n` +
    `Hi ${order.customer_name}!\n\n` +
    `Your order:\n${itemsList}\n\n` +
    `Total: ₹${order.total}\n` +
    `Status: ${statusOptions.find(s => s.value === order.status)?.label}\n` +
    `Payment: ${order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}\n\n` +
    `Thank you for ordering from Sharav's Kitchen! 🙏`
  );
};

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
          toast.info('Orders updated');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } else {
      // Cast items from Json to OrderItem[]
      const typedOrders = (data || []).map(order => ({
        ...order,
        items: (order.items as unknown) as OrderItem[],
      }));
      setOrders(typedOrders);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Order marked as ${status.replace('_', ' ')}`);
      fetchOrders();
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update payment status');
    } else {
      toast.success(paymentStatus === 'paid' ? 'Marked as Paid' : 'Marked as Pending');
      fetchOrders();
    }
  };

  const openWhatsApp = (order: Order) => {
    const phone = order.customer_phone.replace(/\D/g, '');
    const message = generateWhatsAppMessage(order);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Filter:</span>
          <Select value={filter} onValueChange={(v) => setFilter(v as OrderStatus | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-muted-foreground">{filteredOrders.length} orders</p>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      {order.order_number}
                      <Badge className={statusOptions.find(s => s.value === order.status)?.color}>
                        {statusOptions.find(s => s.value === order.status)?.label}
                      </Badge>
                      <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'} className={order.payment_status === 'paid' ? 'bg-veg' : ''}>
                        {order.payment_status === 'paid' ? '✓ Paid' : '$ Pending'}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(order.created_at), 'MMM d, h:mm a')}
                      </span>
                      <span className="capitalize">{order.order_type}</span>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => openWhatsApp(order)}
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {order.customer_phone}
                  </div>
                  {order.customer_address && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {order.customer_address}
                    </div>
                  )}
                  {order.delivery_time && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Deliver by: {order.delivery_time}
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax</span>
                        <span>₹{order.tax}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                    📝 {order.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Status:</span>
                    <Select 
                      value={order.status} 
                      onValueChange={(v) => updateOrderStatus(order.id, v as OrderStatus)}
                    >
                      <SelectTrigger className="w-36 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={order.payment_status === 'paid' ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => updatePaymentStatus(order.id, order.payment_status === 'paid' ? 'pending' : 'paid')}
                    >
                      {order.payment_status === 'paid' ? (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Unmark Paid
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Paid
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
