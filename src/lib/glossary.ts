// 金融术语知识库 — InfoTooltip 数据源

export type BenchmarkStatus = "good" | "neutral" | "warning" | "danger";

export interface BenchmarkLevel {
  range: string;
  label: string;
  status: BenchmarkStatus;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  benchmark?: {
    levels: BenchmarkLevel[];
  };
  tip?: string;
}

// ─── 区域 1：MarketStatusBar 卡片 ───

export const MARKET_GLOSSARY: Record<string, GlossaryEntry> = {
  spx: {
    term: "标普500指数",
    definition: "美国 500 家大型上市公司股价加权指数，是衡量美股整体表现的核心基准。",
    benchmark: {
      levels: [
        { range: "日涨跌 < 1%", label: "正常波动", status: "good" },
        { range: "日跌幅 2-5%", label: "显著回调", status: "warning" },
        { range: "日跌幅 > 5%", label: "剧烈下跌", status: "danger" },
      ],
    },
    tip: "通常与纳斯达克100对比看，若标普500跌而纳斯达克不跌，说明科技板块相对强势。",
  },
  ndx: {
    term: "纳斯达克100",
    definition: "以科技股为主的 100 家大型公司指数，反映科技板块的整体走势。",
    benchmark: {
      levels: [
        { range: "跑赢标普500", label: "科技强势", status: "good" },
        { range: "与标普500同步", label: "正常", status: "neutral" },
        { range: "跑输标普500", label: "科技弱势", status: "warning" },
      ],
    },
    tip: "与标普500对比可判断科技板块相对强弱，对中短线策略尤为重要。",
  },
  vix: {
    term: "VIX 恐慌指数",
    definition: "市场波动率预期指标，衡量未来 30 天标普500期权的隐含波动率。",
    benchmark: {
      levels: [
        { range: "< 15", label: "低波动（贪婪）", status: "good" },
        { range: "15 - 20", label: "适中", status: "neutral" },
        { range: "20 - 25", label: "高波动", status: "warning" },
        { range: "25 - 30", label: "恐慌", status: "danger" },
        { range: "> 30", label: "极端恐慌", status: "danger" },
      ],
    },
    tip: "VIX 越高说明市场越恐慌。反向指标：极端恐慌时往往是短线超卖买入机会。",
  },
  circuitBreaker: {
    term: "熔断器",
    definition: "当市场剧烈下跌时自动暂停交易的保护机制，防止恐慌性抛售失控。",
    benchmark: {
      levels: [
        { range: "关闭", label: "正常交易", status: "good" },
        { range: "Level 1 · 跌 7%", label: "暂停 15 分钟", status: "warning" },
        { range: "Level 2 · 跌 13%", label: "暂停 15 分钟", status: "danger" },
        { range: "Level 3 · 跌 20%", label: "全天暂停交易", status: "danger" },
      ],
    },
    tip: "熔断触发后市场情绪极度恐慌，历史上仅在 2020 年 3 月连续触发过。",
  },
  todaySignals: {
    term: "今日信号",
    definition: "系统当日检测到的所有交易机会总数，包括买入、卖出、观望和预警信号。",
    tip: "信号数量多不代表都需要执行，需结合每条信号的评分和策略层级综合判断。",
  },
};

// ─── 区域 2：StrategyPanel 四层策略 ───

export const STRATEGY_GLOSSARY: Record<string, GlossaryEntry> = {
  base: {
    term: "指数 · THE BASE",
    definition: "以宽基指数 ETF 定投为核心的被动投资策略，作为整个组合的稳定底仓。",
    benchmark: {
      levels: [
        { range: "目标仓位 35%", label: "基础底仓", status: "good" },
        { range: "定投频率 每周", label: "定期定额", status: "neutral" },
      ],
    },
    tip: "指数策略追求市场平均回报，通过长期定投平滑买入成本。当估值偏低时可加大投入。",
  },
  core: {
    term: "长线 · THE CORE",
    definition: "以护城河为核心的价值投资策略，聚焦具有持续竞争优势的优质公司。",
    benchmark: {
      levels: [
        { range: "目标仓位 50%", label: "核心持仓", status: "good" },
        { range: "持有周期 1-3 年", label: "低频交易", status: "neutral" },
      ],
    },
    tip: "依据 Hamilton Helmer「7 Powers」框架评估护城河强度，通过后才进入持仓池。",
  },
  flow: {
    term: "中线 · THE FLOW",
    definition: "基于动量和趋势的波段策略，跟踪有持续上涨势能的股票。",
    benchmark: {
      levels: [
        { range: "目标仓位 30%", label: "趋势仓位", status: "good" },
        { range: "持有周期 2-12 周", label: "中频交易", status: "neutral" },
      ],
    },
    tip: "使用 VCP（波动收缩形态）和 Pocket Pivot（口袋支点）等 William O'Neil 经典形态识别买入时机。",
  },
  swing: {
    term: "短线 · THE SWING",
    definition: "基于技术面超卖信号的短期反弹策略，捕捉市场情绪过度悲观后的修复行情。",
    benchmark: {
      levels: [
        { range: "目标仓位 20%", label: "机动仓位", status: "good" },
        { range: "持有周期 1-5 天", label: "高频交易", status: "neutral" },
      ],
    },
    tip: "适合在 VIX 升高、RSI 进入超卖区域时入场，快进快出。",
  },
};

