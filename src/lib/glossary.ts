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
  // ─── 信号页统计卡片通用 ───
  moatAnalyzed: {
    term: "已分析总数",
    definition: "AI 已完成护城河评估的公司总数，包括已通过、已拒绝和待审核的全部提案。",
    tip: "数量多说明你的关注池在扩大。质量比数量更重要——专注审核 Confidence 为 High 的提案。",
  },
  buySignals: {
    term: "买入信号",
    definition: "系统检测到满足买入条件的信号数量。买入信号需要你人工确认后才代表你认同该判断。",
    benchmark: {
      levels: [
        { range: "0 个", label: "暂无机会，耐心等待", status: "neutral" },
        { range: "1-3 个", label: "少量机会，逐一评估", status: "good" },
        { range: "> 5 个", label: "机会较多，优先处理高分信号", status: "good" },
      ],
    },
    tip: "不是所有买入信号都需要执行。结合信号评分、你的仓位情况和市场环境综合判断。",
  },
  sellSignals: {
    term: "卖出信号",
    definition: "系统检测到需要卖出或减仓的信号数量。卖出信号通常意味着技术指标转弱或趋势反转。",
    benchmark: {
      levels: [
        { range: "0 个", label: "持仓安全，无需操作", status: "good" },
        { range: "1-2 个", label: "部分持仓需关注", status: "warning" },
        { range: "> 3 个", label: "多个持仓转弱，需及时处理", status: "danger" },
      ],
    },
    tip: "卖出信号比买入信号更紧急——保护本金永远是第一位的。",
  },
  watchSignals: {
    term: "观望信号",
    definition: "条件接近但不完全满足的信号。系统认为值得关注但还不到买入时机，建议持续跟踪。",
    tip: "观望信号可能在未来几天内转化为买入信号。加入你的关注列表，等待条件完全满足。",
  },
  alertSignals: {
    term: "预警信号",
    definition: "风险提醒信号，表示技术指标出现异常或接近危险区域。不需要立即操作，但需要提高警惕。",
    benchmark: {
      levels: [
        { range: "0 个", label: "一切正常", status: "good" },
        { range: "1-2 个", label: "个别风险，留意即可", status: "warning" },
        { range: "> 3 个", label: "多个预警，市场可能变化", status: "danger" },
      ],
    },
  },
  signalScore: {
    term: "信号评分",
    definition: "系统对交易信号的综合评分（0-100），分数越高代表信号质量越好、触发条件越充分。",
    benchmark: {
      levels: [
        { range: "90-100", label: "极强信号，多重条件确认", status: "good" },
        { range: "70-89", label: "较强信号，值得重点关注", status: "good" },
        { range: "50-69", label: "中等信号，需结合其他因素", status: "neutral" },
        { range: "< 50", label: "弱信号，谨慎对待", status: "warning" },
      ],
    },
    tip: "评分由多项指标加权计算。高分信号不代表一定赚钱，但历史上高分信号的成功率显著高于低分。",
  },
  suggestedPosition: {
    term: "建议仓位",
    definition: "系统建议你在此信号上投入的资金比例（占总资金的百分比）。例如 10% 表示如果总资金 10 万，建议投入 1 万。",
    benchmark: {
      levels: [
        { range: "5-10%", label: "标准仓位（单只股票）", status: "good" },
        { range: "10-15%", label: "重仓（高信心信号）", status: "neutral" },
        { range: "> 15%", label: "集中持仓（风险较高）", status: "warning" },
      ],
    },
    tip: "新手建议单只股票不超过总资金的 10%。即使信号再好，也要分散投资降低风险。",
  },
  crossStrategy: {
    term: "跨策略共振",
    definition: "同一只股票在多个策略层级（长线/中线/短线）同时触发了信号。共振出现意味着多个维度同时看好，信号可靠性更高。",
    benchmark: {
      levels: [
        { range: "三层共振", label: "极罕见，强信号", status: "good" },
        { range: "两层共振", label: "较强确认", status: "good" },
        { range: "单层信号", label: "正常，单独评估", status: "neutral" },
      ],
    },
    tip: "跨策略共振是 OMEGA 系统的独特优势。当长线护城河 + 中线动量 + 短线超卖同时满足时，是最理想的买入时机。",
  },
  decisionFlow: {
    term: "决策操作",
    definition: "每个信号需要你做出决策：「确认」表示你认同系统判断并计划在券商（如 IBKR）手动执行交易；「忽略」表示你不认同或暂时不操作。",
    benchmark: {
      levels: [
        { range: "确认", label: "认同信号，计划跟进操作", status: "good" },
        { range: "忽略", label: "不认同或已有持仓，跳过", status: "neutral" },
        { range: "待决策", label: "尚未处理，建议尽快决定", status: "warning" },
      ],
    },
    tip: "OMEGA 是 L2 系统（人机协作）：AI 负责发现机会，你负责最终判断和执行。确认信号后需要你自己在券商平台下单。",
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
  // ETF 标的说明
  etfVOO: {
    term: "VOO — Vanguard S&P 500 ETF",
    definition: "追踪标普 500 指数，持有美国 500 家最大上市公司。是最主流的美股大盘指数基金，适合作为核心持仓。",
    tip: "「买入美国」的最简单方式。巴菲特多次推荐普通投资者定投标普 500 指数基金。费率仅 0.03%，几乎零成本。",
  },
  etfQQQ: {
    term: "QQQ — Invesco Nasdaq-100 ETF",
    definition: "追踪纳斯达克 100 指数，重仓苹果、微软、英伟达、Meta 等科技巨头。科技股占比超过 50%，波动比 VOO 更大，成长性也更强。",
    tip: "适合看好科技长期趋势的投资者。牛市时涨幅通常超过 VOO，熊市时跌幅也更大。与 VOO 搭配可以调节科技股权重。",
  },
  etfVTI: {
    term: "VTI — Vanguard Total Stock Market ETF",
    definition: "追踪美国全市场指数（CRSP US Total Market Index），覆盖大中小盘约 4000 只股票。比 VOO 更分散，额外包含中小盘股。",
    tip: "与 VOO 高度重叠（大盘部分相同），但额外包含约 10% 的中小盘股。如果已持有 VOO，通常不需要同时持有 VTI。",
  },
  etfSCHD: {
    term: "SCHD — Schwab US Dividend Equity ETF",
    definition: "追踪道琼斯美国股息 100 指数，精选高股息且基本面健康的公司。注重股息收入，波动通常低于大盘。",
    tip: "适合追求现金流的投资者。股息率通常 3-4%，远高于 VOO 的 ~1.3%。在熊市中因估值较低、股息支撑，往往更抗跌。",
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

// ─── 区域 7：股票详情页指标 ───

export const STOCK_GLOSSARY: Record<string, GlossaryEntry> = {
  marketCap: {
    term: "市值（Market Cap）",
    definition: "公司所有流通股票的总价值 = 股价 × 总股数。反映公司在市场中的规模和地位。",
    benchmark: {
      levels: [
        { range: "> $1T", label: "超大型股（Mega Cap）", status: "good" },
        { range: "$10B - $1T", label: "大型股（Large Cap）", status: "good" },
        { range: "$2B - $10B", label: "中型股（Mid Cap）", status: "neutral" },
        { range: "< $2B", label: "小型股（Small Cap）", status: "warning" },
      ],
    },
    tip: "大型股通常更稳定，适合长线策略；小型股波动大但成长空间也大。OMEGA 长线策略偏好大型股。",
  },
  peRatio: {
    term: "市盈率（P/E Ratio）",
    definition: "股价与每股盈利的比值，衡量投资者愿意为每一元利润支付多少钱。PE 越低理论上越「便宜」。",
    benchmark: {
      levels: [
        { range: "< 15", label: "低估值（价值型）", status: "good" },
        { range: "15 - 25", label: "合理估值", status: "neutral" },
        { range: "25 - 40", label: "偏高（成长型）", status: "warning" },
        { range: "> 40", label: "高估值（需高增长支撑）", status: "danger" },
      ],
    },
    tip: "PE 需结合行业对比：科技股 PE 普遍高于银行股。负值表示公司亏损。不同行业的「合理 PE」差异很大。",
  },
  volume: {
    term: "成交量（Volume）",
    definition: "当日股票交易的总股数（M = 百万股）。例如 56M = 5600 万股。反映市场活跃度和投资者参与热情。",
    benchmark: {
      levels: [
        { range: "> 50M", label: "超高（大型热门股，如 AAPL、NVDA）", status: "good" },
        { range: "10M - 50M", label: "活跃（机构关注度高）", status: "good" },
        { range: "1M - 10M", label: "正常（中型股常见范围）", status: "neutral" },
        { range: "< 1M", label: "冷门（流动性低，买卖困难）", status: "warning" },
      ],
    },
    tip: "判断成交量高低需与该股自身均量对比：今日成交量明显高于过去 20 天均值（放量）配合上涨是好信号，配合下跌是坏信号。",
  },
  technicalChart: {
    term: "技术走势",
    definition: "通过 K 线图、均线、布林带等技术指标分析股票价格趋势和买卖时机的可视化工具。",
    benchmark: {
      levels: [
        { range: "价格在均线上方", label: "上升趋势", status: "good" },
        { range: "价格在均线附近", label: "震荡整理", status: "neutral" },
        { range: "价格在均线下方", label: "下降趋势", status: "danger" },
      ],
    },
    tip: "MA20 反映短期趋势，MA50 反映中期趋势，MA200 反映长期趋势。三线多头排列（短>中>长）是最理想的买入形态。",
  },
  newsSentiment: {
    term: "新闻情绪",
    definition: "通过 AI 分析近期新闻报道中的情感倾向，量化市场对该股票的乐观/悲观程度。范围 -1 到 +1。",
    benchmark: {
      levels: [
        { range: "> +0.4", label: "强烈看涨", status: "good" },
        { range: "+0.2 ~ +0.4", label: "偏多", status: "good" },
        { range: "-0.2 ~ +0.2", label: "中性", status: "neutral" },
        { range: "-0.4 ~ -0.2", label: "偏空", status: "warning" },
        { range: "< -0.4", label: "强烈看跌（触发情绪门控）", status: "danger" },
      ],
    },
    tip: "情绪分 < -0.4 时系统会触发「情绪门控」自动阻止买入信号。极端悲观时反向操作需要经验，新手建议观望。",
  },
  analystRating: {
    term: "分析师评级",
    definition: "华尔街职业分析师对该股票的投资评级汇总。Strong Buy/Buy 为看好，Hold 为中性，Sell/Strong Sell 为看空。",
    benchmark: {
      levels: [
        { range: "看好占比 > 70%", label: "高度看好", status: "good" },
        { range: "看好占比 50-70%", label: "偏看好", status: "neutral" },
        { range: "看好占比 30-50%", label: "分歧较大", status: "warning" },
        { range: "看好占比 < 30%", label: "多数看空", status: "danger" },
      ],
    },
    tip: "分析师评级是参考而非决策依据。注意：大多数分析师有「看多偏差」，很少给出卖出评级。70% 看好其实只是中等水平。",
  },
  returnRate: {
    term: "阶段收益率",
    definition: "股票在特定时间段内的价格涨跌幅。正值表示上涨，负值表示下跌。是衡量动量和趋势强度的核心指标。",
    benchmark: {
      levels: [
        { range: "6M > +20%", label: "强势上涨（关注中线策略）", status: "good" },
        { range: "3M > +10%", label: "中期动量良好", status: "good" },
        { range: "1M ±5%", label: "近期波动正常", status: "neutral" },
        { range: "1M < -10%", label: "短期跌幅较大", status: "warning" },
      ],
    },
    tip: "6/3/1 个月收益构成 RS Rating 的计算基础。中线策略要求三个时段收益均为正且递增（加速上涨趋势）。",
  },
  // ─── 触发原因指标 ───
  moatScore: {
    term: "Moat Score（护城河评分）",
    definition: "基于 Hamilton Helmer「7 Powers」框架的竞争优势评分，满分 35 分（7 项能力各 0-5 分）。分数越高，公司的护城河越深。",
    benchmark: {
      levels: [
        { range: "≥ 25/35", label: "护城河强劲，可触发 STRONG_BUY", status: "good" },
        { range: "20 - 24", label: "护城河较好，需关注弱项", status: "neutral" },
        { range: "15 - 19", label: "护城河一般", status: "warning" },
        { range: "< 15", label: "护城河薄弱，不建议长线持有", status: "danger" },
      ],
    },
    tip: "护城河评分需要人工审核确认。AI 提议后你可以调整每项得分，审批通过且 ≥ 25 分才会触发 STRONG_BUY 信号。",
  },
  topPower: {
    term: "Top Power（最强竞争力）",
    definition: "7 Powers 中得分最高的竞争优势来源，代表公司最核心的护城河。7 种力量包括：规模经济、网络效应、反定位、转换成本、品牌、垄断资源、流程优势。",
    benchmark: {
      levels: [
        { range: "Network Effects", label: "网络效应 — 用户越多越强", status: "good" },
        { range: "Switching Costs", label: "转换成本 — 客户粘性高", status: "good" },
        { range: "Scale Economies", label: "规模经济 — 成本优势", status: "good" },
        { range: "Branding", label: "品牌 — 溢价能力", status: "neutral" },
      ],
    },
    tip: "拥有「网络效应」或「转换成本」的公司往往护城河最持久。关注 Top Power 可以快速判断公司核心竞争力来源。",
  },
  confidence: {
    term: "Confidence（AI 信心度）",
    definition: "AI 模型对护城河评估结果的置信程度。High = 数据充分、判断明确；Medium = 部分指标模糊；Low = 数据不足或存在矛盾信息。",
    benchmark: {
      levels: [
        { range: "High", label: "信心充足，评分可靠", status: "good" },
        { range: "Medium", label: "部分不确定，建议人工复核", status: "warning" },
        { range: "Low", label: "数据不足，需谨慎对待评分", status: "danger" },
      ],
    },
    tip: "信心度低不代表公司不好，只是 AI 缺乏足够数据。建议对 Low confidence 的评分做更多独立调研后再决定。",
  },
  roe: {
    term: "ROE（净资产收益率）",
    definition: "净利润 ÷ 股东权益。衡量公司用股东的钱赚钱的效率，是巴菲特最看重的指标之一。",
    benchmark: {
      levels: [
        { range: "≥ 20%", label: "优秀（强盈利能力）", status: "good" },
        { range: "15% - 20%", label: "良好（达到 OMEGA 长线门槛）", status: "good" },
        { range: "10% - 15%", label: "中等", status: "neutral" },
        { range: "< 10%", label: "偏低（资金使用效率不高）", status: "warning" },
      ],
    },
    tip: "OMEGA 长线策略要求 ROE ≥ 15%。持续高 ROE（>20%）是护城河的强信号。注意：高负债也能推高 ROE，需结合负债率看。",
  },
  revenueGrowth: {
    term: "Revenue Growth（营收增长率）",
    definition: "公司营业收入的同比增长率。反映公司业务规模的扩张速度，是成长性的核心指标。",
    benchmark: {
      levels: [
        { range: "> 20%", label: "高速增长", status: "good" },
        { range: "10% - 20%", label: "稳健增长", status: "good" },
        { range: "5% - 10%", label: "温和增长（达到 OMEGA 长线门槛）", status: "neutral" },
        { range: "< 5%", label: "增长停滞", status: "warning" },
        { range: "< 0%", label: "营收下滑", status: "danger" },
      ],
    },
    tip: "OMEGA 长线策略要求营收增长 ≥ 5%。高增长要可持续才有意义，一次性收入推动的增长不靠谱。",
  },
  grossMargin: {
    term: "Gross Margin（毛利率）",
    definition: "（营收 - 成本）÷ 营收。衡量公司产品/服务的定价能力和成本控制能力，是竞争壁垒的直接体现。",
    benchmark: {
      levels: [
        { range: "> 60%", label: "极高（软件/平台型公司）", status: "good" },
        { range: "40% - 60%", label: "优秀（达到 OMEGA 长线门槛）", status: "good" },
        { range: "30% - 40%", label: "良好", status: "neutral" },
        { range: "20% - 30%", label: "中等（制造业/零售）", status: "neutral" },
        { range: "< 20%", label: "偏低（竞争激烈）", status: "warning" },
      ],
    },
    tip: "OMEGA 长线策略要求毛利率 ≥ 30%。高毛利率意味着产品有定价权或技术壁垒。毛利率持续下降是危险信号。",
  },
  priceVsMa: {
    term: "Price vs MA（价格与均线）",
    definition: "当前股价与移动平均线的对比。价格在均线上方说明处于上升趋势，下方说明处于下降趋势。",
    benchmark: {
      levels: [
        { range: "Price > MA50", label: "中期上升趋势（中线策略看好）", status: "good" },
        { range: "Price > MA200", label: "长期上升趋势", status: "good" },
        { range: "Price < MA50", label: "中期趋势转弱", status: "warning" },
        { range: "Price < MA200", label: "长期趋势走弱", status: "danger" },
      ],
    },
    tip: "中线策略要求 Price > MA50（50日均线之上）。价格同时在 MA50 和 MA200 之上时，是最安全的趋势环境。",
  },
  return3m: {
    term: "3M Return（3 个月收益率）",
    definition: "过去 3 个月的价格涨跌幅。正值表示近期表现良好，是中线动量策略的重要参考指标。",
    benchmark: {
      levels: [
        { range: "> +15%", label: "强势（动量充沛）", status: "good" },
        { range: "+5% ~ +15%", label: "正常上涨", status: "good" },
        { range: "-5% ~ +5%", label: "横盘震荡", status: "neutral" },
        { range: "< -5%", label: "回调中", status: "warning" },
      ],
    },
    tip: "中线策略（RS_BREAKOUT）要求 3M 收益为正。如果 3M 收益远超 1M，说明上涨正在加速。",
  },
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

// ─── 工具：根据触发原因文本匹配 glossary entry ───

const REASON_KEYWORDS: { keyword: string; glossary: "signal" | "stock"; key: string }[] = [
  // 护城河相关（长线信号）
  { keyword: "moat score", glossary: "stock", key: "moatScore" },
  { keyword: "moat", glossary: "stock", key: "moatScore" },
  { keyword: "top power", glossary: "stock", key: "topPower" },
  { keyword: "confidence", glossary: "stock", key: "confidence" },
  { keyword: "roe", glossary: "stock", key: "roe" },
  { keyword: "revenue growth", glossary: "stock", key: "revenueGrowth" },
  { keyword: "gross margin", glossary: "stock", key: "grossMargin" },
  // 中线指标
  { keyword: "rs rating", glossary: "signal", key: "rsRating" },
  { keyword: "rs_rating", glossary: "signal", key: "rsRating" },
  { keyword: "price", glossary: "stock", key: "priceVsMa" },
  { keyword: "ma50", glossary: "stock", key: "priceVsMa" },
  { keyword: "ma200", glossary: "stock", key: "priceVsMa" },
  { keyword: "3m:", glossary: "stock", key: "return3m" },
  { keyword: "3m return", glossary: "stock", key: "return3m" },
  // 短线指标
  { keyword: "rsi", glossary: "signal", key: "rsi" },
  { keyword: "bollinger", glossary: "signal", key: "bollingerBands" },
  { keyword: "布林带", glossary: "signal", key: "bollingerBands" },
  // 通用
  { keyword: "vix", glossary: "signal", key: "vix" },
  { keyword: "vcp", glossary: "signal", key: "vcp" },
  { keyword: "pocket pivot", glossary: "signal", key: "pocketPivot" },
];

export function matchReasonGlossary(reasonText: string): GlossaryEntry | null {
  const lower = reasonText.toLowerCase();
  for (const { keyword, glossary, key } of REASON_KEYWORDS) {
    if (lower.includes(keyword)) {
      const source = glossary === "signal" ? SIGNAL_GLOSSARY : STOCK_GLOSSARY;
      return source[key] || null;
    }
  }
  return null;
}
