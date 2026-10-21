import type { Config } from "@netlify/functions";

const BASE = "https://api.openweathermap.org/data/2.5";

interface ForecastItem {
  dt_txt: string;
  main: { temp: number };
  weather: { description: string; icon: string }[];
}

export default async (req: Request) => {
  const city = new URL(req.url).searchParams.get("city")?.trim();
  if (!city) return json({ error: "City is required" }, 400);

  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return json({ error: "Server is missing the API key" }, 500);

  const query = `q=${encodeURIComponent(city)}&appid=${key}&units=metric`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE}/weather?${query}`),
      fetch(`${BASE}/forecast?${query}`),
    ]);

    if (currentRes.status === 404) return json({ error: "City not found" }, 404);
    if (!currentRes.ok || !forecastRes.ok) {
      return json({ error: "Weather service error" }, 502);
    }

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    const days = (forecast.list as ForecastItem[])
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .slice(0, 5)
      .map((item) => ({
        date: item.dt_txt.slice(0, 10),
        temp: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      }));

    return json({
      city: `${current.name}, ${current.sys.country}`,
      current: {
        temp: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        wind: current.wind.speed,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
      },
      forecast: days,
    });
  } catch {
    return json({ error: "Could not reach the weather service" }, 502);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config: Config = { path: "/api/weather" };