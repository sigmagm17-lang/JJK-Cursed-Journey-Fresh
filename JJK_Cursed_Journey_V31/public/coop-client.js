'use strict';
// Cooperative story room UI. All privileged operations require server-side ADMIN_KEY.
(() => {
const $=id=>document.getElementById(id);
let socket=null,room=null,me=null,bridge=null,admin=false,session=false,updates=[],currentMorph={},connecting=false,displayName="SORCERER",weatherRendered="",lastEvent="";
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isActive=()=>session&&socket?.readyState===1&&room;
const send=data=>{if(socket?.readyState===1){socket.send(JSON.stringify(data));return true;}return false;};
function flash(message){$('coopMessage').textContent=message;$('coopMessage').hidden=false;}
function clearFlash(){$('coopMessage').hidden=true;}
const hideIntro=()=>{$('intro').hidden=true;};
const weatherFX={cursed_rain:'┃',blood_moon:'✦',thunderstorm:'ϟ',snowfall:'❄',meteor_shower:'☄',solar_eclipse:'✦',sakura_bloom:'✿',golden_hour:'✦',soul_fog:'◌',domain_storm:'✧'};
function renderMayhem(){
 const weather=room?.weather,ev=room?.event,boost=room?.boosts?.xp;
 const active=Boolean(weather||ev||boost);
 $('mayhemStatus').hidden=!session||!active;
 $('mayhemBanner').hidden=!session||!active;
 if(!session||!active){$('mayhemWeatherFX').hidden=true;weatherRendered='';return;}
 $('mayhemTitle').textContent=(ev?ev.icon+' '+ev.name:weather?weather.icon+' '+weather.name:'🔥 XP FRENZY');
 $('mayhemDetail').textContent=weather?.detail|| (ev?'Server-wide party event':(boost?boost.factor+'× XP IN THIS ROOM':''));
 const until=Math.max(weather?.until||0,ev?.until||0,boost?.until||0);
 const seconds=Math.max(0,Math.ceil((until-Date.now())/1000));
 $('mayhemTimer').textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' LEFT';
 const kind=weather?.id||'';
 if(weatherRendered!==kind){weatherRendered=kind;const fx=$('mayhemWeatherFX');fx.hidden=!kind;fx.dataset.weather=kind;
   if(kind){fx.innerHTML=Array.from({length:28},(_,i)=>`<i style="--left:${(i*37+13)%100}%;--delay:-${(i*11)%50/10}s;--duration:${2+(i%5)*.7}s">${weatherFX[kind]||'✦'}</i>`).join('');}
   else fx.innerHTML='';
 }
}
function showRoster(){const status=$('coopStatus');status.hidden=!session;$('coopRoomOpen').hidden=!session;if(!room)return;
 $('coopCode').textContent=room.code;$('roomCodeDisplay').textContent=room.code;$('coopPlayers').textContent=`${room.players.length}/${room.capacity} PLAYERS`;
 $('coopLevel').textContent='PARTY LV '+room.level;
 $('coopDifficulty').textContent=`XP x${room.xpMultiplier.toFixed(1)}`+(room.boosts?.xp?' · '+room.boosts.xp.factor+'x XP EVENT':'')+(room.boosts?.coins?' · '+room.boosts.coins.factor+'x COINS':'')+(room.weather?' · '+room.weather.icon+' WEATHER':'');renderMayhem();
 $('coopRoomList').innerHTML=room.players.map(p=>`<div><b>${esc(p.name)}</b> <span>LV ${room.level} · ${esc(p.hero)} · ${p.zone===undefined?'?':esc(['High','Streets','Shibuya','Subway','Forest','Ruins','Shrine'][p.zone]||'Map')}</span></div>`).join('');
}
function handle(event){let m;try{m=JSON.parse(event.data);}catch{return;}if(!m||typeof m!=='object')return;
 if(m.type==='coopWelcome'){me=m.id;return;}
 if(m.type==='coopError'){connecting=false;flash(m.message||'Something went wrong');if($('adminSheet')&&!$('adminSheet').hidden&&$('adminFeedback'))$('adminFeedback').textContent=m.message||'Action failed';return;}
 if(m.type==='coopJoined'){session=true;room=m.room;me=m.id;connecting=false;clearFlash();hideIntro();$('coopStatus').hidden=false;$('coopAdminOpen').hidden=false;showRoster();bridge?.onJoined?.(room,me);send({type:'coopName',name:displayName});return;}
 if(m.type==='coopState'){room=m.room;showRoster();bridge?.onRoom?.(room,me);return;}
 if(m.type==='coopPosition'){bridge?.onPosition?.(m,me);return;}
 if(m.type==='coopAward'){bridge?.onAward?.(m);return;}
 if(m.type==='coopBossStart'){bridge?.onBossStart?.(m.boss);return;}
 if(m.type==='coopBossState'||m.type==='coopBossHit'){bridge?.onBossState?.(m.boss,m);return;}
 if(m.type==='coopBossWon'){bridge?.onBossWon?.(m);return;}
 if(m.type==='coopQuestProgress'){bridge?.onQuestProgress?.(m);return;}
 if(m.type==='coopQuestClaimed'){bridge?.onQuestClaimed?.();return;}
 if(m.type==='coopAdminOK'){admin=true;$('coopAdminOpen').hidden=false;$('adminAuth').hidden=true;$('adminTools').hidden=false;$('adminUnlock').value='';$('adminFeedback').textContent='ADMIN UNLOCKED · 13 POWERS + MAYHEM V31';flash('Admin access granted for this session');return;}
 if(m.type==='coopAnnouncement'){bridge?.onAnnouncement?.(m.message);if(admin&&$('adminSheet')&&!$('adminSheet').hidden){$('adminFeedback').textContent=m.message;}return;}
 if(m.type==='coopTeleport'){bridge?.onTeleport?.(m.zone);return;}
 if(m.type==='coopRestore'){bridge?.onRestore?.(m.kind);return;}
 if(m.type==='coopBossForm'){bridge?.onBossForm?.(m.targets||[],m.hero,m.until,me);return;}
 if(m.type==='coopBossFormEnd'){bridge?.onBossFormEnd?.(m.targets||[],me);return;}
 if(m.type==='coopMorph'){for(const id of m.targets||[])currentMorph[id]={hero:m.hero,until:m.until};bridge?.onMorph?.(m.targets,m.hero,m.until,me);return;}
 if(m.type==='coopMorphEnd'){for(const id of m.targets||[])delete currentMorph[id];bridge?.onMorphEnd?.(m.targets||[],me);return;}
 if(m.type==='coopLeft'){cleanup(false);return;}
}
function cleanup(disconnected){const wasActive=session;session=false;room=null;me=null;admin=false;connecting=false;currentMorph={};$('coopStatus').hidden=true;$('coopRoomOpen').hidden=true;$('coopRoomSheet').hidden=true;$('adminSheet').hidden=true;$('coopAdminOpen').hidden=true;$('adminAuth').hidden=false;$('adminTools').hidden=true;
 renderMayhem();if(wasActive)bridge?.onLeft?.(disconnected);if(disconnected)flash('Room disconnected. Your solo save is safe. Create or join again.');}
function connection(mode,payload){if(connecting)return;connecting=true;clearFlash();const old=socket;if(old){old.onclose=null;old.close();}let proto=location.protocol==='https:'?'wss:':'ws:';try{socket=new WebSocket(proto+'//'+location.host+'/coop');}catch{connecting=false;return flash('WebSocket failed to open');}
 socket.onmessage=handle;socket.onopen=()=>{send({...payload,type:mode});};socket.onerror=()=>{if(!session)flash('Could not connect to the co-op server');};socket.onclose=()=>{if(socket===old)return;cleanup(true);};}
function openAdmin() {if(!isActive()){flash('Start a friend room first, or use Create with 1 player for admin solo mode');return;}$('adminSheet').hidden=false;$('adminAuth').hidden=admin;$('adminTools').hidden=!admin;}
function setup(){
 $('createRoom').onclick=()=>{const code=$('createCode').value.trim().toUpperCase(),capacity=Number($('partySize').value),name=$('playerName').value.trim();if(code&&!/^[A-Z0-9]{4,12}$/.test(code))return flash('Room code needs 4–12 letters or numbers');connection('coopCreate',{code,capacity});displayName=name||'SORCERER';};
 $('joinRoom').onclick=()=>{const code=$('joinCode').value.trim().toUpperCase(),name=$('playerName').value.trim();if(!/^[A-Z0-9]{4,12}$/.test(code))return flash('Enter a 4–12 character room code');connection('coopJoin',{code});displayName=name||'SORCERER';};
 $('coopRoomOpen').onclick=()=>{$('coopRoomSheet').hidden=false;};$('roomClose').onclick=()=>{$('coopRoomSheet').hidden=true;};
 $('roomCopy').onclick=()=>{if(navigator.clipboard?.writeText)navigator.clipboard.writeText(room?.code||'').then(()=>{const o=$('roomCopy');o.textContent='COPIED!';setTimeout(()=>o.textContent='COPY CODE',1300);}).catch(()=>flash('Select and copy the code manually'));else flash('Select and copy the code manually');};
 $('roomLeave').onclick=()=>{send({type:'coopLeave'});socket?.close();cleanup(false);};
 $('coopAdminOpen').onclick=openAdmin;$('adminClose').onclick=()=>{$('adminSheet').hidden=true;};
 $('adminLogin').onclick=()=>{const key=$('adminUnlock').value;send({type:'coopAuth',key});};
 $('adminXp').onclick=()=>send({type:'coopAdminAction',action:'xp',amount:Number($('adminXpAmount').value)});
 $('adminBoss').onclick=()=>send({type:'coopAdminAction',action:'boss',boss:$('adminBossChoice').value,zone:Number($('adminBossZone').value)});
 $('adminMorph').onclick=()=>send({type:'coopAdminAction',action:'morph',hero:$('adminCharacter').value,scope:$('adminScope').value,duration:Number($('adminDuration').value)});
 const admin=(action,values={})=>{if(send({type:'coopAdminAction',action,...values}))$('adminFeedback').textContent='SENDING '+action.toUpperCase()+'…';};
 $('adminCoins').onclick=()=>admin('coins',{amount:Number($('adminCoinAmount').value)});
 $('adminLevel').onclick=()=>admin('level',{level:Number($('adminPartyLevel').value)});
 $('adminTeleport').onclick=()=>admin('teleport',{zone:Number($('adminTeleportZone').value)});
 $('adminHeal').onclick=()=>admin('heal');
 $('adminEnergy').onclick=()=>admin('energy');
 $('adminXpBoost').onclick=()=>admin('xpBoost',{factor:Number($('adminXpFactor').value),duration:Number($('adminXpDuration').value)});
 $('adminCoinBoost').onclick=()=>admin('coinBoost',{factor:Number($('adminCoinFactor').value),duration:Number($('adminCoinDuration').value)});
 $('adminBossHeal').onclick=()=>admin('bossHeal');
 $('adminBossSmite').onclick=()=>admin('bossSmite',{percent:Number($('adminSmite').value)});
 $('adminAnnounce').onclick=()=>admin('announce',{message:$('adminAnnouncement').value});
 $('adminQuick30').onclick=()=>admin('xpBoost',{factor:30,duration:300});
 $('adminWeatherStart').onclick=()=>admin('weather',{weather:$('adminWeather').value,duration:Number($('adminWeatherDuration').value)});
 $('adminWeatherClear').onclick=()=>admin('weatherClear');
 $('adminBossForm').onclick=()=>admin('bossForm',{hero:$('adminFormBoss').value,scope:$('adminFormScope').value,duration:Number($('adminFormDuration').value)});
 $('adminEventStart').onclick=()=>admin('event',{event:$('adminEventChoice').value,duration:Number($('adminEventDuration').value)});
 $('adminClearMayhem').onclick=()=>admin('clearMayhem');
 $('mayhemStatus').onclick=()=>{if(admin)openAdmin();else flash('An admin launched a timed event for this room!');};
 setInterval(()=>{if(session)renderMayhem();},1000);

 document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='a'){e.preventDefault();openAdmin();}if(e.key==='Escape'){$('coopRoomSheet').hidden=true;$('adminSheet').hidden=true;}});
 $('coopRoomSheet').onclick=e=>{if(e.target===$('coopRoomSheet'))$('coopRoomSheet').hidden=true;};$('adminSheet').onclick=e=>{if(e.target===$('adminSheet'))$('adminSheet').hidden=true;};
}
window.JJKCoop={init(cb){bridge=cb;setup();},isActive,send,room:()=>room,me:()=>me,morphFor:id=>currentMorph[id],openAdmin};
})();
