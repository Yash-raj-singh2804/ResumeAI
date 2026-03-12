import React from 'react';
import FileUpload from './FileUpload';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Hero = ({ onUploadSuccess }) => {
    return (
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Powered by Gemini AI (Google) & LangChain
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
                    Unlock Insights from your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Resume in Seconds
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                    Transform static documents into structured data. Our AI parser extracts role, skills, experience, and education with high precision.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>PDF & DOCX Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Instant Extraction</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Secure Processing</span>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="max-w-xl mx-auto transform hover:scale-[1.02] transition-transform duration-300">
                    <FileUpload onUploadSuccess={onUploadSuccess} />
                </div>
            </div>
        </div>
    );
};

export default Hero;
