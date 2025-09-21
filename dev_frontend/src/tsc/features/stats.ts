import { API_BASE_URL } from "./utils-api.js";
import Chart from 'chart.js/auto';

type Summary = { totalGames:number; wins:number; losses:number; winRate:number; avgWallBounces:number; avgTimeTop:number };
type MatchItem = { matchId:string; date:string; opponents:{id:string;name:string}[]; result:string; score?:string };
type FriendSummary = { friendId:string; friendName:string; wins:number; losses:number; timeTop:number; timeBottom:number };
type MatchDetail = { matchId:string; duration:number; players:{id:string; name:string; wallBounces:number; timeTop:number; timeBottom:number; score?:string}[] };

let friendsBarChart: Chart | null = null;
let matchWallChart: Chart | null = null;
let matchTimeChart: Chart | null = null;
let heatmapInstance: any = null;

async function fetchJson<T>(url:string):Promise<T|null> {
  try {
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } });
    if (!res.ok) throw new Error('Network');
    return await res.json() as T;
  } catch (err) {
    console.warn('API fetch failed for', url, 'falling back to mock');
    return getMockFor(url) as unknown as T;
  }
}

export async function initStatsView() {
  const base = API_BASE_URL;
  const summary = await fetchJson<Summary>(base + '/stats/user/me/summary');
  renderSummary(summary);

  const history = await fetchJson<MatchItem[]>(base + '/stats/user/me/history');
  renderHistory(history);

  const friends = await fetchJson<FriendSummary[]>(base + '/stats/user/me/friends-summary');
  renderFriendsCharts(friends || []);
  populateFriendSelect(friends || []);

  document.getElementById('close-match-detail')?.addEventListener('click', () => { const md = document.getElementById('match-detail'); if (md) (md as HTMLElement).style.display = 'none'; });
}

function renderSummary(s:Summary|null) {
  (document.getElementById('stat-total') as HTMLElement).textContent = s? String(s.totalGames) : '—';
  (document.getElementById('stat-wins') as HTMLElement).textContent = s? String(s.wins) : '—';
  (document.getElementById('stat-losses') as HTMLElement).textContent = s? String(s.losses) : '—';
  (document.getElementById('stat-winrate') as HTMLElement).textContent = s? String(Math.round(s.winRate)) + '%' : '—';
  (document.getElementById('stat-bounces') as HTMLElement).textContent = s? String(Math.round(s.avgWallBounces)) : '—';
  (document.getElementById('stat-toptime') as HTMLElement).textContent = s? String(Math.round(s.avgTimeTop)) + '%' : '—';
}

function renderHistory(hist: MatchItem[] | null) {
  const container = document.getElementById('match-history')!;
  container.innerHTML = '';
  const list = hist || (getMockFor('/stats/user/me/history') as MatchItem[]);
  for (const m of list.slice(0,10)) {
    const li = document.createElement('li');
    li.className = 'match-item';
    li.innerHTML = `<div class="flex items-center justify-between"><div class="text-sm text-gray-300">${new Date(m.date).toLocaleString()}</div><div class="text-sm font-semibold">${m.score ?? ''}</div></div><div class="text-xs text-gray-200">${m.opponents.map(o=>o.name).join(' vs ')}</div>`;
    // emit open-match event so the view controller can replace the stats view with a match view
    li.addEventListener('click', () => window.dispatchEvent(new CustomEvent('open-match', { detail: { matchId: m.matchId } })));
    container.appendChild(li);
  }
}

function renderFriendsCharts(friends: FriendSummary[]) {
  const ctxEl = document.getElementById('friends-bar') as HTMLCanvasElement | null;
  if (!ctxEl) return;
  const ctx = ctxEl.getContext('2d')!;
  // default to first friend only (show that friend's wins/losses)
  friendsBarChart?.destroy();
  if (!friends || friends.length === 0) return;
  const f = friends[0];
  friendsBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [f.friendName],
      datasets: [
        { label: 'Wins', data: [f.wins], backgroundColor: 'rgba(34,197,94,0.9)' },
        { label: 'Losses', data: [f.losses], backgroundColor: 'rgba(239,68,68,0.9)' }
      ]
    },
    options: { responsive: true, plugins:{ legend:{ position:'top' } }, scales: { x:{ stacked:false }, y:{ beginAtZero:true } } }
  });
}

