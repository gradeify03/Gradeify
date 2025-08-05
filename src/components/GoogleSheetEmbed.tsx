import React, { useState } from 'react';
import { FaExpand } from 'react-icons/fa';

interface GoogleSheetEmbedProps {
  sheetUrl: string;
  title?: string;
}

export default function GoogleSheetEmbed({ sheetUrl, title = "Student Data Sheet" }: GoogleSheetEmbedProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);



  const handleMaximizeClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Embedded Sheet Container */}
      <div className="relative bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                 {/* Maximize Button */}
         <div className="absolute top-4 right-4 z-10">
           <button
             onClick={handleMaximizeClick}
             className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
             title="Open in full-screen mode"
           >
             <FaExpand className="w-3 h-4" />
             {/* <span className="hidden sm:inline"></span> */}
           </button>
         </div>

        {/* Embedded Sheet */}
        <iframe
          src={sheetUrl}
          className="w-full border-0"
          title={title}
          allowFullScreen
          loading="lazy"
          style={{ minHeight: 'calc(100vh - 400px)' }}
        />
      </div>

      {/* Full-Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#232946] rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#2d3748] dark:text-white">{title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Full-screen view</p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6">
              <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <iframe
                  src={sheetUrl}
                  className="w-full h-full border-0"
                  title={`${title} - Full Screen`}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
             )}


     </>
   );
 } 