'use client';

import { useState } from 'react';

export default function DebugPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/forecast-test?city=Beijing');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">24小时天气趋势诊断</h1>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? '诊断中...' : '运行诊断测试'}
          </button>
        </div>

        {testResult && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">诊断结果</h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">基本信息</h3>
                <div className="text-white/80 space-y-1">
                  <p>成功状态: {testResult.success ? '✅ 成功' : '❌ 失败'}</p>
                  <p>数据源: {testResult.dataSource || '未知'}</p>
                  <p>数据小时数: {testResult.totalHours || 0}</p>
                  <p>位置: {testResult.location || '未知'}</p>
                </div>
              </div>

              {testResult.apiStatus && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">API状态</h3>
                  <div className="text-white/80 space-y-1">
                    <p>WeatherAPI密钥: {testResult.apiStatus.weatherApiKey ? '✅ 已配置' : '❌ 未配置'}</p>
                    <p>OpenWeatherMap密钥: {testResult.apiStatus.openWeatherKey ? '✅ 已配置' : '❌ 未配置'}</p>
                    {testResult.apiStatus.apiError && (
                      <p className="text-red-300">API错误: {testResult.apiStatus.apiError}</p>
                    )}
                  </div>
                </div>
              )}

              {testResult.error && (
                <div className="bg-red-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">错误信息</h3>
                  <p className="text-red-200">{testResult.error}</p>
                </div>
              )}

              {testResult.hourly && testResult.hourly.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">样本数据</h3>
                  <div className="text-white/80 space-y-2">
                    <p>第一小时: {new Date(testResult.hourly[0].time).toLocaleString()}</p>
                    <p>温度: {testResult.hourly[0].temperature}°C</p>
                    <p>天气: {testResult.hourly[0].condition}</p>
                    <p>降水概率: {testResult.hourly[0].precipitationProbability}%</p>
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">完整响应数据</h3>
                <pre className="text-xs text-white/60 overflow-auto max-h-96 bg-black/20 p-3 rounded">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">解决方案指南</h2>
          <div className="text-white/80 space-y-3">
            <div>
              <h3 className="font-semibold text-white">1. 如果API密钥未配置:</h3>
              <p>在Vercel Dashboard → Settings → Environment Variables 中添加:</p>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>WEATHERAPI_KEY = 3fe722ec111444aa8ae55732252507</li>
                <li>OPENWEATHERMAP_API_KEY = 8d0e7008314e73e8667613eb1f6268ea</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white">2. 如果API调用失败:</h3>
              <p>检查API配额是否用完，或者网络是否有限制</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white">3. 如果显示模拟数据:</h3>
              <p>说明所有真实API都失败了，需要检查API密钥和网络连接</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
