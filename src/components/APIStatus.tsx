'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';

interface APIInfo {
  name: string;
  status: string;
  successRate: number;
  avgResponseTime: number;
  dailyUsed: number;
  dailyLimit: number;
}

interface APIStatusData {
  timestamp: string;
  apis: APIInfo[];
  summary: {
    totalAPIs: number;
    availableAPIs: number;
    totalDailyUsage: number;
    averageSuccessRate: number;
    fastestAPI: APIInfo;
    mostReliableAPI: APIInfo;
  };
}

export default function APIStatus() {
  const [data, setData] = useState<APIStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/api-status');
      if (!response.ok) {
        throw new Error('获取API状态失败');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // 每30秒自动刷新
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    return status === '可用' ? 'bg-green-500' : 'bg-red-500';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 1000) return 'text-green-600';
    if (time <= 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            API状态监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-300 text-center py-4">
            {error}
          </div>
          <Button 
            onClick={fetchStatus} 
            className="w-full mt-4"
            variant="outline"
          >
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            API状态监控
          </CardTitle>
          <Button
            onClick={fetchStatus}
            disabled={loading}
            size="sm"
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data && (
          <>
            {/* 概览统计 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-sm">可用API</div>
                <div className="text-white text-xl font-bold">
                  {data.summary.availableAPIs}/{data.summary.totalAPIs}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-sm">平均成功率</div>
                <div className="text-white text-xl font-bold">
                  {data.summary.averageSuccessRate}%
                </div>
              </div>
            </div>

            {/* 推荐API */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">最快API</span>
                </div>
                <div className="text-white font-bold">{data.summary.fastestAPI.name}</div>
                <div className="text-green-300 text-sm">
                  {data.summary.fastestAPI.avgResponseTime}ms
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">最可靠API</span>
                </div>
                <div className="text-white font-bold">{data.summary.mostReliableAPI.name}</div>
                <div className="text-blue-300 text-sm">
                  {data.summary.mostReliableAPI.successRate}% 成功率
                </div>
              </div>
            </div>

            {/* API详细列表 */}
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">API详细状态</h4>
              {data.apis.map((api) => (
                <div
                  key={api.name}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(api.status)}`} />
                      <span className="text-white font-medium">{api.name}</span>
                      <Badge 
                        variant="outline" 
                        className="text-xs border-white/30 text-white/80"
                      >
                        {api.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-white/60 mb-1">成功率</div>
                      <div className={`font-medium ${getSuccessRateColor(api.successRate)}`}>
                        {api.successRate}%
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-white/60 mb-1">响应时间</div>
                      <div className={`font-medium ${getResponseTimeColor(api.avgResponseTime)}`}>
                        {api.avgResponseTime}ms
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-white/60 mb-1">今日使用</div>
                      <div className="text-white font-medium">
                        {api.dailyUsed}/{api.dailyLimit}
                      </div>
                    </div>
                  </div>
                  
                  {/* 使用率进度条 */}
                  <div className="mt-3">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((api.dailyUsed / api.dailyLimit) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <div className="text-white/60 text-xs mt-1">
                      使用率: {((api.dailyUsed / api.dailyLimit) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 更新时间 */}
            <div className="flex items-center gap-2 text-white/60 text-xs pt-4 border-t border-white/10">
              <Clock className="h-3 w-3" />
              <span>
                最后更新: {new Date(data.timestamp).toLocaleString('zh-CN')}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
