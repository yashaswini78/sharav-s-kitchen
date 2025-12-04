import { useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  UtensilsCrossed, 
  BarChart3, 
  ArrowLeft,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AdminTab = 'customers' | 'orders' | 'menu' | 'analytics';

const tabs = [
  { id: 'customers' as AdminTab, label: 'Customers', icon: Users },
  { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingBag },
  { id: 'menu' as AdminTab, label: 'Menu Management', icon: UtensilsCrossed },
  { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart3 },
];

const statsData = [
  { label: 'Total Orders', value: '1,234', change: '+12%', icon: ShoppingBag, color: 'text-primary' },
  { label: 'Revenue', value: '₹89,540', change: '+8%', icon: DollarSign, color: 'text-accent' },
  { label: 'Avg. Order Time', value: '18 min', change: '-5%', icon: Clock, color: 'text-veg' },
  { label: 'New Customers', value: '156', change: '+23%', icon: TrendingUp, color: 'text-primary' },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Manage orders, menu & analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-semibold">A</span>
              </div>
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-display font-bold text-card-foreground">{stat.value}</p>
                    <p className="text-sm text-veg font-medium">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground hover:bg-secondary border border-border"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display">
              {tabs.find(t => t.id === activeTab)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((order) => (
                  <div
                    key={order}
                    className="flex items-center justify-between p-4 bg-muted rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-semibold">#{order}</span>
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">Order T-00{order}</p>
                        <p className="text-sm text-muted-foreground">3 items • ₹{450 + order * 50}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        order % 3 === 0 ? "bg-veg/20 text-veg" :
                        order % 3 === 1 ? "bg-amber-500/20 text-amber-600" :
                        "bg-primary/20 text-primary"
                      )}>
                        {order % 3 === 0 ? 'Ready' : order % 3 === 1 ? 'Preparing' : 'Pending'}
                      </span>
                      <Button variant="secondary" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Customer management coming soon</p>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="text-center py-12 text-muted-foreground">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Menu management coming soon</p>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
