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
    definition: "定期定额投资提醒。系统在每周一自动生成（非熔断期间），提醒你执行本周的 ETF 定投。信号分数固定为 80，建议仓位为总资金的 10%。",
    benchmark: {
      levels: [
        { range: "每周一触发", label: "正常频率", status: "good" },
        { range: "未触发", label: "当前处于熔断状态，暂停定投提醒", status: "warning" },
      ],
    },
    tip: "定投的精髓是「定」——固定时间、固定金额、不做择时。确认信号后请在当天完成买入操作。",
  },
  indexValue: {
    term: "INDEX_VALUE（估值买入）",
    definition: "当 ETF 估值显著低于历史均值或市场出现恐慌时触发的加仓信号。触发条件：价格 < MA200 或 VIX > 30。信号分数动态计算（60-100），越低估分数越高。",
    benchmark: {
      levels: [
        { range: "分数 80-100", label: "极度低估，强加仓信号", status: "good" },
        { range: "分数 60-79", label: "适度低估，可考虑加仓", status: "good" },
        { range: "VIX 触发", label: "市场恐慌导致，需结合估值判断", status: "warning" },
      ],
    },
    tip: "这是常规定投之外的「加餐」机会，不要把全部资金一次投入。建议每次加投为月定投额的 50%，分批加仓摊低成本。",
  },
  indexRisk: {
    term: "INDEX_RISK（风险预警）",
    definition: "当 ETF 技术面全面走弱时触发的风险警示。触发条件：价格跌破 MA200 且 RSI(14) < 30。信号动作为 WATCH（观察），不建议卖出。",
    benchmark: {
      levels: [
        { range: "触发", label: "技术面全面走弱，关注但不恐慌", status: "danger" },
        { range: "未触发", label: "技术面正常", status: "good" },
      ],
    },
    tip: "风险预警是提醒你关注市场状态，不是卖出信号！指数定投策略的核心是在市场低迷时持续积累份额。历史上每次大跌后指数都创了新高。",
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
    definition: "系统已生成但用户尚未做出确认或忽略决策的信号数量。每个信号都需要你的人工判断。",
    benchmark: {
      levels: [
        { range: "0 个", label: "全部处理完毕", status: "good" },
        { range: "1-5 个", label: "正常积压", status: "neutral" },
        { range: "> 5 个", label: "积压过多，建议尽快处理", status: "warning" },
        { range: "> 10 个", label: "信号可能过期失效", status: "danger" },
      ],
    },
    tip: "建议每天花 5 分钟处理待决策信号。INDEX_DCA 信号建议在每周一开盘前处理，INDEX_VALUE 信号时效性更强。",
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
    definition: "用户审核后确认执行的信号数量。确认意味着你认同系统判断并计划跟进操作。",
    benchmark: {
      levels: [
        { range: "确认率 > 80%", label: "系统判断与你高度一致", status: "good" },
        { range: "确认率 50-80%", label: "正常范围，人机配合", status: "neutral" },
        { range: "确认率 < 50%", label: "信号质量可能需要调优", status: "warning" },
      ],
    },
    tip: "L2 系统的核心是人机协作：系统负责发现机会，你负责最终判断。不必 100% 确认，但长期确认率过低说明策略参数可能需要调整。",
  },
  ignored: {
    term: "已忽略",
    definition: "用户审核后选择不执行的信号数量，可能是因为不认同判断或已有持仓。",
  },
  dcaStreak: {
    term: "连续定投",
    definition: "连续执行定投操作的周数。每周系统生成 INDEX_DCA 信号，用户确认后计为一周。连续不中断的周数反映投资纪律性。",
    benchmark: {
      levels: [
        { range: "≥ 52 周", label: "超过一年，纪律极佳", status: "good" },
        { range: "12-51 周", label: "稳定执行中", status: "good" },
        { range: "4-11 周", label: "刚开始建立习惯", status: "neutral" },
        { range: "< 4 周", label: "尚未形成纪律", status: "warning" },
      ],
    },
    tip: "定投的核心是纪律，而非择时。即使市场下跌也应坚持，长期来看波动会被平滑。中断定投往往错过低价买入机会。",
  },
  etfCount: {
    term: "ETF 数量",
    definition: "当前指数策略跟踪的 ETF 数量。OMEGA 默认跟踪 4 只覆盖不同市场的 ETF，实现分散化定投。",
    benchmark: {
      levels: [
        { range: "4 只（默认）", label: "VOO + QQQ + VTI + SCHD，核心组合", status: "good" },
        { range: "< 3 只", label: "覆盖不足，缺少分散化", status: "warning" },
        { range: "> 6 只", label: "过度分散，管理成本上升", status: "neutral" },
      ],
    },
    tip: "4 只 ETF 覆盖大盘（VOO）、科技（QQQ）、全市场（VTI）和高股息（SCHD），兼顾成长与防御。",
  },
  valueSignals: {
    term: "估值买入",
    definition: "最近 30 天内触发的 INDEX_VALUE 信号数量。当 ETF 估值显著低于历史均值，或市场出现恐慌性下跌（VIX > 30）时触发。",
    benchmark: {
      levels: [
        { range: "0 个", label: "估值正常，无额外加投机会", status: "neutral" },
        { range: "1-2 个", label: "部分 ETF 出现低估值机会", status: "good" },
        { range: "3-4 个", label: "市场普遍低估，大好机会", status: "good" },
      ],
    },
    tip: "估值买入是在常规定投之外的「加餐」机会。触发条件：PE < 5年均值的90% 或 VIX > 30。不要贪多，每次加投建议为月定投额的 50%。",
  },
  riskAlerts: {
    term: "风险预警",
    definition: "最近 30 天内触发的 INDEX_RISK 信号数量。当 ETF 跌破 200 日均线且 RSI(14) 进入超卖区域时触发。",
    benchmark: {
      levels: [
        { range: "0 个", label: "市场健康，无风险", status: "good" },
        { range: "1-2 个", label: "个别 ETF 出现技术性风险", status: "warning" },
        { range: "3-4 个", label: "市场普遍走弱，需谨慎", status: "danger" },
      ],
    },
    tip: "风险预警不代表要止损！指数定投策略中，下跌反而是低价积累份额的机会。预警的意义是提醒你关注市场状态，而非恐慌卖出。",
  },
};

