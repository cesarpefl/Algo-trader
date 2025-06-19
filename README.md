# Algo-Trader

A full-stack simulated trading bot built with:
- ⚛️ React frontend (dashboard + chart)
- 🧠 FastAPI backend (price + strategy)
- 💹 Live price feed from Yahoo Finance
- 🧾 Simulated Buy/Sell logic
- 📈 Auto-trading brain with graph overlay

To run:

```bash
uvicorn backend.main:app --reload
cd dashboard && npm start

