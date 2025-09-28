import { TrendingUp, TrendingDown, Users, AlertTriangle, Package, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  description?: string;
}

export function KPICard({ title, value, change, changeType, icon: Icon, description }: KPICardProps) {
  const getChangeStyles = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success bg-success/10 border border-success/20';
      case 'negative':
        return 'text-danger bg-danger/10 border border-danger/20';
      default:
        return 'text-muted-foreground bg-muted/10 border border-muted/20';
    }
  };

  const getTrendIcon = () => {
    if (changeType === 'positive') return TrendingUp;
    if (changeType === 'negative') return TrendingDown;
    return null;
  };

  const TrendIcon = getTrendIcon();

  return (
    <div className="kpi-card group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getChangeStyles()}`}>
              {TrendIcon && <TrendIcon className="w-3 h-3 mr-1" />}
              {change}
            </span>
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        </div>
        
        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

export function KPICards() {
  const [kpis, setKpis] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('customers');
    if (saved) {
      const customers = JSON.parse(saved);
      const totalCustomers = customers.length;
      const highRisk = customers.filter(c => c.riskScore === 'High').length;
      const churnRate = totalCustomers > 0 ? (highRisk / totalCustomers * 100).toFixed(1) : 0;
      const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
      const avgValue = totalCustomers > 0 ? (totalRevenue / totalCustomers).toFixed(0) : 0;

      // Mock changes for demo
      const mockChange = () => (Math.random() - 0.5) * 10;

      setKpis([
        {
          title: 'Total Customers',
          value: totalCustomers.toLocaleString(),
          change: `${mockChange().toFixed(1)}%`,
          changeType: 'positive' as const,
          icon: Users,
          description: 'active customers'
        },
        {
          title: 'Churn Rate',
          value: `${churnRate}%`,
          change: `${mockChange().toFixed(1)}%`,
          changeType: highRisk < totalCustomers * 0.1 ? 'positive' : 'negative',
          icon: AlertTriangle,
          description: 'predicted churn'
        },
        {
          title: 'Total Revenue',
          value: `$${(totalRevenue / 1000000).toFixed(1)}M`,
          change: `${mockChange().toFixed(1)}%`,
          changeType: 'positive' as const,
          icon: DollarSign,
          description: 'lifetime value'
        },
        {
          title: 'At-Risk Customers',
          value: highRisk.toString(),
          change: `${mockChange().toFixed(1)}%`,
          changeType: 'negative' as const,
          icon: AlertTriangle,
          description: 'high risk'
        },
        {
          title: 'Avg. Customer Value',
          value: `$${avgValue}`,
          change: `${mockChange().toFixed(1)}%`,
          changeType: 'positive' as const,
          icon: DollarSign,
          description: 'per customer'
        }
      ]);
    } else {
      // Default values if no data
      setKpis([
        {
          title: 'Total Customers',
          value: '0',
          change: '0%',
          changeType: 'neutral' as const,
          icon: Users,
          description: 'no data'
        },
        {
          title: 'Churn Rate',
          value: '0%',
          change: '0%',
          changeType: 'neutral' as const,
          icon: AlertTriangle,
          description: 'no data'
        },
        {
          title: 'Total Revenue',
          value: '$0',
          change: '0%',
          changeType: 'neutral' as const,
          icon: DollarSign,
          description: 'no data'
        },
        {
          title: 'At-Risk Customers',
          value: '0',
          change: '0%',
          changeType: 'neutral' as const,
          icon: AlertTriangle,
          description: 'no data'
        },
        {
          title: 'Avg. Customer Value',
          value: '$0',
          change: '0%',
          changeType: 'neutral' as const,
          icon: DollarSign,
          description: 'no data'
        }
      ]);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}