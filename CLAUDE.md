# OMEGA Dashboard

## Project Overview

OMEGA is a **L2 quantitative trading Copilot** (Human-in-the-Loop / Cyborg Mode). AI handles data analysis and signal generation; the human makes all final trading decisions. This repo is the **frontend dashboard** built with Next.js.

- **Version**: v0.14.0
- **Language**: Chinese (zh-CN) UI, code comments in Chinese
- **Backend**: FastAPI (Python) at `localhost:8000` (separate repo: `omega-api`)
- **AI Agent**: OpenClaw (separate repo: `openclaw-skills`) — auto research + moat analysis + news tagging
- **Deployment**: Vercel (frontend), Railway/Render/Fly.io (backend)

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, Radix UI, Lucide Icons
- **Charts**: Recharts 3
- **Theme**: next-themes (dark mode support)
- **Realtime**: WebSocket for signal push
- **Node**: >= 20.0.0

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Dashboard home
│   ├── signals/            # Trading signals
│   │   ├── layout.tsx      # Shared signals layout
│   │   ├── page.tsx        # Redirects to /signals/index
│   │   ├── index/page.tsx  # THE BASE (index ETF strategy)
│   │   ├── long/page.tsx   # THE CORE (long-term)
│   │   ├── mid/page.tsx    # THE FLOW (mid-term)
│   │   └── short/page.tsx  # THE SWING (short-term)
│   ├── stock/[symbol]/     # Stock detail (dynamic route)
│   ├── portfolio/          # Portfolio management (WIP)
│   ├── moat-scanner/       # Redirects to /signals/long
│   ├── settings/           # System settings
│   └── api/                # Next.js API Routes (market, stock proxies)
├── components/
│   ├── layout/             # Sidebar, Header, MainContent, MobileMenuButton, NotificationBell
│   ├── dashboard/          # MarketStatusBar, StrategyPanel, MoatScannerTable
│   ├── signals/            # SignalsTable, SignalsFilters, StrategyStats, SignalsStats, DecisionHistory, SignalCard, SignalList, SignalNotifier, IndexWatchlistPanel, MoatPowersGrid
│   ├── news/               # NewsSection (stock news list), MoatNewsFeed (moat news + 7 Powers filter)
│   ├── charts/             # CandlestickChart, VolumeChart, PriceChart, TechnicalChart, MiniChartCard, TimeRangeSelector
│   ├── portfolio/          # PortfolioStats, AllocationChart, PositionsTable
│   ├── shared/             # Logo, GlobalSearch (Cmd+K), SyncStatusBar, StatusBadge, SourceBadge
│   ├── settings/           # SettingsForm
│   ├── ui/                 # Button, Card, Badge, Table, Toast, InfoTooltip
│   └── theme/              # ThemeProvider, ThemeToggle
├── hooks/                  # useSignals, useStockData, useFinnhubData, useMoatData, useMarketData, useHistoricalData, useIndexData, useScannerStatus, useData
├── lib/
│   ├── api.ts              # Main API client (all backend calls + WebSocket + newsApi)
│   ├── api-config.ts       # API configuration
│   ├── glossary.ts         # Financial glossary for InfoTooltip
│   ├── types.ts            # Shared types
│   ├── utils.ts            # cn() utility (clsx + tailwind-merge)
│   ├── mock/               # index-mock.ts (ETF mock data for index strategy)
│   ├── alpha-vantage.ts    # Legacy (unused)
│   └── yahoo-finance.ts    # Legacy (unused)
├── types/
│   └── signals.ts          # Signal type definitions + config constants (incl. IndexSignalType)
└── contexts/
    └── SidebarContext.tsx   # Sidebar open/collapsed/mobile state