function populateFriendSelect(friends: FriendSummary[]) {
  const sel = document.getElementById('friend-select') as HTMLSelectElement | null;
  if (!sel) return;
  sel.innerHTML = '<option value="all">All friends</option>';
  for (const f of friends) {
    const opt = document.createElement('option'); opt.value = f.friendId; opt.textContent = f.friendName; sel.appendChild(opt);
  }
  sel.addEventListener('change', () => {
    const v = sel.value;
    if (v === 'all') {
      // re-fetch friends to reset (or use previous cache)
      fetchJson<FriendSummary[]>(API_BASE_URL + '/stats/user/me/friends-summary').then(fr => {
        if (fr) renderFriendsCharts(fr);
      });
    } else {
      // show single friend as two bars
      fetchJson<FriendSummary[]>(API_BASE_URL + '/stats/user/me/friends-summary').then(fr => {
        const f = (fr || []).find(x=>x.friendId===v);
        if (!f) return;
        friendsBarChart?.destroy();
        const ctxEl = document.getElementById('friends-bar') as HTMLCanvasElement | null;
        if (!ctxEl) return;
        const ctx = ctxEl.getContext('2d')!;
        friendsBarChart = new Chart(ctx, {
          type: 'bar',
          data: { labels: [f.friendName], datasets: [ { label:'Wins', data:[f.wins], backgroundColor:'rgba(34,197,94,0.95)' }, { label:'Losses', data:[f.losses], backgroundColor:'rgba(239,68,68,0.95)' } ] },
          options: { responsive:true, scales:{ x:{ stacked:false }, y:{ beginAtZero:true } } }
        });
      });
    }
  });
}

// AI difficulty chart (easy, medium, hard) - simple mock implementation
function renderAIDifficultyChart() {
  const el = document.getElementById('ai-difficulty') as HTMLCanvasElement | null;
  if (!el) return;
  const ctx = el.getContext('2d')!;
  const dataWins = [5, 3, 1];
  const dataLosses = [1, 2, 4];
  // destroy any existing chart in that canvas
  try { if ((el as any)._chart) (el as any)._chart.destroy(); } catch (e) {}
  const chart = new Chart(ctx, {
    type: 'bar',
    data: { labels: ['Easy','Medium','Hard'], datasets: [ { label:'Wins', data:dataWins, backgroundColor:'rgba(34,197,94,0.9)' }, { label:'Losses', data:dataLosses, backgroundColor:'rgba(239,68,68,0.9)' } ] },
    options: { responsive:true, plugins:{ legend:{ position:'top' } }, scales:{ x:{ stacked:false }, y:{ beginAtZero:true } } }
  });
  (el as any)._chart = chart;
}

async function openMatch(matchId:string) {
  const detail = await fetchJson<MatchDetail>(API_BASE_URL + '/stats/match/' + matchId);
  const m = detail || (getMockFor('/stats/match/m1') as MatchDetail);
  renderMatchDetail(m);
}

