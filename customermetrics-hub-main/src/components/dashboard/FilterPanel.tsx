import { useState } from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FilterPanel() {
  const [churnThreshold, setChurnThreshold] = useState([50]);
  const [dateRange, setDateRange] = useState('last-30-days');
  const [segment, setSegment] = useState('all');
  const [region, setRegion] = useState('all');
  const [productCategory, setProductCategory] = useState('all');

  const handleReset = () => {
    setChurnThreshold([50]);
    setDateRange('last-30-days');
    setSegment('all');
    setRegion('all');
    setProductCategory('all');
  };

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-primary" />
            <span>Filters & Analysis</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 days</SelectItem>
              <SelectItem value="last-30-days">Last 30 days</SelectItem>
              <SelectItem value="last-90-days">Last 90 days</SelectItem>
              <SelectItem value="last-6-months">Last 6 months</SelectItem>
              <SelectItem value="last-year">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer Segment */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Customer Segment</Label>
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Category */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Product Category</Label>
          <Select value={productCategory} onValueChange={setProductCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Region</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="north-america">North America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
              <SelectItem value="latin-america">Latin America</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Churn Probability Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Churn Risk Threshold</Label>
            <span className="text-sm font-medium text-primary">{churnThreshold[0]}%</span>
          </div>
          <div className="px-2">
            <Slider
              value={churnThreshold}
              onValueChange={setChurnThreshold}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0% (Low Risk)</span>
            <span>100% (High Risk)</span>
          </div>
        </div>

        {/* Apply Filters Button */}
        <Button className="w-full">
          Apply Filters
        </Button>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Quick Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Filtered Customers:</span>
              <span className="font-medium">8,429</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">High Risk:</span>
              <span className="font-medium text-danger">1,067</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg. Churn Risk:</span>
              <span className="font-medium">32%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}