import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const API_BASE = "http://127.0.0.1:8000";

// Enhanced indicators display component
const renderIndicatorsDisplay = (indicators, selectedSymbol) => (
  <div style={{ 
    marginBottom: 20, 
    padding: "15px", 
    backgroundColor: "#f8f9fa", 
    borderRadius: "8px",
    border: "1px solid #dee2e6"
  }}>
    {/* Basic Indicators Row */}
    <div style={{ marginBottom: "10px" }}>
      <strong>📊 {selectedSymbol}</strong> |{" "}
      <span style={{ color: indicators.rsi > 70 ? '#dc3545' : indicators.rsi < 30 ? '#28a745' : '#6c757d' }}>
        <strong>RSI:</strong> {indicators.rsi ?? "..."}
      </span> |{" "}
      <span style={{ color: indicators.macd > indicators.signal ? '#28a745' : '#dc3545' }}>
        <strong>MACD:</strong> {indicators.macd ?? "..."}
      </span> |{" "}
      <strong>Signal:</strong> {indicators.signal ?? "..."}
    </div>
    
    {/* Support/Resistance Analysis */}
    <div style={{ display: "flex", gap: "20px", fontSize: "14px" }}>
      <div style={{ flex: 1 }}>
        <strong style={{ color: "#28a745" }}>🟢 Support Levels:</strong>
        {indicators.support_levels && indicators.support_levels.length > 0 ? (
          <div style={{ marginTop: "5px" }}>
            {indicators.support_levels.map((level, index) => (
              <div key={index} style={{ 
                padding: "2px 6px", 
                backgroundColor: index === 0 ? "#d4edda" : "#e9ecef",
                borderRadius: "3px", 
                marginBottom: "2px",
                fontSize: "12px"
              }}>
                <strong>${level.level}</strong> 
                <span style={{ color: "#6c757d" }}>
                  {" "}(Strength: {level.strength}, Touches: {level.touches})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ color: "#6c757d" }}> ${indicators.support ?? "..."} (Basic)</span>
        )}
      </div>
      
      <div style={{ flex: 1 }}>
        <strong style={{ color: "#dc3545" }}>🔴 Resistance Levels:</strong>
        {indicators.resistance_levels && indicators.resistance_levels.length > 0 ? (
          <div style={{ marginTop: "5px" }}>
            {indicators.resistance_levels.map((level, index) => (
              <div key={index} style={{ 
                padding: "2px 6px", 
                backgroundColor: index === 0 ? "#f8d7da" : "#e9ecef",
                borderRadius: "3px", 
                marginBottom: "2px",
                fontSize: "12px"
              }}>
                <strong>${level.level}</strong>
                <span style={{ color: "#6c757d" }}>
                  {" "}(Strength: {level.strength}, Touches: {level.touches})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ color: "#6c757d" }}> ${indicators.resistance ?? "..."} (Basic)</span>
        )}
      </div>
    </div>
    
    {/* Analysis Summary */}
    {indicators.current_price && (
      <div style={{ marginTop: "10px", padding: "8px", backgroundColor: "#e3f2fd", borderRadius: "4px", fontSize: "12px" }}>
        <strong>📈 Analysis:</strong> Current: ${indicators.current_price} | 
        Pivots Found: {indicators.total_pivots_found ?? 0} | 
        Support Quality: {indicators.support_quality ?? 0} | 
        Resistance Quality: {indicators.resistance_quality ?? 0}
      </div>
    )}
  </div>
);

// Enhanced chart component
const renderEnhancedChart = (priceData, indicators) => (
  <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px" }}>
    <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>📊 Price Chart with Support/Resistance Analysis</h4>
    
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={priceData}>
        <CartesianGrid stroke="#f0f0f0" strokeDasharray="2 2" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => {
            if (typeof value === 'number') {
              return new Date(value * 1000).toLocaleTimeString();
            }
            return value;
          }}
        />
        <YAxis 
          domain={['dataMin - 20', 'dataMax + 20']} 
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => `$${value.toFixed(0)}`}
        />
        <Tooltip 
          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
          labelFormatter={(label) => `Time: ${label}`}
          contentStyle={{ 
            backgroundColor: "#fff", 
            border: "1px solid #ccc", 
            borderRadius: "4px",
            fontSize: "12px"
          }}
        />
        
        {/* Main Price Line */}
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#007bff" 
          strokeWidth={2.5} 
          dot={false}
          connectNulls={false}
        />
        
        {/* Primary Support Line */}
        {indicators.support && (
          <ReferenceLine 
            y={indicators.support} 
            stroke="#28a745" 
            strokeWidth={2}
            strokeDasharray="8 4" 
            label={{ 
              value: `Support: $${indicators.support}`, 
              position: "insideTopRight",
              style: { fontSize: "12px", fill: "#28a745", fontWeight: "bold" }
            }}
          />
        )}
        
        {/* Primary Resistance Line */}
        {indicators.resistance && (
          <ReferenceLine 
            y={indicators.resistance} 
            stroke="#dc3545" 
            strokeWidth={2}
            strokeDasharray="8 4" 
            label={{ 
              value: `Resistance: $${indicators.resistance}`, 
              position: "insideTopRight",
              style: { fontSize: "12px", fill: "#dc3545", fontWeight: "bold" }
            }}
          />
        )}
        
        {/* Additional Support Levels */}
        {indicators.support_levels && indicators.support_levels.slice(1).map((level, index) => (
          <ReferenceLine 
            key={`support-${index}`}
            y={level.level} 
            stroke="#28a745" 
            strokeWidth={1}
            strokeDasharray="4 2" 
            strokeOpacity={0.6}
            label={{ 
              value: `S${index + 2}: $${level.level}`, 
              position: "insideTopLeft",
              style: { fontSize: "10px", fill: "#28a745", opacity: 0.8 }
            }}
          />
        ))}
        
        {/* Additional Resistance Levels */}
        {indicators.resistance_levels && indicators.resistance_levels.slice(1).map((level, index) => (
          <ReferenceLine 
            key={`resistance-${index}`}
            y={level.level} 
            stroke="#dc3545" 
            strokeWidth={1}
            strokeDasharray="4 2" 
            strokeOpacity={0.6}
            label={{ 
              value: `R${index + 2}: $${level.level}`, 
              position: "insideBottomLeft",
              style: { fontSize: "10px", fill: "#dc3545", opacity: 0.8 }
            }}
          />
        ))}
        
        {/* Current Price Line */}
        {indicators.current_price && (
          <ReferenceLine 
            y={indicators.current_price} 
            stroke="#ffc107" 
            strokeWidth={1}
            strokeDasharray="2 2" 
            label={{ 
              value: `Current: $${indicators.current_price}`, 
              position: "insideTopRight",
              style: { fontSize: "11px", fill: "#ffc107", fontWeight: "bold" }
            }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
    
    {/* Chart Legend */}
    <div style={{ 
      marginTop: "10px", 
      padding: "8px", 
      backgroundColor: "#f8f9fa", 
      borderRadius: "4px",
      fontSize: "11px",
      display: "flex",
      flexWrap: "wrap",
      gap: "15px"
    }}>
      <span><strong style={{ color: "#007bff" }}>━━━</strong> Price</span>
      <span><strong style={{ color: "#28a745" }}>╌╌╌</strong> Support</span>
      <span><strong style={{ color: "#dc3545" }}>╌╌╌</strong> Resistance</span>
      <span><strong style={{ color: "#ffc107" }}>┅┅┅</strong> Current</span>
      <span style={{ color: "#6c757d" }}>
        Strength = Cluster Size × 10 + Touches × 5 + Recency Bonus
      </span>
    </div>
  </div>
);

function App() {
  const [timeRange, setTimeRange] = useState({ period: "1d", interval: "5m" });
  const [symbolInput, setSymbolInput] = useState("");
  const [watchlist, setWatchlist] = useState(["BTC-USD", "AAPL", "ETH-USD"]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-USD");
  const [priceData, setPriceData] = useState([]);
  const [indicators, setIndicators] = useState({
    rsi: null,
    macd: null,
    signal: null,
    support: null,
    resistance: null,
    support_levels: [],
    resistance_levels: [],
    current_price: null,
    total_pivots_found: 0,
    support_quality: 0,
    resistance_quality: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [botStatus, setBotStatus] = useState("idle");
  const [balance, setBalance] = useState({ usd: 0, btc: 0 });
  const [tradeLogs, setTradeLogs] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch price history and indicators
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch price data
        const priceResponse = await fetch(
          `${API_BASE}/price-history/${selectedSymbol}?period=${timeRange.period}&interval=${timeRange.interval}`
        );
        
        if (!priceResponse.ok) {
          throw new Error(`Price data fetch failed: ${priceResponse.status}`);
        }
        
        const priceData = await priceResponse.json();
        setPriceData(priceData);

        // Fetch indicators
        try {
          const indicatorsResponse = await fetch(
            `${API_BASE}/indicators/${selectedSymbol}?period=${timeRange.period}&interval=${timeRange.interval}`
          );
          
          if (indicatorsResponse.ok) {
            const indicatorsData = await indicatorsResponse.json();
            setIndicators(indicatorsData);
          }
        } catch (indicatorError) {
          console.warn("Indicators fetch failed:", indicatorError);
          // Don't break the app if indicators fail
        }
        
      } catch (err) {
        console.error("Data fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSymbol, timeRange]);

  // Fetch bot status and balance periodically
  useEffect(() => {
    const fetchBotData = async () => {
      try {
        // Get bot status
        const statusResponse = await fetch(`${API_BASE}/status`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setBotStatus(statusData.bot);
        }

        // Get balance
        const balanceResponse = await fetch(`${API_BASE}/balance`);
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setBalance(balanceData);
        }

        // Get trade logs
        const logsResponse = await fetch(`${API_BASE}/logs`);
        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          setTradeLogs(logsData.log.slice(-10)); // Last 10 trades
        }

        setLastUpdate(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn("Bot data fetch failed:", err);
      }
    };

    // Fetch immediately
    fetchBotData();
    
    // Then fetch every 5 seconds
    const interval = setInterval(fetchBotData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartBot = async () => {
    try {
      const response = await fetch(`${API_BASE}/strategy/start`, { method: 'POST' });
      if (response.ok) {
        setBotStatus("running");
      }
    } catch (err) {
      console.error("Failed to start bot:", err);
    }
  };

  const handleStopBot = async () => {
    try {
      const response = await fetch(`${API_BASE}/strategy/stop`, { method: 'POST' });
      if (response.ok) {
        setBotStatus("idle");
      }
    } catch (err) {
      console.error("Failed to stop bot:", err);
    }
  };

  const handleAddSymbol = () => {
    const cleaned = symbolInput.toUpperCase().trim();
    if (cleaned && !watchlist.includes(cleaned)) {
      setWatchlist([...watchlist, cleaned]);
      setSelectedSymbol(cleaned);
      setSymbolInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddSymbol();
    }
  };

  const timeRangeButtons = [
    { label: "1D", period: "1d", interval: "5m" },
    { label: "7D", period: "7d", interval: "1h" },
    { label: "1M", period: "1mo", interval: "1d" }
  ];

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>📈 Algo Trader Dashboard</h2>

      {/* Bot Control Panel */}
      <div style={{ 
        marginBottom: 20, 
        padding: "15px", 
        backgroundColor: "#f0f8ff", 
        borderRadius: "8px", 
        border: "1px solid #007bff" 
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h3 style={{ margin: 0, marginRight: "15px" }}>🤖 Trading Bot</h3>
            <div style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor: botStatus === "running" ? "#28a745" : "#6c757d",
              color: "white"
            }}>
              {botStatus === "running" ? "🟢 RUNNING" : "⚫ IDLE"}
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleStartBot}
              disabled={botStatus === "running"}
              style={{
                padding: "8px 16px",
                backgroundColor: botStatus === "running" ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: botStatus === "running" ? "not-allowed" : "pointer"
              }}
            >
              ▶️ Start
            </button>
            <button
              onClick={handleStopBot}
              disabled={botStatus === "idle"}
              style={{
                padding: "8px 16px",
                backgroundColor: botStatus === "idle" ? "#ccc" : "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: botStatus === "idle" ? "not-allowed" : "pointer"
              }}
            >
              ⏹️ Stop
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div style={{ display: "flex", gap: "20px", fontSize: "14px" }}>
          <div><strong>💵 USD:</strong> ${Number(balance.usd).toFixed(2)}</div>
          <div><strong>₿ BTC:</strong> {Number(balance.btc).toFixed(6)}</div>
          <div><strong>📊 Trades:</strong> {tradeLogs.length}</div>
          {lastUpdate && <div><strong>🕒 Updated:</strong> {lastUpdate}</div>}
        </div>
      </div>

      {/* Symbol Selector */}
      <div style={{ marginBottom: 15 }}>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          {watchlist.map((symbol) => (
            <option key={symbol} value={symbol}>{symbol}</option>
          ))}
        </select>

        <input
          placeholder="Add Symbol (e.g. TSLA)"
          value={symbolInput}
          onChange={(e) => setSymbolInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button 
          onClick={handleAddSymbol} 
          style={{ 
            marginLeft: "10px", 
            padding: "8px 12px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          ➕ Add
        </button>
      </div>

      {/* Time Range Selector */}
      <div style={{ marginBottom: 15 }}>
        <span style={{ marginRight: 15, fontWeight: "bold" }}>🕒 Time Range:</span>
        {timeRangeButtons.map((range) => (
          <button
            key={range.label}
            onClick={() => setTimeRange({ period: range.period, interval: range.interval })}
            style={{
              marginRight: "10px",
              padding: "6px 12px",
              backgroundColor: timeRange.period === range.period ? "#007bff" : "#f8f9fa",
              color: timeRange.period === range.period ? "white" : "#333",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Enhanced Indicators Display */}
      {renderIndicatorsDisplay(indicators, selectedSymbol)}

      {/* Error Display */}
      {error && (
        <div style={{ 
          color: "red", 
          backgroundColor: "#fee", 
          padding: "10px", 
          borderRadius: "4px", 
          marginBottom: "15px" 
        }}>
          Error: {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          Loading chart data...
        </div>
      )}

      {/* Enhanced Chart */}
      {renderEnhancedChart(priceData, indicators)}

      {/* Trade Log */}
      {tradeLogs.length > 0 && (
        <div style={{ 
          marginTop: "20px", 
          padding: "15px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "8px",
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          <h4 style={{ margin: "0 0 10px 0" }}>📋 Recent Trades</h4>
          {tradeLogs.slice().reverse().map((trade, index) => (
            <div key={index} style={{ 
              marginBottom: "5px", 
              padding: "8px", 
              backgroundColor: trade.action === "BUY" ? "#d4edda" : "#f8d7da",
              borderRadius: "4px",
              fontSize: "12px",
              borderLeft: `4px solid ${trade.action === "BUY" ? "#28a745" : "#dc3545"}`
            }}>
              <strong>{trade.time}</strong> - {trade.action === "BUY" ? "🟢" : "🔴"} {trade.action} 
              at ${Number(trade.price).toFixed(2)} | 
              RSI: {trade.rsi} | MACD: {trade.macd} |
              Balance: ${Number(trade.wallet.usd).toFixed(2)} USD, {Number(trade.wallet.btc).toFixed(6)} BTC
            </div>
          ))}
        </div>
      )}

      {/* Data Info */}
      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        Data points: {priceData.length} | Chart updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

export default App;
