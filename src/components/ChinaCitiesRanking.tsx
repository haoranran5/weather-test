'use client';

import { useEffect, useState } from 'react';

interface CityWeatherData {
  name: string;
  province: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rank: number;
  apiSource: string;
}

interface ChinaCitiesData {
  cities: CityWeatherData[];
  metadata: {
    totalCities: number;
    totalAttempted: number;
    successRate: string;
    updateTime: string;
    processingTime: string;
    dataSource: string;
    coverage: string;
    cacheStatus?: string;
    cacheAge?: string;
    nextUpdate?: string;
  };
  hottest: CityWeatherData[];
  coldest: CityWeatherData[];
  statistics: {
    averageTemp: string;
    maxTemp: number;
    minTemp: number;
    tempRange: number;
  };
}

export default function ChinaCitiesRanking() {
  const [data, setData] = useState<ChinaCitiesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hot' | 'cold'>('hot');

  const fetchChinaCitiesData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🇨🇳 获取中国城市排行榜数据...');
      
      const response = await fetch('/api/china-cities-ranking');
      
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setData(result);
      console.log(`✅ 成功获取 ${result.metadata.totalCities} 个中国城市数据`);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取数据失败';
      console.error('❌ 获取中国城市排行榜失败:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChinaCitiesData();
  }, []);

  // 城市名称中文映射 - 完整版
  const getCityNameInChinese = (englishName: string): string => {
    const cityMap: { [key: string]: string } = {
      // 直辖市
      'Beijing': '北京', 'Shanghai': '上海', 'Tianjin': '天津', 'Chongqing': '重庆',

      // 省会城市
      'Harbin': '哈尔滨', 'Changchun': '长春', 'Shenyang': '沈阳', 'Shijiazhuang': '石家庄',
      'Taiyuan': '太原', 'Hohhot': '呼和浩特', 'Jinan': '济南', 'Nanjing': '南京',
      'Hangzhou': '杭州', 'Hefei': '合肥', 'Fuzhou': '福州', 'Nanchang': '南昌',
      'Zhengzhou': '郑州', 'Wuhan': '武汉', 'Changsha': '长沙', 'Guangzhou': '广州',
      'Nanning': '南宁', 'Haikou': '海口', 'Chengdu': '成都', 'Guiyang': '贵阳',
      'Kunming': '昆明', 'Lhasa': '拉萨', "Xi'an": '西安', 'Lanzhou': '兰州',
      'Xining': '西宁', 'Yinchuan': '银川', 'Urumqi': '乌鲁木齐',

      // 特别行政区
      'Hong Kong': '香港', 'Macau': '澳门',

      // 副省级城市和重要城市
      'Dalian': '大连', 'Qingdao': '青岛', 'Ningbo': '宁波', 'Xiamen': '厦门',
      'Shenzhen': '深圳', 'Suzhou': '苏州', 'Wuxi': '无锡',

      // 华北地区
      'Tangshan': '唐山', 'Qinhuangdao': '秦皇岛', 'Handan': '邯郸', 'Xingtai': '邢台',
      'Baoding': '保定', 'Zhangjiakou': '张家口', 'Chengde': '承德', 'Cangzhou': '沧州',
      'Langfang': '廊坊', 'Hengshui': '衡水', 'Datong': '大同', 'Yangquan': '阳泉',
      'Changzhi': '长治', 'Jincheng': '晋城', 'Shuozhou': '朔州', 'Jinzhong': '晋中',
      'Yuncheng': '运城', 'Xinzhou': '忻州', 'Linfen': '临汾', 'Luliang': '吕梁',

      // 东北地区
      'Anshan': '鞍山', 'Fushun': '抚顺', 'Benxi': '本溪', 'Dandong': '丹东',
      'Jinzhou': '锦州', 'Yingkou': '营口', 'Fuxin': '阜新', 'Liaoyang': '辽阳',
      'Panjin': '盘锦', 'Tieling': '铁岭', 'Chaoyang': '朝阳', 'Huludao': '葫芦岛',
      'Jilin': '吉林', 'Siping': '四平', 'Liaoyuan': '辽源', 'Tonghua': '通化',
      'Baishan': '白山', 'Songyuan': '松原', 'Baicheng': '白城', 'Yanbian': '延边',
      'Qiqihar': '齐齐哈尔', 'Jixi': '鸡西', 'Hegang': '鹤岗', 'Shuangyashan': '双鸭山',
      'Daqing': '大庆', 'Yichun': '伊春', 'Jiamusi': '佳木斯', 'Qitaihe': '七台河',
      'Mudanjiang': '牡丹江', 'Heihe': '黑河', 'Suihua': '绥化',

      // 华东地区
      'Zibo': '淄博', 'Zaozhuang': '枣庄', 'Dongying': '东营', 'Yantai': '烟台',
      'Weifang': '潍坊', 'Jining': '济宁', "Tai'an": '泰安', 'Weihai': '威海',
      'Rizhao': '日照', 'Laiwu': '莱芜', 'Linyi': '临沂', 'Dezhou': '德州',
      'Liaocheng': '聊城', 'Binzhou': '滨州', 'Heze': '菏泽', 'Xuzhou': '徐州',
      'Changzhou': '常州', 'Nantong': '南通', 'Lianyungang': '连云港', "Huai'an": '淮安',
      'Yancheng': '盐城', 'Yangzhou': '扬州', 'Zhenjiang': '镇江', 'Taizhou': '泰州',
      'Suqian': '宿迁', 'Shaoxing': '绍兴', 'Wenzhou': '温州', 'Jiaxing': '嘉兴',
      'Huzhou': '湖州', 'Jinhua': '金华', 'Quzhou': '衢州', 'Zhoushan': '舟山',
      'Lishui': '丽水', 'Wuhu': '芜湖', 'Bengbu': '蚌埠', 'Huainan': '淮南',
      "Ma'anshan": '马鞍山', 'Huaibei': '淮北', 'Tongling': '铜陵', 'Anqing': '安庆',
      'Huangshan': '黄山', 'Chuzhou': '滁州', 'Fuyang': '阜阳', 'Suzhou City': '宿州',
      'Lu\'an': '六安', 'Bozhou': '亳州', 'Chizhou': '池州', 'Xuancheng': '宣城',

      // 华中地区
      'Kaifeng': '开封', 'Luoyang': '洛阳', 'Pingdingshan': '平顶山', 'Anyang': '安阳',
      'Hebi': '鹤壁', 'Xinxiang': '新乡', 'Jiaozuo': '焦作', 'Puyang': '濮阳',
      'Xuchang': '许昌', 'Luohe': '漯河', 'Sanmenxia': '三门峡', 'Nanyang': '南阳',
      'Shangqiu': '商丘', 'Xinyang': '信阳', 'Zhoukou': '周口', 'Zhumadian': '驻马店',
      'Huangshi': '黄石', 'Shiyan': '十堰', 'Yichang': '宜昌', 'Xiangyang': '襄阳',
      'Ezhou': '鄂州', 'Jingmen': '荆门', 'Xiaogan': '孝感', 'Jingzhou': '荆州',
      'Huanggang': '黄冈', 'Xianning': '咸宁', 'Suizhou': '随州', 'Enshi': '恩施',
      'Zhuzhou': '株洲', 'Xiangtan': '湘潭', 'Hengyang': '衡阳', 'Shaoyang': '邵阳',
      'Yueyang': '岳阳', 'Changde': '常德', 'Zhangjiajie': '张家界', 'Yiyang': '益阳',
      'Chenzhou': '郴州', 'Yongzhou': '永州', 'Huaihua': '怀化', 'Loudi': '娄底',
      'Xiangxi': '湘西',

      // 华南地区
      'Shaoguan': '韶关', 'Zhuhai': '珠海', 'Shantou': '汕头', 'Foshan': '佛山',
      'Jiangmen': '江门', 'Zhanjiang': '湛江', 'Maoming': '茂名', 'Zhaoqing': '肇庆',
      'Huizhou': '惠州', 'Meizhou': '梅州', 'Shanwei': '汕尾', 'Heyuan': '河源',
      'Yangjiang': '阳江', 'Qingyuan': '清远', 'Dongguan': '东莞', 'Zhongshan': '中山',
      'Chaozhou': '潮州', 'Jieyang': '揭阳', 'Yunfu': '云浮', 'Liuzhou': '柳州',
      'Guilin': '桂林', 'Wuzhou': '梧州', 'Beihai': '北海', 'Fangchenggang': '防城港',
      'Qinzhou': '钦州', 'Guigang': '贵港', 'Yulin Guangxi': '玉林', 'Baise': '百色',
      'Hezhou': '贺州', 'Hechi': '河池', 'Laibin': '来宾', 'Chongzuo': '崇左',
      'Sanya': '三亚', 'Sansha': '三沙', 'Danzhou': '儋州',

      // 西南地区
      'Zigong': '自贡', 'Panzhihua': '攀枝花', 'Luzhou': '泸州', 'Deyang': '德阳',
      'Mianyang': '绵阳', 'Guangyuan': '广元', 'Suining': '遂宁', 'Neijiang': '内江',
      'Leshan': '乐山', 'Nanchong': '南充', 'Meishan': '眉山', 'Yibin': '宜宾',
      'Guanghan': '广汉', 'Dazhou': '达州', "Ya'an": '雅安', 'Bazhong': '巴中',
      'Ziyang': '资阳', 'Aba': '阿坝', 'Ganzi': '甘孜', 'Liangshan': '凉山',
      'Zunyi': '遵义', 'Liupanshui': '六盘水', 'Anshun': '安顺', 'Bijie': '毕节',
      'Tongren': '铜仁', 'Qianxinan': '黔西南', 'Qiandongnan': '黔东南', 'Qiannan': '黔南',
      'Qujing': '曲靖', 'Yuxi': '玉溪', 'Baoshan': '保山', 'Zhaotong': '昭通',
      'Lijiang': '丽江', "Pu'er": '普洱', 'Lincang': '临沧', 'Chuxiong': '楚雄',
      'Honghe': '红河', 'Wenshan': '文山', 'Xishuangbanna': '西双版纳', 'Dali': '大理',
      'Dehong': '德宏', 'Nujiang': '怒江', 'Diqing': '迪庆',

      // 西北地区
      'Baoji': '宝鸡', 'Xianyang': '咸阳', 'Weinan': '渭南', "Yan'an": '延安',
      'Hanzhong': '汉中', 'Yulin Shaanxi': '榆林', 'Ankang': '安康', 'Shangluo': '商洛',
      'Tianshui': '天水', 'Wuwei': '武威', 'Zhangye': '张掖', 'Pingliang': '平凉',
      'Jiuquan': '酒泉', 'Qingyang': '庆阳', 'Dingxi': '定西', 'Longnan': '陇南',
      'Linxia': '临夏', 'Gannan': '甘南', 'Haidong': '海东', 'Haibei': '海北',
      'Huangnan': '黄南', 'Hainan': '海南', 'Golog': '果洛', 'Yushu': '玉树',
      'Haixi': '海西', 'Shizuishan': '石嘴山', 'Wuzhong': '吴忠', 'Guyuan': '固原',
      'Zhongwei': '中卫',

      // 新疆
      'Karamay': '克拉玛依', 'Turpan': '吐鲁番', 'Hami': '哈密', 'Changji': '昌吉',
      'Bortala': '博尔塔拉', 'Bayingolin': '巴音郭楞', 'Aksu': '阿克苏', 'Kizilsu': '克孜勒苏',
      'Kashgar': '喀什', 'Hotan': '和田', 'Ili': '伊犁', 'Tacheng': '塔城',
      'Altay': '阿勒泰', 'Shihezi': '石河子', 'Tumxuk': '图木舒克',

      // 西藏
      'Shigatse': '日喀则', 'Chamdo': '昌都', 'Nyingchi': '林芝', 'Shannan': '山南',
      'Nagqu': '那曲', 'Ali': '阿里',

      // 内蒙古
      'Baotou': '包头', 'Wuhai': '乌海', 'Chifeng': '赤峰', 'Tongliao': '通辽',
      'Ordos': '鄂尔多斯', 'Hulunbuir': '呼伦贝尔', 'Bayannur': '巴彦淖尔', 'Ulanqab': '乌兰察布',
      'Hinggan': '兴安', 'Xilingol': '锡林郭勒', 'Alxa': '阿拉善', 'Erenhot': '二连浩特'
    };

    // 如果找不到映射，尝试去掉后缀再查找
    let result = cityMap[englishName];
    if (!result) {
      const nameWithoutSuffix = englishName.replace(/,CN$|,HK$|,MO$/, '');
      result = cityMap[nameWithoutSuffix];
    }

    return result || englishName;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTemperatureColor = (temp: number): string => {
    if (temp >= 40) return 'text-red-500';
    if (temp >= 35) return 'text-orange-500';
    if (temp >= 30) return 'text-yellow-500';
    if (temp >= 25) return 'text-green-500';
    if (temp >= 20) return 'text-blue-500';
    if (temp >= 15) return 'text-indigo-500';
    if (temp >= 10) return 'text-purple-500';
    return 'text-cyan-500';
  };

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 5) return '🔥';
    return '📍';
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
          🇨🇳 中国城市天气排行榜
        </h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">正在获取全国城市数据...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
          🇨🇳 中国城市天气排行榜
        </h3>
        <div className="text-center py-8">
          <div className="text-red-300 mb-4">❌ {error}</div>
          <button
            onClick={fetchChinaCitiesData}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors"
          >
            重新获取
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
      {/* 标题 */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg flex items-center justify-center gap-3">
          🇨🇳 中国城市天气排行榜
        </h3>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-white/70 mb-4">
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            📊 {data.metadata.totalCities} 个城市
          </span>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            ✅ 成功率 {data.metadata.successRate}
          </span>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            🔄 每1小时更新
          </span>
          {data.metadata.cacheStatus === 'cached' && data.metadata.nextUpdate && (
            <span className="bg-blue-500/30 backdrop-blur-sm px-3 py-1 rounded-full">
              ⏰ {data.metadata.nextUpdate}更新
            </span>
          )}
        </div>

        {/* 切换按钮 */}
        <div className="flex justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 flex">
            <button
              onClick={() => setActiveTab('hot')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'hot'
                  ? 'bg-red-500/80 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🔥 最热城市
            </button>
            <button
              onClick={() => setActiveTab('cold')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'cold'
                  ? 'bg-blue-500/80 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              ❄️ 最冷城市
            </button>
          </div>
        </div>
      </div>

      {/* 榜单内容 */}
      <div className="mb-6">
        {activeTab === 'hot' && (
          <div className="space-y-3">
            {data.hottest.slice(0, 10).map((city, index) => (
              <div
                key={`hot-${city.name}-${index}`}
                className={`
                  group relative bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20
                  hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-[1.02]
                  ${index < 3 ? 'ring-2 ring-red-400/30' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                      ${index === 0 ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' :
                        index === 1 ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md' :
                        index === 2 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md' :
                        'bg-white/20 text-white/90'}
                    `}>
                      {index < 3 ? getRankIcon(index + 1) : index + 1}
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl">
                        {getCityNameInChinese(city.name)}
                      </div>
                      <div className="text-white/60 text-sm">{city.province} • {city.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-3xl">
                      {city.temperature}°C
                    </div>
                    <div className="text-red-300 text-sm font-medium">第 {index + 1} 名</div>
                  </div>
                </div>

                {/* 温度进度条 */}
                <div className="mt-4 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (city.temperature / data.statistics.maxTemp) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cold' && (
          <div className="space-y-3">
            {data.coldest.slice(0, 10).map((city, index) => (
              <div
                key={`cold-${city.name}-${index}`}
                className={`
                  group relative bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20
                  hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-[1.02]
                  ${index < 3 ? 'ring-2 ring-blue-400/30' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                      ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' :
                        index === 1 ? 'bg-gradient-to-r from-cyan-500 to-blue-400 text-white shadow-md' :
                        index === 2 ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md' :
                        'bg-white/20 text-white/90'}
                    `}>
                      {index < 3 ? (index === 0 ? '🥶' : index === 1 ? '❄️' : '🧊') : index + 1}
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl">
                        {getCityNameInChinese(city.name)}
                      </div>
                      <div className="text-white/60 text-sm">{city.province} • {city.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-3xl">
                      {city.temperature}°C
                    </div>
                    <div className="text-blue-300 text-sm font-medium">第 {index + 1} 名</div>
                  </div>
                </div>

                {/* 温度进度条 */}
                <div className="mt-4 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                    style={{
                      width: `${Math.max(10, ((city.temperature - data.statistics.minTemp + 10) / (data.statistics.maxTemp - data.statistics.minTemp + 10)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部信息和操作 */}
      <div className="text-center pt-6 border-t border-white/20">
        <button
          onClick={fetchChinaCitiesData}
          disabled={loading}
          className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mb-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              更新中...
            </span>
          ) : (
            '🔄 刷新数据'
          )}
        </button>

        <div className="text-white/60 text-sm space-y-1">
          <div>最后更新: {new Date(data.metadata.updateTime).toLocaleString('zh-CN')}</div>
          <div>数据来源: 全国 {data.metadata.totalCities} 个城市实时监测</div>
          {data.metadata.cacheStatus === 'cached' && (
            <div className="text-blue-300">
              📋 使用缓存数据 ({data.metadata.cacheAge}) • {data.metadata.nextUpdate}自动更新
            </div>
          )}
          {data.metadata.cacheStatus === 'fresh' && (
            <div className="text-green-300">
              ✨ 数据已刷新 • 1小时内使用缓存
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
