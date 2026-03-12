import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">ResumeAI</h3>
                        <p className="text-gray-400 text-sm">
                            Simplifying recruitment with the power of Artificial Intelligence.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-800 flex items-center justify-center text-sm text-gray-500 gap-1">
                    <span>Made with</span>
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                    <span>by Antigravity</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
