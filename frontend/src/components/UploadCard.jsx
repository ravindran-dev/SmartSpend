import React, { useRef, useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle, Calendar, Clock, FileText, Image, Edit3, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { getCurrentLocalDate, formatDisplayDate } from '../utils/dateUtils';


export default function UploadCard() {
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [fileType, setFileType] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualData, setManualData] = useState({
    vendor: '',
    amount: '',
    category: '',
    date: getCurrentLocalDate(),
    items: []
  });
  const fileInput = useRef();

  const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Healthcare',
    'Entertainment',
    'Travel',
    'Education',
    'Groceries',
    'Other'
  ];

  const handleFile = async (file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload an image file (JPEG, PNG, GIF, BMP) or PDF document');
      return;
    }
    
    setLoading(true);
    setError("");
    setExtractedData(null);
    setFileType(file.type);

    try {
      // Create FormData to send file to backend
      const formData = new FormData();
      formData.append(file.type === 'application/pdf' ? 'pdf' : 'image', file);

      // Call the ML backend API
      const response = await fetch('http://localhost:5000/api/process-bill', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary for FormData
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.manual_entry_required) {
          // Handle manual entry case
          setExtractedData({
            ...result,
            vendor: 'Enter vendor name',
            amount: 0,
            category: 'Select category',
            date: getCurrentLocalDate(),
            items: ['Manual entry required - Install Tesseract OCR for automatic extraction']
          });
          setError('⚠️ Tesseract OCR not installed. Please enter details manually or install Tesseract for automatic extraction.');
        } else {
          // Normal OCR extraction
          setExtractedData(result);
          setError(null);
        }
      } else {
        setError(result.error || 'Failed to process bill');
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('❌ Cannot connect to ML backend. Please check:\n• Backend server is running on http://localhost:5000\n• No firewall is blocking the connection\n• Try refreshing the page');
      } else if (err.message.includes('HTTP error')) {
        setError(`❌ Backend error: ${err.message}\nCheck the backend console for details.`);
      } else {
        setError(`❌ Upload failed: ${err.message}`);
      }
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToExpenses = async () => {
    const dataToSave = manualEntry ? manualData : extractedData;
    if (!dataToSave) return;
    
    // Validate manual entry fields
    if (manualEntry) {
      if (!manualData.vendor.trim()) {
        setError('Please enter vendor name');
        return;
      }
      if (!manualData.amount || manualData.amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      if (!manualData.category) {
        setError('Please select a category');
        return;
      }
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Create expense object with validated date
      const rawDate = dataToSave.date || dataToSave.dates?.[0];
      let validDate = getCurrentLocalDate(); // Default to current date
      
      if (rawDate && rawDate !== 'Invalid Date' && rawDate !== '') {
        // Clean the date string - remove time if present
        const cleanDate = String(rawDate).split(' ')[0];
        
        // Validate the date format
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
          const testDate = new Date(cleanDate);
          if (!isNaN(testDate.getTime())) {
            validDate = cleanDate;
          }
        }
      }
      
      const expenseData = {
        vendor: dataToSave.vendor,
        amount: parseFloat(dataToSave.amount) || dataToSave.total_amount,
        currency: dataToSave.currency || 'INR',
        category: dataToSave.category,
        date: validDate,
        items: dataToSave.items || []
      };
      
      // Send to backend
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      });

      const result = await response.json();
      
      if (result.success) {
        setSaved(true);
        
        // Trigger refresh of expenses list and charts
        window.dispatchEvent(new CustomEvent('expenseAdded', { detail: result.expense }));
        
        // Show success message and reset
        setTimeout(() => {
          setSaved(false);
          setExtractedData(null);
          if (manualEntry) {
            setManualData({
              vendor: '',
              amount: '',
              category: '',
              date: getCurrentLocalDate(),
              items: []
            });
            setManualEntry(false);
          }
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to save expense');
      }
      
    } catch (err) {
      setError(`Failed to save expense: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntryToggle = () => {
    setManualEntry(!manualEntry);
    setExtractedData(null);
    setError("");
    if (!manualEntry) {
      setManualData({
        vendor: '',
        amount: '',
        category: '',
        date: getCurrentLocalDate(),
        items: []
      });
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <motion.div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* System Status and Date Info */}
      <div className="mb-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Current Date</span>
          </div>
          <span className="text-sm text-blue-700 font-semibold">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          📅 Today: {getCurrentLocalDate()} | 
          Receipts without a detected date Model will use today's date by default.
        </p>
      </div>
      
      {/* Manual Entry Toggle */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleManualEntryToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            manualEntry 
              ? 'bg-orange-100 text-orange-700 border border-orange-200' 
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
          }`}
        >
          {manualEntry ? (
            <>
              <UploadCloud size={16} />
              Switch to File Upload
            </>
          ) : (
            <>
              <Edit3 size={16} />
              Manual Entry
            </>
          )}
        </button>
      </div>

      {/* Manual Entry Form */}
      {manualEntry && (
        <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 text-orange-700 mb-4">
            <Plus size={16} />
            <span className="font-semibold">Add Expense Manually</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name *
              </label>
              <input
                type="text"
                value={manualData.vendor}
                onChange={(e) => setManualData(prev => ({...prev, vendor: e.target.value}))}
                placeholder="Enter vendor/store name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                value={manualData.amount}
                onChange={(e) => setManualData(prev => ({...prev, amount: e.target.value}))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={manualData.category}
                onChange={(e) => setManualData(prev => ({...prev, category: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={manualData.date}
                onChange={(e) => setManualData(prev => ({...prev, date: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Add Button for Manual Entry */}
          <button 
            onClick={handleAddToExpenses}
            disabled={loading || saved || !manualData.vendor.trim() || !manualData.amount || !manualData.category}
            className={`w-full py-2 px-4 rounded transition ${
              saved 
                ? 'bg-green-600 text-white' 
                : 'bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </div>
            ) : saved ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={16} />
                Added Successfully!
              </div>
            ) : (
              'Add Manual Expense'
            )}
          </button>
        </div>
      )}
      
      {/* File Upload Area */}
      {!manualEntry && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer hover:border-blue-400 transition"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInput.current.click()}
        >
          <div className="flex items-center gap-3 mb-3">
            <Image size={28} className="text-blue-400" />
            <FileText size={28} className="text-red-400" />
          </div>
          <UploadCloud size={32} className="text-gray-400 mb-2" />
          <span className="text-gray-600 font-medium">Upload Invoice or Receipt</span>
          <span className="text-gray-500 text-sm">Support: Images (JPG, PNG) & PDF documents</span>
          <input 
            type="file" 
            ref={fileInput} 
            className="hidden" 
            accept="image/*,application/pdf"
            onChange={e => handleFile(e.target.files[0])} 
          />
        </div>
      )}
      
      {/* Status Messages */}
      {loading && (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span>
            Processing {fileType === 'application/pdf' ? 'PDF invoice' : 'image'} with ML...
            {fileType === 'application/pdf' && ' 📄'}
            {fileType?.startsWith('image/') && ' 🖼️'}
          </span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success notification */}
      {saved && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded border border-green-200">
          <CheckCircle size={16} />
          <div>
            <span className="font-semibold">Expense saved successfully!</span>
            <p className="text-sm text-green-700">
              ₹{(manualEntry ? parseFloat(manualData.amount) : (extractedData?.total_amount || extractedData?.amount))?.toFixed(2)} expense from {manualEntry ? manualData.vendor : extractedData?.vendor} has been added to your records.
            </p>
          </div>
        </div>
      )}
      
      {/* Extracted Data Display */}
      {extractedData && !manualEntry && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={16} />
            <span className="font-semibold">Bill processed successfully!</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-3">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Vendor</h3>
              <p className="text-sm">{extractedData.vendor}</p>
            </div>
            
            <div className="bg-gray-50 rounded p-3">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Total Amount</h3>
              <p className="text-lg font-bold text-green-600">
                ₹{(extractedData.amount || extractedData.total_amount || 0).toFixed(2)}
              </p>
              {extractedData.currency && (
                <p className="text-xs text-gray-500">{extractedData.currency}</p>
              )}
            </div>
            
            <div className="bg-gray-50 rounded p-3">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Category</h3>
              <p className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
                {extractedData.category}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-gray-600" />
                <h3 className="font-semibold text-sm text-gray-700">Date</h3>
              </div>
              {(() => {
                const dateInfo = formatDisplayDate(extractedData.date || extractedData.dates?.[0]);
                return (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{dateInfo.formatted}</p>
                    <div className="flex items-center gap-2">
                      {dateInfo.isToday ? (
                        <>
                          <Clock size={12} className="text-green-600" />
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            {dateInfo.note}
                          </span>
                        </>
                      ) : (
                        <>
                          <Calendar size={12} className="text-blue-600" />
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {dateInfo.note}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Raw: {dateInfo.raw}</p>
                  </div>
                );
              })()}
            </div>
          </div>
          
          {extractedData.items && extractedData.items.length > 0 && (
            <div className="bg-gray-50 rounded p-3">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Line Items</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {extractedData.items.slice(0, 5).map((item, index) => (
                  <p key={index} className="text-xs text-gray-600">{item}</p>
                ))}
                {extractedData.items.length > 5 && (
                  <p className="text-xs text-gray-500">... and {extractedData.items.length - 5} more items</p>
                )}
              </div>
            </div>
          )}
          
          <button 
            onClick={handleAddToExpenses}
            disabled={loading || saved}
            className={`w-full py-2 px-4 rounded transition ${
              saved 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </div>
            ) : saved ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={16} />
                Added Successfully!
              </div>
            ) : (
              'Add to Expenses'
            )}
          </button>
        </div>
      )}
      
      {/* OCR Preview for debugging */}
      {extractedData && !manualEntry && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            View Raw OCR Text
          </summary>
          <div className="bg-gray-50 rounded p-3 mt-2 text-xs text-gray-700 max-h-32 overflow-auto">
            {extractedData.extracted_text || "No text extracted"}
          </div>
        </details>
      )}
    </motion.div>
  );
}
