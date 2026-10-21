import { useState, type FormEvent } from "react";
import { getWeather } from "./api";
import type { WeatherData } from "./types";
import "./App.css";

const iconUrl = (icon: string) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError("");
    try {
      setWeather(await getWeather(city));
    } catch (err) {
      setWeather(null);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <h1>SkyCheck</h1>

      <form onSubmit={handleSubmit} className="search">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter a city, e.g. London"
          aria-label="City"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {error && <p role="alert" className="error">{error}</p>}

      {weather && (
        <>
          <section className="current">
            <h2>{weather.city}</h2>
            <img src={iconUrl(weather.current.icon)} alt={weather.current.description} />
            <p className="temp">{weather.current.temp}°C</p>
            <p className="desc">{weather.current.description}</p>
            <p>
              Feels like {weather.current.feelsLike}°C · Humidity{" "}
              {weather.current.humidity}% · Wind {weather.current.wind} m/s
            </p>
          </section>

          <section className="forecast">
            {weather.forecast.map((day) => (
              <div key={day.date} className="day">
                <p>
                  {new Date(day.date).toLocaleDateString("en-GB", { weekday: "short" })}
                </p>
                <img src={iconUrl(day.icon)} alt={day.description} />
                <p>{day.temp}°C</p>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default App;