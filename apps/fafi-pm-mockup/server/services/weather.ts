/**
 * Weather Service for FaFi PM
 * Uses Open-Meteo API (free, no API key required)
 * https://open-meteo.com/
 */

interface WeatherData {
  temp: number;
  condition: string;
  wind: number;
  precipitation: number;
  humidity: number;
  updatedAt: string;
  forecast?: WeatherForecast[];
}

interface WeatherForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  precipitation: number;
  precipitationProbability: number;
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
}

// Weather code to condition mapping (WMO codes)
const weatherCodeToCondition: Record<number, string> = {
  0: "sonnig",
  1: "heiter",
  2: "wolkig",
  3: "bewölkt",
  45: "neblig",
  48: "neblig",
  51: "leichter Nieselregen",
  53: "Nieselregen",
  55: "starker Nieselregen",
  56: "gefrierender Nieselregen",
  57: "gefrierender Nieselregen",
  61: "leichter Regen",
  63: "Regen",
  65: "starker Regen",
  66: "gefrierender Regen",
  67: "gefrierender Regen",
  71: "leichter Schneefall",
  73: "Schneefall",
  75: "starker Schneefall",
  77: "Schneegriesel",
  80: "leichte Regenschauer",
  81: "Regenschauer",
  82: "starke Regenschauer",
  85: "leichte Schneeschauer",
  86: "starke Schneeschauer",
  95: "Gewitter",
  96: "Gewitter mit Hagel",
  99: "Gewitter mit starkem Hagel",
};

/**
 * Fetch current weather and 7-day forecast for a location
 */
export async function getWeatherForLocation(
  latitude: number,
  longitude: number
): Promise<WeatherData | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", latitude.toString());
    url.searchParams.set("longitude", longitude.toString());
    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max");
    url.searchParams.set("timezone", "Europe/Berlin");
    url.searchParams.set("forecast_days", "7");

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Weather API error: ${response.status}`);
      return null;
    }

    const data: OpenMeteoResponse = await response.json();

    if (!data.current) {
      return null;
    }

    const weatherData: WeatherData = {
      temp: Math.round(data.current.temperature_2m),
      condition: weatherCodeToCondition[data.current.weather_code] || "unbekannt",
      wind: Math.round(data.current.wind_speed_10m),
      precipitation: data.current.precipitation,
      humidity: data.current.relative_humidity_2m,
      updatedAt: new Date().toISOString(),
    };

    // Add forecast if available
    if (data.daily) {
      weatherData.forecast = data.daily.time.map((date, index) => ({
        date,
        tempMin: Math.round(data.daily!.temperature_2m_min[index]),
        tempMax: Math.round(data.daily!.temperature_2m_max[index]),
        condition: weatherCodeToCondition[data.daily!.weather_code[index]] || "unbekannt",
        precipitation: data.daily!.precipitation_sum[index],
        precipitationProbability: data.daily!.precipitation_probability_max[index],
      }));
    }

    return weatherData;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}

/**
 * Check if weather conditions are suitable for facade cleaning
 * Returns warnings if conditions are not ideal
 */
export function checkWeatherSuitability(weather: WeatherData): {
  suitable: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let suitable = true;

  // Temperature check
  if (weather.temp < 5) {
    warnings.push("Temperatur unter 5°C - Frostgefahr für Reinigungsmittel");
    suitable = false;
  } else if (weather.temp > 30) {
    warnings.push("Temperatur über 30°C - Reinigungsmittel trocknen zu schnell");
  }

  // Wind check
  if (weather.wind > 50) {
    warnings.push("Windgeschwindigkeit über 50 km/h - Bühnenarbeit nicht möglich");
    suitable = false;
  } else if (weather.wind > 30) {
    warnings.push("Starker Wind - Vorsicht bei Bühnenarbeit");
  }

  // Precipitation check
  if (weather.precipitation > 0.5) {
    warnings.push("Niederschlag erwartet - Reinigung nicht empfohlen");
    suitable = false;
  }

  // Condition-based checks
  const badConditions = ["Regen", "starker Regen", "Gewitter", "Schneefall", "starker Schneefall"];
  if (badConditions.some(c => weather.condition.toLowerCase().includes(c.toLowerCase()))) {
    warnings.push(`Wetterbedingung "${weather.condition}" - Arbeiten nicht empfohlen`);
    suitable = false;
  }

  // Humidity check
  if (weather.humidity > 90) {
    warnings.push("Luftfeuchtigkeit über 90% - Trocknungszeit verlängert");
  }

  return { suitable, warnings };
}

/**
 * Get weather icon name based on condition
 */
export function getWeatherIcon(condition: string): string {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes("sonnig") || conditionLower.includes("heiter")) {
    return "sun";
  }
  if (conditionLower.includes("wolkig") || conditionLower.includes("bewölkt")) {
    return "cloud";
  }
  if (conditionLower.includes("regen") || conditionLower.includes("niesel")) {
    return "cloud-rain";
  }
  if (conditionLower.includes("schnee")) {
    return "cloud-snow";
  }
  if (conditionLower.includes("nebel") || conditionLower.includes("neblig")) {
    return "cloud-fog";
  }
  if (conditionLower.includes("gewitter")) {
    return "cloud-lightning";
  }
  
  return "cloud";
}

export type { WeatherData, WeatherForecast };
