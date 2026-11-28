'use client';

import { Sun, CloudSun, Cloud, CloudFog, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import useSWR from 'swr';
import { z } from 'zod';

const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=49.2827&longitude=-123.1207&current=weather_code';

const WeatherResponse = z.object({ current: z.object({ weather_code: z.number() }) });

const iconProps = {
  size: 14,
  strokeWidth: 1.5,
  className: 'ml-1 inline-block -translate-y-[1px]',
  'aria-hidden': true,
} as const;

const ICONS = {
  clear: <Sun {...iconProps} />,
  partly: <CloudSun {...iconProps} />,
  cloudy: <Cloud {...iconProps} />,
  fog: <CloudFog {...iconProps} />,
  rain: <CloudRain {...iconProps} />,
  snow: <CloudSnow {...iconProps} />,
  thunder: <CloudLightning {...iconProps} />,
};

function categorize(code: number): keyof typeof ICONS {
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partly';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'thunder';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  return 'cloudy';
}

export function Weather() {
  const { data } = useSWR(
    WEATHER_URL,
    async (url: string) => {
      const response = await fetch(url);
      // An overloaded API answers with an error body, which has no weather in it.
      if (!response.ok) throw new Error(`Weather API answered ${response.status}`);
      return WeatherResponse.parse(await response.json());
    },
    {
      onError: (err) => console.error('Weather fetch failed:', err),
    },
  );

  if (!data) return null;

  return ICONS[categorize(data.current.weather_code)];
}
