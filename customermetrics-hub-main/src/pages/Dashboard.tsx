import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { KPICards } from '@/components/dashboard/KPICards';
import { ChurnTable } from '@/components/dashboard/ChurnTable';
import { 
  ChurnDistributionChart, 
  FeatureImportanceChart, 
  SalesForecastChart, 
  NPSTrendChart 
} from '@/components/dashboard/ChartComponents';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* KPI Cards */}
        <KPICards />
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Side - Main Charts */}
          <div className="xl:col-span-3 space-y-6">
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChurnDistributionChart />
              <FeatureImportanceChart />
            </div>
            
            {/* Sales Forecast Chart */}
            <SalesForecastChart />
            
            {/* Customer Churn Table */}
            <ChurnTable />
            
            {/* NPS Trend Chart */}
            <NPSTrendChart />
          </div>
          
          
        </div>
      </div>
    </DashboardLayout>
  );
}