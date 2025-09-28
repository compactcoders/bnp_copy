import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

// Churn Distribution Data
const churnDistributionData = [
  { name: 'Low Risk', value: 65, count: 8350, color: '#10b981' },
  { name: 'Medium Risk', value: 25, count: 3212, color: '#f59e0b' },
  { name: 'High Risk', value: 10, count: 1285, color: '#ef4444' }
];

// Feature Importance Data
const featureImportanceData = [
  { feature: 'Recency', importance: 0.25, description: 'Days since last purchase' },
  { feature: 'Frequency', importance: 0.22, description: 'Purchase frequency' },
  { feature: 'Monetary', importance: 0.20, description: 'Total spent' },
  { feature: 'Tenure', importance: 0.15, description: 'Months as customer' },
  { feature: 'Support Tickets', importance: 0.12, description: 'Number of complaints' },
  { feature: 'Cancellations', importance: 0.06, description: 'Previous cancellations' }
];

// Sales Forecast Data
const salesForecastData = [
  { month: 'Jan', historical: 2400000, predicted: 2520000 },
  { month: 'Feb', historical: 2100000, predicted: 2350000 },
  { month: 'Mar', historical: 2800000, predicted: 2650000 },
  { month: 'Apr', historical: 2600000, predicted: 2800000 },
  { month: 'May', historical: 3200000, predicted: 3100000 },
  { month: 'Jun', historical: 2900000, predicted: 3300000 },
  { month: 'Jul', historical: null, predicted: 3500000 },
  { month: 'Aug', historical: null, predicted: 3200000 },
  { month: 'Sep', historical: null, predicted: 3400000 },
];

// NPS Trend Data
const npsTrendData = [
  { month: 'Jan', nps: 42, sentiment: 65 },
  { month: 'Feb', nps: 38, sentiment: 58 },
  { month: 'Mar', nps: 45, sentiment: 72 },
  { month: 'Apr', nps: 52, sentiment: 78 },
  { month: 'May', nps: 48, sentiment: 75 },
  { month: 'Jun', nps: 55, sentiment: 82 }
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-popover-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name.includes('$') 
              ? `$${entry.value.toLocaleString()}` 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ChurnDistributionChart() {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-foreground mb-2">Customer Risk Distribution</h3>
      <p className="text-sm text-muted-foreground mb-6">Breakdown of customers by churn risk level</p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={churnDistributionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {churnDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              content={({ payload }) => {
                if (payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium text-popover-foreground">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.count.toLocaleString()} customers</p>
                      <p className="text-sm text-muted-foreground">{data.value}% of total</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {churnDistributionData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium text-foreground">{item.name}</span>
            </div>
            <span className="text-lg font-bold text-foreground">{item.count.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeatureImportanceChart() {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-foreground mb-2">Churn Prediction Features</h3>
      <p className="text-sm text-muted-foreground mb-6">Most important factors in predicting customer churn</p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={featureImportanceData} layout="horizontal" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" domain={[0, 0.3]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <YAxis type="category" dataKey="feature" width={80} />
            <Tooltip content={CustomTooltip} />
            <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SalesForecastChart() {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-foreground mb-2">Sales Forecast</h3>
      <p className="text-sm text-muted-foreground mb-6">Historical performance vs predicted sales</p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesForecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <Tooltip 
              content={({ payload, label }) => {
                if (payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium text-popover-foreground mb-1">{label}</p>
                      {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                          {entry.name === 'historical' ? 'Historical' : 'Predicted'}: 
                          ${(entry.value / 1000000).toFixed(1)}M
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="historical" 
              stackId="1" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="predicted" 
              stackId="2" 
              stroke="hsl(var(--success))" 
              fill="hsl(var(--success))" 
              fillOpacity={0.6}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <span className="text-xs text-muted-foreground">Historical Sales</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success rounded-full" />
          <span className="text-xs text-muted-foreground">Predicted Sales</span>
        </div>
      </div>
    </div>
  );
}

export function NPSTrendChart() {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-foreground mb-2">Customer Satisfaction Trends</h3>
      <p className="text-sm text-muted-foreground mb-6">Net Promoter Score and sentiment analysis over time</p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={npsTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={CustomTooltip} />
            <Line 
              type="monotone" 
              dataKey="nps" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              name="NPS Score"
            />
            <Line 
              type="monotone" 
              dataKey="sentiment" 
              stroke="hsl(var(--success))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
              name="Sentiment Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <span className="text-xs text-muted-foreground">Net Promoter Score</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success rounded-full" />
          <span className="text-xs text-muted-foreground">Sentiment Score</span>
        </div>
      </div>
    </div>
  );
}