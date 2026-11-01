/* 广告 Agent 评测台 · 交互层
   不发起网络请求。评测结果来自 data.js 的确定性样本。 */
(function () {
  "use strict";

  const DATA = window.AEL_DATA;
  const STORAGE_KEY = "ael-user-votes-v1";
  const BRIEF_KEY = "ael-brief-v1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const POLICY = {
    pass: { label: "通过", note: "可自动投放" },
    warn: { label: "抽检", note: "可投放，进入抽检" },
    major: { label: "阻断", note: "不可自动投放" },
    veto: { label: "否决", note: "本条杀死" }
  };

  const ACTION = {
    ship: "放量",
    rewrite: "改写",
    hold: "暂缓",
    kill: "下线"
  };

  const SLOT = {
    ok: "对齐",
    miss: "缺失",
    wrong: "冲突",
    bad: "触禁"
  };

  const JUDGES = ["投放优化师", "品牌审核", "合规官"];
  const REASONS = ["钩子更清楚", "事实更稳", "合规更干净", "更像这个品牌", "优惠没有变形"];

  const state = {
    briefId: "acquisition",
    visible: { baseline: true, tool: true, multistep: true },
    locale: "EN",
    day: "d2",
    judge: "投放优化师",
    reason: "事实更稳",
    blind: true,
    votes: [],
    running: false,
    timers: [],
    confirmReset: false
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function briefById(id) {
    return DATA.briefs.find((b) => b.id === id);
  }

  function agentById(id) {
    return DATA.agents.find((a) => a.id === id);
  }

  function visibleAgents() {
    return DATA.agents.filter((a) => state.visible[a.id]);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function stripMarkup(text) {
    return String(text || "").replace(/\[\[(?:cite|hallu|warn):[^|\]]+\|([\s\S]*?)\]\]/g, "$1");
  }

  function richHtml(text) {
    const source = String(text || "");
    const re = /\[\[(cite|hallu|warn):([^|\]]+)\|([\s\S]*?)\]\]/g;
    let html = "";
    let last = 0;
    let match;
    while ((match = re.exec(source))) {
      html += escapeHtml(source.slice(last, match.index));
      const kind = match[1];
      const ref = match[2];
      const visible = match[3];
      if (kind === "cite") {
        html += `<button type="button" class="cite" data-cite="${escapeHtml(ref)}">${escapeHtml(visible)}</button>`;
      } else if (kind === "hallu") {
        if (DATA.kb[ref]) {
          html += `<button type="button" class="hallu" data-cite="${escapeHtml(ref)}">${escapeHtml(visible)}</button>`;
        } else {
          html += `<span class="hallu" title="${escapeHtml(ref)}">${escapeHtml(visible)}</span>`;
        }
      } else if (DATA.kb[ref]) {
        html += `<button type="button" class="warn-span" data-cite="${escapeHtml(ref)}">${escapeHtml(visible)}</button>`;
      } else {
        html += `<span class="warn-span" title="${escapeHtml(ref)}">${escapeHtml(visible)}</span>`;
      }
      last = match.index + match[0].length;
    }
    html += escapeHtml(source.slice(last));
    return html.replace(/\n/g, "<br>");
  }

  function plainOutput(brief, result) {
    if (result.copy) return stripMarkup(result.copy);
    if (result.locales) {
      return ["EN", "JA"].map((lang) => lang + "\n" + stripMarkup(result.locales[lang])).join("\n\n");
    }
    if (result.slate) {
      return result.slate.map((row) => `${row.id} ${ACTION[row.action] || row.action} ${row.reason}`).join("\n");
    }
    return "";
  }

  function formatPct(value) {
    return `${Math.round(value * 1000) / 10}%`;
  }

  function formatCny(value) {
    return `¥${value.toFixed(value < 0.1 ? 3 : 2)}`;
  }

  function formatMs(value) {
    return `${Math.round(value)} ms`;
  }

  function hashId(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return `ael_${(h >>> 0).toString(16).padStart(8, "0")}`;
  }

  function runIdFor(briefId) {
    return hashId(`ael-v1|${briefId}`);
  }

  function loadVotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      state.votes = Array.isArray(parsed) ? parsed.filter((v) => v && v.briefId && v.left && v.right) : [];
    } catch (err) {
      state.votes = [];
    }
  }

  function saveVotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.votes));
  }

  function votesForBrief(briefId, includeUser) {
    const seed = DATA.seedVotes.filter((v) => v.briefId === briefId).map((v) => Object.assign({ source: "seed" }, v));
    if (!includeUser) return seed;
    const mine = state.votes
      .filter((v) => v.briefId === briefId)
      .map((v) => Object.assign({ source: "human" }, v));
    return seed.concat(mine);
  }

  function expectedScore(mine, other) {
    return 1 / (1 + 10 ** ((other - mine) / 400));
  }

  function computeElo(votes) {
    const ratings = { baseline: 1500, tool: 1500, multistep: 1500 };
    const stats = {
      baseline: { w: 0, l: 0, t: 0 },
      tool: { w: 0, l: 0, t: 0 },
      multistep: { w: 0, l: 0, t: 0 }
    };
    votes.forEach((vote) => {
      const left = ratings[vote.left];
      const right = ratings[vote.right];
      const eLeft = expectedScore(left, right);
      const eRight = 1 - eLeft;
      let sLeft = 0;
      let sRight = 0;
      if (vote.winner === "tie") {
        sLeft = 0.5;
        sRight = 0.5;
        stats[vote.left].t += 1;
        stats[vote.right].t += 1;
      } else if (vote.winner === "left") {
        sLeft = 1;
        stats[vote.left].w += 1;
        stats[vote.right].l += 1;
      } else {
        sRight = 1;
        stats[vote.right].w += 1;
        stats[vote.left].l += 1;
      }
      ratings[vote.left] = left + 24 * (sLeft - eLeft);
      ratings[vote.right] = right + 24 * (sRight - eRight);
    });
    return { ratings, stats };
  }

  function winRate(stat) {
    const decisive = stat.w + stat.l;
    if (!decisive) return null;
    return stat.w / decisive;
  }

  function headToHead(votes, agentId, otherId) {
    const tally = { w: 0, l: 0, t: 0 };
    votes.forEach((vote) => {
      const pair = [vote.left, vote.right];
      if (!pair.includes(agentId) || !pair.includes(otherId)) return;
      if (vote.winner === "tie") {
        tally.t += 1;
        return;
      }
      const winnerId = vote.winner === "left" ? vote.left : vote.right;
      if (winnerId === agentId) tally.w += 1;
      else tally.l += 1;
    });
    return tally;
  }

  function headToHeadLine(votes, agentId, otherId) {
    const tally = headToHead(votes, agentId, otherId);
    const label = `${agentById(agentId).nameZh} vs ${agentById(otherId).nameZh}`;
    return `${label} ${tally.w}-${tally.l}${tally.t ? `-${tally.t}` : ""}`;
  }

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => el.classList.remove("show"), 2400);
  }

  function charCount(text) {
    return Array.from(stripMarkup(text).replace(/\s+/g, "")).length;
  }

  function renderBriefs() {
    const root = $("#brief-list");
    root.innerHTML = DATA.briefs.map((brief) => `
      <button class="brief-btn" type="button" role="radio" data-brief="${brief.id}" aria-checked="${brief.id === state.briefId}">
        <div class="top">
          <span class="idx-no">${brief.index}</span>
          <span class="risk">${escapeHtml(brief.risk)}</span>
        </div>
        <div class="name">${escapeHtml(brief.name)}</div>
        <div class="meta">${escapeHtml(brief.brand)} · ${escapeHtml(brief.channel)}</div>
      </button>
    `).join("");
  }

  function renderBriefDetail() {
    const brief = briefById(state.briefId);
    const creatives = brief.creatives ? `
      <div class="scroll-x" style="margin-top:12px">
        <table class="creative-table">
          <thead><tr><th>素材</th><th>内容</th><th>说明</th><th>历史 CTR</th><th>金标</th></tr></thead>
          <tbody>
            ${brief.creatives.map((row) => `
              <tr>
                <td>${row.id}</td>
                <td>${escapeHtml(row.title)}</td>
                <td>${escapeHtml(row.detail)}</td>
                <td>${escapeHtml(row.ctr)}</td>
                <td>${ACTION[brief.gold[row.id]]}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <p class="fine">金标只给评测台对照，不会出现在模型输入里。历史 CTR 是干扰项：高不代表能投。</p>
    ` : "";

    $("#brief-detail").innerHTML = `
      <div class="spec-head">
        <div>
          <p class="eyebrow">${escapeHtml(brief.probeId)} · ${escapeHtml(brief.brand)}</p>
          <h3>${escapeHtml(brief.name)}</h3>
        </div>
        <span class="pill">${escapeHtml(brief.channel)}</span>
      </div>
      <dl class="kv">
        <dt>目标</dt><dd>${escapeHtml(brief.objective)}</dd>
        <dt>受众</dt><dd>${escapeHtml(brief.audience)}</dd>
        <dt>验收</dt><dd>${brief.kpis.map(escapeHtml).join(" · ")}</dd>
        <dt>约束</dt><dd>${brief.constraints.map(escapeHtml).join("；")}</dd>
      </dl>
      <div class="asset">
        <div class="label">${escapeHtml(brief.assetTitle)}</div>
        ${escapeHtml(brief.asset)}
      </div>
      ${creatives}
      <p class="callout calm">${escapeHtml(brief.verdict)}</p>
    `;
  }

  function renderChecks() {
    $("#agent-checks").innerHTML = DATA.agents.map((agent) => `
      <label class="check">
        <input type="checkbox" data-agent-toggle="${agent.id}" ${state.visible[agent.id] ? "checked" : ""}>
        <span><strong>${escapeHtml(agent.nameZh)}</strong> · ${escapeHtml(agent.name)}</span>
      </label>
    `).join("");
  }

  function slotHtml(slots) {
    return `<div class="slots">${slots.map((slot) => `
      <span class="slot ${slot.state}">${escapeHtml(slot.name)} · ${SLOT[slot.state]}</span>
    `).join("")}</div>`;
  }

  function outputHtml(brief, result) {
    if (result.copy) {
      const count = charCount(result.copy);
      const limit = brief.maxChars;
      const over = limit && count > limit;
      return `
        <div class="copy">${richHtml(result.copy)}</div>
        <p class="fine" style="color:${over ? "var(--bad)" : "var(--faint)"}">正文字数 ${count}${limit ? ` / ${limit}` : ""}（不计空白）</p>
      `;
    }
    if (result.locales) {
      const body = result.locales[state.locale] || "";
      return `
        <div class="locale-tabs" role="tablist" aria-label="语言">
          ${["EN", "JA"].map((lang) => `
            <button type="button" role="tab" data-locale="${lang}" aria-selected="${state.locale === lang}">${lang}</button>
          `).join("")}
        </div>
        <div class="copy">${richHtml(body)}</div>
      `;
    }
    return `<div class="slate">${result.slate.map((row) => {
      const gold = brief.gold[row.id];
      const mismatch = gold && gold !== row.action;
      const cite = row.cite ? `<button type="button" class="cite" data-cite="${escapeHtml(row.cite)}">引用</button>` : "";
      return `
        <div class="slate-row">
          <strong>${row.id}</strong>
          <span class="action ${row.action}">${ACTION[row.action]}</span>
          <div>
            ${escapeHtml(row.reason)} ${cite}
            ${mismatch ? `<div class="mismatch">与金标不一致 · 金标是${ACTION[gold]}</div>` : `<div class="fine">与金标一致</div>`}
          </div>
        </div>
      `;
    }).join("")}</div>`;
  }

  function findingHtml(result) {
    if (!result.hallucinations.length) {
      return `<ul class="flags"><li class="none">没有事实幻觉标记</li></ul>`;
    }
    return `<ul class="flags">${result.hallucinations.map((item) => `
      <li><strong>${escapeHtml(item.slot)}</strong> · ${escapeHtml(item.detail)}</li>
    `).join("")}</ul>`;
  }

  function renderCompare() {
    const brief = briefById(state.briefId);
    const agents = visibleAgents();
    const grid = $("#compare-grid");
    grid.style.setProperty("--cols", String(agents.length));
    grid.innerHTML = agents.map((agent) => {
      const result = brief.agents[agent.id];
      const policy = POLICY[result.policy];
      const tokens = result.promptTokens + result.completionTokens;
      return `
        <article class="agent-card card" data-agent="${agent.id}">
          <div class="agent-top">
            <div>
              <div class="en">${escapeHtml(agent.name)} · ${escapeHtml(agent.stepsLabel)}</div>
              <h3>${escapeHtml(agent.nameZh)}</h3>
            </div>
            <div class="stamp ${result.policy}" title="${escapeHtml(policy.note)}">${policy.label}</div>
          </div>
          <p class="fine">${escapeHtml(agent.summary)}</p>
          <div class="metrics">
            <div class="metric"><b>${formatMs(result.latencyMs)}</b><span>延迟</span></div>
            <div class="metric"><b>${tokens}</b><span>token · ${result.promptTokens}+${result.completionTokens}</span></div>
            <div class="metric"><b>${formatCny(result.costCny)}</b><span>演示成本</span></div>
            <div class="metric"><b>${formatPct(result.citationCoverage)}</b><span>引用覆盖</span></div>
            <div class="metric"><b>${formatPct(slotGroundedness(result))}</b><span>接地率</span></div>
            <div class="metric"><b>${result.hallucinations.length}</b><span>幻觉标记</span></div>
          </div>
          ${slotHtml(result.slots)}
          ${outputHtml(brief, result)}
          ${findingHtml(result)}
          <details class="trace">
            <summary>轨迹 · ${result.steps.length} 步</summary>
            <ol>${result.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
          </details>
          <button class="btn ghost" type="button" data-copy="${agent.id}">复制纯文本</button>
        </article>
      `;
    }).join("");
  }

  function renderScore() {
    const brief = briefById(state.briefId);
    const votes = votesForBrief(brief.id, true);
    const { ratings, stats } = computeElo(votes);
    const ranked = DATA.agents.slice().sort((a, b) => ratings[b.id] - ratings[a.id]);
    const leader = ranked[0];
    const leaderResult = brief.agents[leader.id];
    const policyBlocked = leaderResult.policy === "veto" || leaderResult.policy === "major";

    const rows = DATA.agents.map((agent) => {
      const result = brief.agents[agent.id];
      const stat = stats[agent.id];
      const rate = winRate(stat);
      const decisive = stat.w + stat.l;
      return `
        <tr>
          <td>${escapeHtml(agent.nameZh)}</td>
          <td>${POLICY[result.policy].label}</td>
          <td>${formatPct(slotGroundedness(result))}</td>
          <td>${formatPct(result.citationCoverage)}</td>
          <td>${result.hallucinations.length}</td>
          <td>${rate == null ? "—" : formatPct(rate)}</td>
          <td>${stat.w}-${stat.l}${stat.t ? `-${stat.t}` : ""}</td>
          <td>${ratings[agent.id].toFixed(0)}</td>
          <td class="fine">${decisive < 12 ? "样本小" : ""}</td>
        </tr>
      `;
    }).join("");

    const leaderRate = winRate(stats[leader.id]);
    $("#scorecard").innerHTML = `
      <p class="eyebrow">代表探针 ${escapeHtml(brief.probeId)} · run ${runIdFor(brief.id)}</p>
      <h3 style="margin:4px 0 10px">自动裁判先说话</h3>
      <div class="score-nums">
        <div class="score-num"><b>${escapeHtml(leader.nameZh)}</b><span>本任务 Elo 领先 · ${ratings[leader.id].toFixed(0)}</span></div>
        <div class="score-num"><b>${leaderRate == null ? "—" : formatPct(leaderRate)}</b><span>领先者胜率 · 有效票 ${stats[leader.id].w + stats[leader.id].l}</span></div>
        <div class="score-num"><b>${formatPct(slotGroundedness(brief.agents.multistep))}</b><span>多步检索接地率 · 本探针，等于对齐槽位占比</span></div>
        <div class="score-num"><b>${POLICY[brief.agents.multistep.policy].label}</b><span>多步检索政策 · ${POLICY[brief.agents.multistep.policy].note}</span></div>
      </div>
      <div class="scroll-x">
        <table class="metric-table">
          <thead>
            <tr>
              <th>架构</th><th>政策</th><th>接地</th><th>引用</th><th>幻觉</th><th>胜率</th><th>W-L</th><th>Elo</th><th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="fine">相对基线：${headToHeadLine(votes, "tool", "baseline")}；${headToHeadLine(votes, "multistep", "baseline")}；多步相对工具：${headToHeadLine(votes, "multistep", "tool")}。Elo 起点 1500，K=24。期望胜率 E = 1 / (1 + 10^((对手分−己方分)/400))。先走种子票的固定顺序，再叠加你的本地票。每个任务种子票只有 8 张，K6 要求 n≥200，这里不能宣布架构胜出。</p>
      ${policyBlocked ? `<div class="callout">Elo 领先的是${escapeHtml(leader.nameZh)}，但这条探针的政策是「${POLICY[leaderResult.policy].label}」。偏好不能把它投回去。</div>` : `<div class="callout calm">Elo 领先的${escapeHtml(leader.nameZh)}在这条探针上政策为「${POLICY[leaderResult.policy].label}」。仍然要回去看 48 条回归集，而不是凭一条探针上线。</div>`}
    `;

    renderArena(ratings);
  }

  function defaultPair() {
    const ids = visibleAgents().map((agent) => agent.id);
    const pool = ids.length >= 2 ? ids : DATA.agents.map((agent) => agent.id);
    if (pool.includes("baseline") && pool.includes("multistep")) return ["baseline", "multistep"];
    return [pool[0], pool[1]];
  }

  function excerpt(brief, agentId) {
    const result = brief.agents[agentId];
    const text = result.copy
      ? stripMarkup(result.copy)
      : result.locales
        ? stripMarkup(result.locales[state.locale] || result.locales.EN)
        : result.slate.map((row) => `${row.id} ${ACTION[row.action]}`).join(" · ");
    const chars = Array.from(text);
    return chars.length > 92 ? `${chars.slice(0, 92).join("")}…` : text;
  }

  function renderArena() {
    const brief = briefById(state.briefId);
    const [leftId, rightId] = defaultPair();
    const left = agentById(leftId);
    const right = agentById(rightId);
    const history = votesForBrief(brief.id, true).slice().reverse().slice(0, 6);

    $("#arena").innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
        <h3 style="margin:0">偏好竞技场</h3>
        <label class="check">
          <input type="checkbox" id="blind-toggle" ${state.blind ? "checked" : ""}>
          盲测
        </label>
      </div>
      <p class="fine">只比较当前勾选的前两个可对照架构里的默认配对（优先基线 vs 多步）。票记在本任务下。</p>
      <div class="arena-pair">
        <div class="arena-card">
          <h4>${state.blind ? "方案甲" : escapeHtml(left.nameZh)}</h4>
          <div>${escapeHtml(excerpt(brief, left.id))}</div>
        </div>
        <div class="arena-card">
          <h4>${state.blind ? "方案乙" : escapeHtml(right.nameZh)}</h4>
          <div>${escapeHtml(excerpt(brief, right.id))}</div>
        </div>
      </div>
      <div class="vote-row">
        <button class="btn" type="button" data-vote="left">甲更好</button>
        <button class="btn" type="button" data-vote="tie">平局</button>
        <button class="btn" type="button" data-vote="right">乙更好</button>
      </div>
      <div class="reason-row" role="group" aria-label="投票角色">
        ${JUDGES.map((judge) => `
          <button class="chip" type="button" data-judge="${escapeHtml(judge)}" aria-pressed="${state.judge === judge}">${escapeHtml(judge)}</button>
        `).join("")}
      </div>
      <div class="reason-row" role="group" aria-label="偏好理由">
        ${REASONS.map((reason) => `
          <button class="chip" type="button" data-reason="${escapeHtml(reason)}" aria-pressed="${state.reason === reason}">${escapeHtml(reason)}</button>
        `).join("")}
      </div>
      <p class="fine">你的票：${state.votes.filter((v) => v.briefId === brief.id).length} 张 · 种子票 8 张。理由来自固定选项，避免把自由文本写进本地记录。</p>
      <div class="cluster">
        <button class="btn ghost" type="button" id="reset-votes">${state.confirmReset ? "再点一次确认清除" : "清除我的投票"}</button>
      </div>
      <h4 style="margin:14px 0 6px">最近的票</h4>
      <ul class="flags">
        ${history.length ? history.map((vote) => {
          const winner = vote.winner === "tie"
            ? "平局"
            : vote.winner === "left"
              ? agentById(vote.left).nameZh
              : agentById(vote.right).nameZh;
          return `<li>${vote.source === "human" ? "你" : "种子"} · ${escapeHtml(vote.judge)} · ${escapeHtml(agentById(vote.left).nameZh)} vs ${escapeHtml(agentById(vote.right).nameZh)} · ${escapeHtml(winner)} · ${escapeHtml(vote.reason)}</li>`;
        }).join("") : "<li>还没有票</li>"}
      </ul>
    `;
  }

  function mean(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function timelineModel() {
    const ids = DATA.briefs.map((b) => b.id);
    const keys = ["groundedness", "policy", "hallucination", "citation", "shippable"];
    const overall = {};
    keys.forEach((key) => {
      overall[key] = [0, 1, 2].map((day) => mean(ids.map((id) => DATA.timeline.byBrief[id][key][day])));
    });
    const cost = [0, 1, 2].map((day) => DATA.timeline.callCost[day] / overall.shippable[day]);
    return { overall, cost };
  }

  function deltaText(current, previous, higherBetter, format) {
    if (previous == null || current == null) return '<span class="delta flat">—</span>';
    const diff = current - previous;
    const improved = higherBetter ? diff > 0.0001 : diff < -0.0001;
    const worse = higherBetter ? diff < -0.0001 : diff > 0.0001;
    const cls = improved ? "up" : worse ? "down" : "flat";
    const sign = diff > 0 ? "+" : "";
    let body;
    if (format === "pct") body = `${sign}${Math.round(diff * 1000) / 10}pp`;
    else if (format === "ms") body = `${sign}${Math.round(diff)} ms`;
    else if (Math.abs(diff) < 0.0005) body = formatCny(0);
    else {
      const money = formatCny(Math.abs(diff));
      body = diff < 0 ? `-${money}` : `+${money}`;
    }
    return `<span class="delta ${cls}">${body}</span>`;
  }

  function slotGroundedness(result) {
    if (!result.slots.length) return 0;
    return result.slots.filter((slot) => slot.state === "ok").length / result.slots.length;
  }

  function killCell(ok) {
    return ok ? '<span class="kill-ok">线内</span>' : '<span class="kill-hit">触发</span>';
  }

  function renderTimeline() {
    const model = timelineModel();
    const dayIndex = DATA.timeline.days.findIndex((day) => day.id === state.day);
    const day = DATA.timeline.days[dayIndex];
    const brief = briefById(state.briefId);
    const subset = DATA.timeline.byBrief[brief.id];
    const kill = DATA.killLine;

    $("#timeline-intro").textContent = `回归集 ${DATA.timeline.n} 条，每条任务 ${DATA.timeline.perBrief} 条探针。总体是四条任务的简单平均。单条可投放成本 = 单次调用成本 ÷ 可投放率。这组数字是冻结的，不随竞技场投票改变。`;

    $("#day-switch").innerHTML = DATA.timeline.days.map((item) => `
      <button type="button" data-day="${item.id}" aria-pressed="${item.id === state.day}">${item.label} · ${escapeHtml(item.architecture)}</button>
    `).join("");

    const rows = [
      ["接地率", model.overall.groundedness, true, "pct", null],
      ["政策自动通过", model.overall.policy, true, "pct", (v) => v + 0.0001 >= kill.policy],
      ["事实幻觉率", model.overall.hallucination, false, "pct", (v) => v <= kill.hallucination + 0.0001],
      ["引用覆盖", model.overall.citation, true, "pct", null],
      ["可投放率", model.overall.shippable, true, "pct", null],
      ["延迟 p50", DATA.timeline.latencyP50, false, "ms", null],
      ["延迟 p95", DATA.timeline.latencyP95, false, "ms", (v) => v <= kill.latencyP95],
      ["单条可投放成本", model.cost, false, "cny", (v) => v <= kill.costPerShippable + 0.0001]
    ];

    const head = DATA.timeline.days.map((item) => `<th>${item.label}</th>`).join("");
    const body = rows.map(([label, series, higherBetter, format, gate]) => {
      const cells = series.map((value, index) => {
        const shown = format === "pct" ? formatPct(value) : format === "ms" ? formatMs(value) : formatCny(value);
        return `<td>${shown}</td>`;
      }).join("");
      const delta = dayIndex === 0
        ? '<span class="delta flat">—</span>'
        : deltaText(series[dayIndex], series[0], higherBetter, format);
      const gateNow = gate ? killCell(gate(series[dayIndex])) : "—";
      return `<tr><th>${label}</th>${cells}<td>${delta}</td><td>${gateNow}</td></tr>`;
    }).join("");

    const maxBar = Math.max(...DATA.timeline.latencyP95, kill.latencyP95);
    const subsetRows = [
      ["接地率", subset.groundedness],
      ["政策通过", subset.policy],
      ["幻觉率", subset.hallucination],
      ["引用覆盖", subset.citation],
      ["可投放率", subset.shippable]
    ].map(([label, series]) => `
      <div class="elo-row">
        <span>${label}</span>
        <div class="bar ${label === "幻觉率" ? "bad" : "good"}"><i style="width:${Math.max(2, series[dayIndex] * 100)}%"></i></div>
        <span>${formatPct(series[dayIndex])}</span>
      </div>
    `).join("");

    const prevWin = DATA.timeline.winVsPrev[dayIndex];

    $("#timeline-panel").innerHTML = `
      <div class="score-layout">
        <div>
          <div class="day-story">
            <p class="eyebrow">${day.label} · ${escapeHtml(day.architecture)}</p>
            <h3>${escapeHtml(day.title)}</h3>
            <p>${escapeHtml(day.summary)}</p>
            <p><strong>当天决定：</strong>${escapeHtml(day.decision)}</p>
            <p class="fine">${prevWin == null ? "D0 没有上一版可比较。" : `冻结的回归偏好：相对上一版胜率 ${formatPct(prevWin)}（n=${DATA.timeline.winN}，不是竞技场里的种子票）。`}</p>
          </div>
          <div class="scroll-x" style="margin-top:12px">
            <table class="metric-table">
              <thead><tr><th>总体</th>${head}<th>相对 D0</th><th>${day.label} 否决线</th></tr></thead>
              <tbody>${body}</tbody>
            </table>
          </div>
          <p class="fine">延迟条对照的是否决线 8000ms。D2 的 p95 是 ${formatMs(DATA.timeline.latencyP95[2])}，大约用掉 ${(DATA.timeline.latencyP95[2] / kill.latencyP95 * 100).toFixed(0)}% 的预算。</p>
          <div class="bar" aria-hidden="true"><i style="width:${DATA.timeline.latencyP95[dayIndex] / maxBar * 100}%"></i></div>
        </div>
        <div>
          <p class="eyebrow">当前任务切片 · ${escapeHtml(brief.name)}</p>
          <h3 style="margin-top:4px">${day.label} 的子集</h3>
          ${subsetRows}
          <p class="fine">多语言在 D2 的政策通过率是 ${formatPct(DATA.timeline.byBrief.i18n.policy[2])}，幻觉率是 ${formatPct(DATA.timeline.byBrief.i18n.hallucination[2])}。总体过线，不代表每个子集过线。</p>
          <div class="callout">${dayIndex === 2 ? "D2 总体可以上线，多语言子集不行。这是分流，不是再训练一整代模型。" : "这一天的总体或子集还压在否决线上，决策是停，不是把分数加权后放行。"}</div>
        </div>
      </div>
    `;
  }

  function renderShipping() {
    const tbody = $("#shipping-table tbody");
    tbody.innerHTML = DATA.shipping.map((row) => {
      const brief = briefById(row.briefId);
      return `
        <tr class="${row.briefId === state.briefId ? "is-current" : ""}" data-brief-row="${row.briefId}">
          <td>${escapeHtml(brief.name)}</td>
          <td>${escapeHtml(row.architecture)}</td>
          <td>${escapeHtml(row.mode)}</td>
          <td>${escapeHtml(row.why)}</td>
        </tr>
      `;
    }).join("");
  }

  function renderStatus() {
    const mine = state.votes.length;
    $("#header-status").textContent = `4 条任务 · 3 种架构 · 48 条回归探针 · 本地票 ${mine} · 网络请求 0`;
  }

  function renderAll() {
    renderBriefs();
    renderBriefDetail();
    renderChecks();
    renderCompare();
    renderScore();
    renderTimeline();
    renderShipping();
    renderStatus();
    writeLog(initialLog(), true);
  }

  function initialLog() {
    const brief = briefById(state.briefId);
    return [
      `装载 ${brief.probeId} ${brief.name} · ${brief.brand}`,
      "样本在 data.js，轨迹可回放，不会请求模型",
      `run ${runIdFor(brief.id)} · 对照 ${visibleAgents().map((a) => a.nameZh).join(" / ")}`
    ];
  }

  function writeLog(lines, done) {
    $("#run-log").innerHTML = lines.map((line, index) => {
      const cls = done && index === lines.length - 1 ? "ok" : "";
      return `<li class="${cls}">${escapeHtml(line)}</li>`;
    }).join("");
  }

  function clearTimers() {
    state.timers.forEach((id) => window.clearTimeout(id));
    state.timers = [];
  }

  function replay() {
    if (state.running) return;
    const brief = briefById(state.briefId);
    const lines = [
      `回放 ${brief.probeId}。本地确定性样本，无网络。`,
      "Baseline：单轮生成，不查库。",
      "Tool-augmented：brand_kb.search + policy.check，保留 expired/draft。",
      "Multi-step：规划槽位，丢弃非 active 文档，批评后修订。",
      "自动裁判：引用、政策、槽位、术语。",
      `完成 ${runIdFor(brief.id)}。可以导出这一轮。`
    ];
    clearTimers();
    if (reduceMotion) {
      writeLog(lines, true);
      toast("已回放（减少动态效果）");
      return;
    }
    state.running = true;
    $("#replay").disabled = true;
    $("#compare").setAttribute("aria-busy", "true");
    writeLog([lines[0]], false);
    lines.slice(1).forEach((line, index) => {
      const timer = window.setTimeout(() => {
        const shown = lines.slice(0, index + 2);
        writeLog(shown, index === lines.length - 2);
        if (index === lines.length - 2) {
          state.running = false;
          $("#replay").disabled = false;
          $("#compare").removeAttribute("aria-busy");
        }
      }, 280 * (index + 1));
      state.timers.push(timer);
    });
  }

  function csvCell(value) {
    const text = value == null ? "" : String(value);
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }

  function exportCsv() {
    const scope = $("#export-scope").value;
    const briefs = scope === "all" ? DATA.briefs : [briefById(state.briefId)];
    const header = [
      "record_type", "run_id", "exported_at", "brief_id", "brief_name", "brand", "probe_id",
      "agent_id", "agent_name", "latency_ms", "prompt_tokens", "completion_tokens", "cost_cny",
      "citation_coverage", "groundedness", "policy_level", "hallucination_count", "hallucination_flags",
      "output_text", "vote_id", "left_agent", "right_agent", "winner", "judge_role", "reason", "vote_source"
    ];
    const rows = [header];
    const exportedAt = new Date().toISOString();
    briefs.forEach((brief) => {
      const runId = runIdFor(brief.id);
      DATA.agents.forEach((agent) => {
        const result = brief.agents[agent.id];
        rows.push([
          "agent", runId, exportedAt, brief.id, brief.name, brief.brand, brief.probeId,
          agent.id, agent.nameZh, result.latencyMs, result.promptTokens, result.completionTokens,
          result.costCny.toFixed(3), result.citationCoverage, slotGroundedness(result).toFixed(3), result.policy,
          result.hallucinations.length, result.hallucinations.map((item) => `${item.slot}:${item.detail}`).join(" | "),
          plainOutput(brief, result), "", "", "", "", "", "", ""
        ]);
      });
      votesForBrief(brief.id, true).forEach((vote) => {
        rows.push([
          "vote", runId, exportedAt, brief.id, brief.name, brief.brand, brief.probeId,
          "", "", "", "", "", "", "", "", "", "", "", "",
          vote.id, vote.left, vote.right, vote.winner, vote.judge, vote.reason, vote.source
        ]);
      });
    });
    const model = timelineModel();
    DATA.timeline.days.forEach((day, index) => {
      rows.push([
        "timeline", "regression48", exportedAt, "all", "回归集", "", "",
        day.architecture, day.label, DATA.timeline.latencyP50[index], "", "",
        model.cost[index].toFixed(4), model.overall.citation[index], model.overall.groundedness[index],
        model.overall.policy[index], model.overall.hallucination[index],
        `shippable=${model.overall.shippable[index]};p95=${DATA.timeline.latencyP95[index]}`,
        day.decision, "", "", "", "", "", "", ""
      ]);
    });
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "");
    link.href = url;
    link.download = scope === "all" ? `ad-eval-lab_all_${stamp}.csv` : `ad-eval-lab_${state.briefId}_${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast(scope === "all" ? "已导出四条任务" : "已导出当前任务");
  }

  function openCitation(id) {
    const doc = DATA.kb[id];
    const dialog = $("#kb-dialog");
    if (!doc) {
      $("#kb-brand").textContent = "未收录";
      $("#kb-title").textContent = id;
      $("#kb-status").innerHTML = "";
      $("#kb-text").textContent = "这条引用没有对应的品牌库文档。";
    } else {
      $("#kb-brand").textContent = doc.brand;
      $("#kb-title").textContent = doc.title;
      $("#kb-status").innerHTML = `<span class="status ${doc.status}">${escapeHtml(doc.status)}</span> · ${escapeHtml(id)}`;
      $("#kb-text").textContent = doc.text;
    }
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else dialog.setAttribute("open", "");
  }

  function castVote(side) {
    const [left, right] = defaultPair();
    const brief = briefById(state.briefId);
    const vote = {
      id: `hv_${Date.now().toString(36)}`,
      briefId: brief.id,
      left,
      right,
      winner: side,
      judge: state.judge,
      reason: state.reason,
      at: new Date().toISOString(),
      blind: state.blind
    };
    state.votes.push(vote);
    saveVotes();
    const winnerName = side === "tie" ? "平局" : side === "left" ? agentById(left).nameZh : agentById(right).nameZh;
    const policy = side === "tie" ? null : brief.agents[side === "left" ? left : right].policy;
    renderScore();
    renderStatus();
    if (policy && policy !== "pass" && policy !== "warn") {
      toast(`已记下你更偏好${winnerName}。该方案政策为「${POLICY[policy].label}」，Elo 会变，否决不撤销。`);
    } else {
      toast(`已记下这一票：${winnerName}`);
    }
  }

  function setBrief(id) {
    if (!briefById(id) || id === state.briefId) return;
    state.briefId = id;
    state.confirmReset = false;
    try { sessionStorage.setItem(BRIEF_KEY, id); } catch (err) { /* 隐私模式忽略 */ }
    renderAll();
  }

  function bind() {
    document.body.addEventListener("click", (event) => {
      const origin = event.target instanceof Element ? event.target : event.target && event.target.parentElement;
      if (!origin || !origin.closest) return;
      const briefBtn = origin.closest("[data-brief]");
      if (briefBtn) {
        setBrief(briefBtn.getAttribute("data-brief"));
        return;
      }
      const cite = origin.closest("[data-cite]");
      if (cite) {
        openCitation(cite.getAttribute("data-cite"));
        return;
      }
      const locale = origin.closest("[data-locale]");
      if (locale) {
        state.locale = locale.getAttribute("data-locale");
        renderCompare();
        renderScore();
        return;
      }
      const copyBtn = origin.closest("[data-copy]");
      if (copyBtn) {
        const brief = briefById(state.briefId);
        const text = plainOutput(brief, brief.agents[copyBtn.getAttribute("data-copy")]);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => toast("已复制纯文本")).catch(() => toast("复制失败"));
        } else {
          toast("这台浏览器不能写剪贴板");
        }
        return;
      }
      const day = origin.closest("[data-day]");
      if (day) {
        state.day = day.getAttribute("data-day");
        renderTimeline();
        return;
      }
      const vote = origin.closest("[data-vote]");
      if (vote) {
        castVote(vote.getAttribute("data-vote"));
        return;
      }
      const judge = origin.closest("[data-judge]");
      if (judge) {
        state.judge = judge.getAttribute("data-judge");
        renderArena();
        return;
      }
      const reason = origin.closest("[data-reason]");
      if (reason) {
        state.reason = reason.getAttribute("data-reason");
        renderArena();
      }
    });

    document.body.addEventListener("change", (event) => {
      const toggle = event.target.closest("[data-agent-toggle]");
      if (toggle) {
        const id = toggle.getAttribute("data-agent-toggle");
        const next = Object.assign({}, state.visible, { [id]: toggle.checked });
        const count = Object.values(next).filter(Boolean).length;
        if (count < 2) {
          toggle.checked = true;
          toast("至少保留两个架构，才构成对照");
          return;
        }
        state.visible = next;
        renderCompare();
        renderScore();
        writeLog(initialLog(), true);
        return;
      }
      if (event.target.id === "blind-toggle") {
        state.blind = event.target.checked;
        renderArena();
      }
    });

    $("#replay").addEventListener("click", replay);
    $("#export").addEventListener("click", exportCsv);
    $("#kb-close").addEventListener("click", () => $("#kb-dialog").close());

    document.body.addEventListener("click", (event) => {
      const resetOrigin = event.target instanceof Element ? event.target : event.target && event.target.parentElement;
      if (!resetOrigin || resetOrigin.id !== "reset-votes") return;
      if (!state.confirmReset) {
        state.confirmReset = true;
        renderArena();
        return;
      }
      state.votes = state.votes.filter((vote) => vote.briefId !== state.briefId);
      state.confirmReset = false;
      saveVotes();
      renderScore();
      renderStatus();
      toast("已清除本任务里你的投票，种子票还在");
    });

    document.addEventListener("keydown", (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const keyTarget = event.target instanceof Element ? event.target : null;
      if (keyTarget && keyTarget.closest("input, select, textarea")) return;
      const index = "1234".indexOf(event.key);
      if (index >= 0) {
        setBrief(DATA.briefs[index].id);
      }
    });

    const links = $$(".subnav a");
    const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      }, { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 });
      sections.forEach((section) => observer.observe(section));
    }
  }

  function init() {
    loadVotes();
    try {
      const saved = sessionStorage.getItem(BRIEF_KEY);
      if (saved && briefById(saved)) state.briefId = saved;
    } catch (err) { /* ignore */ }
    bind();
    renderAll();
  }

  init();
})();
