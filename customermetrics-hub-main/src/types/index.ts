export interface CustomerData {
  order_id?: string;
  customer_id: string;
  age: number;
  gender: string;
  product_id?: string;
  country?: string;
  signup_date?: string;
  last_purchase_date?: string;
  cancellations_count?: number;
  subscription_status?: string;
  unit_price?: number;
  quantity?: number;
  purchase_frequency?: number;
  product_name: string;
  category: string;
  ratings?: number;
  churn_risk?: "High" | "Medium" | "Low";
  age_group?: string;
  months_since_last_purchase?: number;
  lifetime_value?: number;
  churn_probability?: number;
  promotion_eligible?: boolean;
  retention_strategy?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  churnRate: number;
  totalRevenue: number;
  averageOrderValue: number;
  highRiskCustomers: number;
  predictedSalesGrowth: number;
}

export interface ChurnPrediction {
  customer_id: string;
  customer_name: string;
  churn_probability: number;
  risk_factors: string[];
  retention_strategy: string;
  lifetime_value: number;
  last_purchase: string;
}

export interface SalesForecast {
  product_id: string;
  product_name: string;
  category: string;
  predicted_sales: number;
  growth_rate: number;
  confidence: number;
  restock_suggestion: string;
}

export interface AgeGroupData {
  ageGroup: string;
  totalCustomers: number;
  churnRate: number;
  avgLifetimeValue: number;
  avgRating: number;
}

export interface CountryData {
  country: string;
  totalCustomers: number;
  totalRevenue: number;
  churnRate: number;
  avgOrderValue: number;
}

export interface SubscriptionData {
  status: string;
  count: number;
  percentage: number;
  avgLifetimeValue: number;
  churnProbability: number;
}

export interface CancellationData {
  cancellationRange: string;
  customerCount: number;
  churnRate: number;
  avgLifetimeValue: number;
}

export interface PriceQuantityData {
  priceRange: string;
  quantityRange: string;
  customerCount: number;
  totalRevenue: number;
  avgChurnProbability: number;
}

export interface PromotionData {
  eligible: boolean;
  count: number;
  percentage: number;
  avgLifetimeValue: number;
  avgChurnProbability: number;
}

export interface VisualizationConfig {
  showAgeGroups: boolean;
  showCountryAnalysis: boolean;
  showSubscriptionStatus: boolean;
  showCancellationAnalysis: boolean;
  showPriceQuantityAnalysis: boolean;
  showPromotionAnalysis: boolean;
  recordsToAnalyze: number;
  maxRecords: number;
}
