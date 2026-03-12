import React from 'react';
import { UploadCloud, Search, FileText } from 'lucide-react';

const steps = [
    {
        icon: <UploadCloud className="w-8 h-8 text-blue-600" />,
        title: "1. Upload Resume",
        description: "Drag & drop your file or click to browse. We support both PDF and DOCX formats."
    },
    {
        icon: <Search className="w-8 h-8 text-blue-600" />,
        title: "2. AI Analysis",
        description: "Our advanced AI scans the document, understanding structure and context to identify key details."
    },
    {
        icon: <FileText className="w-8 h-8 text-blue-600" />,
        title: "3. Get Results",
        description: "Instantly view the extracted data including skills, experience, and education in a structured format."
    }
];

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        How It Works
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Three simple steps to go from unstructured document to structured data.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-100 dark:via-blue-900 to-transparent z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center mb-6 shadow-sm border-4 border-white dark:border-gray-950">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
