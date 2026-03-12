import React, { useState, useEffect } from 'react';
import { Key, Webhook, Copy, Trash2, Plus, Check, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE;

const DeveloperPortal = () => {
    // State
    const [activeTab, setActiveTab] = useState('apikeys');
    const [apiKeys, setApiKeys] = useState([]);
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Form States
    const [newKeyName, setNewKeyName] = useState('');
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookEvents, setNewWebhookEvents] = useState(['resume.parsed']);
    const [currentApiKey, setCurrentApiKey] = useState(() => localStorage.getItem('devApiKey') || '');
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);

    const availableEvents = ['resume.parsed', 'ats.score.generated', 'resume.failed'];

    // Effects
    useEffect(() => {
        if (currentApiKey) {
            fetchWebhooks();
        }
    }, [currentApiKey]);

    // API Functions
    const createApiKey = async () => {
        if (!newKeyName.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName })
            });
            if (!res.ok) throw new Error('Failed to create API key');
            const data = await res.json();
            setNewlyCreatedKey(data.api_key);
            setCurrentApiKey(data.api_key);
            localStorage.setItem('devApiKey', data.api_key);
            setApiKeys([...apiKeys, { name: data.name, key_prefix: data.key_prefix }]);
            setNewKeyName('');
            setSuccessMessage('API Key created! Copy it now - you won\'t see it again.');
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchWebhooks = async () => {
        if (!currentApiKey) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/webhooks/`, {
                headers: { 'x-api-key': currentApiKey }
            });
            if (!res.ok) throw new Error('Failed to fetch webhooks');
            const data = await res.json();
            setWebhooks(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const createWebhook = async () => {
        if (!newWebhookUrl.trim() || !currentApiKey) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/webhooks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': currentApiKey
                },
                body: JSON.stringify({
                    target_url: newWebhookUrl,
                    event_types: newWebhookEvents
                })
            });
            if (!res.ok) throw new Error('Failed to create webhook');
            const data = await res.json();
            setWebhooks([...webhooks, data]);
            setNewWebhookUrl('');
            setSuccessMessage('Webhook created successfully!');
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteWebhook = async (id) => {
        if (!currentApiKey) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/webhooks/${id}`, {
                method: 'DELETE',
                headers: { 'x-api-key': currentApiKey }
            });
            if (!res.ok) throw new Error('Failed to delete webhook');
            setWebhooks(webhooks.filter(w => w.id !== id));
            setSuccessMessage('Webhook deleted.');
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccessMessage('Copied to clipboard!');
        setTimeout(() => setSuccessMessage(null), 2000);
    };

    const toggleEvent = (event) => {
        if (newWebhookEvents.includes(event)) {
            setNewWebhookEvents(newWebhookEvents.filter(e => e !== event));
        } else {
            setNewWebhookEvents([...newWebhookEvents, event]);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Developer Portal</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Manage your API keys and webhook integrations
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-300">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">&times;</button>
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-2 text-green-800 dark:text-green-300">
                        <Check className="w-5 h-5" />
                        {successMessage}
                        <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-600 hover:text-green-800">&times;</button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('apikeys')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'apikeys'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <Key className="w-5 h-5" />
                        API Keys
                    </button>
                    <button
                        onClick={() => setActiveTab('webhooks')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'webhooks'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <Webhook className="w-5 h-5" />
                        Webhooks
                    </button>
                </div>

                {/* API Keys Tab */}
                {activeTab === 'apikeys' && (
                    <div className="space-y-6">
                        {/* Create API Key */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New API Key</h2>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Key name (e.g., My Integration)"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={createApiKey}
                                    disabled={loading || !newKeyName.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Generate
                                </button>
                            </div>

                            {/* Show newly created key */}
                            {newlyCreatedKey && (
                                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2 font-medium">
                                        ⚠️ Copy this key now! It won't be shown again.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                                            {newlyCreatedKey}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(newlyCreatedKey)}
                                            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Current Key Input */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your API Key</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Enter your API key to manage webhooks
                            </p>
                            <input
                                type="password"
                                placeholder="sk_live_..."
                                value={currentApiKey}
                                onChange={(e) => {
                                    setCurrentApiKey(e.target.value);
                                    localStorage.setItem('devApiKey', e.target.value);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            />
                        </div>
                    </div>
                )}

                {/* Webhooks Tab */}
                {activeTab === 'webhooks' && (
                    <div className="space-y-6">
                        {!currentApiKey ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-6 text-center">
                                <p className="text-yellow-800 dark:text-yellow-300">
                                    Please enter your API key in the API Keys tab first.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Create Webhook */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Webhook</h2>
                                    <div className="space-y-4">
                                        <input
                                            type="url"
                                            placeholder="https://your-server.com/webhook"
                                            value={newWebhookUrl}
                                            onChange={(e) => setNewWebhookUrl(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Events to subscribe:
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {availableEvents.map(event => (
                                                    <button
                                                        key={event}
                                                        onClick={() => toggleEvent(event)}
                                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${newWebhookEvents.includes(event)
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        {event}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={createWebhook}
                                            disabled={loading || !newWebhookUrl.trim()}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create Webhook
                                        </button>
                                    </div>
                                </div>

                                {/* Webhook List */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Webhooks</h2>
                                        <button
                                            onClick={fetchWebhooks}
                                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                        >
                                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>

                                    {webhooks.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                            No webhooks configured yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {webhooks.map(webhook => (
                                                <div
                                                    key={webhook.id}
                                                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-mono text-sm text-gray-900 dark:text-white truncate">
                                                                {webhook.target_url}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {webhook.event_types?.map(event => (
                                                                    <span
                                                                        key={event}
                                                                        className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                                                                    >
                                                                        {event}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                                Secret: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{webhook.secret_key?.slice(0, 8)}...</code>
                                                                <button
                                                                    onClick={() => copyToClipboard(webhook.secret_key)}
                                                                    className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                                >
                                                                    <Copy className="w-3 h-3 inline" />
                                                                </button>
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteWebhook(webhook.id)}
                                                            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeveloperPortal;