// ─── 区域 3 & 4：信号表格表头 + 指标术语 ───

export const SIGNAL_GLOSSARY: Record<string, GlossaryEntry> = {
  // 表头术语
  signalColumn: {
    term: "信号",
    definition: "系统对当前股票的操作建议，基于技术指标和策略规则自动生成。",
    benchmark: {
      levels: [
        { range: "买入", label: "系统建议建仓/加仓", status: "good" },
        { range: "卖出", label: "系统建议减仓/离场", status: "danger" },
        { range: "观望", label: "条件不够成熟，继续监控", status: "neutral" },
        { range: "预警", label: "风险信号出现，需要关注", status: "warning" },
      ],
    },
  },
  strategyColumn: {
    term: "策略",
    definition: "信号来源的策略层级 — 长线（护城河）、中线（动量）或短线（超卖反弹）。",
  },
  indicatorColumn: {
    term: "指标",
    definition: "触发该信号的技术指标名称及其当前值，是信号生成的核心依据。",
  },
  reasonColumnLong: {
    term: "原因（长线）",
    definition: "长线信号的触发依据，核心是护城河评分（7 Powers）和基本面三重验证。",
    benchmark: {
      levels: [
        { range: "Moat ≥ 25/35", label: "护城河通过，可触发 STRONG_BUY", status: "good" },
        { range: "ROE ≥ 15%", label: "盈利能力达标", status: "good" },
        { range: "营收增长 ≥ 5%", label: "成长性达标", status: "good" },
        { range: "毛利率 ≥ 30%", label: "竞争壁垒达标", status: "good" },
      ],
    },
    tip: "三项基本面指标必须同时满足才会触发信号。Top Power 代表最强的竞争优势来源，重点关注。",
  },
  reasonColumnMid: {
    term: "原因（中线）",
    definition: "中线信号的触发依据，基于相对强度（RS Rating）和价量形态识别趋势启动点。",
    benchmark: {
      levels: [
        { range: "RS ≥ 80", label: "强势股，优先关注", status: "good" },
        { range: "RS 50-80", label: "中性，需其他指标确认", status: "neutral" },
        { range: "VCP 形态确认", label: "波动收缩后放量突破", status: "good" },
        { range: "Pocket Pivot", label: "筑底期提前布局信号", status: "good" },
      ],
    },
    tip: "Mark Minervini 建议只买 RS > 70 的股票。突破时成交量需放大至少 1.5 倍均量，否则可能是假突破。",
  },
  reasonColumnShort: {
    term: "原因（短线）",
    definition: "短线信号的触发依据，利用 RSI(2) 和布林带捕捉超卖反弹机会。",
    benchmark: {
      levels: [
        { range: "RSI(2) < 10", label: "T1 级超卖，强反弹信号", status: "good" },
        { range: "RSI(2) < 5", label: "T2 级极端超卖，高胜率", status: "good" },
        { range: "触及布林带下轨", label: "价格处于波动区间底部", status: "good" },
        { range: "VIX > 25", label: "市场恐慌，反向机会", status: "warning" },
      ],
    },
    tip: "超卖不等于一定反弹，需结合支撑位和成交量。持仓周期 1-5 天，快进快出，严格止损。",
  },

  // 指数策略
  reasonColumnIndex: {
    term: "原因（指数）",
    definition: "指数策略的信号触发依据，基于估值水平、均线位置和风险指标判断。",
    benchmark: {
      levels: [
        { range: "PE < 5年均值 90%", label: "估值偏低，可加投", status: "good" },
        { range: "PE 接近均值", label: "正常估值，维持定投", status: "neutral" },
        { range: "跌破 MA200", label: "长期趋势转弱", status: "warning" },
        { range: "RSI(14) < 30", label: "技术超卖", status: "good" },
      ],
    },
    tip: "指数估值低于历史均值时是加大定投的好时机。RSI(14) 超卖配合低估值更有信心。",
  },
  indexDca: {
    term: "INDEX_DCA（定投提醒）",
    definition: "定期定额投资提醒，根据预设频率自动触发的买入信号。",
  },
  indexValue: {
    term: "INDEX_VALUE（估值买入）",
    definition: "当 ETF 估值显著低于历史均值时触发的加仓信号，表示当前价格具有额外吸引力。",
  },
  indexRisk: {
    term: "INDEX_RISK（风险预警）",
    definition: "当 ETF 技术指标出现异常（如跌破 MA200、RSI 极端）时触发的风险警示。",
  },
  // 技术指标术语
  rsi: {
    term: "RSI（相对强弱指标）",
    definition: "衡量股票在一段时间内上涨与下跌力量对比的动量指标，数值 0-100。",
    benchmark: {
      levels: [
        { range: "< 30", label: "超卖（可能反弹）", status: "good" },
        { range: "30 - 70", label: "正常区间", status: "neutral" },
        { range: "> 70", label: "超买（可能回调）", status: "warning" },
      ],
    },
  },
  oversold: {
    term: "Oversold（超卖）",
    definition: "股价被过度抛售，跌幅可能超出基本面所支持的范围，存在反弹机会。",
    benchmark: {
      levels: [
        { range: "RSI < 30", label: "RSI 超卖", status: "good" },
        { range: "触及布林带下轨", label: "布林带超卖", status: "good" },
      ],
    },
    tip: "超卖不等于一定反弹，需结合成交量和支撑位判断。",
  },
  overbought: {
    term: "Overbought（超买）",
    definition: "股价被过度追捧，涨幅可能超出基本面所支持的范围，存在回调风险。",
    benchmark: {
      levels: [
        { range: "RSI > 70", label: "RSI 超买", status: "warning" },
        { range: "触及布林带上轨", label: "布林带超买", status: "warning" },
      ],
    },
  },
  vcp: {
    term: "VCP（波动收缩形态）",
    definition: "William O'Neil 的经典突破形态：股价波动幅度逐步收缩，成交量逐步萎缩，积蓄突破能量。",
    benchmark: {
      levels: [
        { range: "波动幅度逐步收缩", label: "形态形成中", status: "neutral" },
        { range: "缩量后放量突破", label: "突破确认", status: "good" },
      ],
    },
    tip: "突破时成交量需明显放大（至少 1.5 倍均量），否则可能是假突破。",
  },
  pocketPivot: {
    term: "Pocket Pivot（口袋支点）",
    definition: "在基底形成期间出现的上涨信号：当日上涨成交量超过最近 10 天内任何一天的下跌成交量。",
    benchmark: {
      levels: [
        { range: "成交量条件满足", label: "有效信号", status: "good" },
        { range: "价格在 10 日线上方", label: "位置理想", status: "good" },
      ],
    },
    tip: "Pocket Pivot 适合在股票筑底阶段提前布局，不必等到完全突破。",
  },
  bollingerBands: {
    term: "Bollinger Bands（布林带）",
    definition: "基于标准差计算的价格波动通道，由中轨（20日均线）、上轨和下轨组成。",
    benchmark: {
      levels: [
        { range: "价格触及下轨", label: "可能超卖", status: "good" },
        { range: "价格在中轨附近", label: "正常波动", status: "neutral" },
        { range: "价格触及上轨", label: "可能超买", status: "warning" },
      ],
    },
  },
  rsRating: {
    term: "RS Rating（相对强度评级）",
    definition: "股票相对于大盘的价格表现评级，数值 1-99，值越高表示跑赢市场的程度越大。",
    benchmark: {
      levels: [
        { range: "> 80", label: "强势（领涨股）", status: "good" },
        { range: "50 - 80", label: "中性", status: "neutral" },
        { range: "< 50", label: "弱势（跑输大盘）", status: "warning" },
      ],
    },
    tip: "Mark Minervini 建议只买 RS > 70 的股票，避免弱势股。",
  },
  vix: {
    term: "VIX 恐慌指数",
    definition: "市场波动率预期指标，衡量未来 30 天标普500期权的隐含波动率。",
    benchmark: {
      levels: [
        { range: "< 15", label: "低波动（贪婪）", status: "good" },
        { range: "15 - 20", label: "适中", status: "neutral" },
        { range: "20 - 25", label: "高波动", status: "warning" },
        { range: "> 30", label: "极端恐慌", status: "danger" },
      ],
    },
    tip: "VIX 越高说明市场越恐慌。极端恐慌时往往是短线超卖买入机会。",
  },
  strongBuy: {
    term: "STRONG_BUY（强力买入）",
    definition: "长线策略中最高级别的买入信号，表示该股票护城河评分优秀，基本面和估值均具吸引力。",
    benchmark: {
      levels: [
        { range: "护城河评分 > 70%", label: "护城河强劲", status: "good" },
        { range: "估值合理", label: "值得长期持有", status: "good" },
      ],
    },
  },
  trendFollow: {
    term: "趋势跟踪",
    definition: "中线策略的趋势跟踪信号，表示股票处于中期上升趋势中，动量指标支持继续持有或加仓。",
    benchmark: {
      levels: [
        { range: "价格在 50 日均线上方", label: "中期上升趋势", status: "good" },
        { range: "价格在 200 日均线上方", label: "长期上升趋势", status: "good" },
        { range: "价格跌破 50 日均线", label: "趋势减弱", status: "warning" },
      ],
    },
  },
};

