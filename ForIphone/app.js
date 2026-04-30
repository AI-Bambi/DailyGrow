// ─── Utils ────────────────────────────────────────────────────
// 1日の区切り: 日本時間 (UTC+9) AM2:00
// UTC+9 から 2h 引いた UTC 日付を「今日」とみなす
function gameDay() {
  const JST_OFFSET_MS  = 9 * 60 * 60 * 1000;
  const CUTOFF_HOUR_MS = 2 * 60 * 60 * 1000;
  return new Date(Date.now() + JST_OFFSET_MS - CUTOFF_HOUR_MS);
}

function todayStr() {
  const d = gameDay();
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
}
function pad(n) { return String(n).padStart(2,'0'); }

function offsetDate(ds, days) {
  const d = new Date(ds + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function jpDate(ds) {
  const d = new Date(ds + 'T00:00:00');
  return `${d.getMonth()+1}月${d.getDate()}日（${'日月火水木金土'[d.getDay()]}）`;
}

function genId() { return Math.random().toString(36).slice(2,10); }

// ─── Data ─────────────────────────────────────────────────────
// Goal:  { id, name, createdAt, checkins: {'YYYY-MM-DD':{memo}}, bestStreak, pastStreaks }
// App:   { version:2, goals:[...], activeGoalId }

const STORE = 'goaltrack_v2';

function createGoal(name) {
  return { id: genId(), name: name || '新しい目標', createdAt: todayStr(),
           checkins: {}, bestStreak: 0, pastStreaks: [], plans: [] };
}

function loadApp() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (!raw) return freshApp();
    if (!raw.version) {            // migrate v1 → v2
      const g = createGoal(raw.goalName || 'GoalTrack');
      (raw.checkins || []).forEach(d => { g.checkins[d] = { memo: '' }; });
      g.bestStreak = raw.bestStreak || 0;
      g.pastStreaks = raw.pastStreaks || [];
      const app = { version: 2, goals: [g], activeGoalId: g.id };
      saveApp(app); return app;
    }
    return raw;
  } catch(e) { return freshApp(); }
}

function freshApp() {
  const app = { version: 2, goals: [], activeGoalId: null };
  saveApp(app); return app;
}

function saveApp(app) { localStorage.setItem(STORE, JSON.stringify(app)); }

function activeGoal() {
  const app = loadApp();
  if (!app.goals.length) return null;
  return app.goals.find(g => g.id === app.activeGoalId) || app.goals[0];
}

function updateGoal(updated) {
  const app = loadApp();
  app.goals = app.goals.map(g => g.id === updated.id ? updated : g);
  saveApp(app);
}

function setActiveGoal(id) {
  const app = loadApp();
  app.activeGoalId = id;
  saveApp(app);
}

// ─── Plan Utils ────────────────────────────────────────────────
const PLAN_LABEL = { weekday:'平日', weekend:'週末', everyday:'毎日', weekly:'今週', monthly:'今月', once:'一回' };
const PLAN_MAP   = { '平日':'weekday', '週末':'weekend', '毎日':'everyday', '今週':'weekly', '今月':'monthly', '今日':'once_today', '明日':'once' };

function getWeekStart() {
  const d   = gameDay();
  const dow = d.getUTCDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const mon  = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
  return `${mon.getUTCFullYear()}-${pad(mon.getUTCMonth()+1)}-${pad(mon.getUTCDate())}`;
}