```

## Core Business Logic

### Four-Layer Trading Strategy

| Layer | Name | Route | Allocation | Core Logic | Signal Types |
|-------|------|-------|-----------|------------|-------------|
| Index | THE BASE  | `/signals/index` | 35% | ETF DCA + Valuation | INDEX_DCA, INDEX_VALUE, INDEX_RISK |
| Long  | THE CORE  | `/signals/long`  | 30% | Moat (7 Powers) + Fundamentals | STRONG_BUY |
| Mid   | THE FLOW  | `/signals/mid`   | 20% | RS Rating + Momentum | RS_BREAKOUT, RS_MOMENTUM |
| Short | THE SWING | `/signals/short` | 15% | RSI(2) + Bollinger Bands | OVERSOLD_T1, OVERSOLD_T2 |

### Signal Decision Flow

- **Index**: ETF watchlist (VOO, QQQ, VTI, SCHD) with PE vs 5yr avg, dividend yield, MA200, RSI(14). Backend API not yet implemented (uses mock data).
- **Long-term**: AI proposes Moat scores -> human reviews via interactive sliders (0-5 per power) -> approve/reject -> triggers STRONG_BUY if score >= 25/35
- **Mid/Short-term**: Signals auto-generated -> human confirms/ignores in signal table -> manual execution in IBKR
- **Decision states**: `pending` -> `confirmed` | `ignored`

### Safety Mechanisms

1. **Circuit Breaker** (system-level): Halts ALL buy signals when SPX < MA200 OR VIX > 25
2. **Sentiment Gate** (per-stock): Blocks signal when Finnhub news sentiment score < -0.4; warns when bearish% far exceeds sector average

### Moat Scoring (7 Powers Framework)

Hamilton Helmer's 7 Powers, each scored 0-5 (total 0-35):
- Scale Economies, Network Effects, Counter-Positioning, Switching Costs, Branding, Cornered Resource, Process Power
- Score >= 25 + approved + fundamentals pass (ROE >= 15%, revenue growth >= 5%, gross margin >= 30%) -> STRONG_BUY

### News Integration (v0.13.0)

- Backend stores FMP news articles to `news_articles` table (auto-saved when sentiment endpoint is called, deduped by symbol+url)
- 7 Powers tags stored in `news_tags` table (created by OpenClaw via `POST /api/news/{id}/tag`)
- Frontend: `NewsSection` shows per-stock news list; `MoatNewsFeed` shows tagged moat news with 7 Powers filter buttons
- `MoatPowersGrid` shows +N/-N news count indicators per Power

### OpenClaw AI Integration (v0.12.0)

- **Source tracking**: `moat_scores.source` column — `"openclaw"` (AI) or `"manual"` (human). Frontend `SourceBadge` shows purple "AI" / gray "手动"
- **NotificationBell**: Header bell icon with unread count badge, shows recent 48h moat proposals, localStorage-based read tracking
- **OpenClaw Skills** (in `openclaw-skills/` repo):
  - 晨报 (Morning Brief), 7 Powers Analysis, Moat Monitor, Watchlist Management, Autonomous Research
  - 3 Cron jobs: daily brief (weekdays 8:30 AM), research (Wed+Sat 9:00 AM), weekly review (Sun 10:00 AM)
  - Heartbeat every 2h: monitors watchlist companies + circuit breaker
  - `submit-moat.sh`: submits moat proposals via `POST /api/moat` with `source=openclaw`
  - Moat Monitor auto-tags news via `POST /api/news/{id}/tag` (7 Powers framework)

## Data Sources (Backend)

| Data | Source | Cache TTL |
|------|--------|-----------|
| Market indices (SPX, NDX, VIX) | FMP + Finnhub | 60s |
| Stock history (OHLCV) | FMP | 1 hour |
| Real-time quotes | Finnhub | 15s |
| Fundamentals (TTM financials) | FMP | 24 hours |
| RS Rating | Computed from FMP | 5 min |
| Stock search (Cmd+K) | Finnhub | 1 hour |
| News sentiment | FMP (news) + Finnhub (sentiment gate) | 5-30 min |
| Analyst recommendations | Finnhub | 1 hour |
| Moat scores, signals, RS history | SQLite (omega.db) | realtime |
| News articles + tags | SQLite (omega.db) | realtime |
| Settings | JSON file | realtime |

**Database tables** (6): `stocks`, `moat_scores`, `signals`, `rs_ratings`, `news_articles`, `news_tags`

**API Keys required**: `FMP_API_KEY` (FMP Starter $19/mo, 300 req/min), `FINNHUB_API_KEY` (free, 60 req/min)

## Key Backend API Endpoints

All at `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`):

```
# Market & Stock
GET  /api/market                         # Market overview (SPX, NDX, VIX, circuit breaker)
GET  /api/market/search?q=AAPL           # Stock search (Finnhub proxy)
GET  /api/market/quote/{symbol}          # Real-time quote (Finnhub)
GET  /api/market/sentiment/{symbol}      # News sentiment (FMP) — also auto-saves articles to DB
GET  /api/market/recommendation/{symbol} # Analyst ratings (Finnhub)
GET  /api/stock/{symbol}                 # Stock detail (FMP quote + fundamentals + history + indicators)
GET  /api/stock/{symbol}/rs              # RS Rating
GET  /api/rs-ranking                     # RS ranking (?top=20 or ?symbols=AAPL,NVDA)

