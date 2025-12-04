import { useState } from 'react';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  BarChart3, 
  ArrowLeft,
  CalendarDays,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DishManagement } from '@/components/admin/DishManagement';
import { OrderManagement } from '@/components/admin/OrderManagement';
import { DailyMenuControl } from '@/components/admin/DailyMenuControl';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { useAuth } from '@/hooks/useAuth';

type AdminTab = 'orders' | 'menu' | 'daily' | 'analytics';

const tabs = [
  { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingBag },
  { id: 'menu' as AdminTab, label: 'Menu Management', icon: UtensilsCrossed },
  { id: 'daily' as AdminTab, label: 'Daily Menu', icon: CalendarDays },
  { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart3 },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium">{user?.email?.split('@')[0] || 'Admin'}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
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
        <div className="mt-6">
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'menu' && <DishManagement />}
          {activeTab === 'daily' && <DailyMenuControl />}
          {activeTab === 'analytics' && <AdminAnalytics />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
