'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Database, 
  Server, 
  Activity, 
  Settings, 
  RefreshCw, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Cloud,
  HardDrive,
  Zap,
  Clock,
  BarChart3,
  TrendingUp,
  FileText,
  Brain,
  Shield,
  Info,
  Users
} from 'lucide-react';

type MetricsData = {
  timestamp: string;
  aggregate: {
    averageDurationMs: number;
    totalAnalyses: number;
    cacheMetrics: {
      hits: number;
      misses: number;
      hitRate: number;
      totalRequests: number;
    } | null;
  } | null;
  activity?: {
    activeAnalyses: number;
    activeImports: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    totalRequests: number;
  } | null;
  redis: {
    available: boolean;
    connected: boolean;
    error?: string;
  };
  blob: {
    enabled: boolean;
    accessible: boolean;
    error?: string;
  };
  system: {
    adminEnabled: boolean;
    redisAvailable: boolean;
    overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  };
  configuration?: {
    textModel: string;
    visionModel: string;
    textModelFallbacks: string[];
    maxUploadSizeMb: number;
    analysisTimeoutMs: number;
    openrouterConfigured: boolean;
    openrouterKeyPreview: string | null;
    openrouterStatus?: {
      configured: boolean;
      reachable: boolean;
      error?: string;
    };
  };
};

