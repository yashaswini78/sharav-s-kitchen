import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  avgOrderValue: number;
}

export const AdminAnalytics = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total, status, payment_status');

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.payment_status === 'paid' ? Number(o.total) : 0), 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing').length || 0;
    const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      avgOrderValue,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load analytics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="text-3xl font-display font-bold">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue (Paid)</p>
                <p className="text-3xl font-display font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-veg/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-veg" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                <p className="text-3xl font-display font-bold">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Delivered</p>
                <p className="text-3xl font-display font-bold">{stats.deliveredOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-3xl font-bold text-primary">₹{stats.avgOrderValue.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground mt-1">Avg. Order Value</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-3xl font-bold text-veg">
                {stats.totalOrders > 0 ? ((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(0) : 0}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Completion Rate</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-3xl font-bold text-accent">
                {stats.totalOrders > 0 ? ((stats.pendingOrders / stats.totalOrders) * 100).toFixed(0) : 0}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">In Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-8 text-muted-foreground">
        <p>📊 More detailed analytics coming soon!</p>
        <p className="text-sm">Charts, trends, and customer insights</p>
      </div>
    </div>
  );
};
