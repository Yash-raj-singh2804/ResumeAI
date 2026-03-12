import React from 'react';
import { Bot, Moon, Sun, Github } from 'lucide-react';

const Navbar = ({ darkMode, setDarkMode }) => {
    return (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:text-white">
                            ResumeAI
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <a href="#features" className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works" className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            How it Works
                        </a>
                        <a href="/admin" className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Admin
                        </a>
                        <a
                            href="/#candidate-search"
                            onClick={(e) => {
                                if (window.location.pathname === '/') {
                                    e.preventDefault();
                                    document.getElementById('candidate-search')?.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Search
                        </a>
                        <a href="/developers" className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Developers
                        </a>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Toggle Dark Mode"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <a
                            href="https://github.com/Yash-raj-singh2804/ResumeAI/tree/main"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                        >
                            <Github className="w-4 h-4" />
                            <span>Star on GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
