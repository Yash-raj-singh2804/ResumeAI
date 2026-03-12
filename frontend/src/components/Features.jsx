import React from 'react';
import { Zap, Shield, FileJson, Brain, MousePointerClick, Layout } from 'lucide-react';

const features = [
    {
        icon: <Brain className="w-6 h-6 text-white" />,
        title: "AI-Powered Intelligence",
        description: "Leverages Google's Gemini LLM to understand context and nuance in resumes, going beyond simple keyword matching.",
        color: "bg-purple-600"
    },
    {
        icon: <Zap className="w-6 h-6 text-white" />,
        title: "Lightning Fast",
        description: "Get structured results in seconds. Our optimized extraction pipeline ensures minimal latency.",
        color: "bg-yellow-500"
    },
    {
        icon: <FileJson className="w-6 h-6 text-white" />,
        title: "JSON Export",
        description: "Receive data in a clean, standardized JSON format ready for integration with ATS or HR systems.",
        color: "bg-green-500"
    },
    {
        icon: <Shield className="w-6 h-6 text-white" />,
        title: "Secure & Private",
        description: "Your data is processed securely. We don't store your resumes after extraction is complete.",
        color: "bg-blue-600"
    },
    {
        icon: <MousePointerClick className="w-6 h-6 text-white" />,
        title: "Drag & Drop Ready",
        description: "Intuitive interface supporting drag-and-drop actions for PDF and DOCX files.",
        color: "bg-pink-500"
    },
    {
        icon: <Layout className="w-6 h-6 text-white" />,
        title: "Responsive Design",
        description: "Built with modern technologies to work flawlessly on desktop, tablet, and mobile devices.",
        color: "bg-indigo-600"
    }
];

const Features = () => {
    return (
        <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Why Choose Us</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Powerful Features for Modern Hiring
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Everything you need to automate resume parsing and streamline your recruitment workflow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
                            <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                {feature.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
