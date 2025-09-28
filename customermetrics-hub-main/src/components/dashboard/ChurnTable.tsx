import { useState } from 'react';
import { Search, Filter, Download, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Customer {
  id: string;
  name: string;
  email: string;
  churnProbability: number;
  riskScore: 'High' | 'Medium' | 'Low';
  tenure: number;
  recency: number;
  cancellations: number;
  totalSpent: number;
  segment: string;
}

const mockCustomers: Customer[] = [
  {
    id: 'CUS001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    churnProbability: 0.87,
    riskScore: 'High',
    tenure: 6,
    recency: 45,
    cancellations: 3,
    totalSpent: 1240,
    segment: 'Premium'
  },
  {
    id: 'CUS002',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    churnProbability: 0.72,
    riskScore: 'High',
    tenure: 12,
    recency: 30,
    cancellations: 2,
    totalSpent: 890,
    segment: 'Standard'
  },
  {
    id: 'CUS003',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    churnProbability: 0.45,
    riskScore: 'Medium',
    tenure: 18,
    recency: 15,
    cancellations: 1,
    totalSpent: 2150,
    segment: 'Premium'
  },
  {
    id: 'CUS004',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    churnProbability: 0.23,
    riskScore: 'Low',
    tenure: 24,
    recency: 7,
    cancellations: 0,
    totalSpent: 3200,
    segment: 'Premium'
  },
  {
    id: 'CUS005',
    name: 'David Wilson',
    email: 'david.w@email.com',
    churnProbability: 0.68,
    riskScore: 'High',
    tenure: 8,
    recency: 60,
    cancellations: 4,
    totalSpent: 567,
    segment: 'Basic'
  }
];

export function ChurnTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState(mockCustomers);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = mockCustomers.filter(customer =>
      customer.name.toLowerCase().includes(term.toLowerCase()) ||
      customer.email.toLowerCase().includes(term.toLowerCase()) ||
      customer.segment.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'secondary';
      default:
        return 'secondary';
    }
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

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">High-Risk Customers</h3>
          <p className="text-sm text-muted-foreground">
            Customers with highest churn probability
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Churn Probability</TableHead>
              <TableHead className="font-semibold">Risk Score</TableHead>
              <TableHead className="font-semibold">Tenure (months)</TableHead>
              <TableHead className="font-semibold">Recency (days)</TableHead>
              <TableHead className="font-semibold">Cancellations</TableHead>
              <TableHead className="font-semibold">Total Spent</TableHead>
              <TableHead className="font-semibold">Segment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          customer.churnProbability > 0.7 ? 'bg-danger' :
                          customer.churnProbability > 0.4 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${customer.churnProbability * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {(customer.churnProbability * 100).toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRiskBadgeStyles(customer.riskScore)}>
                    {customer.riskScore === 'High' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {customer.riskScore}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{customer.tenure}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{customer.recency}</span>
                    {customer.recency > 30 ? (
                      <TrendingUp className="w-3 h-3 text-danger" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-success" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    customer.cancellations > 2 ? 'text-danger' : 
                    customer.cancellations > 0 ? 'text-warning' : 'text-success'
                  }`}>
                    {customer.cancellations}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">${customer.totalSpent.toLocaleString()}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{customer.segment}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}