// ─── 区域 5：StrategyStats 统计卡片 ───

export const STATS_GLOSSARY: Record<string, GlossaryEntry> = {
  moatPassed: {
    term: "护城河已通过",
    definition: "护城河评估完成且被用户确认的股票数量，这些股票具备长期竞争优势。",
  },
  pendingDecision: {
    term: "待决策",
    definition: "系统已生成信号但用户尚未做出确认或忽略决策的信号数量。",
    tip: "建议及时处理待决策信号，避免错过最佳入场时机。",
  },
  totalSignals: {
    term: "信号总数",
    definition: "当前策略下所有已生成的信号总量，包括已确认、已忽略和待处理的信号。",
  },
  activeSignals: {
    term: "活跃信号",
    definition: "当前仍然有效的信号数量，这些信号的触发条件尚未失效。",
  },
  confirmed: {
    term: "已确认",
    definition: "用户审核后确认执行的信号数量，意味着用户认同系统的判断并计划跟进。",
  },
  ignored: {
    term: "已忽略",
    definition: "用户审核后选择不执行的信号数量，可能是因为不认同判断或已有持仓。",
  },
  dcaStreak: {
    term: "连续定投",
    definition: "连续执行定投操作的周数，反映投资纪律性。",
    tip: "保持定投纪律是指数投资成功的关键，避免情绪化中断。",
  },
  etfCount: {
    term: "ETF 数量",
    definition: "当前指数策略跟踪的 ETF 数量。",
  },
};

