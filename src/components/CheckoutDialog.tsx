import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, MessageCircle } from 'lucide-react';

const ADMIN_WHATSAPP = '+917022855115';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const { items, orderType, totalPrice, clearCart } = useCart();
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + tax;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryTime: 'asap',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const deliveryTimeOptions = [
    { value: 'asap', label: 'As soon as possible' },
    { value: '30min', label: 'In 30 minutes' },
    { value: '1hour', label: 'In 1 hour' },
    { value: '2hours', label: 'In 2 hours' },
  ];

  const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SK${dateStr}${random}`;
  };

  const formatOrderForWhatsApp = (orderNumber: string) => {
    const itemsList = items
      .map((item) => `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`)
      .join('\n');

    const deliveryLabel = deliveryTimeOptions.find(o => o.value === formData.deliveryTime)?.label || formData.deliveryTime;

    return `🍽️ *New Order - Sharav's Kitchen*
    
📋 *Order #${orderNumber}*

👤 *Customer Details*
Name: ${formData.name}
Phone: ${formData.phone}
${orderType === 'delivery' ? `Address: ${formData.address}` : `Order Type: ${orderType === 'dine-in' ? 'Dine In' : 'Takeaway'}`}

🕐 *Delivery Time*: ${deliveryLabel}

🛒 *Order Items*
${itemsList}

💰 *Bill Summary*
Subtotal: ₹${totalPrice}
Tax (5%): ₹${tax}
*Total: ₹${grandTotal}*

${formData.notes ? `📝 *Notes*: ${formData.notes}` : ''}

Please confirm this order! 🙏`;
  };

  const openWhatsApp = (message: string, phone: string) => {
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (orderType === 'delivery' && !formData.address.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    setLoading(true);

    try {
      const orderNumber = generateOrderNumber();
      const deliveryLabel = deliveryTimeOptions.find(o => o.value === formData.deliveryTime)?.label || formData.deliveryTime;

      // Save order to database
      const { error } = await supabase.from('orders').insert({
        order_number: orderNumber,
        customer_name: formData.name.trim(),
        customer_phone: formData.phone.trim(),
        customer_address: orderType === 'delivery' ? formData.address.trim() : null,
        order_type: orderType,
        delivery_time: deliveryLabel,
        notes: formData.notes.trim() || null,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: totalPrice,
        tax: tax,
        total: grandTotal,
        status: 'pending',
        payment_status: 'pending',
      });

      if (error) throw error;

      // Generate WhatsApp message
      const whatsappMessage = formatOrderForWhatsApp(orderNumber);

      // Open WhatsApp to send to admin
      openWhatsApp(whatsappMessage, ADMIN_WHATSAPP);

      toast.success('Order placed successfully!', {
        description: `Order #${orderNumber} - WhatsApp opened to confirm with admin`,
      });

      // Clear cart and close dialog
      clearCart();
      onOpenChange(false);

      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: '',
        deliveryTime: 'asap',
        notes: '',
      });

    } catch (error: any) {
      console.error('Order error:', error);
      toast.error('Failed to place order', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Complete Your Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Summary */}
          <div className="bg-muted rounded-xl p-3 space-y-2">
            <p className="text-sm font-medium">Order Summary</p>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between font-semibold mt-1">
                <span>Total</span>
                <span className="text-primary">₹{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>

            {orderType === 'delivery' && (
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter complete delivery address"
                  rows={2}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Preferred Delivery Time</Label>
              <Select
                value={formData.deliveryTime}
                onValueChange={(value) => setFormData({ ...formData, deliveryTime: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deliveryTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Special Instructions (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requests or dietary requirements"
                rows={2}
              />
            </div>
          </div>

          {/* WhatsApp Info */}
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>📱 WhatsApp Checkout:</strong> After clicking "Place Order", 
              WhatsApp will open with your order details. Send the message to confirm your order with the admin.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
            Place Order via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};