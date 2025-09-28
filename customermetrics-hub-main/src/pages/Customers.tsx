import { useState, useEffect, useRef } from "react";
import { Search, Filter, Download, Eye, Upload, Loader2, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { DataService } from "@/services/dataService";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  churnProbability: number;
  riskScore: "High" | "Medium" | "Low";
  segment: string;
  region: string;
  lastActivity: string;
  totalSpent: number;
}

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadCustomers = async () => {
      // Try to load from localStorage first
      const saved = localStorage.getItem('customers');
      if (saved) {
        setCustomers(JSON.parse(saved));
        setLoading(false);
        return;
      }

      const churnData = DataService.getChurnData();
      if (churnData.length > 0) {
        const records = churnData.map(c => ({
          order_id: c.order_id,
          customer_id: c.customer_id,
          age: c.age,
          gender: c.gender,
          product_id: c.product_id,
          country: c.country,
          signup_date: c.signup_date,
          last_purchase_date: c.last_purchase_date,
          cancellations_count: c.cancellations_count,
          subscription_status: c.subscription_status,
          unit_price: c.unit_price,
          quantity: c.quantity,
          purchase_frequency: c.purchase_frequency,
          product_name: c.product_name,
          category: c.category,
          Ratings: c.ratings,
          churn_reason: '',
          churn_risk_score: c.churn_probability || 0
        }));
        try {
          const predictions = await DataService.getChurnPredictionsFromBackend(records);
          const mappedCustomers = churnData.map((c, i) => ({
            id: c.customer_id,
            name: `Customer ${c.customer_id}`,
            email: `customer${c.customer_id}@example.com`,
            churnProbability: predictions[i].churn_probability,
            riskScore: predictions[i].segment as "High" | "Medium" | "Low",
            segment: c.category,
            region: c.country,
            lastActivity: c.last_purchase_date,
            totalSpent: c.unit_price * c.quantity * c.purchase_frequency
          }));
          setCustomers(mappedCustomers);
        } catch (error) {
          console.error('Failed to get predictions:', error);
          // Fallback to local data
          const mappedCustomers = churnData.map(c => ({
            id: c.customer_id,
            name: `Customer ${c.customer_id}`,
            email: `customer${c.customer_id}@example.com`,
            churnProbability: c.churn_probability || 0,
            riskScore: (c.churn_risk === 'High' ? 'High' : c.churn_risk === 'Medium' ? 'Medium' : 'Low') as "High" | "Medium" | "Low",
            segment: c.category,
            region: c.country,
            lastActivity: c.last_purchase_date,
            totalSpent: c.unit_price * c.quantity * c.purchase_frequency
          }));
          setCustomers(mappedCustomers);
        }
      }
      setLoading(false);
    };
    loadCustomers();
  }, []);

  // Save to localStorage when customers change
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem('customers', JSON.stringify(customers));
    }
  }, [customers]);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".csv")) return "Please select a CSV file.";
    if (file.size > 10 * 1024 * 1024) return "File size must be less than 10MB.";
    return null;
  };

  // Upload CSV
  const handleUpload = async () => {
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({ title: "Invalid file", description: error, variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      await DataService.uploadFile(file, "churn");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Upload successful",
        description: "Customer data processed successfully.",
        duration: 3000
      });
      // Reload customers
      setLoading(true);
      const churnData = DataService.getChurnData();
      if (churnData.length > 0) {
        const records = churnData.map(c => ({
          order_id: c.order_id,
          customer_id: c.customer_id,
          age: c.age,
          gender: c.gender,
          product_id: c.product_id,
          country: c.country,
          signup_date: c.signup_date,
          last_purchase_date: c.last_purchase_date,
          cancellations_count: c.cancellations_count,
          subscription_status: c.subscription_status,
          unit_price: c.unit_price,
          quantity: c.quantity,
          purchase_frequency: c.purchase_frequency,
          product_name: c.product_name,
          category: c.category,
          Ratings: c.ratings,
          churn_reason: '',
          churn_risk_score: c.churn_probability || 0
        }));
        try {
          const predictions = await DataService.getChurnPredictionsFromBackend(records);
          const mappedCustomers = churnData.map((c, i) => ({
            id: c.customer_id,
            name: `Customer ${c.customer_id}`,
            email: `customer${c.customer_id}@example.com`,
            churnProbability: predictions[i].churn_probability,
            riskScore: predictions[i].segment as "High" | "Medium" | "Low",
            segment: c.category,
            region: c.country,
            lastActivity: c.last_purchase_date,
            totalSpent: c.unit_price * c.quantity * c.purchase_frequency
          }));
          setCustomers(mappedCustomers);
        } catch (error) {
          console.error('Failed to get predictions:', error);
          const mappedCustomers = churnData.map(c => ({
            id: c.customer_id,
            name: `Customer ${c.customer_id}`,
            email: `customer${c.customer_id}@example.com`,
            churnProbability: c.churn_probability || 0,
            riskScore: (c.churn_risk === 'High' ? 'High' : c.churn_risk === 'Medium' ? 'Medium' : 'Low') as "High" | "Medium" | "Low",
            segment: c.category,
            region: c.country,
            lastActivity: c.last_purchase_date,
            totalSpent: c.unit_price * c.quantity * c.purchase_frequency
          }));
          setCustomers(mappedCustomers);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Error uploading file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      riskFilter === "all" || customer.riskScore === riskFilter;

    const matchesRegion =
      regionFilter === "all" || customer.region === regionFilter;

    return matchesSearch && matchesRisk && matchesRegion;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredCustomers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, riskFilter, regionFilter]);

  const getRiskBadgeStyles = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-danger/10 text-danger border-danger/20";
      case "Medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "Low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground">
              Loading customer data...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            Manage and analyze your customer base with churn predictions
          </p>
        </div>

        {/* Upload Section */}
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upload Customer Data
            </CardTitle>
            <CardDescription>
              Upload your customer CSV to analyze churn predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose CSV File
              </Button>

              {file && (
                <div className="flex items-center gap-2 flex-1">
                  <Badge variant="secondary" className="truncate max-w-xs">
                    {file.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="flex-1 sm:flex-none"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isUploading ? "Processing..." : "Upload & Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="High">High Risk</SelectItem>
              <SelectItem value="Medium">Medium Risk</SelectItem>
              <SelectItem value="Low">Low Risk</SelectItem>
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="North America">North America</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="Asia">Asia</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>

        {/* Customers Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Churn Risk</TableHead>
                <TableHead className="font-semibold">Segment</TableHead>
                <TableHead className="font-semibold">Region</TableHead>
                <TableHead className="font-semibold">Last Activity</TableHead>
                <TableHead className="font-semibold">Total Spent</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/customer/${customer.id}`)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">
                        {customer.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {customer.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={getRiskBadgeStyles(customer.riskScore)}>
                        {customer.riskScore}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              customer.churnProbability > 0.7
                                ? "bg-danger"
                                : customer.churnProbability > 0.4
                                ? "bg-warning"
                                : "bg-success"
                            }`}
                            style={{
                              width: `${customer.churnProbability * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(customer.churnProbability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.segment}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{customer.region}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{customer.lastActivity}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      ${customer.totalSpent.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customer/${customer.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} entries
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
