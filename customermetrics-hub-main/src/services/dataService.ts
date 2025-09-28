import {
  CustomerData,
  DashboardStats,
  ChurnPrediction,
  SalesForecast,
  VisualizationConfig,
  AgeGroupData,
  CountryData,
  SubscriptionData,
  CancellationData,
  PriceQuantityData,
  PromotionData,
} from "../types";

export class DataService {
  private static churnData: CustomerData[] = [];
  private static salesData: CustomerData[] = [];
  private static config: VisualizationConfig = {
    showAgeGroups: true,
    showCountryAnalysis: true,
    showSubscriptionStatus: true,
    showCancellationAnalysis: true,
    showPriceQuantityAnalysis: true,
    showPromotionAnalysis: true,
    recordsToAnalyze: 1000,
    maxRecords: 1000,
  };

static async uploadFile(
  file: File,
  dataType: "churn" | "sales" = "churn"
): Promise<CustomerData[]> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:8000/upload-customers/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload file");
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }

    const processedData: CustomerData[] = result.data.map((row: any) => ({
      ...row,
      age_group: row.age_group || this.getAgeGroup(row.age),
      months_since_last_purchase:
        row.months_since_last_purchase ||
        this.getMonthsSinceLastPurchase(row.last_purchase_date),
      lifetime_value: row.lifetime_value ?? 0,
      churn_probability: row.churn_probability,
      churn_risk: row.churn_risk,
      promotion_eligible: row.promotion_eligible ?? false,
      retention_strategy: row.retention_strategy,
      ratings: row.ratings ?? 3,
      purchase_frequency: row.purchase_frequency ?? 1,
      subscription_status: row.subscription_status ?? "Active",
    }));

    // Compute churn probability, risk, and retention strategy if missing
    processedData.forEach((customer) => {
      if (customer.churn_probability === undefined) {
        customer.churn_probability = this.calculateChurnScore(customer);
      }

      if (!customer.churn_risk) {
        if (customer.churn_probability < 0.33) customer.churn_risk = "Low";
        else if (customer.churn_probability < 0.66) customer.churn_risk = "Medium";
        else customer.churn_risk = "High";
      }

      if (!customer.retention_strategy) {
        customer.retention_strategy = this.generateRetentionStrategy(customer);
      }
    });

    if (dataType === "churn") {
      this.churnData = processedData;
    } else {
      this.salesData = processedData;
    }

    this.config.maxRecords = processedData.length;
    this.config.recordsToAnalyze = Math.min(1000, processedData.length);

    return processedData;
  } catch (error) {
    throw error;
  }
}


  private static getAgeGroup(age: number): string {
    if (age < 25) return "Under 25";
    if (age < 35) return "25-34";
    if (age < 45) return "35-44";
    if (age < 60) return "45-59";
    return "60+";
  }

  private static getMonthsSinceLastPurchase(lastPurchase: string): number {
    if (!lastPurchase) return 999;
    const lastDate = new Date(lastPurchase);
    const now = new Date();
    return Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
  }

  private static calculateChurnScore(customer: CustomerData): number {
    let score = 0;

    // Age factor
    if (customer.age < 25) score += 0.1;
    else if (customer.age > 60) score += 0.2;

    // Cancellations
    score += customer.cancellations_count * 0.15;

    // Months since last purchase
    const monthsSince = customer.months_since_last_purchase || 0;
    if (monthsSince > 6) score += 0.3;
    else if (monthsSince > 3) score += 0.15;

    // Purchase frequency
    if (customer.purchase_frequency < 2) score += 0.2;

    // Subscription status
    if (customer.subscription_status === "Inactive") score += 0.25;
    else if (customer.subscription_status === "Cancelled") score += 0.5;

    // Ratings
    if (customer.ratings < 3) score += 0.2;
    else if (customer.ratings < 4) score += 0.1;

    return Math.min(Math.max(score, 0), 1);
  }

  private static generateRetentionStrategy(customer: CustomerData): string {
    if (customer.churn_risk === "Low") {
      return customer.promotion_eligible
        ? "Offer premium products or loyalty rewards"
        : "Continue engagement with regular offers";
    }

    if (customer.churn_risk === "Medium") {
      const strategies = [];
      if (customer.months_since_last_purchase! > 3) {
        strategies.push("Send re-engagement campaign");
      }
      if (customer.ratings < 4) {
        strategies.push("Improve customer experience");
      }
      if (customer.purchase_frequency < 2) {
        strategies.push(`Offer discounts on ${customer.category} products`);
      }
      return strategies.join("; ") || "Personalized retention offer";
    }

    // High risk
    return `Urgent: Personal outreach, 20% discount on ${customer.category}, loyalty program enrollment`;
  }

  static getAnalysisData(dataType?: "churn" | "sales"): CustomerData[] {
    let data: CustomerData[];
    if (dataType === "churn") {
      data = this.churnData;
    } else if (dataType === "sales") {
      data = this.salesData;
    } else {
      data = [...this.churnData, ...this.salesData];
    }
    return data.slice(0, this.config.recordsToAnalyze);
  }

  static setChurnData(data: CustomerData[]): void {
    this.churnData = data;
  }

  static setSalesData(data: CustomerData[]): void {
    this.salesData = data;
  }

  static getChurnData(): CustomerData[] {
    return this.churnData;
  }

  static getSalesData(): CustomerData[] {
    return this.salesData;
  }

  static getData(): CustomerData[] {
    return [...this.churnData, ...this.salesData];
  }

  static getConfig(): VisualizationConfig {
    return { ...this.config };
  }

  static updateConfig(newConfig: Partial<VisualizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  static getDashboardStats(): DashboardStats {
    const data = this.getAnalysisData();
    const totalCustomers = new Set(data.map((d) => d.customer_id)).size;
    const churnedCustomers = data.filter((d) => d.churn_risk === "High").length;
    const totalRevenue = data.reduce(
      (sum, d) => sum + d.unit_price * d.quantity,
      0
    );
    const highRiskCustomers = data.filter(
      (d) => d.churn_risk === "High"
    ).length;

    return {
      totalCustomers,
      churnRate:
        totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0,
      totalRevenue,
      averageOrderValue: data.length > 0 ? totalRevenue / data.length : 0,
      highRiskCustomers,
      predictedSalesGrowth: Math.random() * 20 + 5, // Mock prediction
    };
  }

  static getAgeGroupAnalysis(): AgeGroupData[] {
    const data = this.getAnalysisData();
    const ageGroups = new Map<string, CustomerData[]>();

    data.forEach((customer) => {
      const group = customer.age_group!;
      if (!ageGroups.has(group)) {
        ageGroups.set(group, []);
      }
      ageGroups.get(group)!.push(customer);
    });

    return Array.from(ageGroups.entries())
      .map(([ageGroup, customers]) => {
        const uniqueCustomers = new Set(customers.map((c) => c.customer_id))
          .size;
        const churnedCustomers = customers.filter(
          (c) => c.churn_risk === "High"
        ).length;
        const totalLifetimeValue = customers.reduce(
          (sum, c) => sum + c.lifetime_value!,
          0
        );
        const totalRatings = customers.reduce((sum, c) => sum + c.ratings, 0);

        return {
          ageGroup,
          totalCustomers: uniqueCustomers,
          churnRate:
            uniqueCustomers > 0
              ? (churnedCustomers / uniqueCustomers) * 100
              : 0,
          avgLifetimeValue:
            customers.length > 0 ? totalLifetimeValue / customers.length : 0,
          avgRating: customers.length > 0 ? totalRatings / customers.length : 0,
        };
      })
      .sort((a, b) => {
        const order = ["Under 25", "25-34", "35-44", "45-59", "60+"];
        return order.indexOf(a.ageGroup) - order.indexOf(b.ageGroup);
      });
  }

  static getCountryAnalysis(): CountryData[] {
    const data = this.getAnalysisData();
    const countries = new Map<string, CustomerData[]>();

    data.forEach((customer) => {
      if (!countries.has(customer.country)) {
        countries.set(customer.country, []);
      }
      countries.get(customer.country)!.push(customer);
    });

    return Array.from(countries.entries())
      .map(([country, customers]) => {
        const uniqueCustomers = new Set(customers.map((c) => c.customer_id))
          .size;
        const churnedCustomers = customers.filter(
          (c) => c.churn_risk === "High"
        ).length;
        const totalRevenue = customers.reduce(
          (sum, c) => sum + c.unit_price * c.quantity,
          0
        );

        return {
          country,
          totalCustomers: uniqueCustomers,
          totalRevenue,
          churnRate:
            uniqueCustomers > 0
              ? (churnedCustomers / uniqueCustomers) * 100
              : 0,
          avgOrderValue:
            customers.length > 0 ? totalRevenue / customers.length : 0,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  static getSubscriptionAnalysis(): SubscriptionData[] {
    const data = this.getAnalysisData();
    const subscriptions = new Map<string, CustomerData[]>();

    data.forEach((customer) => {
      if (!subscriptions.has(customer.subscription_status)) {
        subscriptions.set(customer.subscription_status, []);
      }
      subscriptions.get(customer.subscription_status)!.push(customer);
    });

    const total = data.length;
    return Array.from(subscriptions.entries()).map(([status, customers]) => {
      const totalLifetimeValue = customers.reduce(
        (sum, c) => sum + c.lifetime_value!,
        0
      );
      const avgChurnProbability =
        customers.reduce((sum, c) => sum + c.churn_probability!, 0) /
        customers.length;

      return {
        status,
        count: customers.length,
        percentage: (customers.length / total) * 100,
        avgLifetimeValue:
          customers.length > 0 ? totalLifetimeValue / customers.length : 0,
        churnProbability: avgChurnProbability,
      };
    });
  }

  static getCancellationAnalysis(): CancellationData[] {
    const data = this.getAnalysisData();
    const ranges = [
      { range: "0", min: 0, max: 0 },
      { range: "1-2", min: 1, max: 2 },
      { range: "3-5", min: 3, max: 5 },
      { range: "6+", min: 6, max: Infinity },
    ];

    return ranges.map(({ range, min, max }) => {
      const customers = data.filter(
        (c) => c.cancellations_count >= min && c.cancellations_count <= max
      );
      const uniqueCustomers = new Set(customers.map((c) => c.customer_id)).size;
      const churnedCustomers = customers.filter(
        (c) => c.churn_risk === "High"
      ).length;
      const totalLifetimeValue = customers.reduce(
        (sum, c) => sum + c.lifetime_value!,
        0
      );

      return {
        cancellationRange: range,
        customerCount: uniqueCustomers,
        churnRate:
          uniqueCustomers > 0 ? (churnedCustomers / uniqueCustomers) * 100 : 0,
        avgLifetimeValue:
          customers.length > 0 ? totalLifetimeValue / customers.length : 0,
      };
    });
  }

  static getPriceQuantityAnalysis(): PriceQuantityData[] {
    const data = this.getAnalysisData();
    const priceRanges = [
      { range: "$0-50", min: 0, max: 50 },
      { range: "$51-100", min: 51, max: 100 },
      { range: "$101-200", min: 101, max: 200 },
      { range: "$201+", min: 201, max: Infinity },
    ];

    const quantityRanges = [
      { range: "1-2", min: 1, max: 2 },
      { range: "3-5", min: 3, max: 5 },
      { range: "6-10", min: 6, max: 10 },
      { range: "11+", min: 11, max: Infinity },
    ];

    const results: PriceQuantityData[] = [];

    priceRanges.forEach((priceRange) => {
      quantityRanges.forEach((quantityRange) => {
        const customers = data.filter(
          (c) =>
            c.unit_price >= priceRange.min &&
            c.unit_price <= priceRange.max &&
            c.quantity >= quantityRange.min &&
            c.quantity <= quantityRange.max
        );

        if (customers.length > 0) {
          const uniqueCustomers = new Set(customers.map((c) => c.customer_id))
            .size;
          const totalRevenue = customers.reduce(
            (sum, c) => sum + c.unit_price * c.quantity,
            0
          );
          const avgChurnProbability =
            customers.reduce((sum, c) => sum + c.churn_probability!, 0) /
            customers.length;

          results.push({
            priceRange: priceRange.range,
            quantityRange: quantityRange.range,
            customerCount: uniqueCustomers,
            totalRevenue,
            avgChurnProbability,
          });
        }
      });
    });

    return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  static getPromotionAnalysis(): PromotionData[] {
    const data = this.getAnalysisData();
    const eligible = data.filter((c) => c.promotion_eligible);
    const notEligible = data.filter((c) => !c.promotion_eligible);

    return [
      {
        eligible: true,
        count: eligible.length,
        percentage: (eligible.length / data.length) * 100,
        avgLifetimeValue:
          eligible.reduce((sum, c) => sum + c.lifetime_value!, 0) /
          eligible.length,
        avgChurnProbability:
          eligible.reduce((sum, c) => sum + c.churn_probability!, 0) /
          eligible.length,
      },
      {
        eligible: false,
        count: notEligible.length,
        percentage: (notEligible.length / data.length) * 100,
        avgLifetimeValue:
          notEligible.reduce((sum, c) => sum + c.lifetime_value!, 0) /
          notEligible.length,
        avgChurnProbability:
          notEligible.reduce((sum, c) => sum + c.churn_probability!, 0) /
          notEligible.length,
      },
    ];
  }

  static getTopChurnRiskCustomers(limit: number = 10): ChurnPrediction[] {
    const data = this.getAnalysisData();
    const customers = new Map<string, CustomerData>();

    // Get unique customers with highest churn probability
    data.forEach((record) => {
      const existing = customers.get(record.customer_id);
      if (
        !existing ||
        record.churn_probability! > existing.churn_probability!
      ) {
        customers.set(record.customer_id, record);
      }
    });

    return Array.from(customers.values())
      .sort((a, b) => b.churn_probability! - a.churn_probability!)
      .slice(0, limit)
      .map((customer) => ({
        customer_id: customer.customer_id,
        customer_name: `Customer ${customer.customer_id}`,
        churn_probability: customer.churn_probability!,
        risk_factors: this.getRiskFactors(customer),
        retention_strategy: customer.retention_strategy!,
        lifetime_value: customer.lifetime_value!,
        last_purchase: customer.last_purchase_date,
      }));
  }

  private static getRiskFactors(customer: CustomerData): string[] {
    const factors = [];
    if (customer.cancellations_count > 2)
      factors.push("High cancellation rate");
    if (customer.months_since_last_purchase! > 6)
      factors.push("Inactive for 6+ months");
    if (customer.purchase_frequency < 2) factors.push("Low purchase frequency");
    if (customer.ratings < 3) factors.push("Poor ratings");
    if (customer.subscription_status !== "Active")
      factors.push("Inactive subscription");
    return factors;
  }

  static getTopProductsForSales(limit: number = 10): SalesForecast[] {
    const data = this.getAnalysisData();
    const productSales = new Map<
      string,
      {
        product_name: string;
        category: string;
        total_sales: number;
        avg_rating: number;
        orders: number;
      }
    >();

    data.forEach((record) => {
      const key = record.product_id;
      const existing = productSales.get(key);
      const sales = record.unit_price * record.quantity;

      if (existing) {
        existing.total_sales += sales;
        existing.orders += 1;
        existing.avg_rating = (existing.avg_rating + record.ratings) / 2;
      } else {
        productSales.set(key, {
          product_name: record.product_name,
          category: record.category,
          total_sales: sales,
          avg_rating: record.ratings,
          orders: 1,
        });
      }
    });

    return Array.from(productSales.entries())
      .sort(([, a], [, b]) => b.total_sales - a.total_sales)
      .slice(0, limit)
      .map(([product_id, data]) => ({
        product_id,
        product_name: data.product_name,
        category: data.category,
        predicted_sales: data.total_sales * (1 + Math.random() * 0.3), // Mock growth
        growth_rate: (Math.random() - 0.5) * 40, // -20% to +20%
        confidence: 0.85 + Math.random() * 0.1, // 85-95%
        restock_suggestion:
          data.orders > 10
            ? "High priority restock"
            : data.orders > 5
            ? "Monitor inventory"
            : "Standard restock",
      }));
  }

  static getChurnTrendData() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => ({
      month,
      churnRate: Math.random() * 15 + 5,
      totalCustomers: Math.floor(Math.random() * 1000) + 500,
      newCustomers: Math.floor(Math.random() * 200) + 50,
    }));
  }

  static async getChurnPredictionsFromBackend(records: any[]): Promise<{index: number, churn_probability: number, segment: string}[]> {
    const response = await fetch('http://localhost:8000/api/churn/predict', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({records})
    });
    if (!response.ok) throw new Error('Failed to get predictions');
    const data = await response.json();
    return data.predictions;
  }

  static getSalesForecastData() {
    const months = ["Q1", "Q2", "Q3", "Q4"];
    return months.map((quarter) => ({
      actualSales: Math.floor(Math.random() * 100000) + 50000,
      predictedSales: Math.floor(Math.random() * 120000) + 60000,
      confidence: Math.random() * 0.2 + 0.8,
    }));
  }
}