# Moat
GET  /api/moat                           # All moat scores (?status=PENDING)
POST /api/moat                           # Create moat proposal (source=openclaw|manual)
GET  /api/moat/{ticker}                  # Single moat detail
GET  /api/moat/strong-buys               # Verified high-score moats (>= 25)
POST /api/moat/{ticker}/approve          # Approve (with optional adjustedScores)
POST /api/moat/{ticker}/reject           # Reject (with optional notes)

# News
GET  /api/news/{symbol}                  # News list (pagination, ?tagged_only, ?power filter)
GET  /api/news/{symbol}/moat-feed        # Moat news feed (tagged news only)
POST /api/news/{news_id}/tag             # Tag news with 7 Powers (idempotent, used by OpenClaw)

# Signals
GET  /api/signals                        # Signal list + stats (?strategy=&action=&ticker=)
GET  /api/signals/scanner-status         # Scanner status
POST /api/signals/{id}/confirm           # Confirm signal (with optional notes)
POST /api/signals/{id}/ignore            # Ignore signal (with optional notes)
WS   /api/signals/ws                     # WebSocket real-time signal push

# Settings
GET  /api/settings                       # Get settings
PUT  /api/settings                       # Update settings

# System
GET  /health                             # Health check
GET  /docs                               # Swagger UI
```

## Frontend API Client (`src/lib/api.ts`)

The API client maps backend snake_case/CamelModel responses to frontend TypeScript interfaces:
- `mapStockDetail()`: raw StockDetailRaw -> StockData
- `mapMoatProposal()`: raw MoatProposalRaw -> MoatData
- `mapTradingSignal()`: raw TradingSignalRaw -> TradingSignal (action BUY/SELL/HOLD/WATCH -> type buy/sell/watch/alert)
- `mapSignalStats()`: raw SignalStatsRaw -> SignalStats
- `createSignalWebSocket()`: WebSocket with auto-reconnect (3s interval)
- `newsApi`: `getStockNews(symbol)`, `getMoatFeed(symbol)` — news list + moat news feed
- `indexApi`: `getWatchlist()`, `getOverview()`, `getDetail(symbol)` — index strategy (currently mock data)

## Development

```bash
npm install
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

Backend must be running at `localhost:8000` (or set `NEXT_PUBLIC_API_URL`).

## Conventions

- **UI language**: All user-facing text in Chinese (zh-CN)
- **CSS**: Tailwind utility classes with custom `stripe-*` design tokens (e.g., `text-stripe-ink`, `bg-stripe-bg`, `text-stripe-purple`)
- **Dark mode**: All components support dark mode via `dark:` prefix classes
- **Components**: "use client" for interactive components; server components where possible
- **Imports**: `@/` path alias maps to `src/`
- **State management**: React hooks + Context (SidebarContext); no Redux/Zustand
- **Data fetching**: Custom hooks with SWR-like patterns (polling intervals, error handling)
- **Responsive**: Mobile-first with sidebar drawer on mobile, fixed sidebar on desktop

## Current Status

### Completed
- Four-strategy independent pages (/signals/index, /signals/long, /signals/mid, /signals/short)
- Index strategy THE BASE — ETF watchlist (VOO, QQQ, VTI, SCHD) with IndexWatchlistPanel (frontend mock data)
- Moat approval integrated into long-term strategy page (with interactive score sliders)
- FMP + Finnhub data source migration (from yfinance)
- Sentiment Gate (news sentiment filtering)
- Real-time signal push via WebSocket (with offline/realtime toggle)
- Global stock search (Cmd+K)
- Circuit breaker display
- Signal deduplication (same ticker+strategy+type per day)
- SQLite database migration (from YAML)
- News integration: news_articles + news_tags tables, 3 News API endpoints, NewsSection + MoatNewsFeed components
- OpenClaw AI integration: 5 Skills, Cron jobs, Heartbeat, auto-submit moat proposals
- Source Badge (AI/Manual) on moat proposals
- NotificationBell for moat proposal alerts
- InfoTooltip financial glossary across all pages
- Client-side strategy filtering in useSignals

### In Progress / TODO
1. Frontend settings page: wire up to backend GET/PUT /api/settings
2. Index strategy backend API (`/api/index/watchlist`, `/api/index/overview`, `/api/index/detail/{symbol}` — frontend currently uses mock data)
3. Index strategy signal engine (INDEX_DCA, INDEX_VALUE, INDEX_RISK)
4. Portfolio page: manual position tracking, later IBKR API integration
5. Backend cloud deployment (Docker ready)
6. OpenClaw Cron jobs: switch from localhost:8000 to cloud API URL
