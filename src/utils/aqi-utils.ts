// AQI (空气质量指数) 工具函数

export interface AQILevel {
  level: string;
  color: string;
  bgColor: string;
  description: string;
  healthAdvice: string;
}

// 美国EPA AQI标准 (1-6级) - 更直观的等级划分
export function getEPAAQILevel(aqiIndex: number): AQILevel {
  switch (aqiIndex) {
    case 1:
      return {
        level: "优秀",
        color: "text-green-700",
        bgColor: "bg-green-100 border-green-300",
        description: "空气质量令人满意",
        healthAdvice: "空气质量被认为是令人满意的，空气污染很少或没有风险"
      };
    case 2:
      return {
        level: "良好",
        color: "text-yellow-700",
        bgColor: "bg-yellow-100 border-yellow-300",
        description: "空气质量可接受",
        healthAdvice: "对于极少数对空气污染异常敏感的人，可能有轻微影响"
      };
    case 3:
      return {
        level: "轻度污染",
        color: "text-orange-700",
        bgColor: "bg-orange-100 border-orange-300",
        description: "敏感人群不健康",
        healthAdvice: "敏感人群可能会感到轻微至中度症状，一般人群影响较小"
      };
    case 4:
      return {
        level: "中度污染",
        color: "text-red-700",
        bgColor: "bg-red-100 border-red-300",
        description: "对所有人不健康",
        healthAdvice: "每个人都可能开始感受到健康影响，敏感人群可能会感受到更严重的影响"
      };
    case 5:
      return {
        level: "重度污染",
        color: "text-purple-700",
        bgColor: "bg-purple-100 border-purple-300",
        description: "非常不健康",
        healthAdvice: "健康警告：每个人都可能受到更严重的健康影响"
      };
    case 6:
      return {
        level: "严重污染",
        color: "text-red-900",
        bgColor: "bg-red-200 border-red-400",
        description: "危险",
        healthAdvice: "健康警报：每个人都可能受到严重的健康影响"
      };
    default:
      return {
        level: "未知",
        color: "text-gray-700",
        bgColor: "bg-gray-100 border-gray-300",
        description: "数据不可用",
        healthAdvice: "无法评估空气质量"
      };
  }
}

// PM2.5浓度等级 (μg/m³) - 更直观的等级划分
export function getPM25Level(pm25: number): AQILevel {
  if (pm25 <= 12) {
    return {
      level: "优秀",
      color: "text-green-700",
      bgColor: "bg-green-100 border-green-300",
      description: "优秀",
      healthAdvice: "空气质量令人满意，基本无空气污染"
    };
  } else if (pm25 <= 35) {
    return {
      level: "良好",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100 border-yellow-300",
      description: "良好",
      healthAdvice: "空气质量可接受，但某些污染物可能对极少数异常敏感人群健康有较弱影响"
    };
  } else if (pm25 <= 55) {
    return {
      level: "轻度污染",
      color: "text-orange-700",
      bgColor: "bg-orange-100 border-orange-300",
      description: "轻度污染",
      healthAdvice: "易感人群症状有轻度加剧，健康人群出现刺激症状"
    };
  } else if (pm25 <= 150) {
    return {
      level: "中度污染",
      color: "text-red-700",
      bgColor: "bg-red-100 border-red-300",
      description: "中度污染",
      healthAdvice: "进一步加剧易感人群症状，可能对健康人群心脏、呼吸系统有影响"
    };
  } else if (pm25 <= 250) {
    return {
      level: "重度污染",
      color: "text-purple-700",
      bgColor: "bg-purple-100 border-purple-300",
      description: "重度污染",
      healthAdvice: "心脏病和肺病患者症状显著加剧，运动耐受力降低，健康人群普遍出现症状"
    };
  } else {
    return {
      level: "严重污染",
      color: "text-red-900",
      bgColor: "bg-red-200 border-red-400",
      description: "严重污染",
      healthAdvice: "健康人群运动耐受力降低，有明显强烈症状，提前出现某些疾病"
    };
  }
}

// 综合空气质量评估 - 优先使用EPA指数，显示详细信息
export function getAirQualityAssessment(aqiIndex: number, pm25: number): {
  overallLevel: string;
  color: string;
  bgColor: string;
  description: string;
  details: string;
  score: number; // 用于排序的综合评分
} {
  const epaLevel = getEPAAQILevel(aqiIndex);
  const pm25Level = getPM25Level(pm25);

  // 计算综合评分 (EPA指数权重70%，PM2.5权重30%)
  const epaScore = aqiIndex * 100; // EPA指数 1-6 转换为 100-600
  const pm25Score = Math.min(pm25 * 2, 500); // PM2.5浓度，最高500分
  const totalScore = epaScore * 0.7 + pm25Score * 0.3;

  return {
    overallLevel: epaLevel.level, // 主要使用EPA等级
    color: epaLevel.color,
    bgColor: epaLevel.bgColor,
    description: `EPA指数: ${aqiIndex} (${epaLevel.description})`,
    details: `PM2.5: ${pm25.toFixed(1)} μg/m³ (${pm25Level.description})`,
    score: Math.round(totalScore)
  };
}