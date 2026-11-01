/* 广告 Agent 评测台 · 合成数据
   北境咖啡 / 星轨耳机 / 青禾护肤均为虚构品牌。
   分数是确定性演示样本，不是线上实验。 */
var AEL_DATA = {
  agents: [
    {
      id: "baseline",
      name: "Baseline",
      nameZh: "单轮基线",
      summary: "一次生成。不检索、不调用工具、不修订。",
      stepsLabel: "1 步"
    },
    {
      id: "tool",
      name: "Tool-augmented",
      nameZh: "工具增强",
      summary: "品牌库检索 + 政策规则。未过滤文档状态。",
      stepsLabel: "工具"
    },
    {
      id: "multistep",
      name: "Multi-step + retrieval",
      nameZh: "多步检索",
      summary: "规划槽位 → 只取 active 文档 → 起草 → 批评 → 修订。",
      stepsLabel: "5 步"
    }
  ],

  kb: {
    "coffee.origin": {
      brand: "北境咖啡",
      title: "产地",
      status: "active",
      text: "咖啡豆来自云南保山，日晒处理，海拔 1400–1800 米。不是埃塞俄比亚，也不是巴拿马。"
    },
    "coffee.process": {
      brand: "北境咖啡",
      title: "工艺与风味",
      status: "active",
      text: "冷萃·雪线为 12 小时冷萃。允许的风味描述只有：柑橘开头，可可尾韵。"
    },
    "coffee.sku": {
      brand: "北境咖啡",
      title: "产品名",
      status: "active",
      text: "对外产品名使用「冷萃·雪线」。"
    },
    "coffee.promo": {
      brand: "北境咖啡",
      title: "新客优惠",
      status: "active",
      text: "新客首单尝鲜装 ¥19.9，共 3 日装。本任务只允许这一档优惠。"
    },
    "coffee.ice": {
      brand: "北境咖啡",
      title: "夜航冰杯",
      status: "expired",
      text: "历史活动：22:00 后下单赠冰杯。上季度已结束，禁止再写。"
    },
    "coffee.audience": {
      brand: "北境咖啡",
      title: "受众",
      status: "active",
      text: "一二线 25–34 岁夜班或晚归职场人。语气克制，不要喊「熬夜党」。"
    },
    "audio.anc": {
      brand: "星轨耳机",
      title: "降噪口径",
      status: "active",
      text: "星轨耳机 Pro：实验室峰值 42dB@1kHz，典型通勤约 38dB。不得简称成未加限定的「40dB」，不得写临床或医生推荐。"
    },
    "audio.battery": {
      brand: "星轨耳机",
      title: "续航",
      status: "active",
      text: "单次续航 28 小时，含充电仓 36 小时。"
    },
    "audio.price": {
      brand: "星轨耳机",
      title: "星轨黄价格",
      status: "active",
      text: "星轨黄日常价 ¥1,299，当前已审批活动价 ¥1,099。"
    },
    "audio.price_draft": {
      brand: "星轨耳机",
      title: "未审批价格草稿",
      status: "draft",
      text: "内部草稿出现过 ¥899。未审批，禁止对外，也不能当作清库存价。"
    },
    "audio.policy": {
      brand: "星轨耳机",
      title: "表达禁区",
      status: "active",
      text: "禁止医疗表述（保护听力、治疗耳鸣、医生推荐）和点名或影射贬低竞品。"
    },
    "skin.name": {
      brand: "青禾护肤",
      title: "产品名",
      status: "active",
      text: "对外产品名为「青禾澄光精华」。"
    },
    "skin.ingredient": {
      brand: "青禾护肤",
      title: "成分",
      status: "active",
      text: "烟酰胺 5%，搭配神经酰胺。浓度不是 10%。"
    },
    "skin.claims": {
      brand: "青禾护肤",
      title: "功效边界",
      status: "active",
      text: "可以说提亮肤色外观、保湿。不可以说淡斑、祛斑、医用、当天见效、100% 有效。"
    },
    "skin.category": {
      brand: "青禾护肤",
      title: "品类",
      status: "active",
      text: "化妆品，妆字号。不是药品，不是医疗器械。"
    },
    "skin.team": {
      brand: "青禾护肤",
      title: "团队表述",
      status: "active",
      text: "可以写化妆品配方团队。禁止「三甲医院皮肤科」「皮肤科推荐」「医用背景」。"
    },
    "i18n.glossary": {
      brand: "北境咖啡",
      title: "术语表",
      status: "active",
      text: "冷萃雪线 = Snowline Cold Brew = スノーライン・コールドブリュー。日晒 = natural process = ナチュラル。产地 = Yunnan Baoshan = 雲南保山。"
    },
    "i18n.price": {
      brand: "北境咖啡",
      title: "价格与货币",
      status: "active",
      text: "尝鲜装 ¥19.9 人民币 / 3 日装。禁止换算成美元或日元一口价。页面需说明结算货币是人民币。"
    },
    "i18n.cta": {
      brand: "北境咖啡",
      title: "行动号召",
      status: "active",
      text: "一次性新客尝鲜，不是订阅。英文用 Try the 3-day pack。日文用 3日分を試す。禁止 Subscribe / 定期購入。"
    },
    "i18n.proof": {
      brand: "北境咖啡",
      title: "社会证明",
      status: "active",
      text: "品牌库没有可引用的评价数、星级或奖项。禁止编造。"
    }
  },

  briefs: [
    {
      id: "acquisition",
      index: "01",
      name: "新客获客",
      brand: "北境咖啡",
      risk: "事实槽位",
      channel: "流光信息流",
      probeId: "acq-07",
      maxChars: 120,
      objective: "为冷萃·雪线拉新客首单，目标 CPA ≤ ¥48。代表探针只看一条主文案。",
      audience: "一二线 25–34 岁夜班 / 晚归职场人。",
      kpis: ["首单 CPA ≤ ¥48", "必填槽位写全", "正文 ≤ 120 字"],
      constraints: [
        "产地、工艺、风味、价格必须来自 active 文档",
        "禁止减肥、治疗、绝对化「最」",
        "禁止过期权益和虚构优惠券",
        "字数服务于槽位：先写全事实，再谈短"
      ],
      assetTitle: "任务简报（模型可见）",
      asset: "写一条流光信息流新客文案。产品：北境咖啡 · 冷萃雪线。人群：夜班或晚归的职场人。必须出现可核对的产地、工艺、风味和唯一允许的优惠。结尾要有行动号召。不要使用已结束的活动。",
      verdict: "本探针只有多步检索可以自动投放：槽位对齐，且拒绝了已过期的夜航冰杯。工具增强把过期赠品写进了正文。基线虚构产地并触发绝对化，直接否决。",
      agents: {
        baseline: {
          latencyMs: 840,
          promptTokens: 420,
          completionTokens: 168,
          costCny: 0.01,
          citationCoverage: 0,
          groundedness: 0,
          policy: "veto",
          hallucinations: [
            { slot: "产地", detail: "写成埃塞俄比亚耶加雪菲，品牌库是云南保山" },
            { slot: "品种", detail: "写成巴拿马瑰夏，库里没有该品种" },
            { slot: "绝对化", detail: "「全网最好喝」没有证据档" },
            { slot: "功效", detail: "咖啡文案写了瘦身" },
            { slot: "优惠", detail: "「神秘大额券」不在允许清单" }
          ],
          findings: [
            { level: "veto", rule: "绝对化", detail: "全网最好喝" },
            { level: "veto", rule: "功效越界", detail: "瘦身承诺" },
            { level: "major", rule: "事实冲突", detail: "产地与品种均不在品牌库" }
          ],
          slots: [
            { name: "产地", state: "wrong" },
            { name: "工艺风味", state: "wrong" },
            { name: "优惠金额", state: "wrong" },
            { name: "权益有效", state: "wrong" },
            { name: "受众", state: "bad" }
          ],
          steps: ["读取简报", "单轮生成，无工具", "不经校验直接输出"],
          copy: "[[hallu:coffee.origin|埃塞俄比亚耶加雪菲]]风味，[[hallu:coffee.origin|巴拿马瑰夏]]级柑橘香。熬夜党看过来，这是[[hallu:绝对化用语，没有证据档|全网最好喝]]的冷萃，喝完[[hallu:食品不得宣传瘦身|瘦身又提神]]。马上下单领[[hallu:coffee.promo|神秘大额券]]。"
        },
        tool: {
          latencyMs: 1680,
          promptTokens: 1040,
          completionTokens: 132,
          costCny: 0.028,
          citationCoverage: 0.83,
          groundedness: 0.8,
          policy: "major",
          hallucinations: [
            { slot: "优惠", detail: "夜航冰杯 status=expired，仍被写进正文" }
          ],
          findings: [
            { level: "major", rule: "过期权益", detail: "赠品活动已结束，属于误导性优惠" }
          ],
          slots: [
            { name: "产地", state: "ok" },
            { name: "工艺风味", state: "ok" },
            { name: "优惠金额", state: "ok" },
            { name: "权益有效", state: "wrong" },
            { name: "受众", state: "ok" }
          ],
          steps: [
            "brand_kb.search(\"冷萃雪线 新客\")",
            "命中 origin / process / promo / ice",
            "policy.check 只扫了绝对化词，没有看文档 status",
            "把冰杯和现行优惠写在同一句"
          ],
          copy: "晚归后来一瓶[[cite:coffee.sku|冷萃·雪线]]。[[cite:coffee.origin|云南保山日晒]]，[[cite:coffee.origin|海拔 1400–1800 米]]，[[cite:coffee.process|12 小时冷萃]]，[[cite:coffee.process|柑橘与可可]]。新客[[cite:coffee.promo|¥19.9]]。今日仍赠[[hallu:coffee.ice|夜航冰杯]]。"
        },
        multistep: {
          latencyMs: 2460,
          promptTokens: 1620,
          completionTokens: 148,
          costCny: 0.044,
          citationCoverage: 1,
          groundedness: 1,
          policy: "pass",
          hallucinations: [],
          findings: [],
          slots: [
            { name: "产地", state: "ok" },
            { name: "工艺风味", state: "ok" },
            { name: "优惠金额", state: "ok" },
            { name: "权益有效", state: "ok" },
            { name: "受众", state: "ok" }
          ],
          steps: [
            "列出必填槽位：产地、工艺、风味、优惠、受众",
            "检索后丢弃 coffee.ice（expired）",
            "起草",
            "批评者检查绝对化、功效和过期权益",
            "压到 120 字以内后输出"
          ],
          copy: "夜班后的第一瓶。[[cite:coffee.sku|冷萃·雪线]]：[[cite:coffee.origin|云南保山日晒]]，[[cite:coffee.origin|海拔 1400–1800 米]]，[[cite:coffee.process|12 小时冷萃]]，[[cite:coffee.process|柑橘开头、可可收尾]]。新客尝鲜[[cite:coffee.promo|¥19.9／3 日装]]。先尝三天。"
        }
      }
    },
    {
      id: "screening",
      index: "02",
      name: "素材爆款筛选",
      brand: "星轨耳机",
      risk: "会花预算",
      channel: "栖息社区 · 素材池",
      probeId: "scr-03",
      maxChars: null,
      objective: "五条在投素材做去留。错误放量会直接消耗媒体预算，所以放行门槛按生成类同样严格。",
      audience: "通勤场景的城市用户。历史 CTR 只是参考，不是排序目标。",
      kpis: ["与金标动作一致", "医疗和贬损必须下线", "价格必须用已审批档"],
      constraints: [
        "CTR 高不能挽救 veto 级素材",
        "降噪必须带测试条件，不能写成 40dB",
        "¥899 是草稿价，不能放行",
        "金标只在评测台可见，不进模型上下文"
      ],
      assetTitle: "候选素材（模型可见）",
      asset: "请给每条素材一个动作：放量、改写、暂缓或下线，并说明理由。不要只按 CTR 排序。",
      creatives: [
        { id: "A", title: "地铁里，世界的音量键在你这边", detail: "通勤场景，没有参数、医疗和价格", ctr: "1.8%" },
        { id: "B", title: "医生推荐的听力保护", detail: "口播提到保护听力、预防耳鸣", ctr: "2.4%" },
        { id: "C", title: "比邻座那个牌子更安静", detail: "影射贬低竞品", ctr: "2.1%" },
        { id: "D", title: "40dB 降噪，实验室曲线为证", detail: "把峰值简化成 40dB，没有条件", ctr: "1.6%" },
        { id: "E", title: "星轨黄限时 ¥899", detail: "价格来自未审批草稿", ctr: "1.1%" }
      ],
      gold: { A: "ship", B: "kill", C: "kill", D: "rewrite", E: "hold" },
      verdict: "多步检索和金标一致。工具增强下线了医疗和贬损，但放行了草稿价，并把口径过满的 D 直接放量。基线按 CTR 把「医生推荐」排到第一，否决。",
      agents: {
        baseline: {
          latencyMs: 690,
          promptTokens: 560,
          completionTokens: 240,
          costCny: 0.011,
          citationCoverage: 0,
          groundedness: 0,
          policy: "veto",
          hallucinations: [
            { slot: "医疗", detail: "给 B 补了库里不存在的「临床认证」" },
            { slot: "排序", detail: "用 CTR 覆盖了禁区规则" }
          ],
          findings: [
            { level: "veto", rule: "医疗素材放行", detail: "B 被建议加码" },
            { level: "major", rule: "竞品贬损放行", detail: "C 被建议放量" }
          ],
          slots: [
            { name: "医疗素材", state: "bad" },
            { name: "贬损素材", state: "bad" },
            { name: "降噪口径", state: "miss" },
            { name: "价格", state: "miss" },
            { name: "主素材", state: "wrong" }
          ],
          steps: ["读取五条素材和 CTR", "按 CTR 从高到低排", "不调用政策工具"],
          slate: [
            { id: "B", action: "ship", reason: "CTR 最高，临床认证方向可以加码。" },
            { id: "C", action: "ship", reason: "对比句好懂，适合放量。" },
            { id: "A", action: "rewrite", reason: "没有数字，钩子偏软。" },
            { id: "D", action: "ship", reason: "有参数，能建立信任。" },
            { id: "E", action: "hold", reason: "CTR 低，先不烧预算。" }
          ]
        },
        tool: {
          latencyMs: 1510,
          promptTokens: 1180,
          completionTokens: 280,
          costCny: 0.03,
          citationCoverage: 0.7,
          groundedness: 0.6,
          policy: "major",
          hallucinations: [
            { slot: "价格", detail: "把 draft 状态的 ¥899 当成可执行低价" }
          ],
          findings: [
            { level: "major", rule: "未审批价格", detail: "E 被放行" },
            { level: "warn", rule: "口径过满", detail: "D 未改写仍建议放量" }
          ],
          slots: [
            { name: "医疗素材", state: "ok" },
            { name: "贬损素材", state: "ok" },
            { name: "降噪口径", state: "wrong" },
            { name: "价格", state: "wrong" },
            { name: "主素材", state: "ok" }
          ],
          steps: [
            "policy.check 标出 B、C",
            "brand_kb.search 读到价格和降噪",
            "没有丢弃 status=draft 的 ¥899",
            "输出去留，不经第二轮批评"
          ],
          slate: [
            { id: "A", action: "ship", reason: "场景干净，可作主素材。" },
            { id: "D", action: "ship", reason: "实验室曲线足够支撑 40dB 的说法。" },
            { id: "E", action: "ship", reason: "草稿里的 ¥899 可以拿来清库存。" },
            { id: "B", action: "kill", reason: "医生推荐和听力保护不能投。" },
            { id: "C", action: "kill", reason: "影射竞品，下线。" }
          ]
        },
        multistep: {
          latencyMs: 2380,
          promptTokens: 1760,
          completionTokens: 320,
          costCny: 0.046,
          citationCoverage: 1,
          groundedness: 1,
          policy: "pass",
          hallucinations: [],
          findings: [],
          slots: [
            { name: "医疗素材", state: "ok" },
            { name: "贬损素材", state: "ok" },
            { name: "降噪口径", state: "ok" },
            { name: "价格", state: "ok" },
            { name: "主素材", state: "ok" }
          ],
          steps: [
            "先标禁区，再谈效率",
            "只采用 status=active 的价格和降噪口径",
            "对照金标不可见的动作空间做自检",
            "批评者否决「40dB」和「¥899」",
            "输出最终去留"
          ],
          slate: [
            { id: "A", action: "ship", reason: "无禁区，通勤场景直接放量。", cite: "audio.policy" },
            { id: "D", action: "rewrite", reason: "改成峰值 42dB@1kHz，通勤约 38dB。", cite: "audio.anc" },
            { id: "E", action: "hold", reason: "¥899 是草稿。活动价是 ¥1,099。", cite: "audio.price" },
            { id: "B", action: "kill", reason: "医疗表述，下线。", cite: "audio.policy" },
            { id: "C", action: "kill", reason: "影射贬低竞品，下线。", cite: "audio.policy" }
          ]
        }
      }
    },
    {
      id: "compliance",
      index: "03",
      name: "合规改写",
      brand: "青禾护肤",
      risk: "一票否决",
      channel: "品牌详情页首屏",
      probeId: "cmp-11",
      maxChars: 140,
      objective: "把一条越界功效文案改成妆字号可以自动投放的版本。功效边界错了就否决，不进入文采讨论。",
      audience: "关注肤色外观和保湿的日常护肤用户。",
      kpis: ["成分浓度正确", "无医疗暗示", "声明品类"],
      constraints: [
        "烟酰胺只写 5%",
        "功效停在提亮肤色外观和保湿",
        "禁止医院、医用、天数承诺",
        "必须说明是化妆品"
      ],
      assetTitle: "待改写原文（模型可见）",
      asset: "青禾美白精华，7 天淡斑看得见，医用级烟酰胺 10%，100% 有效，敏感肌也能当天见效。三甲医院皮肤科背景团队研发，用完斑点消失。",
      verdict: "多步检索把功效收进妆字号边界，并写明不是药品。工具增强改对了浓度，但留下「皮肤科」暗示，阻断自动投放。基线保留医用和 7 天淡斑，否决。",
      agents: {
        baseline: {
          latencyMs: 760,
          promptTokens: 480,
          completionTokens: 96,
          costCny: 0.009,
          citationCoverage: 0,
          groundedness: 0,
          policy: "veto",
          hallucinations: [
            { slot: "品类", detail: "写成医用护肤" },
            { slot: "功效", detail: "保留 7 天淡斑" },
            { slot: "成分", detail: "烟酰胺仍是 10%" }
          ],
          findings: [
            { level: "veto", rule: "医疗功效", detail: "医用 + 天数淡斑" },
            { level: "major", rule: "成分错误", detail: "10% 与品牌库 5% 冲突" }
          ],
          slots: [
            { name: "产品名", state: "miss" },
            { name: "成分", state: "wrong" },
            { name: "功效边界", state: "bad" },
            { name: "品类", state: "wrong" },
            { name: "机构背书", state: "bad" }
          ],
          steps: ["轻度改写，试图保留转化力度", "不查成分和品类文档"],
          copy: "升级版[[hallu:暗示医疗器械|医用护肤]]：[[hallu:天数疗效|7 天淡斑]]，敏感肌也能感到变化。[[hallu:浓度应为 5%|烟酰胺 10%]]，效果看得见。"
        },
        tool: {
          latencyMs: 1620,
          promptTokens: 1090,
          completionTokens: 150,
          costCny: 0.029,
          citationCoverage: 0.75,
          groundedness: 0.6,
          policy: "major",
          hallucinations: [
            { slot: "机构背书", detail: "「皮肤科常见思路」仍在借用医疗权威" }
          ],
          findings: [
            { level: "major", rule: "医疗暗示", detail: "皮肤科表述在禁止名单" }
          ],
          slots: [
            { name: "产品名", state: "ok" },
            { name: "成分", state: "ok" },
            { name: "功效边界", state: "ok" },
            { name: "品类", state: "miss" },
            { name: "机构背书", state: "bad" }
          ],
          steps: [
            "检索成分、功效边界、产品名",
            "替换浓度和功效动词",
            "政策工具未覆盖「皮肤科」这一暗示句式",
            "输出"
          ],
          copy: "[[cite:skin.name|青禾澄光精华]]，含[[cite:skin.ingredient|5% 烟酰胺]]与神经酰胺，帮助[[cite:skin.claims|提亮肤色外观]]并保湿。配方参考[[hallu:禁止借用医疗机构表述|皮肤科常见护理思路]]，建议先局部试用。"
        },
        multistep: {
          latencyMs: 2740,
          promptTokens: 1840,
          completionTokens: 168,
          costCny: 0.048,
          citationCoverage: 1,
          groundedness: 1,
          policy: "pass",
          hallucinations: [],
          findings: [],
          slots: [
            { name: "产品名", state: "ok" },
            { name: "成分", state: "ok" },
            { name: "功效边界", state: "ok" },
            { name: "品类", state: "ok" },
            { name: "机构背书", state: "ok" }
          ],
          steps: [
            "对照原文标出每一处越界",
            "只引用 active 的成分、功效和品类",
            "起草时主动写上妆字号",
            "批评者删除所有医院和天数承诺",
            "输出"
          ],
          copy: "[[cite:skin.name|青禾澄光精华]]：[[cite:skin.ingredient|5% 烟酰胺]]搭配神经酰胺，日常[[cite:skin.claims|提亮肤色外观]]、保湿。本品是[[cite:skin.category|化妆品（妆字号）]]，不是药品或医疗器械，效果因人而异。初次使用建议局部试用。"
        }
      }
    },
    {
      id: "i18n",
      index: "04",
      name: "多语言落地页",
      brand: "北境咖啡",
      risk: "术语与货币",
      channel: "独立落地页 · EN / JA",
      probeId: "i18n-05",
      maxChars: 320,
      objective: "把中文首屏扩成英文和日文。术语、货币和 CTA 必须跟词表一致，禁止编评价。",
      audience: "会读英文或日文、人在中国大陆下单的新客。结算货币仍是人民币。",
      kpis: ["术语命中词表", "不换算一口价", "CTA 不是订阅"],
      constraints: [
        "Snowline Cold Brew / スノーライン・コールドブリュー",
        "日晒译成 natural process / ナチュラル",
        "价格保持 ¥19.9 RMB，并说明结算货币",
        "没有评价数据就不要写社会证明"
      ],
      assetTitle: "中文源（模型可见）",
      asset: "北境咖啡 · 冷萃雪线\n云南保山日晒，12 小时冷萃。柑橘开头，可可收尾。\n新客尝鲜装 ¥19.9 / 3 日。先尝三天。",
      verdict: "多步检索中英日共用词表，价格留在人民币，CTA 是尝鲜装。工具增强把行动写成订阅。基线发明了美元价和 10,000+ 评价，否决。",
      agents: {
        baseline: {
          latencyMs: 1080,
          promptTokens: 640,
          completionTokens: 250,
          costCny: 0.015,
          citationCoverage: 0,
          groundedness: 0,
          policy: "veto",
          hallucinations: [
            { slot: "社会证明", detail: "编造 10,000+ 五星评价" },
            { slot: "货币", detail: "换成 $2.99 和 299 円" },
            { slot: "产地", detail: "英文写成 Ethiopia" }
          ],
          findings: [
            { level: "veto", rule: "虚构社会证明", detail: "评价数量不存在" },
            { level: "major", rule: "擅自换汇", detail: "美元与日元一口价" }
          ],
          slots: [
            { name: "术语", state: "wrong" },
            { name: "货币", state: "wrong" },
            { name: "CTA", state: "bad" },
            { name: "社会证明", state: "bad" },
            { name: "风味", state: "miss" }
          ],
          steps: ["自由翻译", "补上常见电商话术", "不查词表"],
          locales: {
            EN: "[[hallu:术语表规定 Snowline Cold Brew|Snow Cold Extract]] from [[hallu:产地是云南保山|Ethiopia]]. The best cold brew you can buy. Now [[hallu:禁止换算一口价|only $2.99]]. [[hallu:品牌库没有评价数据|10,000+ five-star reviews]]. Subscribe today.",
            JA: "エチオピア産、最高の水出し。[[hallu:禁止换算一口价|今だけ 299 円]]。[[hallu:虚构评价|レビュー 1 万件]]。定期購入はこちら。"
          }
        },
        tool: {
          latencyMs: 2040,
          promptTokens: 1420,
          completionTokens: 290,
          costCny: 0.037,
          citationCoverage: 0.72,
          groundedness: 0.6,
          policy: "major",
          hallucinations: [
            { slot: "CTA", detail: "英文 Subscribe、日文 定期購入，任务是一次性尝鲜" }
          ],
          findings: [
            { level: "major", rule: "优惠形态错误", detail: "订阅不等于 3 日装" },
            { level: "warn", rule: "术语偏离", detail: "日文把日晒写成天日干し，词表是ナチュラル" }
          ],
          slots: [
            { name: "英文术语", state: "ok" },
            { name: "日文术语", state: "wrong" },
            { name: "货币", state: "ok" },
            { name: "CTA", state: "bad" },
            { name: "社会证明", state: "ok" }
          ],
          steps: [
            "读取术语表和价格",
            "英文产品名正确",
            "CTA 沿用了落地页模板里的 Subscribe",
            "未做第二语言对照"
          ],
          locales: {
            EN: "[[cite:i18n.glossary|Snowline Cold Brew]]. [[cite:i18n.glossary|Yunnan Baoshan]], natural process, 12-hour steep. First order [[cite:i18n.price|¥19.9 RMB]] for three days. [[hallu:词表要求 Try the 3-day pack|Subscribe]] and taste the night.",
            JA: "[[cite:i18n.glossary|スノーライン・コールドブリュー]]。雲南保山、[[warn:词表术语是ナチュラル|天日干し]]、12 時間。初めての方は[[cite:i18n.price|¥19.9 人民元]]。[[hallu:词表要求 3日分を試す|定期購入]]でもっとお得。"
          }
        },
        multistep: {
          latencyMs: 3320,
          promptTokens: 2180,
          completionTokens: 360,
          costCny: 0.056,
          citationCoverage: 1,
          groundedness: 1,
          policy: "pass",
          hallucinations: [],
          findings: [],
          slots: [
            { name: "术语", state: "ok" },
            { name: "货币", state: "ok" },
            { name: "CTA", state: "ok" },
            { name: "社会证明", state: "ok" },
            { name: "风味", state: "ok" }
          ],
          steps: [
            "锁定术语、货币、CTA、社会证明四条禁改",
            "英文先写，日文对照词表而不是对照英文",
            "批评者删除一切评价和奖项",
            "确认没有出现 Subscribe / 定期購入",
            "输出双语"
          ],
          locales: {
            EN: "[[cite:i18n.glossary|Snowline Cold Brew]] from [[cite:i18n.glossary|Yunnan Baoshan]], natural process, steeped 12 hours. [[cite:coffee.process|Citrus first, cocoa last]]. New guests: [[cite:i18n.price|¥19.9 RMB for a 3-day pack]], settled in RMB. [[cite:i18n.cta|Try the 3-day pack]].",
            JA: "[[cite:i18n.glossary|スノーライン・コールドブリュー]]。産地は[[cite:i18n.glossary|雲南保山]]、精製は[[cite:i18n.glossary|ナチュラル]]、抽出 12 時間。[[cite:coffee.process|柑橘ではじまり、カカオでおわる]]。新規の方は[[cite:i18n.price|¥19.9 人民元／3 日分]]（決済は人民元）。[[cite:i18n.cta|3日分を試す]]。"
          }
        }
      }
    }
  ],

  /* 预写的三角色盲测票。顺序参与 Elo，因为 Elo 与路径有关。
     这些票评的是「代表探针上的成稿偏好」，不是 48 条回归集。 */
  seedVotes: [
    { id: "sv01", briefId: "acquisition", left: "baseline", right: "multistep", winner: "right", judge: "投放优化师", reason: "夜班场景和 3 日装价格都写清了" },
    { id: "sv02", briefId: "acquisition", left: "tool", right: "multistep", winner: "right", judge: "品牌审核", reason: "工具增强写了已经结束的冰杯" },
    { id: "sv03", briefId: "acquisition", left: "baseline", right: "tool", winner: "right", judge: "合规官", reason: "产地回到了云南保山" },
    { id: "sv04", briefId: "acquisition", left: "baseline", right: "multistep", winner: "right", judge: "合规官", reason: "没有绝对化，也没有瘦身" },
    { id: "sv05", briefId: "acquisition", left: "tool", right: "multistep", winner: "left", judge: "投放优化师", reason: "前三秒更短，信息流里更容易停住" },
    { id: "sv06", briefId: "acquisition", left: "baseline", right: "tool", winner: "right", judge: "品牌审核", reason: "不像叫卖，产品名是对的" },
    { id: "sv07", briefId: "acquisition", left: "baseline", right: "multistep", winner: "right", judge: "品牌审核", reason: "语气像夜间，不是通用励志" },
    { id: "sv08", briefId: "acquisition", left: "tool", right: "multistep", winner: "right", judge: "合规官", reason: "过期赠品不能出现" },

    { id: "sv09", briefId: "screening", left: "baseline", right: "multistep", winner: "right", judge: "合规官", reason: "基线把医生推荐排到了放量" },
    { id: "sv10", briefId: "screening", left: "tool", right: "multistep", winner: "right", judge: "合规官", reason: "草稿价被拦住了" },
    { id: "sv11", briefId: "screening", left: "baseline", right: "tool", winner: "right", judge: "合规官", reason: "至少把 B 和 C 下线了" },
    { id: "sv12", briefId: "screening", left: "baseline", right: "multistep", winner: "right", judge: "投放优化师", reason: "主素材选了干净的地铁场景" },
    { id: "sv13", briefId: "screening", left: "tool", right: "multistep", winner: "right", judge: "品牌审核", reason: "降噪没有说满" },
    { id: "sv14", briefId: "screening", left: "baseline", right: "tool", winner: "right", judge: "投放优化师", reason: "不再只看 CTR" },
    { id: "sv15", briefId: "screening", left: "tool", right: "multistep", winner: "left", judge: "投放优化师", reason: "希望带参数的 D 先跑起来，不想等改写" },
    { id: "sv16", briefId: "screening", left: "baseline", right: "multistep", winner: "right", judge: "品牌审核", reason: "没有虚构临床认证" },

    { id: "sv17", briefId: "compliance", left: "baseline", right: "multistep", winner: "right", judge: "合规官", reason: "去掉了 7 天淡斑和医用" },
    { id: "sv18", briefId: "compliance", left: "tool", right: "multistep", winner: "right", judge: "合规官", reason: "去掉了皮肤科暗示" },
    { id: "sv19", briefId: "compliance", left: "baseline", right: "tool", winner: "right", judge: "合规官", reason: "烟酰胺改回 5%" },
    { id: "sv20", briefId: "compliance", left: "baseline", right: "multistep", winner: "right", judge: "品牌审核", reason: "产品名是澄光精华" },
    { id: "sv21", briefId: "compliance", left: "tool", right: "multistep", winner: "right", judge: "品牌审核", reason: "声明完整，读起来仍然像人话" },
    { id: "sv22", briefId: "compliance", left: "baseline", right: "tool", winner: "right", judge: "投放优化师", reason: "至少不再承诺当天见效" },
    { id: "sv23", briefId: "compliance", left: "tool", right: "multistep", winner: "left", judge: "投放优化师", reason: "多步的免责声明偏长，怕像说明书" },
    { id: "sv24", briefId: "compliance", left: "baseline", right: "multistep", winner: "right", judge: "合规官", reason: "写明了妆字号，而且不是药品" },

    { id: "sv25", briefId: "i18n", left: "baseline", right: "multistep", winner: "right", judge: "合规官", reason: "基线编了 10,000+ 评价" },
    { id: "sv26", briefId: "i18n", left: "tool", right: "multistep", winner: "right", judge: "合规官", reason: "CTA 必须是尝鲜装，不能是订阅" },
    { id: "sv27", briefId: "i18n", left: "baseline", right: "tool", winner: "right", judge: "品牌审核", reason: "英文没有发明美元价" },
    { id: "sv28", briefId: "i18n", left: "baseline", right: "multistep", winner: "right", judge: "品牌审核", reason: "术语和词表一致" },
    { id: "sv29", briefId: "i18n", left: "tool", right: "multistep", winner: "right", judge: "投放优化师", reason: "日文没有把优惠说成定期购" },
    { id: "sv30", briefId: "i18n", left: "baseline", right: "multistep", winner: "right", judge: "合规官", reason: "没有编造社会证明" },
    { id: "sv31", briefId: "i18n", left: "tool", right: "multistep", winner: "left", judge: "品牌审核", reason: "英文节奏更像独立咖啡，尽管按钮得改" },
    { id: "sv32", briefId: "i18n", left: "baseline", right: "tool", winner: "right", judge: "合规官", reason: "至少没有假评论" }
  ],

  /* 48 条回归集：每条 brief 12 条探针。数字按子集存放，总体在界面里取平均。
     成本按「调用成本 / 可投放率」计算，避免基线看起来更便宜。 */
  timeline: {
    n: 48,
    perBrief: 12,
    callCost: [0.0096, 0.026, 0.044],
    latencyP50: [780, 1520, 2340],
    latencyP95: [1100, 2400, 4100],
    winVsPrev: [null, 0.67, 0.71],
    winN: 36,
    days: [
      {
        id: "d0",
        label: "D0",
        title: "只上单轮基线",
        architecture: "Baseline",
        summary: "没有品牌库。回归集可投放率约 8%，事实幻觉 27%，已经越过 5% 的否决线。合规探针几乎不能自动通过。",
        decision: "不放量。基线留在回归集里当对照臂，不接流量。"
      },
      {
        id: "d1",
        label: "D1",
        title: "接上检索和政策工具",
        architecture: "Tool-augmented",
        summary: "可投放率升到约 54%。单次调用更贵，但废片变少，单条可投放成本反而下降。失败模式很具体：检索没有丢掉 expired 和 draft。",
        decision: "不自动投放。素材筛选也不灰度，因为会花预算的任务同样要求政策通过率 ≥ 95%，这一天没有子集达到。"
      },
      {
        id: "d2",
        label: "D2",
        title: "多步检索，强制引用",
        architecture: "Multi-step + retrieval",
        summary: "规划槽位、只取 active 文档、批评后再输出。总体幻觉降到 3%，p95 延迟 4.1 秒。多语言子集仍短一截：政策通过 94%，幻觉 6%。",
        decision: "不换架构。过线的任务按字典序上线；多语言补术语表，首周改为人审后投放。延迟若失守，只允许筛选任务有条件降级。"
      }
    ],
    /* 顺序与 briefs 一致。每个数组是 [D0, D1, D2]。 */
    byBrief: {
      acquisition: {
        groundedness: [0.4, 0.78, 0.95],
        policy: [0.58, 0.86, 0.97],
        hallucination: [0.25, 0.08, 0.02],
        citation: [0.04, 0.74, 0.96],
        shippable: [0.08, 0.58, 0.92]
      },
      screening: {
        groundedness: [0.48, 0.8, 0.94],
        policy: [0.75, 0.92, 0.98],
        hallucination: [0.22, 0.08, 0.02],
        citation: [0.08, 0.7, 0.95],
        shippable: [0.17, 0.67, 0.92]
      },
      compliance: {
        groundedness: [0.36, 0.72, 0.96],
        policy: [0.5, 0.75, 0.96],
        hallucination: [0.33, 0.1, 0.02],
        citation: [0.05, 0.68, 0.97],
        shippable: [0, 0.42, 0.92]
      },
      i18n: {
        groundedness: [0.52, 0.74, 0.87],
        policy: [0.5, 0.83, 0.94],
        hallucination: [0.28, 0.1, 0.06],
        citation: [0.07, 0.72, 0.88],
        shippable: [0.08, 0.5, 0.75]
      }
    }
  },

  killLine: {
    hallucination: 0.05,
    policy: 0.95,
    latencyP95: 8000,
    costPerShippable: 0.08
  },

  shipping: [
    {
      briefId: "acquisition",
      architecture: "多步检索",
      mode: "自动投放，10% 抽检",
      why: "子集政策、幻觉、可投放率都过线。"
    },
    {
      briefId: "screening",
      architecture: "多步检索",
      mode: "自动标注，放量首周人确认",
      why: "判断会直接花预算。工具增强在代表探针上放行过草稿价。"
    },
    {
      briefId: "compliance",
      architecture: "多步检索",
      mode: "自动投放，20% 抽检",
      why: "政策通过率刚过 95%，抽检加厚。"
    },
    {
      briefId: "i18n",
      architecture: "多步检索",
      mode: "人审后投放",
      why: "政策 94%、幻觉 6%，两条都还压在否决线上。补词表，不换架构。"
    }
  ]
};
