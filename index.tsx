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
      { name: "N", short: "N", angle: 0 },
      { name: "NE", short: "NE", angle: 45 },
      { name: "E", short: "E", angle: 90 },
      { name: "SE", short: "SE", angle: 135 },
      { name: "S", short: "S", angle: 180 },
      { name: "SW", short: "SW", angle: 225 },
      { name: "W", short: "W", angle: 270 },
      { name: "NW", short: "NW", angle: 315 },
    ];
    
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

  // 解析时间字符串为Date对象（统一的时间解析函数）
  const parseTimeString = (timeStr: string): Date => {
    const now = new Date();
    const parts = timeStr.split(':');
    const time = new Date(now);
    time.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    if (time < now) {
      time.setDate(time.getDate() + 1);
    }
    return time;
  };

  // 计算距离月升/月落的时间
  const getTimeToMoon = (): { label: string; time: string } => {
    const now = new Date();
    let targetTime: Date | null = null;
    let label = '';

    if (moonElevation > 0 && moonSet) {
      targetTime = parseTimeString(moonSet);
      label = 'The moon will set in';
    } else if (moonRise) {
      targetTime = parseTimeString(moonRise);
      label = 'The moon will rise in';
    }

    if (targetTime) {
      const diff = targetTime.getTime() - now.getTime();
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
    return moonElevation > 0 && moonSet ? moonSet : (moonRise || '');
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

  // 更新可见度（使用useMemo避免重复计算）
  useEffect(() => {
    if (deviceOrientation.alpha !== null) {
      const visibility = calculateMoonVisibility();
      setMoonVisibility(visibility);
    }
  }, [deviceOrientation.alpha, moonAngle, moonElevation, cloudCover, moonIllumination]);

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

  // rem换算：设计稿394px，1rem = 100px，所以 N px = (N / 100) rem
  return (
    <div 
      ref={containerRef}
      style={{ 
        width: "100%",
        height: "100vh",
        position: "relative",
        background: "#0E2148",
        overflow: "hidden",
        fontFamily: "Ubuntu Condensed, Helvetica, sans-serif",
      }}
    >
      {/* 顶部：月相名称 - 根据Figma: width:196px, height:111px, font-size:64px, left:10px, top:10px */}
      <header style={{
          position: "absolute",
          left: "0.1rem", // 10px
          top: "0.1rem", // 10px
          width: "1.96rem", // 196px
          height: "1.11rem", // 111px
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 
          style={{
            color: "var(--e-3d-095)",
            fontSize: "0.64rem", // 64px
            fontWeight: 400,
            letterSpacing: 0,
            lineHeight: "1.114rem", // 111.4px
            fontFamily: "var(--text-font-family)",
            whiteSpace: "nowrap",
          }}
        >
          {moonPhase}
        </h1>
      </header>

      {/* 中间：圆形表盘和月亮 - 注意：文件中没有表盘的具体位置，需要根据实际布局调整 */}
      {/* 暂时使用居中布局，后续可以根据实际位置调整 */}
      <div 
        style={{
          position: "absolute",
          width: "3.18rem", // 318px (估算，需要确认)
          height: "3.18rem", // 318px
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* 圆盘背景 */}
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "50%",
            backgroundColor: "#000000", // 黑色表盘
            border: "none",
          }}
        />
        
        {/* 圆盘刻度线（只在30度范围内显示） */}
        {isInRange && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "50%",
              pointerEvents: "none",
              overflow: "hidden",
              transform: `rotate(${diskRotation}deg)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            <svg style={{ 
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              filter: "blur(1px)" 
            }}>
              <defs>
                <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--e-3d-095)" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="var(--e-3d-095)" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="var(--e-3d-095)" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <path
                d={`M 50% 50% L ${50 + 47 * Math.cos((moonAngle - 15) * Math.PI / 180)}% ${50 - 47 * Math.sin((moonAngle - 15) * Math.PI / 180)}% A 47% 47% 0 0 1 ${50 + 47 * Math.cos((moonAngle + 15) * Math.PI / 180)}% ${50 - 47 * Math.sin((moonAngle + 15) * Math.PI / 180)}% Z`}
                fill="url(#glow-gradient)"
                opacity="0.4"
              />
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

        {/* 月亮图片（中心）- 根据Figma: width:81px, height:81px */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
          <div 
            style={{
              backgroundColor: "var(--e-3d-095)",
              width: "0.81rem", // 81px
              height: "0.81rem", // 81px
              borderRadius: "0.405rem", // 40.5px
            }}
          >
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
              alt="Moon"
              src={moonImage}
            />
          </div>
        </div>
      </div>

      {/* 时间信息区域 - 根据Figma: time1 left:0, time2 left:303px, 累计时间 left:116px */}
      <nav 
        style={{
          position: "absolute",
          width: "100%",
          top: "6.73rem", // 约673px，在表盘下方
          left: 0,
        }}
      >
        {/* 左侧时间 - width:56px, height:28px, font-size:24px, left:0 */}
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          color: "var(--e-3d-095)",
          fontSize: "0.24rem", // 24px
          fontFamily: "var(--text-font-family)",
          fontWeight: 400,
          height: "0.28rem", // 28px
          width: "0.56rem", // 56px
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
        }}>
          {currentTime || '--'}
        </div>

        {/* 中间描述文字 - width:127px, height:14px, font-size:12px, left:116px, top:7px */}
        <p style={{
          position: "absolute",
          left: "1.16rem", // 116px
          top: "0.07rem", // 7px
          color: "var(--e-3d-095)",
          fontSize: "0.12rem", // 12px
          fontFamily: "var(--text-font-family)",
          fontWeight: 400,
          filter: "blur(0.5px)",
          height: "0.14rem", // 14px
          width: "1.27rem", // 127px
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
        }}>
          {timeToMoon.label ? `${timeToMoon.label} ${timeToMoon.time}.` : ''}
        </p>

        {/* 右侧时间 - width:52px, height:28px, font-size:24px, left:303px */}
        <div style={{
          position: "absolute",
          left: "3.03rem", // 303px
          top: 0,
          color: "var(--e-3d-095)",
          fontSize: "0.24rem", // 24px
          fontFamily: "var(--text-font-family)",
          fontWeight: 400,
          height: "0.28rem", // 28px
          width: "0.52rem", // 52px
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
        }}>
          {currentTime || '--'}
        </div>
      </nav>

      {/* 可见度信息区域 - 根据Figma: width:234px, height:167px */}
      <section 
        style={{
          position: "absolute",
          width: "2.34rem", // 234px
          height: "1.67rem", // 167px
          top: "7.04rem", // 约704px，在时间信息下方
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {/* 大号数字82 - font-size:96px, line-height:167px */}
        <div 
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            color: "var(--e-3d-095)",
            fontSize: "0.96rem", // 96px
            fontFamily: "var(--text-font-family)",
            fontWeight: 400,
            lineHeight: "1.67rem", // 167px
            height: "1.67rem", // 167px
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            whiteSpace: "nowrap",
          }}
        >
          {moonVisibility}
        </div>

        {/* 百分号和方向文字区域 - left:97px */}
        <div style={{
          position: "absolute",
          left: "0.97rem", // 97px
          top: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        }}>
          {/* "can be seen at East" - font-size:32px, line-height:43.5px, top:36px, width:137px, height:88px */}
          <div 
            style={{
              color: "var(--e-3d-095)",
              fontSize: "0.32rem", // 32px
              fontFamily: "var(--text-font-family)",
              fontWeight: 400,
              lineHeight: "0.435rem", // 43.5px
              width: "1.37rem", // 137px
              height: "0.88rem", // 88px
              top: "0.36rem", // 36px
              position: "relative",
              display: "flex",
              alignItems: "center",
              textAlign: "left",
            }}
          >
            can be seen<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; at {direction}
          </div>

          {/* 百分号% - font-size:20px, line-height:34.8px, top:90px */}
          <div 
            style={{
              color: "var(--e-3d-095)",
              fontSize: "0.2rem", // 20px
              fontFamily: "var(--text-font-family)",
              fontWeight: 400,
              lineHeight: "0.348rem", // 34.8px
              height: "0.35rem", // 35px
              top: "0.9rem", // 90px
              position: "relative",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            %
          </div>

          {/* 位置和天气 - font-size:20px, line-height:27.2px, top:141px, left:calc(50% - 64px) */}
          <div 
            style={{
              color: "var(--e-3d-095)",
              fontSize: "0.2rem", // 20px
              fontFamily: "var(--text-font-family)",
              fontWeight: 400,
              lineHeight: "0.272rem", // 27.2px
              height: "0.27rem", // 27px
              top: "1.41rem", // 141px
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
            }}
          >
            {location}{weather ? `,${weather}` : ''}
          </div>
        </div>
      </section>

      {/* 底部固定文字 - 根据Figma: width:237px, height:14px, font-size:12px, left:81px, top:811px */}
      <footer 
        style={{
          position: "absolute",
          top: "8.11rem", // 811px
          left: "0.81rem", // 81px
          width: "2.37rem", // 237px
          height: "0.14rem", // 14px
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: "0.12rem", // 12px
          fontFamily: "var(--text-font-family)",
          fontWeight: 400,
          lineHeight: "normal",
          whiteSpace: "nowrap",
        }}
      >
        We shall meet in the place where there is no darkness
      </footer>
    </div>
  );
};
