// Miroir des DTOs de l'API (apps/api/app/schemas.py)

export type LightColor = "green" | "orange" | "red" | "neutral";

export interface Light {
  color: LightColor;
  label: string;
  reason: string;
}

export interface Quote {
  symbol: string;
  name: string;
  asset_class: string;
  currency: string;
  unit: string;
  price: number | null;
  change_24h_pct: number | null;
  change_7d_pct: number | null;
  change_30d_pct: number | null;
  change_1y_pct: number | null;
  sparkline_7d: number[];
  volume_24h: number | null;
  market_cap: number | null;
  source: string;
  as_of: string | null;
  stale: boolean;
  light: Light;
}

export interface SubScore {
  key: string;
  name: string;
  score: number;
  weight: number;
  explanation: string;
  source: string;
}

export interface Pulse {
  score: number;
  label: string;
  explanation: string;
  subscores: SubScore[];
  as_of: string;
  disclaimer: string;
}

export interface Summary {
  text: string;
  generated_by: string;
  is_ai: boolean;
  sources: string[];
  as_of: string;
  note: string;
}

export interface MarketGroup {
  title: string;
  quotes: Quote[];
}

export interface Overview {
  as_of: string;
  data_mode: "live" | "degraded" | "demo";
  groups: MarketGroup[];
  pulse: Pulse;
  summary: Summary;
  disclaimer: string;
}

export interface Candle {
  t: string;
  o: number | null;
  h: number | null;
  l: number | null;
  c: number;
  v: number | null;
}

export interface AssetStats {
  volatility_30d_annualized_pct: number | null;
  drawdown_from_1y_high_pct: number | null;
  high_1y: number | null;
  low_1y: number | null;
  above_sma50: boolean | null;
  trend_label: string;
}

export interface WhyBlock {
  facts: string[];
  interpretation: string | null;
  generated: boolean;
  note: string;
}

export interface AssetDetail {
  quote: Quote;
  stats: AssetStats;
  why: WhyBlock;
  candles: Candle[];
  history_source: string;
  disclaimer: string;
}

export interface AssetRef {
  symbol: string;
  name: string;
  asset_class: string;
  currency: string;
}

export interface Position {
  id: number;
  symbol: string;
  name: string;
  asset_class: string;
  quantity: number;
  buy_price: number;
  buy_currency: string;
  buy_date: string | null;
  note: string;
  current_price: number | null;
  price_currency: string;
  value_eur: number;
  invested_eur: number;
  pnl_eur: number;
  pnl_pct: number | null;
  source: string;
  as_of: string | null;
}

export interface AllocationSlice {
  asset_class: string;
  value_eur: number;
  pct: number;
}

export interface RiskCard {
  key: string;
  title: string;
  level: LightColor;
  headline: string;
  detail: string;
}

export interface RuleCheck {
  rule: string;
  ok: boolean;
  current: number;
  limit: number;
  comment: string;
}

export interface Portfolio {
  positions: Position[];
  cash_eur: number;
  total_value_eur: number;
  invested_eur: number;
  pnl_eur: number;
  pnl_pct: number | null;
  allocation: AllocationSlice[];
  risk_cards: RiskCard[];
  rule_checks: RuleCheck[];
  fx_eur_usd: number;
  as_of: string;
  disclaimer: string;
}

export interface Settings {
  cash_eur: number;
  rule_max_crypto_pct: number;
  rule_max_position_pct: number;
  rule_reserve_eur: number;
}

export interface SimSnapshot {
  total_value_eur: number;
  cash_eur: number;
  allocation: AllocationSlice[];
  top_position_pct: number;
  crypto_pct: number;
  est_volatility_pct: number;
}

export interface SimScenario {
  shock_pct: number;
  asset_loss_eur: number;
  portfolio_value_eur: number;
  portfolio_change_pct: number;
}

export interface SimResult {
  symbol: string;
  name: string;
  amount_eur: number;
  before: SimSnapshot;
  after: SimSnapshot;
  scenarios: SimScenario[];
  rule_checks: RuleCheck[];
  warnings: string[];
  note: string;
  disclaimer: string;
}

export interface WatchlistItem {
  id: number;
  symbol: string;
  reason: string;
  added_at: string;
  quote: Quote | null;
}

export interface CopilotStatus {
  available: boolean;
  model: string | null;
  reason: string | null;
}

export interface CopilotAnswer {
  answer: string;
  sources: string[];
  model: string;
  disclaimer: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
