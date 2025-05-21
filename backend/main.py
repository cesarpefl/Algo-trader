from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import yfinance as yf

# Load env vars (not used here yet)
load_dotenv()

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from collections import deque

price_history = deque(maxlen=100)

bot_active = False

# Request schema for /buy and /sell
class TradeRequest(BaseModel):
    symbol: str
    amount: float

@app.get("/")
def root():
    return {"message": "Trading bot API running with yfinance!"}

@app.get("/price/{symbol}")
def get_price(symbol: str):
    try:
        print(f"Fetching price for {symbol}")
        ticker = yf.Ticker(symbol.upper())
        history = ticker.history(period="1d")
        if history.empty:
            raise Exception("No data returned.")
        price = history['Close'].iloc[-1]
        return {
            "symbol": symbol.upper(),
            "price": round(price, 2)
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/buy")
def buy(trade: TradeRequest):
    print(f"Simulated BUY: {trade.amount} of {trade.symbol}")
    return {
        "action": "buy",
        "symbol": trade.symbol.upper(),
        "amount": trade.amount,
        "status": "simulated"
    }

@app.post("/sell")
def sell(trade: TradeRequest):
    print(f"Simulated SELL: {trade.amount} of {trade.symbol}")
    return {
        "action": "sell",
        "symbol": trade.symbol.upper(),
        "amount": trade.amount,
        "status": "simulated"
    }

@app.get("/status")
def get_status():
    print(f"[STATUS CHECK] bot_active = {bot_active}")
    return {
        "bot": "running" if bot_active else "idle",
        "trades": len(trade_log)
    }


import threading
import time
from datetime import datetime

bot_active = False
trade_log = []
last_price = None

def strategy_loop():
    global bot_active, trade_log, last_price
    print("🤖 Bot started thinking...")

    while bot_active:
        try:
            ticker = yf.Ticker("BTC-USD")
            history = ticker.history(period="1d")
            price = history['Close'].iloc[-1]
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"🔍 Checked price: ${price}")
            price_history.append({"time": timestamp, "price": price})
           

            # Simple strategy: Buy if price drops >2%, Sell if rises >2%
            if last_price:
                delta = (price - last_price) / last_price
                timestamp = datetime.now().strftime("%H:%M:%S")

                if delta <= -0.02:
                    trade_log.append({"time": timestamp, "action": "BUY", "price": price})
                    print(f"🟢 BUY triggered at ${price}")
                elif delta >= 0.02:
                    trade_log.append({"time": timestamp, "action": "SELL", "price": price})
                    print(f"🔴 SELL triggered at ${price}")
                else:
                    print("⏳ No trade this round")

            last_price = price
        except Exception as e:
            print(f"⚠️ Strategy error: {e}")

        time.sleep(10)
@app.post("/strategy/start")
def start_bot():
    global bot_active
    if bot_active:
        return {"status": "already running"}
    bot_active = True
    thread = threading.Thread(target=strategy_loop, daemon=True)
    thread.start()
    return {"status": "bot started"}

@app.post("/strategy/stop")
def stop_bot():
    global bot_active
    bot_active = False
    return {"status": "bot stopped"}

@app.get("/status")
def get_status():
    return {
        "bot": "running" if bot_active else "idle",
        "trades": len(trade_log)
    }

@app.get("/logs")
def get_logs():
    return {"log": trade_log}

@app.get("/price-history")
def get_price_history():
    return list(price_history)

