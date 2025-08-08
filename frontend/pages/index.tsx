import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../src/app/globals.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FiUpload, FiDownload, FiCopy, FiAlertTriangle, FiCheckCircle, FiX, FiCode, FiBarChart2, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ComplexityBadge = ({ complexity }: { complexity: number }) => {
  let gradient = "from-emerald-400 to-emerald-600";
  let text = "Simple";
  let pulse = "animate-pulse";
  
  if (complexity > 3 && complexity <= 6) {
    gradient = "from-amber-400 to-amber-600";
    text = "Moderate";
    pulse = "animate-pulse";
  } else if (complexity > 6) {
    gradient = "from-red-400 to-red-600";
    text = "Complex";
    pulse = "animate-pulse";
  }

  return (
    <motion.span 
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`bg-gradient-to-r ${gradient} ${pulse} text-white text-xs font-semibold px-3 py-1 rounded-full ml-2 shadow-sm flex items-center`}
    >
      {text} <span className="ml-1 font-mono">({complexity})</span>
    </motion.span>
  );
};

const FileUploadCard = ({ file, setFile, loading }: { file: File | null, setFile: (f: File | null) => void, loading: boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full max-w-2xl bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 ${dragActive ? "border-blue-400 shadow-xl" : "border-gray-200/70"} p-8 transition-all duration-300 ease-in-out backdrop-blur-sm bg-white/30`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div 
          animate={{ 
            rotate: dragActive ? [0, 5, -5, 0] : 0,
            scale: dragActive ? 1.05 : 1
          }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-blue-50 rounded-full mb-6 ring-4 ring-blue-100/50"
        >
          <FiUpload className="text-blue-500 text-3xl" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Upload C++ Source File</h3>
        <p className="text-gray-500 mb-8 text-lg max-w-md">Drag & drop your .cpp file or click to browse</p>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className={`px-8 py-4 rounded-xl font-semibold text-lg ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'} text-white transition-all duration-300 relative overflow-hidden`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Select File"
          )}
          <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-20 transition-opacity"></span>
        </motion.button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".cpp,.h,.hpp"
          onChange={handleChange}
          className="hidden"
        />
        
        {file && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center bg-white p-4 rounded-xl shadow-sm w-full border border-gray-200/70 backdrop-blur-sm bg-white/70"
          >
            <div className="flex-1 truncate">
              <p className="font-medium text-gray-800 truncate text-lg">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-gray-600 ml-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX className="text-xl" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const AnalysisResults = ({ metrics, downloading, handleDownloadPDF, setMetrics }: { 
  metrics: any, 
  downloading: boolean, 
  handleDownloadPDF: () => void, 
  setMetrics: (m: null) => void 
}) => {
  const [activeTab, setActiveTab] = useState("functions");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden mt-10 backdrop-blur-sm bg-white/90"
  >
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">Analysis Results</h2>
            <div className="mt-3 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center backdrop-blur-sm">
              <span className="truncate max-w-xs">{metrics.file_name}</span>
            </div>
          </div>
          <div className="flex">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadPDF}
              disabled={downloading}
              className={`flex items-center px-5 py-2.5 rounded-full font-semibold ${downloading ? 'bg-gray-400' : 'bg-white text-blue-600 hover:bg-gray-50 shadow-md'} transition-all relative overflow-hidden`}
            >
              {downloading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <>
                  <FiDownload className="mr-2 text-lg" />
                  Export PDF
                </>
              )}
              <span className="absolute inset-0 bg-black/5 hover:bg-black/10 transition-opacity"></span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMetrics(null)}
              className="flex items-center px-5 py-2.5 rounded-full font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md transition-all relative overflow-hidden ml-3"
            >
              <FiX className="mr-2 text-lg" />
              New Analysis
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex border-b border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 font-medium text-lg relative flex items-center ${activeTab === "functions" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("functions")}
          >
            <FiCode className="mr-2" />
            Function Analysis
            {activeTab === "functions" && (
              <motion.span 
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 font-medium text-lg relative flex items-center ${activeTab === "metrics" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("metrics")}
          >
            <FiBarChart2 className="mr-2" />
            Code Metrics
            {activeTab === "metrics" && (
              <motion.span 
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        </div>

        {activeTab === "metrics" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              Complexity Overview
              <span className="ml-2 text-gray-400 text-sm font-normal flex items-center">
                <FiInfo className="mr-1" /> Hover for details
              </span>
            </h3>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200/70 backdrop-blur-sm bg-white/50">
              <Bar
                data={{
                  labels: Object.keys(metrics.summary),
                  datasets: [
                    {
                      label: "Count",
                      data: Object.values(metrics.summary),
                      backgroundColor: [
                        "rgba(16, 185, 129, 0.7)",
                        "rgba(245, 158, 11, 0.7)",
                        "rgba(239, 68, 68, 0.7)",
                      ],
                      borderColor: [
                        "rgba(16, 185, 129, 1)",
                        "rgba(245, 158, 11, 1)",
                        "rgba(239, 68, 68, 1)",
                      ],
                      borderWidth: 1,
                      borderRadius: 6,
                      hoverBackgroundColor: [
                        "rgba(16, 185, 129, 0.9)",
                        "rgba(245, 158, 11, 0.9)",
                        "rgba(239, 68, 68, 0.9)",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleFont: {
                        size: 14,
                        weight: 'bold'
                      },
                      bodyFont: {
                        size: 13
                      },
                      padding: 12,
                      cornerRadius: 8,
                      displayColors: false,
                      callbacks: {
                        title: (items) => {
                          const item = items[0];
                          return `${item.label} Complexity`;
                        },
                        label: (context) => {
                          const value = context.raw as number;
                          return `${value} function${value !== 1 ? 's' : ''}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      },
                      ticks: {
                        precision: 0,
                      },
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  },
                }}
                height={350}
              />
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 flex items-center">
                  <FiCheckCircle className="mr-2 text-emerald-600" />
                  Simple Functions
                </h4>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{metrics.summary.simple || 0}</p>
                <p className="text-sm text-emerald-500 mt-1">Complexity ≤ 3</p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-800 flex items-center">
                  <FiAlertTriangle className="mr-2 text-amber-600" />
                  Moderate Functions
                </h4>
                <p className="text-3xl font-bold text-amber-600 mt-2">{metrics.summary.moderate || 0}</p>
                <p className="text-sm text-amber-500 mt-1">Complexity 4-6</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-800 flex items-center">
                  <FiAlertTriangle className="mr-2 text-red-600" />
                  Complex Functions
                </h4>
                <p className="text-3xl font-bold text-red-600 mt-2">{metrics.summary.complex || 0}</p>
                <p className="text-sm text-red-500 mt-1">Complexity ≥ 7</p>
              </div>
            </div>
          </motion.div>
        )}

{activeTab === "functions" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            <div className="grid grid-cols-12 gap-5 mb-6 font-medium text-gray-500 text-base">
              <div className="col-span-4 pl-2">Function</div>
              <div className="col-span-2">Complexity</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Space</div>
              <div className="col-span-2">Suggestions</div>
            </div>

            <div className="space-y-4">
              {metrics?.functions_detail?.map((f: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`grid grid-cols-12 gap-5 p-5 rounded-xl ${
                    f.complexity > 6 ? "bg-red-50 border-l-4 border-red-400" : 
                    f.complexity > 3 ? "bg-amber-50 border-l-4 border-amber-400" : 
                    "bg-emerald-50 border-l-4 border-emerald-400"
                  } shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-white/70`}
                >
                  <div className="col-span-4 font-mono font-medium text-gray-800 text-lg truncate">
                    {f.name}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <ComplexityBadge complexity={f.complexity} />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      f.time_complexity?.includes('O(n^2)') || f.time_complexity?.includes('O(2^n)') ? 
                        'bg-red-100 text-red-800' :
                        f.time_complexity?.includes('O(n)') ? 
                        'bg-amber-100 text-amber-800' : 
                        'bg-emerald-100 text-emerald-800'
                    }`}>
                      {f.time_complexity || 'O(1)'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      f.space_complexity?.includes('O(n)') || f.space_complexity?.includes('O(n^2)') ? 
                        'bg-red-100 text-red-800' :
                        f.space_complexity?.includes('O(1)') ? 
                        'bg-emerald-100 text-emerald-800' : 
                        'bg-amber-100 text-amber-800'
                    }`}>
                      {f.space_complexity || 'O(1)'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {f.issues && f.issues.length > 0 ? (
                      <ul className="space-y-3">
                        {f.issues.map((issue: string, i: number) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start"
                          >
                            <FiAlertTriangle className={`flex-shrink-0 mt-1 mr-3 text-lg ${
                              f.complexity > 6 ? "text-red-500" : "text-amber-500"
                            }`} />
                            <span className="flex-1 text-gray-700 text-sm">{issue}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(issue, idx * 100 + i)}
                              className="text-gray-400 hover:text-blue-500 ml-3 transition-colors p-1 rounded hover:bg-gray-100"
                              title="Copy suggestion"
                            >
                              {copiedIndex === idx * 100 + i ? (
                                <FiCheckCircle className="text-green-500 text-lg" />
                              ) : (
                                <FiCopy className="text-lg" />
                              )}
                            </motion.button>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center text-gray-600">
                        <FiCheckCircle className="text-green-500 mr-3 text-lg" />
                        <span className="text-sm">No issues</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default function CodeComplexityAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    if (!isMounted) return;
    setNotification({show: true, message, type});
    setTimeout(() => {
      if (isMounted) setNotification({show: false, message: '', type});
    }, 3000);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/analyze/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMetrics(res.data);
      setFile(null);
      showNotification("Analysis completed successfully!", 'success');
    } catch (err) {
      console.error(err);
      showNotification("Error analyzing code. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!metrics) {
      showNotification("No analysis data available to export", "error");
      return;
    }
  
    setDownloading(true);
    
    try {
      const fileName = metrics.file_name && typeof metrics.file_name === 'string'
        ? metrics.file_name.replace(/\.[^/.]+$/, "")
        : "code_analysis";
  
      const hasAnalysisData = metrics.functions_detail && Array.isArray(metrics.functions_detail) && metrics.functions_detail.length > 0;
      
      if (!hasAnalysisData) {
        throw new Error("No analysis results available to export");
      }
  
      const payload = {
        file_name: fileName,
        functions_detail: metrics.functions_detail || [],
        summary: metrics.summary || {},
        ...metrics
      };
  
      const response = await axios.post(
        "http://127.0.0.1:8000/api/download-pdf/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );
  
      if (!response.data || response.data.size === 0) {
        throw new Error("Received empty PDF file");
      }
  
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes("application/pdf")) {
        throw new Error("Server did not return a PDF file");
      }
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}_analysis.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error("PDF download error:", error);
      let errorMessage = "Failed to generate PDF report";
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data?.message || 
                       `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = "No response from server - check your connection";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            C++ Code Complexity Analyzer
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Professional-grade static analysis to measure and improve your code quality
          </p>
        </motion.div>

        <div className="flex flex-col items-center">
          {!metrics ? (
            <>
              <FileUploadCard file={file} setFile={setFile} loading={loading} />
              
              {file && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  disabled={loading}
                  className={`mt-10 px-10 py-4 rounded-xl font-bold text-xl ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'} text-white transition-all duration-300 relative overflow-hidden`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    <>
                      Analyze Code
                      <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-20 transition-opacity"></span>
                    </>
                  )}
                </motion.button>
              )}
            </>
          ) : (
            <AnalysisResults 
              metrics={metrics} 
              downloading={downloading} 
              handleDownloadPDF={handleDownloadPDF}
              setMetrics={setMetrics}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-xl ${notification.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white flex items-center z-50 backdrop-blur-sm`}
          >
            {notification.type === 'success' ? (
              <FiCheckCircle className="mr-3 text-2xl" />
            ) : (
              <FiAlertTriangle className="mr-3 text-2xl" />
            )}
            <span className="text-lg font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Chart.js tooltip customization */
        .chartjs-tooltip {
          opacity: 1 !important;
          transform: translate(-50%, 0) !important;
          transition: all 0.1s ease;
          pointer-events: none;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(4px);
          background-color: rgba(0, 0, 0, 0.85) !important;
          border-radius: 12px !important;
          padding: 12px 16px !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .chartjs-tooltip-key {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-right: 6px;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}