export default function AdminDashboard() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [llmActivity, setLlmActivity] = useState<any[]>([]);
  const [activityStream, setActivityStream] = useState<AbortController | null>(null);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [errorFilter, setErrorFilter] = useState<string>('');
  const [logSize, setLogSize] = useState<{ bytes: number; mb: string } | null>(null);
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheClearMessage, setCacheClearMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated && autoRefresh) {
      const interval = setInterval(() => {
        fetchMetrics();
        fetchErrors();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated, autoRefresh]);

  useEffect(() => {
    if (authenticated) {
      fetchErrors();
    }
  }, [authenticated, errorFilter]);

  useEffect(() => {
    if (selectedConversationId && authenticated && secret) {
      const abortController = new AbortController();
      
      (async () => {
        try {
          const response = await fetch(
            `/api/admin/llm-activity/${selectedConversationId}`,
            {
              headers: {
                'x-admin-secret': secret
              },
              signal: abortController.signal
            }
          );

          if (!response.ok) {
            if (response.status === 401) {
              setError('Unauthorized - check admin secret');
              setAuthenticated(false);
            } else {
              setError('Failed to connect to activity stream');
            }
            return;
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) return;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'activity') {
                    setLlmActivity(prev => [...prev, data.event].slice(-100));
                  } else if (data.type === 'connected') {
                    setError(null);
                  } else if (data.type === 'error') {
                    setError(`Stream error: ${data.error}`);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            setError('Activity stream error: ' + error.message);
          }
        }
      })();

      setActivityStream(abortController);

      return () => {
        abortController.abort();
      };
    } else {
      if (activityStream) {
        activityStream.abort();
        setActivityStream(null);
      }
      setLlmActivity([]);
    }
  }, [selectedConversationId, authenticated, secret]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/metrics', {
        headers: {
          'x-admin-secret': secret
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setAuthenticated(true);
        setError(null);
      } else {
        setError('Invalid admin secret');
        setAuthenticated(false);
      }
    } catch (err) {
      setError('Failed to connect to admin API');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics', {
        headers: {
          'x-admin-secret': secret
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } else if (response.status === 401) {
        setAuthenticated(false);
        setError('Session expired. Please login again.');
      }
    } catch (err) {
      setError('Failed to fetch metrics');
    }
  };

  const fetchErrors = async () => {
    try {
      const url = `/api/admin/errors?limit=50${errorFilter ? `&filter=${encodeURIComponent(errorFilter)}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'x-admin-secret': secret
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentErrors(data.errors || []);
        // Show log size if available
        if (data.logSizeBytes !== undefined) {
          setLogSize({
            bytes: data.logSizeBytes,
            mb: data.logSizeMB || '0.00'
          });
        }
      }
    } catch (err) {
      // Silently fail - errors are not critical
    }
  };

  const clearCache = async () => {
    if (!confirm('Clear analysis cache and reset cache metrics?')) {
      return;
    }

    setClearingCache(true);
    setCacheClearMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/cache/clear', {
        method: 'POST',
        headers: {
          'x-admin-secret': secret
        }
      });

      if (response.ok) {
        const data = await response.json();
        const deleted = data.deletedCacheKeys ?? 0;
        const metricsCleared = data.clearedMetricKeys ?? 0;
        setCacheClearMessage(
          `Cleared ${deleted} cache entr${deleted === 1 ? 'y' : 'ies'} and reset ${metricsCleared} cache metric key${metricsCleared === 1 ? '' : 's'}.`
        );
        await fetchMetrics();
      } else if (response.status === 401) {
        setAuthenticated(false);
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to clear cache');
      }
    } catch (err) {
      setError('Failed to clear cache');
    } finally {
      setClearingCache(false);
    }
  };

  const StatusBadge = ({ status, label }: { status: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">{label}:</span>
      {status ? (
        <span className="flex items-center gap-1 text-primary font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Yes
        </span>
      ) : (
        <span className="flex items-center gap-1 text-destructive font-semibold">
          <XCircle className="w-4 h-4" />
          No
        </span>
      )}
    </div>
  );

  const HealthBadge = ({ health }: { health: 'healthy' | 'degraded' | 'unhealthy' }) => {
    const colors = {
      healthy: 'bg-primary/20 text-primary border-primary/50',
      degraded: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50 dark:bg-yellow-400/20 dark:text-yellow-400 dark:border-yellow-400/50',
      unhealthy: 'bg-destructive/20 text-destructive border-destructive/50'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[health]}`}>
        {health.toUpperCase()}
      </span>
    );
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card/90 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-border shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm text-center mb-6">Enter your admin secret to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="secret" className="block text-sm font-medium text-foreground mb-2">
                Admin Secret
              </label>
              <input
                id="secret"
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder="Enter admin secret"
                required
              />
            </div>
            {error && (
              <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3 text-destructive-foreground text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Login
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              System monitoring and metrics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 text-foreground bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border cursor-pointer hover:bg-card transition-colors">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span className="text-sm">Auto-refresh (5s)</span>
            </label>
            <button
              onClick={fetchMetrics}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => {
                setAuthenticated(false);
                setSecret('');
                setMetrics(null);
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-4 text-destructive-foreground mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {metrics && (
          <>
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">System Health</h3>
                  </div>
                  <HealthBadge health={metrics.system.overallHealth} />
                </div>
                <div className="space-y-2">
                  <StatusBadge status={metrics.system.adminEnabled} label="Admin" />
                  <StatusBadge status={metrics.system.redisAvailable} label="Redis Available" />
                </div>
              </div>

              <div className="bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Redis</h3>
                </div>
                <div className="space-y-2">
                  <StatusBadge status={metrics.redis.available} label="Available" />
                  <StatusBadge status={metrics.redis.connected} label="Connected" />
                  {metrics.redis.error && (
                    <div className="text-destructive text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {metrics.redis.error}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Cloud className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Blob Storage</h3>
                </div>
                <div className="space-y-2">
                  <StatusBadge status={metrics.blob.enabled} label="Enabled" />
                  <StatusBadge status={metrics.blob.accessible} label="Accessible" />
                  {metrics.blob.error && (
                    <div className="text-destructive text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {metrics.blob.error}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Last Update</h3>
                </div>
                <div className="text-muted-foreground text-sm">
                  {new Date(metrics.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Live Activity */}
            {metrics.activity && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Active Analyses</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">live</span>
                  </div>
                  <div className="text-4xl font-bold text-foreground">
                    {metrics.activity.activeAnalyses}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Conversations currently being analyzed (progress &lt; 100%)
                  </p>
                </div>

                <div className="bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Active Imports</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">live</span>
                  </div>
                  <div className="text-4xl font-bold text-foreground">
                    {metrics.activity.activeImports}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload/import requests currently processing
                  </p>
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Cache Metrics */}
              {metrics.cache && (
                <div className="bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">Cache Metrics</h3>
                    </div>
                    <button
                      onClick={clearCache}
                      disabled={clearingCache}
                      className="text-xs bg-accent/10 hover:bg-accent/20 text-foreground px-3 py-1.5 rounded-lg border border-border flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {clearingCache ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <HardDrive className="w-4 h-4" />
                      )}
                      {clearingCache ? 'Clearing...' : 'Clear cache'}
                    </button>
                  </div>
                  {cacheClearMessage && (
                    <div className="mb-3 text-xs text-muted-foreground flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      {cacheClearMessage}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Hits:</span>
                      <span className="text-primary font-semibold">{metrics.cache.hits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Misses:</span>
                      <span className="text-accent font-semibold">{metrics.cache.misses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Hit Rate:</span>
                      <span className="text-primary font-semibold">
                        {(metrics.cache.hitRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Requests:</span>
                      <span className="text-foreground font-semibold">{metrics.cache.totalRequests.toLocaleString()}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                          style={{ width: `${metrics.cache.hitRate * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Metrics */}
              {metrics.aggregate && (
                <div className="bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Analysis Metrics</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Analyses:</span>
                      <span className="text-foreground font-semibold">{metrics.aggregate.totalAnalyses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Avg Duration:</span>
                      <span className="text-primary font-semibold">
                        {(metrics.aggregate.averageDurationMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                    {metrics.aggregate.cacheMetrics && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Cache Hits:</span>
                          <span className="text-primary font-semibold">
                            {metrics.aggregate.cacheMetrics.hits.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Cache Hit Rate:</span>
                          <span className="text-primary font-semibold">
                            {(metrics.aggregate.cacheMetrics.hitRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Configuration */}
              {metrics.configuration && (
                <div className="bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Configuration</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Text Model:</span>
                      <div className="text-foreground font-mono text-xs mt-1 break-all">
                        {metrics.configuration.textModel}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vision Model:</span>
                      <div className="text-foreground font-mono text-xs mt-1 break-all">
                        {metrics.configuration.visionModel}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Max Upload:</span>
                      <span className="text-foreground">{metrics.configuration.maxUploadSizeMb} MB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Timeout:</span>
                      <span className="text-foreground">{(metrics.configuration.analysisTimeoutMs / 1000).toFixed(0)}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">OpenRouter:</span>
                      <StatusBadge status={metrics.configuration.openrouterConfigured} label="" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">API key:</span>
                      <span className="text-foreground font-mono text-xs">
                        {metrics.configuration.openrouterKeyPreview || 'missing'}
                      </span>
                    </div>
                    {metrics.configuration.openrouterStatus && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">OpenRouter Reachable:</span>
                        <StatusBadge status={metrics.configuration.openrouterStatus.reachable} label="" />
                      </div>
                    )}
                    {metrics.configuration.openrouterStatus?.error && (
                      <div className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-md p-2">
                        {metrics.configuration.openrouterStatus.error}
                      </div>
                    )}
                    {metrics.configuration.textModelFallbacks.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-muted-foreground text-xs">Fallbacks:</span>
                        <div className="text-foreground/80 text-xs mt-1">
                          {metrics.configuration.textModelFallbacks.slice(0, 2).join(', ')}
                          {metrics.configuration.textModelFallbacks.length > 2 && '...'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* LLM Activity Monitor */}
            <div className="mt-6 bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">LLM Activity Monitor</h2>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={selectedConversationId}
                    onChange={(e) => setSelectedConversationId(e.target.value)}
                    placeholder="Enter conversation ID to monitor"
                    className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* OpenRouter test */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={async () => {
                    setTestResult('Running...');
                    try {
                      const res = await fetch('/api/admin/openrouter-test', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret || '' },
                        body: JSON.stringify({ prompt: 'ping' })
                      });
                      const data = await res.json();
                      if (!res.ok || !data.ok) {
                        setTestResult(`Fail (${res.status}): ${data.error || 'unknown'}`);
                      } else {
                        setTestResult(`OK: ${data.text || 'no text'}`);
                      }
                    } catch (e: any) {
                      setTestResult(`Error: ${e.message}`);
                    }
                  }}
                  className="text-sm px-3 py-2 rounded-md border border-border bg-muted hover:bg-muted/70 transition"
                  disabled={!authenticated || !secret}
                >
                  Test OpenRouter
                </button>
                {testResult && (
                  <span className="text-xs text-muted-foreground">{testResult}</span>
                )}
              </div>

              {selectedConversationId && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {llmActivity.length === 0 ? (
                    <div className="text-muted-foreground text-sm flex items-center gap-2 py-8 justify-center">
                      <Info className="w-4 h-4" />
                      No activity yet. Waiting for LLM requests...
                    </div>
                  ) : (
                    llmActivity.map((event, idx) => (
                      <div
                        key={idx}
                        className="bg-muted/50 rounded-lg p-3 text-sm font-mono border border-border hover:bg-muted transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-primary font-semibold">{event.eventType}</span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-foreground/80">
                          Chunk {event.chunkIndex} | Model: <span className="text-accent">{event.model}</span>
                        </div>
                        {event.data?.content && (
                          <div className="text-muted-foreground text-xs mt-1 truncate">
                            {event.data.content}
                          </div>
                        )}
                        {event.data?.error && (
                          <div className="text-destructive text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Error: {event.data.error}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Recent Errors */}
            <div className="bg-card/90 backdrop-blur-lg rounded-xl p-6 border border-border mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Recent Errors
                </h2>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Filter (e.g., 403, openrouter)"
                    value={errorFilter}
                    onChange={(e) => setErrorFilter(e.target.value)}
                    className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={fetchErrors}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to clear all error logs?')) {
                        try {
                          const response = await fetch('/api/admin/errors?clear=true', {
                            headers: {
                              'x-admin-secret': secret
                            }
                          });
                          if (response.ok) {
                            setRecentErrors([]);
                            setError(null);
                          }
                        } catch (err) {
                          setError('Failed to clear logs');
                        }
                      }
                    }}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Clear Log
                  </button>
                </div>
              </div>
              {logSize && (
                <div className="mb-2 text-xs text-muted-foreground flex items-center justify-between px-1">
                  <span>
                    Showing {recentErrors.length} log{recentErrors.length !== 1 ? 's' : ''} 
                    ({recentErrors.filter(e => e.level === 'error').length} errors, {recentErrors.filter(e => e.level === 'warn').length} warnings)
                  </span>
                  <span>
                    Log size: {logSize.mb} MB / 1 MB (auto-rotation enabled)
                  </span>
                </div>
              )}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentErrors.length === 0 ? (
                  <div className="text-muted-foreground text-sm flex items-center gap-2 py-8 justify-center">
                    <Info className="w-4 h-4" />
                    No logs found. {errorFilter && `Try removing the filter "${errorFilter}".`}
                  </div>
                ) : (
                  recentErrors.map((err, idx) => {
                    const isWarning = err.level === 'warn';
                    const isError = err.level === 'error';
                    return (
                    <div
                      key={idx}
                      className={`${
                        isWarning 
                          ? 'bg-yellow-500/10 border-yellow-500/30' 
                          : 'bg-destructive/10 border-destructive/30'
                      } rounded-lg p-3 text-sm font-mono`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`${
                          isWarning 
                            ? 'text-yellow-600 dark:text-yellow-500' 
                            : 'text-destructive'
                        } font-semibold`}>
                          {err.event}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(err.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {err.data && (
                        <div className="text-foreground/80 text-xs mt-2 space-y-1">
                          {Object.entries(err.data).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-muted-foreground">{key}:</span>{' '}
                              <span className="text-foreground">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
