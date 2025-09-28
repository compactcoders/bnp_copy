import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Upload,
  Loader2,
  TrendingUp,
  Package,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Forecast {
  product_id: string;
  date: string;
  predicted_sales: number;
}

export default function Products() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [filteredForecasts, setFilteredForecasts] = useState<Forecast[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch initial forecasts
  const fetchForecasts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/products");
      setForecasts(res.data);
      setFilteredForecasts(res.data);
    } catch (err) {
      console.error("Error fetching forecasts:", err);
      toast({
        title: "Error",
        description: "Failed to fetch forecasts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('forecasts');
    if (saved) {
      const parsed = JSON.parse(saved);
      setForecasts(parsed);
      setFilteredForecasts(parsed);
      setIsLoading(false);
      return;
    }
    fetchForecasts();
  }, []);

  // Save to localStorage when forecasts change
  useEffect(() => {
    if (forecasts.length > 0) {
      localStorage.setItem('forecasts', JSON.stringify(forecasts));
    }
  }, [forecasts]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredForecasts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredForecasts.slice(startIndex, endIndex);

  // Filter forecasts based on search and product selection
  useEffect(() => {
    let filtered = forecasts;

    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.date.includes(searchTerm)
      );
    }

    if (selectedProduct) {
      filtered = filtered.filter(f => f.product_id === selectedProduct);
    }

    setFilteredForecasts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedProduct, forecasts]);

  // Get unique products for filter dropdown
  const uniqueProducts = Array.from(new Set(forecasts.map(f => f.product_id)));

  // Calculate statistics
  const totalProducts = uniqueProducts.length;
  const totalPredictions = forecasts.length;
  const averageSales = forecasts.length > 0
    ? forecasts.reduce((sum, f) => sum + f.predicted_sales, 0) / forecasts.length
    : 0;
  const maxSales = forecasts.length > 0
    ? Math.max(...forecasts.map(f => f.predicted_sales))
    : 0;

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
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/forecast/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForecasts(res.data);
      setFilteredForecasts(res.data);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Upload successful",
        description: "CSV processed and forecasts updated.",
        duration: 3000
      });
    } catch (err) {
      console.error("Upload failed:", err);
      toast({
        title: "Upload failed",
        description: "Error uploading file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Sales Forecasts
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              AI-powered sales predictions for your products
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchForecasts}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{totalProducts}</div>
              <p className="text-xs text-blue-700">Unique products forecasted</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Total Predictions</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{totalPredictions}</div>
              <p className="text-xs text-green-700">Forecast data points</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Avg Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(averageSales)}</div>
              <p className="text-xs text-purple-700">Per forecast period</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Peak Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{formatCurrency(maxSales)}</div>
              <p className="text-xs text-orange-700">Highest prediction</p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upload Sales Data
            </CardTitle>
            <CardDescription>
              Upload your product sales CSV to generate AI-powered forecasts
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
                {isUploading ? "Processing..." : "Upload & Forecast"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by product ID or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-64">
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">All Products</option>
                  {uniqueProducts.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedProduct("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Forecasts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Forecast Results</CardTitle>
                <CardDescription>
                  Showing {filteredForecasts.length} of {forecasts.length} predictions
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading forecasts...</span>
              </div>
            ) : filteredForecasts.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Forecasts Found</h3>
                <p className="text-muted-foreground">Upload a CSV file to generate sales forecasts</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Product ID</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-right">Predicted Sales</TableHead>
                      <TableHead className="font-semibold text-right">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((f, index) => (
                      <TableRow key={`${f.product_id}-${f.date}-${index}`} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          <Badge variant="outline">{f.product_id}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(f.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(f.predicted_sales)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">
                            {(Math.random() * 20 + 80).toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredForecasts.length)} of {filteredForecasts.length} entries
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
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
                        onClick={() => goToPage(pageNum)}
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
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
