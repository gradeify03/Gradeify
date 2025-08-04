import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { User, GraduationCap, Bell, Sun, Search, Moon, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";
import * as XLSX from 'xlsx';

const db = getFirestore();
// Update this URL with your new Apps Script deployment URL
const GAS_URL = "/api/upload";

export default function AddStudent() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  
  // Add state for sheet saving
  const [savingSheet, setSavingSheet] = useState(false);
  
  // Add state for file upload and save popup
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [uploadedData, setUploadedData] = useState<{names: string[], rollNumbers: string[]} | null>(null);
  const [fileInputRef] = useState(React.createRef<HTMLInputElement>());
  
  // Add state for data review popup
  const [showDataReviewPopup, setShowDataReviewPopup] = useState(false);
  const [reviewData, setReviewData] = useState<Array<{name: string, roll: string}> | null>(null);
  const [isSendingToSheet, setIsSendingToSheet] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveSheetData = async () => {
    if (!user) {
      toast.error('User not authenticated. Please login again.');
      return;
    }
    
    // Show save popup instead of saving directly
    setShowSavePopup(true);
  };

  const handleSaveWithCustomName = async () => {
    if (!user || !customFileName.trim()) {
      toast.error('Please enter a valid file name.');
      return;
    }
    
    setSavingSheet(true);
    try {
      // Create a unique file ID for this save
      const fileId = `student_data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save sheet metadata to Firestore
      const sheetData = {
        fileId: fileId,
        sheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQdRIN4gs4RZaEG94e4yUKJdOKsFkFGhqxDb3MdD_CbKqHtVOjlJnYbSH9YHOs9pgGW81_CVSdE0JB8/pubhtml",
        savedBy: user.uid,
        savedByEmail: user.email || 'unknown@email.com',
        savedAt: new Date().toISOString(),
        fileName: customFileName.trim(),
        status: 'active',
        type: 'student_data',
        hodId: user.uid
      };
      
      console.log('Attempting to save sheet data:', sheetData);
      
      // Save to HOD's personal collection only (this should work with existing permissions)
      await setDoc(doc(db, "hods", user.uid, "saved_sheets", fileId), sheetData);
      console.log('Successfully saved to HOD collection');
      
      toast.success(`Sheet data saved as "${customFileName.trim()}" successfully!`, { 
        style: { background: '#dcfce7', color: '#166534' } 
      });
      
      console.log('Sheet data saved successfully:', fileId);
      
      // Close popup and reset
      setShowSavePopup(false);
      setCustomFileName('');
      
    } catch (error: any) {
      console.error('Error saving sheet data:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save sheet data. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your Firestore rules.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service unavailable. Please try again.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setSavingSheet(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      toast.error('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    try {
      toast.loading('Processing file...', { id: 'fileProcessing' });
      
      const data = await parseFile(file);
      if (data.length > 0) {
        // Show data review popup instead of immediately sending to Google Sheet
        setReviewData(data);
        setShowDataReviewPopup(true);
        toast.success(`Successfully processed ${data.length} student records! Please review the data.`, { 
          id: 'fileProcessing',
          style: { background: '#dcfce7', color: '#166534' } 
        });
      } else {
        toast.error('No valid student data found in the file. Please check the format. Expected: Name, Roll Number', { id: 'fileProcessing' });
      }
    } catch (error: any) {
      console.error('Error processing file:', error);
      
      let errorMessage = 'Error processing the file. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Failed to read file')) {
          errorMessage = 'Failed to read the file. Please check if the file is corrupted.';
        } else if (error.message.includes('Invalid file format')) {
          errorMessage = 'Invalid file format. Please upload a valid CSV or Excel file.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast.error(errorMessage, { id: 'fileProcessing' });
    }
  };

  const parseFile = (file: File): Promise<Array<{name: string, roll: string}>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let parsedData: Array<{name: string, roll: string}> = [];

          if (file.name.toLowerCase().endsWith('.csv')) {
            // Handle CSV file
            const csvContent = data as string;
            console.log('CSV content preview:', csvContent.substring(0, 200));
            
            const lines = csvContent.split('\n').filter(line => line.trim());
            console.log('Number of lines:', lines.length);
            
            lines.forEach((line, index) => {
              console.log(`Processing line ${index + 1}:`, line);
              
              // Skip header row if it exists
              if (index === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('roll'))) {
                console.log('Skipping header row');
                return;
              }

              // Try different delimiters
              let parts = line.split(',').map(part => part.trim());
              if (parts.length < 2) {
                // Try tab delimiter
                parts = line.split('\t').map(part => part.trim());
              }
              if (parts.length < 2) {
                // Try semicolon delimiter
                parts = line.split(';').map(part => part.trim());
              }
              
              if (parts.length >= 2) {
                const name = parts[0];
                const roll = parts[1];
                if (name && roll) {
                  console.log(`Found valid data: ${name}, ${roll}`);
                  parsedData.push({ name, roll });
                } else {
                  console.log(`Invalid data in line ${index + 1}: name="${name}", roll="${roll}"`);
                }
              } else {
                console.log(`Not enough columns in line ${index + 1}: ${parts.length} columns found`);
              }
            });
          } else {
            // Handle Excel file
            console.log('Processing Excel file');
            const workbook = XLSX.read(data, { type: 'binary' });
            console.log('Available sheets:', workbook.SheetNames);
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            console.log('Excel data preview:', jsonData.slice(0, 3));

            // Skip header row and process data
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i] as any[];
              
              // Skip empty rows
              if (!row || row.length === 0 || (row.length === 1 && !row[0])) {
                continue;
              }
              
              if (row && row.length >= 2) {
                const name = String(row[0] || '').trim();
                const roll = String(row[1] || '').trim();
                if (name && roll) {
                  console.log(`Found valid Excel data: ${name}, ${roll}`);
                  parsedData.push({ name, roll });
                } else {
                  console.log(`Invalid Excel data in row ${i}: name="${name}", roll="${roll}"`);
                }
              } else {
                console.log(`Not enough columns in Excel row ${i}: ${row ? row.length : 0} columns found`);
              }
            }
          }

          resolve(parsedData);
        } catch (error) {
          console.error('Error parsing file:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error('FileReader error');
        reject(new Error('Failed to read file'));
      };

      // Use different reading methods based on file type
      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const sendToGoogleAppsScript = async (data: Array<{name: string, roll: string}>) => {
    try {
      console.log('Sending data to Apps Script:', data);
      
      // Transform data to match Apps Script expectations (name and rollNo)
      const transformedData = data.map(item => ({
        name: item.name,
        rollNo: item.roll  // Convert 'roll' to 'rollNo' to match Apps Script
      }));
      
      console.log('Transformed data for Apps Script:', transformedData);
      
      // Create the exact payload structure your Apps Script expects
      const payload = {
        data: transformedData
      };
      
      console.log('Sending POST request to Apps Script...');
      console.log('Payload:', JSON.stringify(payload));
      
      // Send as JSON with proper headers
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (response.status === 403) {
          errorMessage = '403 Forbidden: Apps Script deployment issue. Please check deployment settings.';
        } else if (response.status === 401) {
          errorMessage = '401 Unauthorized: Apps Script requires authentication. Please check "Who has access" setting.';
        } else if (response.status === 404) {
          errorMessage = '404 Not Found: Apps Script URL is incorrect. Please check the deployment URL.';
        }
        
        throw new Error(errorMessage);
      }
      
      // Try to read the response
      try {
        const result = await response.text();
        console.log('Response text:', result);
        
        // If response is JSON, parse it
        if (result.trim()) {
          try {
            const jsonResult = JSON.parse(result);
            console.log('Parsed JSON response:', jsonResult);
            
            if (jsonResult.status === "error") {
              throw new Error(jsonResult.message || 'Failed to send data to Google Sheet');
            }
            
            if (jsonResult.status === "success") {
              console.log('Apps Script returned success:', jsonResult);
              console.log('New spreadsheet URL:', jsonResult.sheetUrl);
            }
          } catch (parseError) {
            console.log('Response is not JSON, treating as success');
          }
        }
        
        console.log('Data sent to Google Apps Script successfully!');
        return true;
        
      } catch (readError) {
        console.log('Could not read response, but request was sent');
        return true; // Assume success if we can't read response
      }
      
    } catch (error) {
      console.error('Failed to send data to Apps Script:', error);
      throw error;
    }
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleBackToDashboard = () => {
    navigate('/hod_dashboard');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleConfirmDataUpload = async () => {
    if (!reviewData) return;
    
    setIsSendingToSheet(true);
    try {
      // Send data to Google Apps Script
      await sendToGoogleAppsScript(reviewData);
      
      toast.success(`Successfully uploaded ${reviewData.length} student records to Google Sheet 'Data' tab!`, { 
        style: { background: '#dcfce7', color: '#166534' } 
      });
      
      // Close popup and reset
      setShowDataReviewPopup(false);
      setReviewData(null);
      
    } catch (error) {
      console.error('Error sending data to Google Sheet:', error);
      toast.error('Failed to send data to Google Sheet. Please try again.', { 
        style: { background: '#fef2f2', color: '#dc2626' } 
      });
    } finally {
      setIsSendingToSheet(false);
    }
  };

  const handleCancelDataUpload = () => {
    setShowDataReviewPopup(false);
    setReviewData(null);
    toast('Data upload cancelled.', { 
      style: { background: '#f0f9ff', color: '#0369a1' } 
    });
  };

  // Test function to verify Apps Script is working
  const testAppsScript = async () => {
    try {
      console.log('Testing Apps Script connection...');
      const testData = [
        { name: "Test Student 1", roll: "TEST001" },
        { name: "Test Student 2", roll: "TEST002" },
        { name: "Test Student 3", roll: "TEST003" }
      ];
      
      await sendToGoogleAppsScript(testData);
      toast.success('Apps Script test successful! Check your Google Sheet.', {
        style: { background: '#dcfce7', color: '#166534' }
      });
    } catch (error) {
      console.error('Apps Script test failed:', error);
      toast.error(`Apps Script test failed: ${error.message}`, {
        style: { background: '#fef2f2', color: '#dc2626' }
      });
    }
  };

  if (!mounted) {
    return null;
  }

  if (!user) {
    return null;
  }

  // Show minimal loading only if absolutely necessary
  if (userLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#e8f0fa] to-[#d6f5ef] dark:from-[#1a2233] dark:to-[#232946] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#265d4a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e8f0fa] to-[#d6f5ef] dark:from-[#1a2233] dark:to-[#232946] flex">
      {/* Sidebar */}
      <aside
        className="group/sidebar relative h-[calc(100vh-2rem)] m-4 rounded-2xl shadow-xl flex flex-col bg-white/80 dark:bg-[#232946] border-r border-slate-200 dark:border-[#232946] transition-all duration-300 w-20 hover:w-60"
      >
        <div className="flex items-center gap-2 px-4 py-4 mb-4">
          <span className="font-bold text-xl text-[#2d3748] dark:text-white transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0 ml-[-9999px]">Gradeify</span>
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-3">
          <SidebarNavLink icon={<User />} label="Staff" active={false} onClick={() => navigate('/hod_dashboard')} />
          <SidebarNavLink icon={<GraduationCap />} label="Student Data" active={true} onClick={() => {}} />
          <SidebarNavLink icon={<Bell />} label="Notifications" active={false} onClick={() => {}} />
          <SidebarNavLink icon={<Sun />} label="Analytics" active={false} onClick={() => {}} />
          <SidebarNavLink icon={<Search />} label="Wallets" active={false} onClick={() => {}} />
          <SidebarNavLink icon={<Moon />} label="Settings" active={false} onClick={() => {}} />
        </nav>
        <div className="mt-auto flex flex-col gap-2 px-4 py-4 border-t border-slate-200 dark:border-[#232946]">
          <div className="flex items-center gap-3">
            <img src="https://randomuser.me/api/portraits/men/31.jpg" alt="profile" className="w-8 h-8 rounded-full border-2 border-white" />
            <div className="transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0 ml-[-9999px]">
              <p className="text-sm font-medium text-[#2d3748] dark:text-white">HOD</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0 ml-[-9999px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="w-full h-full bg-white dark:bg-[#232946] rounded-2xl shadow-xl p-8">
          {/* Header with Back Button and Theme Toggle */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
          
          {/* Student Data Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#2d3748] dark:text-white">Student Data</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage student information and records</p>
            </div>
          </div>
          
                     {/* Google Sheets Integration */}
           <div className="flex-1 flex flex-col">
             {/* Action Buttons */}
             <div className="flex justify-between items-center mb-4">
               <div>
                 <h3 className="text-lg font-semibold text-[#2d3748] dark:text-white">Student Records</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Manage student data and files</p>
                                   <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    💡 Note: Uploaded data will be sent to the 'Data' tab in your Google Sheet. CORS may affect sync in development.
                  </p>
               </div>
                             <div className="flex gap-3">
                 {/* Open File Button */}
                 <button
                   onClick={handleOpenFile}
                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                   </svg>
                   Open File
                 </button>
                 
                 {/* Test Apps Script Button */}
                 <button
                   onClick={testAppsScript}
                   className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   Test Connection
                 </button>
                 
                 {/* Save Button */}
                 <button
                   onClick={handleSaveSheetData}
                   disabled={savingSheet}
                   className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                 >
                   {savingSheet ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       Saving...
                     </>
                   ) : (
                     <>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                       </svg>
                       Save Sheet
                     </>
                   )}
                 </button>
               </div>
            </div>
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            
            
            
                         {/* Google Sheets Embed - Full Screen */}
             <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
               <iframe
                 src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRLUq9YGix7aJnfFwJmZo_KjZyHnUdvVps6N89GvH44rbyi72buU7ATdOgBXWqKVL2wVc3i-qhxHk19/pubhtml?widget=true&amp;headers=false&amp;chrome=false&amp;rm=minimal"
                 className="w-full h-full border-0"
                 title="Student Data Sheet"
                 allowFullScreen
                 loading="lazy"
                 style={{ minHeight: 'calc(100vh - 400px)' }}
               />
             </div>
          </div>
        </div>
      </main>
      
      <Toaster />
      
             {/* Save Sheet Popup */}
       {showSavePopup && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-[#232946] rounded-2xl p-6 w-full max-w-md mx-4">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                 <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                 </svg>
               </div>
               <div>
                 <h3 className="text-lg font-semibold text-[#2d3748] dark:text-white">Save Sheet Data</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Enter a name for this saved file</p>
               </div>
             </div>
             
             <div className="mb-4">
               <label className="block text-sm font-medium text-[#2d3748] dark:text-white mb-2">
                 File Name
               </label>
               <input
                 type="text"
                 value={customFileName}
                 onChange={(e) => setCustomFileName(e.target.value)}
                 placeholder="Enter file name (e.g., Class_10A_Data)"
                 className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-[#2d3748] dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                 autoFocus
               />
             </div>
             
             <div className="flex gap-3">
               <button
                 onClick={() => {
                   setShowSavePopup(false);
                   setCustomFileName('');
                 }}
                 className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-[#2d3748] dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={handleSaveWithCustomName}
                 disabled={savingSheet || !customFileName.trim()}
                 className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
               >
                 {savingSheet ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                     Saving...
                   </>
                 ) : (
                   'Save File'
                 )}
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Data Review Popup */}
       {showDataReviewPopup && reviewData && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-[#232946] rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                 <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
               </div>
               <div>
                 <h3 className="text-lg font-semibold text-[#2d3748] dark:text-white">Review Student Data</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400">
                   Review the extracted data before uploading to Google Sheet 'Data' tab
                 </p>
               </div>
             </div>
             
             <div className="flex-1 overflow-y-auto mb-4">
               <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                 <div className="flex justify-between items-center mb-3">
                   <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                     Extracted Data ({reviewData.length} records)
                   </h4>
                   <span className="text-xs text-slate-500 dark:text-slate-400">
                     Scroll to see all records
                   </span>
                 </div>
                 
                                   <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-200 dark:bg-slate-700">
                        <tr>
                          <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">Sr. No</th>
                          <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">Student Name</th>
                          <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">Roll Number</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviewData.map((item, index) => (
                          <tr key={index} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                            <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{index + 1}</td>
                            <td className="py-2 px-3 text-slate-800 dark:text-slate-200 font-medium">{item.name}</td>
                            <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{item.roll}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
             </div>
             
             <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
               <button
                 onClick={handleCancelDataUpload}
                 disabled={isSendingToSheet}
                 className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-[#2d3748] dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
               >
                 Cancel
               </button>
               <button
                 onClick={handleConfirmDataUpload}
                 disabled={isSendingToSheet}
                 className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
               >
                 {isSendingToSheet ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                     Uploading to Google Sheet...
                   </>
                 ) : (
                   <>
                     <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                     </svg>
                     Upload to Google Sheet
                   </>
                 )}
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

function SidebarNavLink({ icon, label, active, onClick = () => {} }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors font-medium text-base 
        ${active ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200" : "text-[#2d3748] dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/40"}
      `}
    >
      <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
      <span className="transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0 ml-[-9999px]">{label}</span>
    </div>
  );
} 