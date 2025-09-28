import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import { CustomerData } from "@/types";

export default function DataUpload() {
  const [uploadedData, setUploadedData] = useState<CustomerData[]>([]);
  const [dataProcessed, setDataProcessed] = useState(false);

  const handleDataUploaded = (data: CustomerData[]) => {
    setUploadedData(data);
    setDataProcessed(true);
    // Here you could trigger further processing, like sending to an API or updating other components
    console.log("Data uploaded:", data.length, "records");
  };

  const handleProcessData = () => {
    // Implement data processing logic here
    console.log("Processing data...");
    // You could navigate to dashboard or trigger analysis
  };

  const handleUploadAnother = () => {
    setUploadedData([]);
    setDataProcessed(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Upload</h1>
          <p className="text-muted-foreground">
            Upload your customer data files in Excel or CSV format for analysis
          </p>
        </div>

        <div className="max-w-4xl">
          {!dataProcessed ? (
            <FileUpload onDataUploaded={handleDataUploaded} dataType="churn" />
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Successfully Uploaded</CardTitle>
                  <CardDescription>
                    Your data has been processed and is ready for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {uploadedData.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Records
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {new Set(uploadedData.map((d) => d.customer_id)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Unique Customers
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {
                          uploadedData.filter((d) => d.churn_risk === "High")
                            .length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        High Risk
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {new Set(uploadedData.map((d) => d.category)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Categories
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-4">
                <Button onClick={handleProcessData} className="flex-1">
                  Analyze Data
                </Button>
                <Button variant="outline" onClick={handleUploadAnother}>
                  Upload Another File
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
