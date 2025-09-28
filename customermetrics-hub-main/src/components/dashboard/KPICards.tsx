import { TrendingUp, TrendingDown, Users, AlertTriangle, Package, DollarSign } from 'lucide-react';

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
  const kpis = [
    {
      title: 'Total Customers',
      value: '12,847',
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'vs last month'
    },
    {
      title: 'Churn Rate',
      value: '8.3%',
      change: '-1.1%',
      changeType: 'positive' as const,
      icon: AlertTriangle,
      description: 'vs last month'
    },
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'this quarter'
    },
    {
      title: 'At-Risk Customers',
      value: '1,067',
      change: '+3.2%',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      description: 'high churn risk'
    },
    {
      title: 'Top Products',
      value: '247',
      change: '+8.1%',
      changeType: 'positive' as const,
      icon: Package,
      description: 'active products'
    },
    {
      title: 'Avg. Customer Value',
      value: '$187',
      change: '+2.3%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'per customer'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}