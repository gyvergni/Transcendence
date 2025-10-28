import { API_BASE_URL } from '../utils/utilsApi.js';
import Chart from 'chart.js/auto';

// We'll read the temporary match id set on window.__openMatchId by the event handler

type Player = { id:string; name:string; wallBounces:number; timeTop:number; timeBottom:number; score?:string };
type MatchDetail = { matchId:string; duration:number; players:Player[] };
async function fetchJson(url:string) {
  try {
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } });
    if (!res.ok) throw new Error('Network');
    return await res.json();
  } catch (e) {
    console.warn('fetch failed', e);
    return null;
  }
}

export async function initMatchView() {
  const matchId = (window as any).__openMatchId as string | undefined;
  if (!matchId) return console.warn('No match id provided');
  const detail = (await fetchJson(API_BASE_URL + '/stats/match/' + matchId) || (window as any).__mockMatchDetail) as MatchDetail;

  // wall
  const labels = detail.players.map(p=>p.name);
  const wall = detail.players.map(p=>p.wallBounces);
  const top = detail.players.map(p=>p.timeTop);
  const bottom = detail.players.map(p=>p.timeBottom);

  const wctxEl = document.getElementById('detail-wall') as HTMLCanvasElement | null;
  if (wctxEl) {
    const wctx = wctxEl.getContext('2d')!;
    new Chart(wctx, { type:'bar', data:{ labels, datasets:[ { label:'Wall bounces', data:wall, backgroundColor:'rgba(124,58,237,0.8)' } ] }, options:{ responsive:true } });
  }

  const tctxEl = document.getElementById('detail-time') as HTMLCanvasElement | null;
  if (tctxEl) {
    const tctx = tctxEl.getContext('2d')!;
    new Chart(tctx, { type:'bar', data:{ labels, datasets:[ { label:'Time Top', data:top, backgroundColor:'rgba(34,197,94,0.8)' }, { label:'Time Bottom', data:bottom, backgroundColor:'rgba(245,158,11,0.8)' } ] }, options:{ responsive:true, scales:{ x:{ stacked:true }, y:{ stacked:true } } } });
  }

  const playersDiv = document.getElementById('detail-players')!;
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
}