// ─── 区域 6：指数 ETF 卡片指标 ───

export const INDEX_METRIC_GLOSSARY: Record<string, GlossaryEntry> = {
  indexPe: {
    term: "PE / PE 5年均值",
    definition: "市盈率（Price-to-Earnings Ratio）是股价与每股盈利的比值。左侧为当前 PE，右侧为过去 5 年的 PE 均值。两者的比值反映当前估值相对于历史水平的高低。",
    benchmark: {
      levels: [
        { range: "PE/均值 < 0.9", label: "估值偏低，定投加码好时机", status: "good" },
        { range: "PE/均值 0.9-1.1", label: "估值合理，维持正常定投", status: "neutral" },
        { range: "PE/均值 1.1-1.3", label: "估值偏高，维持但不加码", status: "warning" },
        { range: "PE/均值 > 1.3", label: "显著高估，考虑降低定投额", status: "danger" },
      ],
    },
    tip: "ETF 卡片上当比值 < 0.9 时数字显示为绿色，> 1.1 时显示为红色。PE 受市场情绪和利率影响较大，不要单独作为买卖依据。",
  },
  indexDividendYield: {
    term: "股息率",
    definition: "过去 12 个月的股息总额占当前股价的百分比（TTM Dividend Yield）。反映 ETF 的现金回报能力。",
    benchmark: {
      levels: [
        { range: "> 3%", label: "高股息，适合收入型投资者", status: "good" },
        { range: "1.5-3%", label: "中等，平衡成长与收入", status: "neutral" },
        { range: "0.5-1.5%", label: "偏低，侧重资本增值", status: "neutral" },
        { range: "< 0.5%", label: "极低股息，纯成长型", status: "neutral" },
      ],
    },
    tip: "SCHD 专注高股息策略（通常 > 3%），QQQ 侧重成长（通常 < 1%），各有定位。股息率高不一定好——可能是股价暴跌导致的「被动高息」。",
  },
  indexMa200: {
    term: "MA200（200 日均线）",
    definition: "过去 200 个交易日的收盘价平均值，是判断长期趋势方向的经典指标。「上方」表示价格在均线之上（上升趋势），「下方」表示在均线之下（下降趋势）。",
    benchmark: {
      levels: [
        { range: "上方（绿色）", label: "长期上升趋势，定投安全区", status: "good" },
        { range: "下方（红色）", label: "长期趋势转弱，可能触发风险预警", status: "danger" },
      ],
    },
    tip: "跌破 MA200 是 OMEGA 系统的重要风险信号之一。但对于指数定投策略，跌破 MA200 反而可能是以更低价格积累份额的机会——关键是不要停止定投。",
  },
  indexRsi14: {
    term: "RSI(14)（14日相对强弱指标）",
    definition: "14 个交易日内上涨力量与下跌力量的对比。数值 0-100，反映 ETF 是否处于超买或超卖状态。",
    benchmark: {
      levels: [
        { range: "< 30", label: "超卖，价格可能被低估", status: "good" },
        { range: "30-50", label: "偏弱但正常", status: "neutral" },
        { range: "50-70", label: "正常偏强", status: "neutral" },
        { range: "> 70", label: "超买，短期可能回调", status: "warning" },
      ],
    },
    tip: "RSI(14) < 30 配合跌破 MA200 会触发 INDEX_RISK 风险预警。对指数来说，超卖通常是加码定投的信号而非止损信号。",
  },
  indexExpenseRatio: {
    term: "费率（Expense Ratio）",
    definition: "ETF 每年收取的管理费用占资产净值的百分比。费率直接侵蚀长期收益，是选择 ETF 时的重要考量因素。",
    benchmark: {
      levels: [
        { range: "≤ 0.05%", label: "极低费率，行业最优", status: "good" },
        { range: "0.05-0.20%", label: "合理范围，长期影响有限", status: "neutral" },
        { range: "0.20-0.50%", label: "中等，注意长期复合影响", status: "warning" },
        { range: "> 0.50%", label: "偏高，建议寻找替代品", status: "danger" },
      ],
    },
    tip: "VOO 和 VTI 费率仅 0.03%，属于全市场最低。QQQ 费率 0.20% 稍高但可接受。长期定投中 0.1% 的费率差异可能导致数万美元的收益差距。",
  },
  indexHealthStatus: {
    term: "健康状态",
    definition: "系统根据 PE 估值、MA200 位置和 RSI(14) 三项指标综合判断的 ETF 健康度。绿色圆点 = 健康，黄色 = 观望，红色 = 谨慎。",
    benchmark: {
      levels: [
        { range: "健康（healthy）", label: "PE 合理 + 在 MA200 上方 + RSI 正常", status: "good" },
        { range: "观望（watch）", label: "跌破 MA200 / RSI < 40 / PE 偏高（> 均值×1.3）三者任一", status: "warning" },
        { range: "谨慎（caution）", label: "跌破 MA200 且 RSI < 30（技术面全面走弱）", status: "danger" },
      ],
    },
    tip: "健康状态是快速一览的综合指标。「谨慎」不代表要停止定投，而是提醒你当前市场环境需要更多关注。在「谨慎」时坚持定投，往往能获得更低的平均成本。",
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
