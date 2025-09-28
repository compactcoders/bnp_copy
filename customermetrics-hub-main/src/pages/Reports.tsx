import { useState } from 'react';
import { Download, FileText, Calendar, Mail, Clock, Settings } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'csv' | 'xlsx';
  category: string;
  lastGenerated: string;
  size: string;
  status: 'ready' | 'generating' | 'failed';
}

const availableReports: Report[] = [
  {
    id: 'RPT001',
    name: 'Customer Churn Analysis',
    description: 'Comprehensive analysis of customer churn patterns and predictions',
    type: 'pdf',
    category: 'Analytics',
    lastGenerated: '2024-01-25',
    size: '2.4 MB',
    status: 'ready'
  },
  {
    id: 'RPT002',
    name: 'Sales Forecast Report',
    description: 'Quarterly sales forecasts with trend analysis',
    type: 'xlsx',
    category: 'Sales',
    lastGenerated: '2024-01-24',
    size: '1.8 MB',
    status: 'ready'
  },
  {
    id: 'RPT003',
    name: 'High-Risk Customers List',
    description: 'List of customers with high churn probability',
    type: 'csv',
    category: 'CRM',
    lastGenerated: '2024-01-25',
    size: '245 KB',
    status: 'ready'
  },
  {
    id: 'RPT004',
    name: 'Product Performance Dashboard',
    description: 'Product sales performance and forecasting data',
    type: 'pdf',
    category: 'Products',
    lastGenerated: '2024-01-23',
    size: '3.1 MB',
    status: 'generating'
  },
  {
    id: 'RPT005',
    name: 'Customer Satisfaction Trends',
    description: 'NPS scores and customer feedback analysis over time',
    type: 'pdf',
    category: 'Analytics',
    lastGenerated: '2024-01-22',
    size: '1.5 MB',
    status: 'ready'
  }
];

const scheduledReports = [
  {
    id: 'SCH001',
    name: 'Weekly Churn Report',
    frequency: 'Weekly',
    nextRun: '2024-01-29',
    recipients: ['sarah@company.com', 'john@company.com']
  },
  {
    id: 'SCH002',
    name: 'Monthly Sales Forecast',
    frequency: 'Monthly',
    nextRun: '2024-02-01',
    recipients: ['sales@company.com']
  }
];

export default function Reports() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [reportName, setReportName] = useState('');
  const [reportFrequency, setReportFrequency] = useState('weekly');
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);

  const filteredReports = availableReports.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesType = selectedType === 'all' || report.type === selectedType;
    return matchesCategory && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-success/10 text-success border-success/20">Ready</Badge>;
      case 'generating':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Generating</Badge>;
      case 'failed':
        return <Badge className="bg-danger/10 text-danger border-danger/20">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'xlsx':
        return '📊';
      case 'csv':
        return '📋';
      default:
        return '📄';
    }
  };

  const handleChartSelection = (chartId: string, checked: boolean) => {
    if (checked) {
      setSelectedCharts(prev => [...prev, chartId]);
    } else {
      setSelectedCharts(prev => prev.filter(id => id !== chartId));
    }
  };

  const chartOptions = [
    { id: 'churn-distribution', name: 'Churn Distribution Chart' },
    { id: 'feature-importance', name: 'Feature Importance Chart' },
    { id: 'sales-forecast', name: 'Sales Forecast Chart' },
    { id: 'nps-trend', name: 'NPS Trend Chart' },
    { id: 'customer-table', name: 'High-Risk Customers Table' },
    { id: 'kpi-summary', name: 'KPI Summary Cards' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Generate, schedule, and download analytics reports
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Reports */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>
                  Pre-built reports ready for download
                </CardDescription>
                <div className="flex space-x-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="CRM">CRM</SelectItem>
                      <SelectItem value="Products">Products</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getTypeIcon(report.type)}</div>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{report.name}</div>
                          <div className="text-sm text-muted-foreground">{report.description}</div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Last generated: {report.lastGenerated}</span>
                            <span>Size: {report.size}</span>
                            <Badge variant="outline">{report.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(report.status)}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={report.status !== 'ready'}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Automatically generated reports sent via email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Frequency: {report.frequency} • Next run: {report.nextRun}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Recipients: {report.recipients.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Run Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Custom Report */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Report</CardTitle>
                <CardDescription>
                  Generate a custom report with selected components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input 
                    id="report-name"
                    placeholder="Enter report name"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Include Components</Label>
                  <div className="space-y-3">
                    {chartOptions.map((chart) => (
                      <div key={chart.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={chart.id}
                          checked={selectedCharts.includes(chart.id)}
                          onCheckedChange={(checked) => handleChartSelection(chart.id, !!checked)}
                        />
                        <Label htmlFor={chart.id} className="text-sm">{chart.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  disabled={!reportName || selectedCharts.length === 0}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule Report</CardTitle>
                <CardDescription>
                  Set up automatic report generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={reportFrequency} onValueChange={setReportFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-recipients">Email Recipients</Label>
                  <Input 
                    id="email-recipients"
                    placeholder="Enter email addresses"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>

                <Button className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data (CSV)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Executive Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Current Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}