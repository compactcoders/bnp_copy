import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  churnProbability: number;
  riskScore: 'High' | 'Medium' | 'Low';
  segment: string;
  region: string;
  tenure: number;
  recency: number;
  frequency: number;
  monetary: number;
  supportTickets: number;
  cancellations: number;
  npsScore: number;
  lastActivity: string;
  joinDate: string;
}

const mockCustomer: CustomerProfile = {
  id: 'CUS001',
  name: 'John Smith',
  email: 'john.smith@email.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, New York, NY 10001',
  churnProbability: 0.87,
  riskScore: 'High',
  segment: 'Premium',
  region: 'North America',
  tenure: 6,
  recency: 45,
  frequency: 12,
  monetary: 1240,
  supportTickets: 3,
  cancellations: 2,
  npsScore: 6,
  lastActivity: '2024-01-15',
  joinDate: '2023-07-15'
};

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerProfile>(mockCustomer);
  const [whatIfValues, setWhatIfValues] = useState({
    tenure: customer.tenure,
    recency: customer.recency,
    frequency: customer.frequency,
    supportTickets: customer.supportTickets
  });
  const [predictedChurn, setPredictedChurn] = useState(customer.churnProbability);

  useEffect(() => {
    // Mock customer data loading based on ID
    setCustomer(mockCustomer);
    setWhatIfValues({
      tenure: mockCustomer.tenure,
      recency: mockCustomer.recency,
      frequency: mockCustomer.frequency,
      supportTickets: mockCustomer.supportTickets
    });
    setPredictedChurn(mockCustomer.churnProbability);
  }, [id]);

  const calculateChurnProbability = () => {
    // Mock churn probability calculation based on what-if values
    const tenureScore = Math.max(0, (24 - whatIfValues.tenure) / 24);
    const recencyScore = Math.min(1, whatIfValues.recency / 90);
    const frequencyScore = Math.max(0, (50 - whatIfValues.frequency) / 50);
    const supportScore = Math.min(1, whatIfValues.supportTickets / 10);
    
    const newChurn = Math.min(1, (tenureScore * 0.3 + recencyScore * 0.3 + frequencyScore * 0.25 + supportScore * 0.15));
    setPredictedChurn(newChurn);
  };

  const getRiskBadgeStyles = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-danger/10 text-danger border-danger/20';
      case 'Medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return '';
    }
  };

  const riskFactors = [
    { name: 'High Recency (45 days)', impact: 0.25, color: 'bg-danger' },
    { name: 'Low Tenure (6 months)', impact: 0.20, color: 'bg-warning' },
    { name: 'Support Issues', impact: 0.15, color: 'bg-warning' },
    { name: 'Previous Cancellations', impact: 0.12, color: 'bg-danger' },
    { name: 'Low NPS Score', impact: 0.10, color: 'bg-warning' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/customers')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customers
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{customer.name}</h1>
              <p className="text-muted-foreground">Customer ID: {customer.id}</p>
            </div>
          </div>
          <Badge className={getRiskBadgeStyles(customer.riskScore)}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {customer.riskScore} Risk
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{customer.address}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Join Date:</span>
                    <span>{customer.joinDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Activity:</span>
                    <span>{customer.lastActivity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Segment:</span>
                    <Badge variant="outline">{customer.segment}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Region:</span>
                    <span>{customer.region}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{customer.tenure}</div>
                    <div className="text-xs text-muted-foreground">Months Tenure</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{customer.recency}</div>
                    <div className="text-xs text-muted-foreground">Days Recency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{customer.frequency}</div>
                    <div className="text-xs text-muted-foreground">Purchase Frequency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">${customer.monetary}</div>
                    <div className="text-xs text-muted-foreground">Total Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Churn Probability */}
            <Card>
              <CardHeader>
                <CardTitle>Churn Probability</CardTitle>
                <CardDescription>
                  Current risk assessment based on customer behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-foreground">
                      {(customer.churnProbability * 100).toFixed(0)}%
                    </div>
                    <div className="flex items-center space-x-2">
                      {customer.churnProbability > 0.7 ? (
                        <TrendingUp className="w-5 h-5 text-danger" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-success" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        vs last month
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      customer.churnProbability > 0.7 ? 'bg-danger' :
                      customer.churnProbability > 0.4 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${customer.churnProbability * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Risk Factors</CardTitle>
                <CardDescription>
                  Key factors contributing to churn risk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{factor.name}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${factor.color}`}
                            style={{ width: `${factor.impact * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">
                          {(factor.impact * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}