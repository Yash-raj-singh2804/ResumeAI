import React from 'react';
import { User, Code2, Briefcase, GraduationCap, FileJson, Copy, Check, Layers, ChevronDown } from 'lucide-react';

const ResultDisplay = ({ data }) => {
    const [copied, setCopied] = React.useState(false);

    if (!data) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div id="results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <User className="w-8 h-8" />
                        {data.role || "Candidate Profile"}
                    </h2>
                    <p className="opacity-90">Extracted Insights</p>
                </div>

                <div className="p-8 flex flex-col gap-10">

                    {/* Top Row: Skills & Education */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Skills */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white">
                                <Code2 className="w-6 h-6 text-blue-500" />
                                <h3>Skills</h3>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl h-full border border-gray-100 dark:border-gray-700">
                                <div className="flex flex-wrap gap-2">
                                    {data.skills && data.skills.map((skill, index) => (
                                        <span key={index} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800/50">
                                            {skill}
                                        </span>
                                    ))}
                                    {(!data.skills || data.skills.length === 0) && <p className="text-gray-500 italic">No skills found.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Education */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white">
                                <GraduationCap className="w-6 h-6 text-blue-500" />
                                <h3>Education</h3>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl h-full border border-gray-100 dark:border-gray-700">
                                <ul className="space-y-3">
                                    {data.education && data.education.map((edu, index) => (
                                        <li key={index} className="flex gap-3 text-gray-700 dark:text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0"></div>
                                            <span>{edu}</span>
                                        </li>
                                    ))}
                                    {(!data.education || data.education.length === 0) && <p className="text-gray-500 italic">No education details found.</p>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white relative z-10">
                            <Briefcase className="w-6 h-6 text-purple-500" />
                            <h3>Projects</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <ul className="space-y-4">
                                {data.projects && data.projects.map((proj, index) => (
                                    <li key={index} className="flex gap-3 text-gray-700 dark:text-gray-300 p-3 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                        <span>{proj}</span>
                                    </li>
                                ))}
                                {(!data.projects || data.projects.length === 0) && <p className="text-gray-500 italic">No projects found.</p>}
                            </ul>
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white">
                            <Briefcase className="w-6 h-6 text-blue-500" />
                            <h3>Experience</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <ul className="space-y-4">
                                {data.experience && data.experience.map((exp, index) => (
                                    <li key={index} className="flex gap-3 text-gray-700 dark:text-gray-300 p-3 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                                        <span>{exp}</span>
                                    </li>
                                ))}
                                {(!data.experience || data.experience.length === 0) && <p className="text-gray-500 italic">No experience found.</p>}
                            </ul>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
                    <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer list-none">
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                <FileJson className="w-5 h-5" />
                                View Raw JSON
                            </span>
                            <button
                                onClick={(e) => { e.preventDefault(); copyToClipboard(); }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy JSON'}
                            </button>
                        </summary>
                        <div className="mt-4 relative">
                            <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-auto text-xs sm:text-sm font-mono leading-relaxed max-h-96 shadow-inner">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    </details>
                </div>

                {/* Debug / Parsing Details Section */}
                {data.parsing_debug && (
                    <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    <Layers className="w-5 h-5" />
                                    View Parsing Details (Debug)
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-300" />
                            </summary>
                            <div className="mt-6 flex flex-col xl:flex-row gap-6 h-[800px]">
                                {/* Left Side: Original Resume */}
                                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                                        <span className="font-semibold text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Original Document
                                        </span>
                                    </div>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-900 relative">
                                        {data.file_url && data.file_url.toLowerCase().endsWith('.pdf') ? (
                                            <iframe
                                                src={data.file_url}
                                                className="w-full h-full"
                                                title="Resume View"
                                            />
                                        ) : data.file_url ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
                                                <p>Preview not available for this file type.</p>
                                                <a
                                                    href={data.file_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Download / Open File
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                                Preview unavailable
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Parsing Blocks */}
                                <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Raw text blocks identified by the classifier vs Original Document.
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        {Object.entries(data.parsing_debug).map(([category, content]) => (
                                            content && (
                                                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shrink-0">
                                                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                                        <span className="font-semibold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                            {category}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {content.length} chars
                                                        </span>
                                                    </div>
                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 max-h-60 overflow-y-auto custom-scrollbar">
                                                        <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400 font-mono">
                                                            {content || <em className="text-gray-400">No content identified</em>}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </details>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResultDisplay;
