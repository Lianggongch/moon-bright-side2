import { useState, useEffect, useRef } from "react";
// 图片文件（如果不存在，使用占位符）
const moonImage = "./4385f01f5e2a09e8239e70d6551f2b05-2.png";
import { calculateMoonIllumination, getMoonPhaseNameFromDate } from "./moonPhaseCalculator";

// 月亮名称枚举
enum MoonPhase {
  NEW_MOON = "New Moon",
  WAXING_CRESCENT = "Waxing Crescent",
  FIRST_QUARTER = "First Quarter",
  WAXING_GIBBOUS = "Waxing Gibbous",
  FULL_MOON = "Full Moon",
  WANING_GIBBOUS = "Waning Gibbous",
  LAST_QUARTER = "Last Quarter",
  WANING_CRESCENT = "Waning Crescent",
}

export const Image = (): JSX.Element => {
  const [deviceOrientation, setDeviceOrientation] = useState<{
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  }>({ alpha: null, beta: null, gamma: null });
  
  const [moonAngle, setMoonAngle] = useState<number>(0); // 月亮方向角度（0-360度，方位角azimuth）
  const [moonElevation, setMoonElevation] = useState<number>(0); // 月亮高度角（-90到90度）
  const [moonRise, setMoonRise] = useState<string>(""); // 月升时间（HH:MM格式）
  const [moonSet, setMoonSet] = useState<string>(""); // 月落时间（HH:MM格式）
  const [location, setLocation] = useState<string>("获取位置中...");
  const [weather, setWeather] = useState<string>(""); // 天气描述
  const [_latitude, setLatitude] = useState<number | null>(null);
  const [_longitude, setLongitude] = useState<number | null>(null);
  const [moonPhase, setMoonPhase] = useState<MoonPhase>(MoonPhase.FULL_MOON);
  const [moonIllumination, setMoonIllumination] = useState<number>(1.0); // 月相照明度（0.0-1.0）
  const [moonVisibility, setMoonVisibility] = useState<number>(0); // 月亮可见比例（0-100%）
  const [cloudCover, setCloudCover] = useState<number>(0); // 云量（0-100%）
  const containerRef = useRef<HTMLDivElement>(null);

  const IPGEOLOCATION_API_KEY = 'da4ee14a6a904b369cf22b13bcfade57';
  const VISUALCROSSING_API_KEY = 'K84ZRGQH2W3662DSD9QKHY239';

  // 获取GPS位置并调用API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          setLatitude(lat);
          setLongitude(lon);
          setLocation(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);

          // 获取城市名称（逆地理编码）
          await getCityName(lat, lon);

          // 调用API获取月亮和天气数据
          await fetchMoonAndWeatherData(lat, lon);
        },
        (error) => {
          setLocation("位置获取失败");
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocation("不支持GPS");
    }
  }, []);

  // 逆地理编码：将坐标转换为城市名称
  const getCityName = async (lat: number, lon: number) => {
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
      const response = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'MoonPhaseApp/1.0' }
      });
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const city = address.city || address.town || address.village || address.county || '';
        const state = address.state || address.province || '';
        
        // 格式化地点：城市,省/州
        let locationStr = city;
        if (state && state !== city) {
          locationStr += state.includes(city) ? '' : `,${state}`;
        }
        setLocation(locationStr);
      }
    } catch (error) {
      console.error("逆地理编码错误:", error);
    }
  };

  // 调用IPGeolocation Astronomy API和Visual Crossing Weather API
  const fetchMoonAndWeatherData = async (lat: number, lon: number) => {
    const date = new Date().toISOString().split('T')[0];
    const currentTime = new Date();

    try {
      // 1. 调用IPGeolocation Astronomy API获取月亮位置
      const astronomyUrl = `https://api.ipgeolocation.io/astronomy?apiKey=${IPGEOLOCATION_API_KEY}&lat=${lat}&long=${lon}&date=${date}`;
      const astronomyResponse = await fetch(astronomyUrl);
      const astronomyData = await astronomyResponse.json();
      
      // API返回的数据结构：字段直接在根对象中
      if (astronomyData.moon_azimuth !== undefined) {
        setMoonAngle(astronomyData.moon_azimuth);
        setMoonElevation(astronomyData.moon_altitude || 0);
        if (astronomyData.moonrise) {
          setMoonRise(astronomyData.moonrise);
        }
        if (astronomyData.moonset) {
          setMoonSet(astronomyData.moonset);
        }
      } else if (astronomyData.moon && astronomyData.moon.azimuth !== undefined) {
        setMoonAngle(astronomyData.moon.azimuth);
        setMoonElevation(astronomyData.moon.elevation || 0);
        if (astronomyData.moon.moonrise) {
          setMoonRise(astronomyData.moon.moonrise);
        }
        if (astronomyData.moon.moonset) {
          setMoonSet(astronomyData.moon.moonset);
        }
      }

      // 2. 计算月相
      const calculatedIllumination = calculateMoonIllumination(currentTime);
      const phaseName = getMoonPhaseNameFromDate(currentTime);
      setMoonIllumination(calculatedIllumination);
      
      const phaseMap: { [key: string]: MoonPhase } = {
        "New Moon": MoonPhase.NEW_MOON,
        "Waxing Crescent": MoonPhase.WAXING_CRESCENT,
        "First Quarter": MoonPhase.FIRST_QUARTER,
        "Waxing Gibbous": MoonPhase.WAXING_GIBBOUS,
        "Full Moon": MoonPhase.FULL_MOON,
        "Waning Gibbous": MoonPhase.WANING_GIBBOUS,
        "Last Quarter": MoonPhase.LAST_QUARTER,
        "Waning Crescent": MoonPhase.WANING_CRESCENT,
      };
      
      if (phaseMap[phaseName]) {
        setMoonPhase(phaseMap[phaseName]);
      }

      // 3. 调用Visual Crossing Weather API获取天气
      const weatherUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${date}?key=${VISUALCROSSING_API_KEY}&unitGroup=metric&include=current`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      
      if (weatherData.currentConditions) {
        if (weatherData.currentConditions.cloudcover !== undefined) {
          setCloudCover(weatherData.currentConditions.cloudcover);
        }
        // 获取天气描述
        const conditions = weatherData.currentConditions.conditions || '';
        setWeather(conditions.toLowerCase() || 'clear');
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  // 计算月亮可见度百分比
  const calculateMoonVisibility = (): number => {
    if (deviceOrientation.alpha === null) return 0;

    const deviceAzimuth = deviceOrientation.alpha;
    let horizontalAngleDiff = Math.abs(deviceAzimuth - moonAngle);
    
    if (horizontalAngleDiff > 180) {
      horizontalAngleDiff = 360 - horizontalAngleDiff;
    }
    
    if (horizontalAngleDiff > 30 || moonElevation <= 0) {
      return 0;
    }
    
    const horizontalAlignment = Math.cos((horizontalAngleDiff / 30) * (Math.PI / 2)) * 100;
    const elevationFactor = Math.sin((moonElevation / 90) * (Math.PI / 2)) * 100;
    const cloudFactor = 100 - cloudCover;
    const moonPhaseFactor = moonIllumination * 100;
    
    const finalVisibility = (horizontalAlignment * elevationFactor * cloudFactor * moonPhaseFactor) / (100 * 100 * 100);
    return Math.round(Math.min(100, Math.max(0, finalVisibility)));
  };

  // 将方位角转换为方向名称（简写）
  const getDirectionName = (azimuth: number): string => {
    const directions = [
      { name: "N", short: "N", angle: 0 },      // 北
      { name: "NE", short: "NE", angle: 45 },   // 东北
      { name: "E", short: "E", angle: 90 },     // 东
      { name: "SE", short: "SE", angle: 135 },  // 东南
      { name: "S", short: "S", angle: 180 },    // 南
      { name: "SW", short: "SW", angle: 225 },  // 西南
      { name: "W", short: "W", angle: 270 },    // 西
      { name: "NW", short: "NW", angle: 315 },  // 西北
    ];
    
    // 找到最接近的方向
    let closest = directions[0];
    let minDiff = Math.abs(azimuth - directions[0].angle);
    
    for (const dir of directions) {
      const diff = Math.min(Math.abs(azimuth - dir.angle), Math.abs(azimuth - dir.angle + 360), Math.abs(azimuth - dir.angle - 360));
      if (diff < minDiff) {
        minDiff = diff;
        closest = dir;
      }
    }
    
    return closest.short;
  };

  // 计算距离月升/月落的时间
  const getTimeToMoon = (): { label: string; time: string } => {
    const now = new Date();
    let timeToShow: Date | null = null;
    let label = '';

    // 解析时间字符串
    const parseTime = (timeStr: string): Date => {
      const parts = timeStr.split(':');
      const time = new Date(now);
      time.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      if (time < now) {
        time.setDate(time.getDate() + 1);
      }
      return time;
    };

    if (moonElevation > 0) {
      // 月亮在地平线以上，显示距离月落的时间
      if (moonSet) {
        const setTime = parseTime(moonSet);
        if (setTime > now) {
          timeToShow = setTime;
          label = 'The moon will set in';
        } else {
          const tomorrowSet = new Date(setTime);
          tomorrowSet.setDate(tomorrowSet.getDate() + 1);
          timeToShow = tomorrowSet;
          label = 'The moon will set in';
        }
      }
    } else {
      // 月亮在地平线以下，显示距离月升的时间
      if (moonRise) {
        const riseTime = parseTime(moonRise);
        if (riseTime > now) {
          timeToShow = riseTime;
          label = 'The moon will rise in';
        } else {
          const tomorrowRise = new Date(riseTime);
          tomorrowRise.setDate(tomorrowRise.getDate() + 1);
          timeToShow = tomorrowRise;
          label = 'The moon will rise in';
        }
      }
    }

    if (timeToShow) {
      const diff = timeToShow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return { label, time: `${hours} hour${hours > 1 ? 's' : ''}` };
      } else {
        return { label, time: `${minutes} minute${minutes > 1 ? 's' : ''}` };
      }
    }

    return { label: '', time: '' };
  };

  // 获取当前显示的时间（月升或月落）
  const getCurrentTime = (): string => {
    if (moonElevation > 0 && moonSet) {
      return moonSet; // 月亮在地平线以上，显示月落时间
    } else if (moonRise) {
      return moonRise; // 月亮在地平线以下，显示月升时间
    }
    return '';
  };

  // 陀螺仪监听
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setDeviceOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      });
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, []);

  // 更新可见度
  useEffect(() => {
    const visibility = calculateMoonVisibility();
    setMoonVisibility(visibility);
  }, [deviceOrientation, moonAngle, moonElevation, cloudCover, moonIllumination]);

  // 计算圆盘旋转角度（只在30度范围内）
  const getDiskRotation = (): number => {
    if (deviceOrientation.alpha === null) return 0;
    
    const deviceDirection = deviceOrientation.alpha;
    let angleDiff = Math.abs(deviceDirection - moonAngle);
    
    if (angleDiff > 180) {
      angleDiff = 360 - angleDiff;
    }
    
    if (angleDiff <= 30) {
      return deviceDirection - moonAngle;
    }
    
    return 0;
  };

  const diskRotation = getDiskRotation();
  const isInRange = Math.abs(diskRotation) <= 30;
  const timeToMoon = getTimeToMoon();
  const currentTime = getCurrentTime();
  const direction = getDirectionName(moonAngle);

  return (
    <div 
      ref={containerRef}
      className="bg-x-0e-2148 w-full min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      style={{ 
        aspectRatio: "0.46",
        minWidth: "394px",
        minHeight: "852px",
        fontFamily: "var(--text-font-family)",
      }}
    >
      {/* 顶部：月相名称 */}
      <header className="absolute top-0 left-0 right-0 flex justify-center items-center"
        style={{
          paddingTop: "min(3vw, 26px)",
        }}
      >
        <h1 
          className="text-e-3d-095 text-center"
          style={{
            fontSize: "min(10vw, 64px)",
            fontWeight: "normal",
            letterSpacing: "0",
            lineHeight: "1.74",
            fontFamily: "var(--text-font-family)",
          }}
        >
          {moonPhase}
        </h1>
      </header>

      {/* 中间：圆盘和月亮 */}
      <div 
        className="absolute"
        style={{
          width: "min(80vw, 318px)",
          height: "min(80vw, 318px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          marginTop: "min(6vw, 51px)",
        }}
      >
        {/* 圆盘背景（深蓝色主题色） */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: "var(--x-0e-2148)",
            border: "none",
          }}
        />
        
        {/* 圆盘刻度线（只在30度范围内显示，米黄色带高斯模糊） */}
        {isInRange && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
            style={{
              transform: `rotate(${diskRotation}deg)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            {/* 使用SVG绘制30度范围的指示器 */}
            <svg className="absolute inset-0 w-full h-full" style={{ filter: "blur(1px)" }}>
              <defs>
                <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--e-3d-095)" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="var(--e-3d-095)" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="var(--e-3d-095)" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              {/* 绘制30度范围的扇形（以月亮为中心） */}
              <path
                d={`M 50% 50% L ${50 + 47 * Math.cos((moonAngle - 15) * Math.PI / 180)}% ${50 - 47 * Math.sin((moonAngle - 15) * Math.PI / 180)}% A 47% 47% 0 0 1 ${50 + 47 * Math.cos((moonAngle + 15) * Math.PI / 180)}% ${50 - 47 * Math.sin((moonAngle + 15) * Math.PI / 180)}% Z`}
                fill="url(#glow-gradient)"
                opacity="0.4"
              />
              {/* 中心指示线 */}
              <line
                x1="50%"
                y1="50%"
                x2={`${50 + 47 * Math.cos(moonAngle * Math.PI / 180)}%`}
                y2={`${50 - 47 * Math.sin(moonAngle * Math.PI / 180)}%`}
                stroke="var(--e-3d-095)"
                strokeWidth="2"
                opacity="0.7"
                style={{ filter: "blur(0.5px)" }}
              />
            </svg>
          </div>
        )}

        {/* 月亮图片（中心） */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="rounded-full bg-e-3d-095"
            style={{
              width: "min(25vw, 101px)",
              height: "min(25vw, 101px)",
            }}
          >
            <img
              className="w-full h-full object-cover rounded-full"
              alt="Moon"
              src={moonImage}
            />
          </div>
        </div>
      </div>

      {/* 时间信息（月升/月落时间） */}
      <nav 
        className="absolute flex items-center justify-center gap-[60px]"
        style={{
          top: "min(67vh, 573px)",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div className="text-e-3d-095 text-right"
          style={{
            fontSize: "min(3vw, 24px)",
            fontFamily: "var(--text-font-family)",
            fontWeight: "normal",
          }}
        >
          {currentTime || '--'}
        </div>

        <p className="text-e-3d-095 text-center blur-[0.5px]"
          style={{
            fontSize: "min(1.5vw, 12px)",
            fontFamily: "var(--text-font-family)",
            fontWeight: "normal",
          }}
        >
          {timeToMoon.label ? `${timeToMoon.label} ${timeToMoon.time}.` : ''}
        </p>

        <div className="text-e-3d-095 text-left"
          style={{
            fontSize: "min(3vw, 24px)",
            fontFamily: "var(--text-font-family)",
            fontWeight: "normal",
          }}
        >
          {currentTime || '--'}
        </div>
      </nav>

      {/* 可见度百分比和方向 */}
      <section 
        className="absolute flex items-center"
        style={{
          top: "min(70vh, 600px)",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(60vw, 234px)",
          height: "min(20vh, 167px)",
        }}
      >
        {/* 百分比（大号，左侧） */}
        <div 
          className="text-e-3d-095 flex items-center justify-center"
          style={{
            fontSize: "min(12vw, 96px)",
            fontFamily: "var(--text-font-family)",
            fontWeight: "normal",
            lineHeight: "167px",
            width: "min(30vw, 97px)",
          }}
        >
          {moonVisibility}
        </div>

        {/* 百分号和方向（右侧，居右对齐） */}
        <div className="flex flex-col items-end justify-center"
          style={{
            width: "min(30vw, 137px)",
            marginLeft: "auto",
          }}
        >
          <div 
            className="text-e-3d-095"
            style={{
              fontSize: "min(2.5vw, 20px)",
              fontFamily: "var(--text-font-family)",
              fontWeight: "normal",
              lineHeight: "34.8px",
            }}
          >
            %
          </div>
          <p 
            className="text-e-3d-095 text-right"
            style={{
              fontSize: "min(4vw, 32px)",
              fontFamily: "var(--text-font-family)",
              fontWeight: "normal",
              lineHeight: "43.5px",
            }}
          >
            can be seen
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; at {direction}
          </p>
        </div>
      </section>

      {/* 地点和天气 */}
      <div 
        className="absolute text-e-3d-095 text-center"
        style={{
          top: "min(75vh, 640px)",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "min(2.5vw, 20px)",
          fontFamily: "var(--text-font-family)",
          fontWeight: "normal",
          lineHeight: "27.2px",
        }}
      >
        {location}{weather ? `,${weather}` : ''}
      </div>

      {/* 底部固定文字 */}
      <footer 
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center text-white"
        style={{
          paddingBottom: "min(2vw, 20px)",
          fontSize: "min(1.5vw, 12px)",
          fontFamily: "var(--text-font-family)",
          fontWeight: "normal",
          lineHeight: "normal",
        }}
      >
        We shall meet in the place where there is no darkness
      </footer>
    </div>
  );
};
