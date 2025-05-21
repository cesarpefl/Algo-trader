import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter
} from 'recharts';

function App() {
  const [symbol] = useState("BTC-USD");
  const [amount] = useState(0.001);
  const [log, setLog] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [botStatus, setBotStatus] = useState("idle");

  // Fetch trade log
  const fetchLog = async () => {
    try {
      const res = await axios.get("http://localhost:8000/logs");
      setLog(res.data.log);
    } catch (err) {
      console.error("Failed to fetch log:", err);
    }
  };

  // Fetch price history
  const fetchPrices = async () => {
    try {
      const res = await axios.get("http://localhost:8000/price-history");
      setPriceData(res.data);
    } catch (err) {
      console.error("Failed to fetch price data:", err);
    }
  };

  // Fetch bot status
  const fetchStatus = async () => {
    try {
      const res = await axios.get("http://localhost:8000/status");
      setBotStatus(res.data.bot);
    } catch (err) {
      console.error("Failed to fetch status:", err);
    }
  };

  const startBot = async () => {
    try {
      await axios.post("http://localhost:8000/strategy/start");
      setBotStatus("running");
    } catch (err) {
      console.error("Failed to start bot:", err);
    }
  };

  useEffect(() => {
    fetchLog();
    fetchPrices();
    fetchStatus();
    const interval = setInterval(() => {
      fetchLog();
      fetchPrices();
      fetchStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Extract buy/sell markers from log
  const buyPoints = log.filter(t => t.action === "BUY");
  const sellPoints = log.filter(t => t.action === "SELL");

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Trading Bot Dashboard</h1>

      <p>Bot status: <strong>{botStatus}</strong></p>
      {botStatus !== "running" && (
        <button onClick={startBot}>Start Bot</button>
      )}

      <h2>BTC-USD Price Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={priceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />

          {/* Buy and Sell Markers */}
          <Scatter data={buyPoints} dataKey="price" name="BUY" fill="green" shape="triangle" />
          <Scatter data={sellPoints} dataKey="price" name="SELL" fill="red" shape="square" />
        </LineChart>
      </ResponsiveContainer>

      <h3>Trade Log</h3>
      <ul>
        {log.map((entry, i) => (
          <li key={i}>
            [{entry.time}] {entry.action} at ${entry.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

