// Ball Battle API — Cloudflare Worker + D1
// Required binding: DB -> ball-battle-stats
// Required Worker secret: ADMIN_TOKEN (long random secret; never commit it)
// Public game origin: https://jalunden.github.io
const ORIGIN = 'https://jalunden.github.io';
const TYPES = new Set(['page_view','match_start','match_end']);
const safe = (s, max=48) => typeof s === 'string' ? s.slice(0,max).replace(/[^a-zA-Z0-9_:-]/g,'') : '';
const json = (data,status=200,headers={}) => new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
const cors = {'access-control-allow-origin':ORIGIN,'access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':'content-type','vary':'Origin'};
function sameSecret(a,b){
  if(!a||!b)return false;
  const e=new TextEncoder(),x=e.encode(a),y=e.encode(b);
  let d=x.length^y.length;
  for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);
  return d===0;
}
export default {
  async fetch(request,env){
    const url=new URL(request.url),origin=request.headers.get('origin');
    if(request.method==='OPTIONS' && url.pathname==='/event')
      return new Response(null,{status:204,headers:cors});
    if(url.pathname==='/event'){
      if(request.method!=='POST')return json({error:'method'},405,cors);
      if(origin!==ORIGIN)return json({error:'origin'},403,cors);
      if(Number(request.headers.get('content-length')||0)>2048)return json({error:'size'},413,cors);
      let body;
      try{body=await request.json()}catch{return json({error:'json'},400,cors)}
      const type=safe(body?.type,24),id=safe(body?.id,64);
      if(!TYPES.has(type)||!(/^[a-f0-9-]{36}$/.test(id)))return json({error:'event'},400,cors);
      const world=safe(body.world),season=safe(body.season),ball=safe(body.ball);
      const outcome=type==='match_end'&&['win','loss','draw'].includes(body.outcome)?body.outcome:'';
      try{
        await env.DB.prepare('INSERT OR IGNORE INTO game_events (id,event_type,world,season,ball,outcome) VALUES (?,?,?,?,?,?)')
          .bind(id,type,world,season,ball,outcome).run();
        return json({ok:true},200,cors);
      }catch{return json({error:'database'},503,cors)}
    }
    if(url.pathname==='/stats'){
      if(request.method!=='GET')return json({error:'method'},405);
      if(!env.ADMIN_TOKEN)return json({error:'admin token not configured'},503);
      const provided=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
      if(!sameSecret(provided,env.ADMIN_TOKEN))return json({error:'unauthorized'},401);
      try{
        const [totals,days,worlds,balls,seasons]=await Promise.all([
          env.DB.prepare("SELECT SUM(event_type='page_view') AS views, SUM(event_type='match_start') AS starts, SUM(event_type='match_end') AS finished, SUM(outcome='win') AS wins, SUM(outcome='loss') AS losses, SUM(outcome='draw') AS draws FROM game_events").first(),
          env.DB.prepare("SELECT substr(created_at,1,10) AS day, SUM(event_type='page_view') AS views, SUM(event_type='match_start') AS starts, SUM(event_type='match_end') AS finished FROM game_events WHERE created_at >= datetime('now','-29 days') GROUP BY day ORDER BY day").all(),
          env.DB.prepare("SELECT world AS name, COUNT(*) AS count FROM game_events WHERE event_type='match_start' AND world<>'' GROUP BY world ORDER BY count DESC LIMIT 12").all(),
          env.DB.prepare("SELECT ball AS name, COUNT(*) AS count FROM game_events WHERE event_type='match_start' AND ball<>'' GROUP BY ball ORDER BY count DESC LIMIT 12").all(),
          env.DB.prepare("SELECT season AS name, COUNT(*) AS count FROM game_events WHERE event_type='match_start' AND season<>'' GROUP BY season ORDER BY count DESC LIMIT 12").all()
        ]);
        return json({totals,days:days.results,worlds:worlds.results,balls:balls.results,seasons:seasons.results});
      }catch{return json({error:'database'},503)}
    }
    return json({service:'Ball Battle API',status:'ready'});
  }
};
