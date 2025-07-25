import { NextResponse } from "next/server";
import { apiManager } from "@/lib/api-manager";

export async function GET() {
  try {
    const status = apiManager.getAPIStatus();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      apis: status,
      summary: {
        totalAPIs: status.length,
        availableAPIs: status.filter(api => api.status === '可用').length,
        totalDailyUsage: status.reduce((sum, api) => sum + api.dailyUsed, 0),
        averageSuccessRate: Math.round(
          status.reduce((sum, api) => sum + api.successRate, 0) / status.length
        ),
        fastestAPI: status.reduce((fastest, api) => 
          api.avgResponseTime < fastest.avgResponseTime ? api : fastest
        ),
        mostReliableAPI: status.reduce((reliable, api) => 
          api.successRate > reliable.successRate ? api : reliable
        )
      }
    });
  } catch (error) {
    console.error("API Status error:", error);
    return NextResponse.json(
      { error: "获取API状态失败" },
      { status: 500 }
    );
  }
}