// ─── 工具：根据指标关键词匹配 glossary entry ───

const INDICATOR_KEYWORDS: Record<string, string> = {
  // RSI
  rsi: "rsi",
  "relative strength index": "rsi",
  "相对强弱": "rsi",
  // 超卖
  oversold: "oversold",
  "超卖": "oversold",
  "over sold": "oversold",
  // 超买
  overbought: "overbought",
  "超买": "overbought",
  "over bought": "overbought",
  // VCP
  vcp: "vcp",
  "波动收缩": "vcp",
  "volatility contraction": "vcp",
  // Pocket Pivot
  "pocket pivot": "pocketPivot",
  "口袋支点": "pocketPivot",
  "pocket_pivot": "pocketPivot",
  // Bollinger Bands
  bollinger: "bollingerBands",
  "布林带": "bollingerBands",
  "boll": "bollingerBands",
  // RS Rating
  "rs rating": "rsRating",
  "rs_rating": "rsRating",
  "相对强度": "rsRating",
  "relative strength": "rsRating",
  // VIX（原因中可能提及）
  vix: "vix",
  "恐慌指数": "vix",
  // 护城河相关
  "strong_buy": "strongBuy",
  "强力买入": "strongBuy",
  // 趋势跟踪
  "trend_follow": "trendFollow",
  "趋势跟踪": "trendFollow",
  // 指数策略
  "index_dca": "indexDca",
  "定投提醒": "indexDca",
  "index_value": "indexValue",
  "估值买入": "indexValue",
  "index_risk": "indexRisk",
  "风险预警": "indexRisk",
};

export function matchIndicatorGlossary(indicatorText: string): GlossaryEntry | null {
  const lower = indicatorText.toLowerCase();
  for (const [keyword, key] of Object.entries(INDICATOR_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return SIGNAL_GLOSSARY[key] || null;
    }
  }
  return null;
}