function getMonthStart() {
  const d = gameDay();
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}`;
}

function todayPlans(goal) {
  if (!goal.plans || !goal.plans.length) return [];
  const d   = gameDay();
  const dow = d.getUTCDay();
  const isWeekend = dow === 0 || dow === 6;
  return goal.plans.filter(p => {
    if (p.type === 'everyday') return true;
    if (p.type === 'weekday')  return !isWeekend;
    if (p.type === 'weekend')  return isWeekend;
    if (p.type === 'weekly')   return true;
    if (p.type === 'monthly')  return true;
    if (p.type === 'once')     return p.date === todayStr();
    return false;
  });
}

function checkedPlanIds(goal) {
  const ci = goal.checkins[todayStr()];
  return ci ? (ci.checkedPlans || []) : [];
}

function renderPlanSection() {
  const goal  = activeGoal();
  const sec   = document.getElementById('plan-section');
  if (!goal) { sec.innerHTML = ''; return; }
  const plans = todayPlans(goal);
  if (!plans.length) { sec.innerHTML = ''; return; }

  const checked  = checkedPlanIds(goal);
  const items = plans.map(p => {
    const isChecked = checked.includes(p.id);
    const badge = p.type === 'once' ? jpDate(p.date) : (PLAN_LABEL[p.type] || p.type);
    return `
      <div class="plan-item${isChecked ? ' plan-checked' : ''}" onclick="togglePlan('${p.id}')">
        <div class="plan-check-circle">${isChecked ? '✓' : ''}</div>
        <div class="plan-text-wrap">
          <span class="plan-type-badge">${badge}</span>
          <span class="plan-text">${escHtml(p.text)}</span>
        </div>
      </div>`;
  }).join('');

  sec.innerHTML = `<div class="card"><div class="card-title">今日のプラン</div>${items}</div>`;
}

function togglePlan(planId) {
  const goal  = activeGoal();
  const today = todayStr();
  const ci    = goal.checkins[today];
  if (!ci) {
    startCheckin(planId);
    return;
  }
  if (!ci.checkedPlans) ci.checkedPlans = [];
  const idx = ci.checkedPlans.indexOf(planId);
  if (idx === -1) ci.checkedPlans.push(planId);
  else            ci.checkedPlans.splice(idx, 1);
  updateGoal(goal);
  renderPlanSection();
  checkAllPlansDone();
}

const ALL_DONE_MSGS = [
  '🎉 今日のプラン全部クリア！最高すぎる！',
  '⭐ 全タスク達成！今日も完璧にこなした！',
  '🔥 全部やり切った！この調子でいこう！',
  '✨ 今日のプラン完了！自分を褒めていいよ！',
  '🏆 完全制覇！今日も全力で駆け抜けた！',
];

function checkAllPlansDone() {
  const goal  = activeGoal();
  const plans = todayPlans(goal);
  if (!plans.length) return;
  const checked = checkedPlanIds(goal);
  if (!plans.every(p => checked.includes(p.id))) return;
  const msg = ALL_DONE_MSGS[Math.floor(Math.random() * ALL_DONE_MSGS.length)];
  const el  = document.getElementById('all-plans-toast');
  el.textContent  = msg;
  el.style.display = 'block';
  el.classList.remove('toast-show');
  void el.offsetWidth;
  el.classList.add('toast-show');
  setTimeout(() => { el.style.display = 'none'; el.classList.remove('toast-show'); }, 4000);
}

function copyToClipboard(text, onSuccess) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
      copyFallback(text, onSuccess);
    });
  } else {
    copyFallback(text, onSuccess);
  }
}

function copyFallback(text, onSuccess) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try {
    document.execCommand('copy');
    onSuccess();
  } catch(e) {
    alert('コピーに失敗しました。手動でコピーしてください。');
  }
  document.body.removeChild(ta);
}

function copyBlankTemplate() {
  const template = '今日: \n明日: \n今週: \n平日: \n週末: \n今月: \n毎日: ';
  copyToClipboard(template, () => {
    const btns = document.querySelectorAll('#plan-text-mode .copy-template-btn');
    const btn  = btns[0];
    const orig = btn.textContent;
    btn.textContent = '✅ コピーしました！';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
}

function copyPlanTemplate() {
  const goal    = activeGoal();
  const REVERSE = { weekday:'平日', weekend:'週末', everyday:'毎日', weekly:'今週', monthly:'今月' };
  const lines   = (goal.plans || [])
    .filter(p => p.type !== 'once')
    .map(p => `${REVERSE[p.type]}: ${p.text}`);
  if (!lines.length) {
    alert('コピーできるプランがありません\n（今日・明日の一回限りプランはコピー対象外です）');
    return;
  }
  copyToClipboard(lines.join('\n'), () => {
    const btn = document.querySelector('.copy-template-btn');
    const orig = btn.textContent;
    btn.textContent = '✅ コピーしました！';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
}

// ─── Plan Settings ─────────────────────────────────────────────
let _selectedPlanType   = 'weekday';
let _selectedPlanOffset = 1;

function switchPlanTab(mode) {
  document.getElementById('plan-list-mode').style.display = mode === 'list' ? '' : 'none';
  document.getElementById('plan-text-mode').style.display = mode === 'text' ? '' : 'none';
  document.getElementById('plan-tab-list').classList.toggle('active', mode === 'list');
  document.getElementById('plan-tab-text').classList.toggle('active', mode === 'text');
  if (mode === 'list') renderPlanSettingsList();
}

function renderPlanSettingsList() {
  const goal  = activeGoal();
  const plans = goal.plans || [];
  document.getElementById('plan-settings-list').innerHTML = plans.length
    ? plans.map(p => {
        const badge = p.type === 'once' ? jpDate(p.date) : (PLAN_LABEL[p.type] || p.type);
        return `
        <div class="plan-list-item">
          <span class="plan-type-badge">${badge}</span>
          <span class="plan-list-text">${escHtml(p.text)}</span>
          <button class="goal-delete-btn" onclick="deletePlan('${p.id}')">🗑️</button>
        </div>`;
      }).join('')
    : '<div style="color:var(--muted);font-size:13px;padding:8px 0">プランはまだありません</div>';
}

function deletePlan(id) {
  const goal = activeGoal();
  goal.plans = (goal.plans || []).filter(p => p.id !== id);
  updateGoal(goal);
  renderPlanSettingsList();
  renderPlanSection();
}

function openAddPlanSheet() {
  _selectedPlanType   = 'weekday';
  _selectedPlanOffset = 1;
  document.querySelectorAll('.plan-type-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.type === 'weekday' && b.dataset.offset === undefined));
  document.getElementById('add-plan-input').value = '';
  document.getElementById('add-plan-backdrop').style.display = 'block';
  document.getElementById('add-plan-sheet').classList.add('open');
  setTimeout(() => document.getElementById('add-plan-input').focus(), 400);
}

function cancelAddPlan() {
  document.getElementById('add-plan-backdrop').style.display = 'none';
  document.getElementById('add-plan-sheet').classList.remove('open');
}

function selectPlanType(btn) {
  _selectedPlanType   = btn.dataset.type;
  _selectedPlanOffset = btn.dataset.offset !== undefined ? Number(btn.dataset.offset) : 1;
  document.querySelectorAll('.plan-type-btn').forEach(b => b.classList.toggle('active', b === btn));
}

function confirmAddPlan() {
  const text = document.getElementById('add-plan-input').value.trim();
  if (!text) { document.getElementById('add-plan-input').focus(); return; }
  const goal = activeGoal();
  if (!goal.plans) goal.plans = [];
  const plan = { id: genId(), type: _selectedPlanType, text };
  if (_selectedPlanType === 'once') plan.date = offsetDate(todayStr(), _selectedPlanOffset);
  goal.plans.push(plan);
  updateGoal(goal);
  cancelAddPlan();
  renderPlanSettingsList();
  renderPlanSection();
}

function importPlanText() {
  const raw    = document.getElementById('plan-text-input').value;
  const lines  = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const parsed = [];
  const today    = todayStr();
  const tomorrow = offsetDate(today, 1);
  for (const line of lines) {
    const m = line.match(/^(平日|週末|毎日|今週|今月|今日|明日)[：:]\s*(.+)$/);
    if (!m) continue;
    const raw  = PLAN_MAP[m[1]];
    const plan = { id: genId(), type: raw === 'once_today' ? 'once' : raw, text: m[2].trim() };
    if (raw === 'once_today') plan.date = today;
    if (raw === 'once')       plan.date = tomorrow;
    parsed.push(plan);
  }
  if (!parsed.length) {
    alert('読み込めるプランがありませんでした。\n形式例: 平日: 問題5問');
    return;
  }
  const goal = activeGoal();
  if (!goal.plans) goal.plans = [];
  goal.plans.push(...parsed);
  updateGoal(goal);
  document.getElementById('plan-text-input').value = '';
  switchPlanTab('list');
  renderPlanSection();
}

// ─── Streak Logic ──────────────────────────────────────────────
function calcStreak(checkins) {
  const dates = Object.keys(checkins).sort().reverse();
  if (!dates.length) return 0;
  const t = todayStr(), y = offsetDate(t, -1);
  if (dates[0] !== t && dates[0] !== y) return 0;
  let n = 1;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i] === offsetDate(dates[i-1], -1)) n++;
    else break;
  }
  return n;
}

const MILESTONES = [3, 7, 30, 100];

const CEL = {
  3:   { emoji:'⭐', title:'3日連続！すごい！',   msg:'3日間、ちゃんと続けた。\nそれだけで十分すごいことだよ！\n次は7日を目指そう🎯', confetti:40 },
  7:   { emoji:'🔥', title:'1週間連続！！',       msg:'7日間も続けたなんて最高すぎる！\n毎日コツコツ積み上げた証拠だね。\nこの調子でいこう！💪', confetti:60 },
  30:  { emoji:'🏆', title:'30日達成！！！',      msg:'1ヶ月間、本当によく頑張った！！\n毎日継続するって難しいのに、\nあなたはやりきった！素晴らしい🎊', confetti:90 },
  100: { emoji:'🌟', title:'100日連続！！！！！', msg:'100日！！！！！\nこれはもう習慣が身についた証拠。\nあなたは本物だ。本当におめでとう！！\n🎆🎆🎆🎆🎆', confetti:150 },
};

function streakVisual(n) {
  if (n >= 100) return { emoji:'🌟', msg:'伝説の域に達した！これが本物の継続力！', sub:`${n}日 🎆` };
  if (n >= 30)  return { emoji:'🏆', msg:'1ヶ月以上継続中！もう習慣になってるね！', sub:`${n}日 — 驚異の継続力！` };
  if (n >= 7)   return { emoji:'🔥', msg:'1週間以上続いてる！最高すぎる！', sub:`${n}日 — この調子で行こう！` };
  if (n >= 3)   return { emoji:'⭐', msg:'3日以上継続中！いい感じ！', sub:`${n}日 — 続けることが力になる` };
  if (n === 0)  return { emoji:'✨', msg:'さあ、今日もはじめよう！', sub:'最初の一歩が一番大事' };
  return { emoji:'💪', msg:'今日もやり遂げた！えらい！', sub:`${n}日 — 着実に積み上げ中！` };
}

function nextMilestone(n) { return MILESTONES.find(m => n < m) || null; }

// ─── Goal Pill Tabs ────────────────────────────────────────────
function renderGoalPills() {
  const app   = loadApp();
  const pills = document.getElementById('goal-pills');
  if (!app.goals.length) { pills.innerHTML = ''; return; }
  pills.innerHTML = app.goals.map(g =>
    `<button class="goal-pill${g.id === app.activeGoalId ? ' active' : ''}"
             onclick="switchGoal('${g.id}')">${escHtml(g.name)}</button>`
  ).join('') +
  `<button class="goal-pill-add" onclick="openAddGoalSheet()" title="目標を追加">＋</button>`;
}

function switchGoal(id) {
  setActiveGoal(id);
  renderGoalPills();
  updateHome();
  renderPlanSection();
}

// ─── Home UI ──────────────────────────────────────────────────
function updateHome() {
  const goal   = activeGoal();
  if (!goal) return;
  const streak = calcStreak(goal.checkins);
  const today  = todayStr();
  const done   = !!goal.checkins[today];
  const total  = Object.keys(goal.checkins).length;

  const d = gameDay();
  document.getElementById('today-label').textContent =
    `${d.getUTCFullYear()}年${d.getUTCMonth()+1}月${d.getUTCDate()}日（${'日月火水木金土'[d.getUTCDay()]}）`;

  const v = streakVisual(streak);
  document.getElementById('hero-emoji').textContent = v.emoji;
  document.getElementById('hero-num').textContent   = streak;
  document.getElementById('hero-msg').textContent   = v.msg;
  document.getElementById('hero-sub').textContent   = v.sub;

  document.getElementById('s-streak').textContent = streak;
  document.getElementById('s-best').textContent   = goal.bestStreak;
  document.getElementById('s-total').textContent  = total;

  const btn = document.getElementById('checkin-btn');
  btn.textContent = done ? '✅ 今日はチェック済み！おつかれ様！' : '✅ 今日もやった！';
  btn.disabled    = done;

  const next = nextMilestone(streak);
  const fill = document.getElementById('prog-fill');
  const lbl  = document.getElementById('milestone-right');
  if (!next) {
    fill.style.width = '100%';
    lbl.textContent  = '全マイルストーン達成！🌟';
  } else {
    const prev = MILESTONES[MILESTONES.indexOf(next) - 1] ?? 0;
    fill.style.width = Math.round(((streak - prev) / (next - prev)) * 100) + '%';
    lbl.textContent  = `${next}日まであと${next - streak}日`;
  }

  renderPlanSection();
}

// ─── Check-in ─────────────────────────────────────────────────
let _pendingDate = null;

function startCheckin(planId = null) {
  const goal  = activeGoal();
  const today = todayStr();
  if (goal.checkins[today]) {
    if (planId) {
      const ci = goal.checkins[today];
      if (!ci.checkedPlans) ci.checkedPlans = [];
      if (!ci.checkedPlans.includes(planId)) ci.checkedPlans.push(planId);
      updateGoal(goal);
      renderPlanSection();
    }
    return;
  }

  const prevStreak = calcStreak(goal.checkins);
  goal.checkins[today] = { memo: '', checkedPlans: planId ? [planId] : [] };
  const newStreak = calcStreak(goal.checkins);
  if (newStreak > goal.bestStreak) goal.bestStreak = newStreak;
  updateGoal(goal);
  updateHome();

  _pendingDate = today;

  const hadBefore = Object.keys(goal.checkins).length > 1;
  if (prevStreak === 0 && hadBefore) showRestartToast();

  setTimeout(() => openMemoSheet(), 350);
  if (CEL[newStreak]) setTimeout(() => showCel(newStreak), 2200);
}

function openMemoSheet() {
  document.getElementById('memo-input').value = '';
  document.getElementById('memo-backdrop').style.display = 'block';
  document.getElementById('memo-sheet').classList.add('open');
  setTimeout(() => document.getElementById('memo-input').focus(), 400);
}
function closeMemoSheet() {
  document.getElementById('memo-backdrop').style.display = 'none';
  document.getElementById('memo-sheet').classList.remove('open');
}
function skipMemo() { closeMemoSheet(); _pendingDate = null; }
function saveMemo() {
  const text = document.getElementById('memo-input').value.trim();
  if (text && _pendingDate) {
    const goal = activeGoal();
    if (goal.checkins[_pendingDate]) {
      goal.checkins[_pendingDate].memo = text;
      updateGoal(goal);
    }
  }
  closeMemoSheet(); _pendingDate = null;
}

function showRestartToast() {
  const el = document.getElementById('restart-toast');
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

// ─── Add Goal Sheet ────────────────────────────────────────────
function openAddGoalSheet() {
  document.getElementById('add-goal-input').value = '';
  document.getElementById('add-goal-backdrop').style.display = 'block';
  document.getElementById('add-goal-sheet').classList.add('open');
  setTimeout(() => document.getElementById('add-goal-input').focus(), 400);
}
function cancelAddGoal() {
  document.getElementById('add-goal-backdrop').style.display = 'none';
  document.getElementById('add-goal-sheet').classList.remove('open');
}
function confirmAddGoal() {
  const name = document.getElementById('add-goal-input').value.trim();
  if (!name) { document.getElementById('add-goal-input').focus(); return; }
  const app  = loadApp();
  const goal = createGoal(name);
  app.goals.push(goal);
  app.activeGoalId = goal.id;
  saveApp(app);
  cancelAddGoal();
  renderGoalPills();
  updateHome();
  setTimeout(() => {
    const pills = document.getElementById('goal-pills');
    pills.scrollLeft = pills.scrollWidth;
  }, 100);
}

// ─── Celebration ───────────────────────────────────────────────
function showCel(streak) {
  const c = CEL[streak];
  document.getElementById('cel-emoji').textContent = c.emoji;
  document.getElementById('cel-title').textContent = c.title;
  document.getElementById('cel-msg').textContent   = c.msg;
  document.getElementById('celebration').classList.add('show');
  spawnConfetti(c.confetti);
}
function closeCel() { document.getElementById('celebration').classList.remove('show'); }

function spawnConfetti(n) {
  const colors = ['#f5a623','#f8c660','#4ecb8d','#ffe082','#e07878','#ffd54f','#6ee7b7'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.cssText = `left:${Math.random()*100}vw;top:-10px;` +
      `background:${colors[Math.random()*colors.length|0]};` +
      `animation-duration:${1.4+Math.random()*2}s;` +
      `animation-delay:${Math.random()*0.9}s;`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ─── History UI ────────────────────────────────────────────────
function updateHistory() {
  const goal   = activeGoal();
  const streak = calcStreak(goal.checkins);
  const total  = Object.keys(goal.checkins).length;
  const today  = todayStr();

  document.getElementById('hist-goal-name').textContent = goal.name + ' の記録';
  document.getElementById('h-streak').textContent = streak + '日';
  document.getElementById('h-best').textContent   = goal.bestStreak + '日';
  document.getElementById('h-total').textContent  = total + '日';

  const dates = Object.keys(goal.checkins).sort().reverse();
  document.getElementById('h-last').textContent = dates.length ? jpDate(dates[0]) : '—';

  const DOW = ['日','月','火','水','木','金','土'];
  document.getElementById('cal-headers').innerHTML =
    DOW.map(d => `<div class="cal-dh">${d}</div>`).join('');

  const [year, mon1] = today.split('-').map(Number);
  const month = mon1 - 1;
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  document.getElementById('cal-month').textContent = `${year}年${mon1}月`;

  const dow = firstDay.getDay();
  let html  = '<div class="cal-day empty"></div>'.repeat(dow);
  for (let d = 1; d <= lastDate; d++) {
    const ds  = `${year}-${pad(mon1)}-${pad(d)}`;
    const isT = ds === today;
    const isC = !!goal.checkins[ds];
    const isM = isC && goal.checkins[ds].memo;
    const cls = ['cal-day', isT?'today':'', isC?'checked':'', isM?'has-memo':''].filter(Boolean).join(' ');
    const tap = isC ? `onclick="showDayPopup('${ds}')"` : '';
    html += `<div class="${cls}" ${tap}>${d}</div>`;
  }
  document.getElementById('cal-days').innerHTML = html;

  if (goal.pastStreaks && goal.pastStreaks.length) {
    document.getElementById('past-card').style.display = '';
    document.getElementById('past-list').innerHTML =
      goal.pastStreaks.slice(-5).reverse().map(s =>
        `<div class="rec-item">
          <span class="rec-label">${jpDate(s.start)} 〜 ${jpDate(s.end)}</span>
          <span class="rec-value">${s.length}日</span>
        </div>`
      ).join('');
  } else {
    document.getElementById('past-card').style.display = 'none';
  }
}

function showDayPopup(ds) {
  const ci = activeGoal().checkins[ds];
  if (!ci) return;
  document.getElementById('popup-date').textContent = jpDate(ds);
  document.getElementById('popup-memo').textContent = ci.memo || '（メモなし）';
  const el = document.getElementById('day-popup');
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}
function closeDayPopup() { document.getElementById('day-popup').classList.remove('show'); }

document.addEventListener('click', e => {
  const p = document.getElementById('day-popup');
  if (p.classList.contains('show') && !p.contains(e.target) && !e.target.classList.contains('cal-day'))
    closeDayPopup();
});

// ─── Settings UI ───────────────────────────────────────────────
function updateSettings() {
  renderPlanSettingsList();
  const app = loadApp();
  const list = document.getElementById('goal-settings-list');
  const canDelete = app.goals.length > 1;

  list.innerHTML = app.goals.map(g => `
    <div class="goal-list-item">
      <div class="goal-active-dot ${g.id === app.activeGoalId ? '' : 'inactive'}"
           onclick="switchGoalSettings('${g.id}')" title="この目標を選択" style="cursor:pointer"></div>
      <input class="goal-name-input" value="${escHtml(g.name)}"
             onchange="renameGoal('${g.id}', this.value)"
             placeholder="目標名" maxlength="20">
      ${canDelete
        ? `<button class="goal-delete-btn" onclick="deleteGoal('${g.id}')" title="削除">🗑️</button>`
        : '<div style="width:29px"></div>'}
    </div>
  `).join('');
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

function switchGoalSettings(id) {
  setActiveGoal(id);
  renderGoalPills();
  updateHome();
  updateSettings();
  renderPlanSection();
}

function renameGoal(id, newName) {
  const name = newName.trim() || '目標';
  const app  = loadApp();
  const g    = app.goals.find(g => g.id === id);
  if (g) { g.name = name; saveApp(app); }
  renderGoalPills();
  updateHome();
}

function deleteGoal(id) {
  const app = loadApp();
  if (app.goals.length <= 1) return;
  const g = app.goals.find(g => g.id === id);
  if (!confirm(`「${g?.name}」を削除しますか？\nこの目標のすべての記録が消えます。`)) return;
  app.goals = app.goals.filter(g => g.id !== id);
  if (app.activeGoalId === id) app.activeGoalId = app.goals[0].id;
  saveApp(app);
  renderGoalPills();
  updateHome();
  updateSettings();
}

function confirmReset() {
  if (!confirm('新しいチャレンジを始めますか？\n\n現在の連続記録は「過去の記録」として保存されます。')) return;
  const goal   = activeGoal();
  const streak = calcStreak(goal.checkins);
  if (streak > 0) {
    const sorted = Object.keys(goal.checkins).sort();
    const end    = sorted[sorted.length - 1];
    const start  = offsetDate(end, -(streak - 1));
    if (!goal.pastStreaks) goal.pastStreaks = [];
    goal.pastStreaks.push({ start, end, length: streak });
  }
  goal.checkins = {};
  updateGoal(goal);
  updateHome();
  switchTab('home');
}

// ─── Tab Navigation ────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  document.getElementById('tab-'    + name).classList.add('active');
  if (name === 'history')  updateHistory();
  if (name === 'settings') updateSettings();
}

// ─── Welcome Sheet ─────────────────────────────────────────────
function showWelcomeSheet() {
  document.getElementById('welcome-goal-input').value = '';
  document.getElementById('welcome-backdrop').style.display = 'block';
  document.getElementById('welcome-sheet').classList.add('open');
  setTimeout(() => document.getElementById('welcome-goal-input').focus(), 400);
}

function confirmFirstGoal() {
  const name = document.getElementById('welcome-goal-input').value.trim();
  if (!name) { document.getElementById('welcome-goal-input').focus(); return; }
  const app  = loadApp();
  const goal = createGoal(name);
  app.goals.push(goal);
  app.activeGoalId = goal.id;
  saveApp(app);
  document.getElementById('welcome-backdrop').style.display = 'none';
  document.getElementById('welcome-sheet').classList.remove('open');
  renderGoalPills();
  updateHome();
}

// ─── Init ──────────────────────────────────────────────────────
document.getElementById('add-goal-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmAddGoal();
});
document.getElementById('add-plan-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmAddPlan();
});
document.getElementById('welcome-goal-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmFirstGoal();
});

renderGoalPills();
updateHome();
if (loadApp().goals.length === 0) showWelcomeSheet();
