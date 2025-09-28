import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { DataService } from "../services/dataService";
import { CustomerData } from "../types";

interface FileUploadProps {
  onDataUploaded: (data: CustomerData[]) => void;
  dataType?: "churn" | "sales";
}

const FileUpload: React.FC<FileUploadProps> = ({
  onDataUploaded,
  dataType = "churn",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState<CustomerData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError("Please upload a valid Excel (.xlsx, .xls) or CSV file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const data = await DataService.uploadFile(file, dataType);
      setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setUploading(false);
    }
  };

  const confirmUpload = () => {
    const allData = DataService.getData();
    onDataUploaded(allData);
    setShowPreview(false);
    setPreviewData([]);
  };

  const cancelUpload = () => {
    setShowPreview(false);
    setPreviewData([]);
    setError("");
  };

  if (showPreview) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Data Preview
              </h3>
              <p className="text-sm text-slate-600">
                Found {DataService.getData().length} records. Review the first 5
                rows below.
              </p>
            </div>
          </div>
          <button
            onClick={cancelUpload}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Customer ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Churn Risk
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {previewData.map((row, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {row.customer_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {row.age}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {row.gender}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {row.product_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {row.category}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.churn_risk === "High"
                          ? "bg-red-100 text-red-800"
                          : row.churn_risk === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {row.churn_risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={cancelUpload}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmUpload}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Confirm & Process Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <div className="text-center mb-6">
        <FileSpreadsheet className="mx-auto w-12 h-12 text-emerald-600 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Upload Customer Data
        </h2>
        <p className="text-slate-600">
          Upload your Excel or CSV file containing customer and sales data for
          analysis
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <h4 className="text-red-800 font-medium">Data Validation Error</h4>
          </div>
          <div className="text-red-800 text-sm ml-8">
            {error.split("\n").map((line, index) => (
              <p key={index} className="mb-1">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-300 hover:border-emerald-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto w-8 h-8 text-slate-400 mb-4" />
        <p className="text-lg font-medium text-slate-900 mb-2">
          Drop your file here, or click to browse
        </p>
        <p className="text-sm text-slate-600 mb-4">
          Supports .xlsx, .xls, and .csv files up to 10MB
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Processing..." : "Choose File"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
        />
      </div>

      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-900 mb-2">
          Required Columns:
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs text-slate-600">
          <span>• order_id</span>
          <span>• customer_id</span>
          <span>• age</span>
          <span>• gender</span>
          <span>• product_id</span>
          <span>• country</span>
          <span>• signup_date</span>
          <span>• last_purchase_date</span>
          <span>• cancellations_count</span>
          <span>• subscription_status</span>
          <span>• unit_price</span>
          <span>• quantity</span>
          <span>• purchase_frequency</span>
          <span>• product_name</span>
          <span>• category</span>
          <span>• ratings</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
