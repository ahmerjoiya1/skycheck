import type { WeatherData } from "./types";

export async function getWeather(city: string): Promise<WeatherData> {
  const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Unexpected response from the server");
  }

  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}