async function renderMatchDetail(detail: MatchDetail) {
  const md = document.getElementById('match-detail'); if (md) (md as HTMLElement).style.display = '';
  // wall
  const labels = detail.players.map(p=>p.name);
  const wall = detail.players.map(p=>p.wallBounces);
  const top = detail.players.map(p=>p.timeTop);
  const bottom = detail.players.map(p=>p.timeBottom);

  const wctxEl = document.getElementById('match-wall') as HTMLCanvasElement | null;
  if (wctxEl) {
    const wctx = wctxEl.getContext('2d')!;
    matchWallChart?.destroy();
    matchWallChart = new Chart(wctx, { type:'bar', data:{ labels, datasets:[ { label:'Wall bounces', data:wall, backgroundColor:'rgba(124,58,237,0.8)' } ] }, options:{ responsive:true } });
  }

  const tctxEl = document.getElementById('match-time') as HTMLCanvasElement | null;
  if (tctxEl) {
    const tctx = tctxEl.getContext('2d')!;
    matchTimeChart?.destroy();
    matchTimeChart = new Chart(tctx, { type:'bar', data:{ labels, datasets:[ { label:'Time Top', data:top, backgroundColor:'rgba(34,197,94,0.8)' }, { label:'Time Bottom', data:bottom, backgroundColor:'rgba(245,158,11,0.8)' } ] }, options:{ responsive:true, scales:{ x:{ stacked:true }, y:{ stacked:true } } } });
  }

  // players table
  const playersDiv = document.getElementById('match-players')!;
  playersDiv.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'w-full text-sm';
  table.innerHTML = `<thead><tr><th>Player</th><th>Score</th><th>Wall bounces</th><th>Time top</th><th>Time bottom</th></tr></thead>`;
  const tbody = document.createElement('tbody');
  for (const p of detail.players) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.name}</td><td>${p.score ?? '-'}</td><td>${p.wallBounces}</td><td>${p.timeTop}</td><td>${p.timeBottom}</td>`;
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  playersDiv.appendChild(table);

  // Heatmap
  const heatContainer = document.getElementById('heatmap-container');
  if (!heatContainer) return;
  // clear previous content
  heatContainer.innerHTML = '';
  try {
    await loadHeatmapLibrary();
    // create instance bound to this container
    heatmapInstance = (window as any).h337.create({ container: heatContainer });

    // synthesize points using player top/bottom bias, map to container size
    const pts:any[] = [];
    const cw = Math.max(heatContainer.clientWidth, 200);
    const ch = Math.max(heatContainer.clientHeight, 120);
    detail.players.forEach((p, idx) => {
      const n = Math.max(8, Math.round((p.timeTop + p.timeBottom) / 15));
      for (let i = 0; i < n; i++) {
        const topBias = p.timeTop / Math.max(1, p.timeTop + p.timeBottom);
        const x = Math.round(Math.random() * cw);
        const y = Math.round(Math.random() * ch * (topBias * 0.6 + 0.2));
        pts.push({ x, y, value: Math.round(Math.random() * 8) + 1 });
      }
    });
    heatmapInstance.setData({ max: 50, data: pts });
  } catch (e) {
    console.warn('Heatmap render failed', e);
  }
}

async function loadHeatmapLibrary(): Promise<void> {
  if ((window as any).h337) return;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/heatmap.js/2.0.5/heatmap.min.js';
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

function getMockFor(url:string) {
  if (url.includes('/summary')) return { totalGames:42, wins:27, losses:15, winRate:64, avgWallBounces:3.6, avgTimeTop:55 };
  if (url.includes('/history')) return [ { matchId:'m1', date:new Date().toISOString(), opponents:[{id:'u2',name:'Alice'},{id:'u3',name:'Bob'}], result:'win', score:'3-1' }, { matchId:'m2', date:new Date(Date.now()-86400000).toISOString(), opponents:[{id:'u4',name:'Eve'}], result:'loss', score:'2-3' } ];
  if (url.includes('/friends-summary')) return [ { friendId:'u2', friendName:'Alice', wins:3, losses:1, timeTop:60, timeBottom:40 }, { friendId:'u3', friendName:'Bob', wins:1, losses:2, timeTop:45, timeBottom:55 } ];
  if (url.includes('/match/')) return { matchId:'m1', duration:180, players:[ { id:'u1', name:'You', wallBounces:4, timeTop:110, timeBottom:70, score:'3' }, { id:'u2', name:'Alice', wallBounces:2, timeTop:70, timeBottom:110, score:'1' } ] };
  return null;
}

export function attachStatsIfViewPresent() {
  const mh = document.getElementById('match-history');
  if (mh) {
    // avoid double-initialization if already attached
    const container = mh.closest('#content-inner') || mh;
    if ((container as HTMLElement).dataset && (container as HTMLElement).dataset.statsAttached === '1') return;
    (container as HTMLElement).dataset.statsAttached = '1';
    initStatsView().catch(err => console.error('initStatsView', err));
    renderAIDifficultyChart();
  }
}

