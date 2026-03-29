import { useState, useEffect, useCallback } from "react";

// ── 釣り場データ ──────────────────────────────────────────
// windFacing: 釣り場が開いている方角（その方向からの風・波が直撃する）
const SPOTS = [
  // ── 横浜・川崎 ────────────────────────────────────────
  { id:1,  name:"本牧海釣り施設",          lat:35.4180,lng:139.6640,area:"横浜・本牧",      type:["桟橋"],           fee:"有料",parking:true, toilet:true, windFacing:135,fish:["アジ","クロダイ","シーバス","カレイ","サバ"],         season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:2,  name:"大黒海釣り公園",           lat:35.4660,lng:139.6580,area:"横浜・大黒",      type:["桟橋"],           fee:"有料",parking:true, toilet:true, windFacing:90, fish:["アジ","クロダイ","シーバス","カレイ","サバ"],         season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:3,  name:"海の公園（金沢区）",       lat:35.3480,lng:139.6400,area:"横浜・金沢",      type:["サーフ","堤防"],   fee:"無料",parking:true, toilet:true, windFacing:90, fish:["シロギス","ハゼ","アジ","シーバス","カレイ"],       season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  // ── 横須賀 ────────────────────────────────────────────
  { id:4,  name:"走水港",                   lat:35.2680,lng:139.7340,area:"横須賀・走水",    type:["漁港","堤防"],     fee:"無料",parking:true, toilet:false,windFacing:45, fish:["アジ","メバル","カサゴ","クロダイ","アオリイカ"],   season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:5,  name:"うみかぜ公園",             lat:35.2850,lng:139.6900,area:"横須賀",          type:["堤防"],           fee:"無料",parking:true, toilet:true, windFacing:90, fish:["アジ","クロダイ","シーバス","カレイ","サバ"],         season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:6,  name:"観音崎公園",               lat:35.2790,lng:139.7440,area:"横須賀・観音崎",  type:["磯","堤防"],       fee:"無料",parking:true, toilet:true, windFacing:90, fish:["メバル","カサゴ","アオリイカ","クロダイ","アジ"],   season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  // ── 三浦半島（内湾） ──────────────────────────────────
  { id:7,  name:"長井港",                   lat:35.2240,lng:139.6300,area:"横須賀・長井",    type:["漁港","堤防"],     fee:"無料",parking:true, toilet:false,windFacing:270,fish:["アジ","クロダイ","メバル","アオリイカ","カサゴ"],   season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:8,  name:"宮川港",                   lat:35.1590,lng:139.6210,area:"三浦・宮川",      type:["漁港"],           fee:"無料",parking:true, toilet:false,windFacing:180,fish:["アジ","クロダイ","アオリイカ","メバル","サバ"],       season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  // ── 三浦半島先端 ──────────────────────────────────────
  { id:9,  name:"剣崎（立石海岸）",         lat:35.1580,lng:139.6850,area:"三浦・剣崎",      type:["磯"],             fee:"無料",parking:true, toilet:false,windFacing:135,fish:["メバル","カサゴ","アオリイカ","クロダイ","ヒラメ"],   season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:10, name:"三崎港",                   lat:35.1570,lng:139.6120,area:"三浦・三崎",      type:["漁港","堤防"],     fee:"無料",parking:true, toilet:true, windFacing:180,fish:["アジ","クロダイ","アオリイカ","サバ","ワカシ"],     season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:11, name:"城ヶ島",                   lat:35.1360,lng:139.6140,area:"三浦・城ヶ島",    type:["磯","堤防"],       fee:"無料",parking:true, toilet:true, windFacing:180,fish:["メバル","カサゴ","アオリイカ","クロダイ","ヒラメ"],   season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:12, name:"荒崎公園",                 lat:35.1750,lng:139.5990,area:"三浦・荒崎",      type:["磯"],             fee:"無料",parking:true, toilet:true, windFacing:225,fish:["メバル","カサゴ","アオリイカ","クロダイ"],             season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  // ── 湘南 ──────────────────────────────────────────────
  { id:13, name:"江の島（湘南港）",         lat:35.2940,lng:139.4790,area:"藤沢・江の島",    type:["堤防","漁港"],     fee:"無料",parking:true, toilet:true, windFacing:180,fish:["アジ","クロダイ","シーバス","アオリイカ","サバ"],   season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:14, name:"片瀬漁港",                 lat:35.3060,lng:139.4870,area:"藤沢・片瀬",      type:["漁港","堤防"],     fee:"無料",parking:true, toilet:false,windFacing:180,fish:["アジ","シロギス","ハゼ","シーバス","クロダイ"],       season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:15, name:"腰越漁港",                 lat:35.3060,lng:139.5060,area:"鎌倉・腰越",      type:["漁港","堤防"],     fee:"無料",parking:true, toilet:false,windFacing:180,fish:["アジ","クロダイ","メバル","カサゴ","サバ"],           season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:16, name:"茅ヶ崎ヘッドランド",       lat:35.3210,lng:139.4200,area:"茅ヶ崎",          type:["サーフ","堤防"],   fee:"無料",parking:true, toilet:true, windFacing:180,fish:["シロギス","ヒラメ","マゴチ","シーバス","アジ"],       season:[4,5,6,7,8,9,10,11] },
  { id:17, name:"平塚新港",                 lat:35.3210,lng:139.3540,area:"平塚",            type:["堤防"],           fee:"無料",parking:true, toilet:true, windFacing:180,fish:["アジ","クロダイ","シーバス","サバ","ヒラメ"],         season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:18, name:"相模川河口（茅ヶ崎側）",   lat:35.3280,lng:139.3880,area:"茅ヶ崎・相模川",  type:["河口","ルアー"],   fee:"無料",parking:true, toilet:false,windFacing:180,fish:["シーバス","クロダイ","ヒラメ","マゴチ"],               season:[4,5,6,7,8,9,10,11] },
  // ── 西湘 ──────────────────────────────────────────────
  { id:19, name:"大磯港",                   lat:35.3050,lng:139.3150,area:"大磯",            type:["漁港","堤防"],     fee:"無料",parking:true, toilet:true, windFacing:180,fish:["アジ","クロダイ","サバ","メバル","ヒラメ"],           season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:20, name:"二宮海岸（国府津）",       lat:35.2980,lng:139.2450,area:"二宮・国府津",    type:["サーフ"],         fee:"無料",parking:true, toilet:false,windFacing:180,fish:["シロギス","ヒラメ","マゴチ","シーバス"],               season:[5,6,7,8,9,10] },
  { id:21, name:"早川港（小田原）",         lat:35.2670,lng:139.1540,area:"小田原・早川",    type:["漁港","堤防"],     fee:"無料",parking:true, toilet:true, windFacing:225,fish:["アジ","クロダイ","サバ","メバル","カサゴ"],           season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:22, name:"小田原漁港前",             lat:35.2590,lng:139.1580,area:"小田原",          type:["堤防"],           fee:"無料",parking:true, toilet:true, windFacing:225,fish:["アジ","クロダイ","サバ","アオリイカ","メバル"],       season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:23, name:"米神漁港",                 lat:35.2300,lng:139.1250,area:"小田原・米神",    type:["漁港"],           fee:"無料",parking:true, toilet:false,windFacing:225,fish:["アジ","メバル","カサゴ","アオリイカ","クロダイ"],     season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:24, name:"真鶴港",                   lat:35.1710,lng:139.1290,area:"真鶴",            type:["漁港","磯","堤防"],fee:"無料",parking:true, toilet:true, windFacing:225,fish:["メバル","カサゴ","アオリイカ","クロダイ","ヒラメ"],   season:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { id:25, name:"湯河原・吉浜漁港",         lat:35.1440,lng:139.0830,area:"湯河原",          type:["漁港","堤防"],     fee:"無料",parking:true, toilet:false,windFacing:270,fish:["アジ","メバル","カサゴ","アオリイカ","クロダイ"],     season:[1,2,3,4,5,6,7,8,9,10,11,12] },
];

const FISH_MASTER = [
  { name:"アジ",      emoji:"🐟", season:[4,5,6,7,8,9,10],             tempMin:15, tempMax:28 },
  { name:"クロダイ",  emoji:"🐠", season:[1,2,3,4,5,6,7,8,9,10,11,12], tempMin:8,  tempMax:30 },
  { name:"シーバス",  emoji:"🐋", season:[4,5,6,7,8,9,10,11],           tempMin:12, tempMax:28 },
  { name:"アオリイカ",emoji:"🦑", season:[3,4,5,9,10,11],               tempMin:15, tempMax:25 },
  { name:"メバル",    emoji:"🐟", season:[1,2,3,4,11,12],               tempMin:8,  tempMax:18 },
  { name:"カサゴ",    emoji:"🦐", season:[1,2,3,4,5,6,7,8,9,10,11,12], tempMin:5,  tempMax:25 },
  { name:"ヒラメ",    emoji:"🐡", season:[10,11,12,1,2,3,4],            tempMin:10, tempMax:20 },
  { name:"カレイ",    emoji:"🐡", season:[11,12,1,2,3],                 tempMin:8,  tempMax:16 },
  { name:"サバ",      emoji:"🐟", season:[6,7,8,9,10,11],               tempMin:18, tempMax:28 },
  { name:"シロギス",  emoji:"🐟", season:[5,6,7,8,9,10],                tempMin:18, tempMax:28 },
  { name:"マゴチ",    emoji:"🐡", season:[5,6,7,8,9,10],                tempMin:18, tempMax:28 },
  { name:"ハゼ",      emoji:"🐟", season:[7,8,9,10],                    tempMin:20, tempMax:30 },
  { name:"ワカシ",    emoji:"🐠", season:[7,8,9,10,11],                 tempMin:18, tempMax:28 },
];

// ── ユーティリティ ────────────────────────────────────────
function calcDist(lat1,lng1,lat2,lng2){
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function distToTime(km){
  const mins = Math.round(km/25*60);
  return mins < 60 ? `約${mins}分` : `約${Math.floor(mins/60)}時間${mins%60>0?mins%60+'分':""}`;
}

// 月齢計算（Julian Date基準）
function calcLunarAge(date){
  const JD=date.getTime()/86400000+2440587.5;
  const KNOWN_NEW_MOON=2451550.259; // 2000年1月6日 18:14 UTC の新月
  const CYCLE=29.530589;
  let age=(JD-KNOWN_NEW_MOON)%CYCLE;
  return age<0?age+CYCLE:age;
}

// 潮汐計算（横浜港天文計算）
function generateTide(date){
  const CYCLE=29.530589;
  const age=calcLunarAge(date);

  const distFromSyzygy=Math.min(age,Math.abs(age-CYCLE/2),CYCLE-age);
  const isBig=distFromSyzygy<=1.5;
  const name=distFromSyzygy<=1.5?"大潮":distFromSyzygy<=4.0?"中潮":distFromSyzygy<=6.0?"小潮":"中潮";

  // 振幅（横浜港: 大潮±85cm / 小潮±40cm）
  const phaseFactor=0.5*(1+Math.cos(age/CYCLE*4*Math.PI));
  const amp=40+45*phaseFactor;

  // 月の南中時刻
  const lunarTransit=(12+(age/CYCLE)*24)%24;
  // 横浜港の高潮間隔（HWI）: 月南中から約5.5時間後が満潮
  const firstHigh=(lunarTransit+5.5)%24;

  // M2分潮（半日周期 12.42h）+ K1分潮（日周期 23.93h）で潮位計算
  const MSL=140; // 平均水面 cm（東京湾基準面上）
  const pts=Array.from({length:25},(_,h)=>({
    hour:h,
    level:Math.max(5,Math.round(
      MSL
      +amp*Math.cos(2*Math.PI*(h-firstHigh)/12.4206)
      +amp*0.18*Math.cos(2*Math.PI*(h-lunarTransit)/23.9345)
    ))
  }));

  const high=pts.reduce((a,b)=>a.level>b.level?a:b);
  const low=pts.reduce((a,b)=>a.level<b.level?a:b);
  return{name,isBig,pts,high,low,score:isBig?5:name==="中潮"?4:2};
}

// ベスト釣り時間帯（朝夕マズメ × 潮汐）
function calcBestHours(tide, month){
  const sr=[7,6,6,5,5,4,5,5,5,6,6,7][month-1]; // 日の出（神奈川概算）
  const ss=[17,17,18,18,19,19,19,18,18,17,17,16][month-1]; // 日の入り
  const w=h=>((h%24)+24)%24;
  return [
    {start:w(sr-1), end:w(sr+1), label:"朝マズメ",  mark:"🌅", score:2},
    {start:w(ss-1), end:w(ss+1), label:"夕マズメ",  mark:"🌆", score:2},
    {start:w(tide.high.hour-2), end:w(tide.high.hour+1), label:"満潮前後", mark:"🌊", score:tide.isBig?3:2},
    {start:w(tide.low.hour-2),  end:w(tide.low.hour+1),  label:"干潮前後", mark:"🌊", score:1},
  ].sort((a,b)=>b.score-a.score).slice(0,3);
}

// 風向き × 釣り場の向きの相性判定
function windShelterInfo(windDeg, windSpeed, windFacing){
  if(windFacing==null||windSpeed<2)return{ok:true,label:""};
  const diff=Math.abs(((windDeg-windFacing+180)%360)-180);
  const exposed=diff<70;
  if(!exposed)return{ok:true, label:"追い風"};
  if(windSpeed<4)return{ok:true, label:""};
  if(windSpeed<7)return{ok:false,label:"向かい風注意"};
  return{ok:false,label:"波高し注意"};
}

function calcFishScore(spot,month,temp){
  let hit=0;
  spot.fish.forEach(f=>{
    const m=FISH_MASTER.find(x=>x.name===f); if(!m)return;
    if(m.season.includes(month))hit+=2;
    if(temp>=m.tempMin&&temp<=m.tempMax)hit+=1;
  });
  return Math.min(5,Math.round(hit/spot.fish.length*2));
}

function calcFishScoreReason(spot,month,temp){
  const reasons=[];
  const inSeason=spot.fish.filter(f=>{
    const m=FISH_MASTER.find(x=>x.name===f);
    return m&&m.season.includes(month);
  });
  if(inSeason.length>0) reasons.push(`${inSeason.slice(0,2).join("・")}が旬`);
  if(temp>=15&&temp<=25) reasons.push("水温が適水温帯");
  else if(temp<15) reasons.push("水温やや低め");
  else reasons.push("水温高め・魚が沖へ");
  return reasons.join(" / ");
}

function windDir(deg){
  const dirs=["北","北東","東","南東","南","南西","西","北西"];
  return dirs[Math.round(deg/45)%8];
}

function dayScore(tide,weather){
  let s=tide.score;
  if(weather){
    if(weather.windspeed<3)s=Math.min(5,s+1);
    else if(weather.windspeed>6)s=Math.max(1,s-1);
    if(weather.precipitation>2)s=Math.max(1,s-1);
  }
  return s;
}

function scoreLabel(s){
  if(s>=5)return{text:"最高の日",color:"#ff6b00"};
  if(s>=4)return{text:"狙い目",color:"#ffaa00"};
  if(s>=3)return{text:"まずまず",color:"#88ff44"};
  return{text:"難しい日",color:"#556644"};
}

// 天気コード→絵文字
function weatherEmoji(code){
  if(code===0)return"☀️";
  if(code<=2)return"🌤️";
  if(code===3)return"☁️";
  if(code<=48)return"🌫️";
  if(code<=67)return"🌧️";
  if(code<=77)return"❄️";
  if(code<=82)return"🌦️";
  return"⛈️";
}

// ── OSM釣具屋・飲食店取得 ─────────────────────────────────
async function fetchOSMPlaces(lat,lng,type){
  const r=0.05;
  let query="";
  if(type==="tackle"){
    query=`[out:json][timeout:10];(node["shop"="fishing"](${lat-r},${lng-r},${lat+r},${lng+r});node["name"~"釣具|つり具|フィッシング|キャスティング|上州屋",i](${lat-r},${lng-r},${lat+r},${lng+r}););out body 5;`;
  } else {
    query=`[out:json][timeout:10];(node["amenity"~"restaurant|cafe|fast_food"](${lat-r},${lng-r},${lat+r},${lng+r}););out body 8;`;
  }
  try{
    const res=await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    const data=await res.json();
    return (data.elements||[]).map(e=>({
      name:e.tags?.name||"名称不明",
      lat:e.lat, lng:e.lng,
      dist:calcDist(lat,lng,e.lat,e.lng),
      cuisine:e.tags?.cuisine||"",
      opening:e.tags?.opening_hours||"",
    })).sort((a,b)=>a.dist-b.dist).slice(0,type==="tackle"?3:4);
  }catch{return[];}
}

// ── サブコンポーネント ─────────────────────────────────────
function Dots({score,max=5,color="#ff6b00",size=8,radius="50%"}){
  return(
    <div style={{display:"flex",gap:3}}>
      {Array.from({length:max},(_,i)=>(
        <div key={i} style={{width:size,height:size,borderRadius:radius,background:i<score?color:"#1a2a18"}}/>
      ))}
    </div>
  );
}

function TideChart({data}){
  const W=300,H=72,pad=10;
  const maxL=Math.max(...data.pts.map(p=>p.level));
  const minL=Math.min(...data.pts.map(p=>p.level));
  const sx=(W-pad*2)/24, sy=(H-pad*2)/(maxL-minL);
  const pts=data.pts.map(p=>`${pad+p.hour*sx},${H-pad-(p.level-minL)*sy}`).join(" ");
  const area=`${pad},${H-pad} ${pts} ${pad+24*sx},${H-pad}`;
  const now=new Date().getHours();
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0088ff" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#0088ff" stopOpacity="0.05"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#tg)"/>
      <polyline points={pts} fill="none" stroke="#0088ff" strokeWidth="2" strokeLinecap="round"/>
      <line x1={pad+now*sx} y1={pad} x2={pad+now*sx} y2={H-pad} stroke="#ff6b00" strokeWidth="1.5" strokeDasharray="3,2"/>
      {[0,6,12,18,24].map(h=>(
        <text key={h} x={pad+h*sx} y={H-1} fontSize="8" fill="#334422" textAnchor="middle">{h}時</text>
      ))}
      <text x={pad+now*sx+3} y={pad+8} fontSize="7" fill="#ff6b00">今</text>
    </svg>
  );
}

// ── メイン ────────────────────────────────────────────────
const C={bg:"#050f04",card:"#0a1a08",border:"#1a3a18",text:"#eeffcc",muted:"#556644",accent:"#88ff44",orange:"#ff6b00"};

function HourlyDetail({hourly,marineHourly,dayIndex}){
  if(!hourly)return <div style={{fontSize:10,color:"#334422",padding:"8px 0"}}>気象データ取得中...</div>;
  const base=dayIndex*24;
  const nowH=new Date().getHours();
  const rows=Array.from({length:19},(_,i)=>i+4);
  return(
    <div style={{overflowY:"auto",maxHeight:280,marginTop:8,borderRadius:8,border:"1px solid #0f2a0d"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr style={{fontSize:9,color:"#445533",background:"#061204",position:"sticky",top:0}}>
            <td style={{padding:"5px 8px"}}>時刻</td>
            <td style={{padding:"5px 4px",textAlign:"center"}}>風向</td>
            <td style={{padding:"5px 6px"}}>風速</td>
            <td style={{padding:"5px 6px"}}>波高</td>
            <td style={{padding:"5px 6px"}}>雨mm</td>
          </tr>
        </thead>
        <tbody>
          {rows.map(h=>{
            const idx=base+h;
            const spd=hourly.windspeed[idx];
            const dir=hourly.winddir[idx];
            const rain=hourly.rain[idx];
            const wave=marineHourly?.wave?.[idx];
            const isNow=dayIndex===0&&h===nowH;
            const sc=spd>7?"#ff6644":spd>4?"#ffaa44":"#88ff44";
            const wc=wave==null?"#334422":wave>1.5?"#ff6644":wave>0.8?"#ffaa44":"#88ff44";
            return(
              <tr key={h} style={{background:isNow?"#0d2a10":"transparent",borderBottom:"1px solid #091808"}}>
                <td style={{padding:"5px 8px",fontSize:11,color:isNow?C.orange:"#556644",fontWeight:isNow?700:400}}>
                  {isNow?"▶ ":""}{h}:00
                </td>
                <td style={{padding:"5px 4px",textAlign:"center"}}>
                  <span style={{display:"inline-block",transform:`rotate(${dir}deg)`,fontSize:13,lineHeight:1,color:"#88aacc"}}>↑</span>
                </td>
                <td style={{padding:"5px 6px",fontFamily:"monospace",fontSize:12,color:sc,fontWeight:700}}>
                  {spd!=null?spd.toFixed(1):"--"}
                </td>
                <td style={{padding:"5px 6px",fontFamily:"monospace",fontSize:12,color:wc}}>
                  {wave!=null?`${wave.toFixed(1)}m`:"--"}
                </td>
                <td style={{padding:"5px 6px",fontFamily:"monospace",fontSize:12,color:rain>0?"#88aaff":"#223322"}}>
                  {rain>0?rain.toFixed(1):"–"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function App(){
  const today=new Date();
  const [location,setLocation]=useState(null);
  const [nearbySpots,setNearbySpots]=useState([]);
  const [sortOrder,setSortOrder]=useState("asc");
  const [selectedArea,setSelectedArea]=useState(null);
  const [selectedDay,setSelectedDay]=useState(0);
  const [weather7,setWeather7]=useState(null);
  const [openSpot,setOpenSpot]=useState(null);
  const [selectedFish,setSelectedFish]=useState(null);
  const [view,setView]=useState("home");
  const [reports,setReports]=useState([]);
  const [reportModal,setReportModal]=useState(null);
  const [reportFish,setReportFish]=useState("");
  const [reportNote,setReportNote]=useState("");
  const [tackle,setTackle]=useState([]);
  const [food,setFood]=useState([]);
  const [loadingNearby,setLoadingNearby]=useState(false);
  const [selectedSpotForNearby,setSelectedSpotForNearby]=useState(null);
  const [hourly,setHourly]=useState(null);
  const [marineHourly,setMarineHourly]=useState(null);
  const [showDetail,setShowDetail]=useState(false);

  // 7日分の日付
  const days=Array.from({length:7},(_,i)=>{
    const d=new Date(today); d.setDate(today.getDate()+i); return d;
  });
  const currentDay=days[selectedDay];
  const month=currentDay.getMonth()+1;
  const tideToday=generateTide(currentDay);

  // 現在地
  useEffect(()=>{
    navigator.geolocation?.getCurrentPosition(
      pos=>{
        const{latitude:lat,longitude:lng}=pos.coords;
        setLocation({lat,lng});
        const nearby=SPOTS.map(s=>({...s,dist:calcDist(lat,lng,s.lat,s.lng)})).filter(s=>s.dist<=100).sort((a,b)=>a.dist-b.dist);
        setNearbySpots(nearby.slice(0,15));
      },
      ()=>{
        const lat=35.4437,lng=139.6380; // 横浜（フォールバック）
        setLocation({lat,lng,fallback:true});
        const nearby=SPOTS.map(s=>({...s,dist:calcDist(lat,lng,s.lat,s.lng)})).filter(s=>s.dist<=100).sort((a,b)=>a.dist-b.dist);
        setNearbySpots(nearby.slice(0,15));
      }
    );
  },[]);

  // 7日間天気
  useEffect(()=>{
    if(!location)return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&daily=temperature_2m_max,windspeed_10m_max,precipitation_sum,winddirection_10m_dominant,weathercode&current=temperature_2m,windspeed_10m,precipitation,winddirection_10m,weathercode&hourly=windspeed_10m,winddirection_10m,precipitation&timezone=Asia%2FTokyo&forecast_days=7`)
      .then(r=>r.json())
      .then(d=>{
        setWeather7({
          current:{
            temperature:Math.round(d.current.temperature_2m),
            windspeed:Math.round(d.current.windspeed_10m/3.6*10)/10,
            winddir:d.current.winddirection_10m,
            precipitation:d.current.precipitation,
            wcode:d.current.weathercode,
          },
          daily:d.daily.time.map((t,i)=>({
            date:t,
            temp:Math.round(d.daily.temperature_2m_max[i]),
            wind:Math.round(d.daily.windspeed_10m_max[i]/3.6*10)/10,
            winddir:d.daily.winddirection_10m_dominant[i],
            rain:d.daily.precipitation_sum[i],
            wcode:d.daily.weathercode[i],
          }))
        });
        setHourly({
          windspeed:d.hourly.windspeed_10m.map(v=>Math.round(v/3.6*10)/10),
          winddir:d.hourly.winddirection_10m,
          rain:d.hourly.precipitation,
        });
      })
      .catch(()=>{});
  },[location]);

  // 波高 hourly（Open-Meteo Marine）
  useEffect(()=>{
    if(!location)return;
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${location.lat}&longitude=${location.lng}&hourly=wave_height&timezone=Asia%2FTokyo&forecast_days=7`)
      .then(r=>r.json())
      .then(d=>{setMarineHourly({wave:d.hourly?.wave_height});})
      .catch(()=>{});
  },[location]);

  // 釣具屋・飲食店（選択した釣り場の近く）
  const loadNearby=useCallback(async(spot)=>{
    setLoadingNearby(true);
    setSelectedSpotForNearby(spot.id);
    const[t,f]=await Promise.all([fetchOSMPlaces(spot.lat,spot.lng,"tackle"),fetchOSMPlaces(spot.lat,spot.lng,"food")]);
    setTackle(t); setFood(f);
    setLoadingNearby(false);
  },[]);

  const w=weather7?.daily?.[selectedDay];
  const wCurrent=selectedDay===0?weather7?.current:null;
  const temp=wCurrent?.temperature??w?.temp??18;
  const wind=wCurrent?.windspeed??w?.wind??0;
  const windDeg=wCurrent?.winddir??w?.winddir??0;
  const rain=wCurrent?.precipitation??w?.rain??0;
  const windOk=wind<5, rainOk=rain<2;
  const tide=generateTide(currentDay);
  const totalScore=dayScore(tide,{windspeed:wind,precipitation:rain});
  const {text:scoreText,color:scoreColor}=scoreLabel(totalScore);

  const nearbyAreas=[...new Set(nearbySpots.map(s=>s.area))];
  const applyFilters=(spots)=>
    spots
      .filter(s=>!selectedArea||s.area===selectedArea)
      .filter(s=>!selectedFish||s.fish.includes(selectedFish))
      .sort((a,b)=>sortOrder==="asc"?a.dist-b.dist:b.dist-a.dist);
  const filteredSpots=applyFilters(nearbySpots);

  const addReport=(spotId)=>{
    if(!reportFish)return;
    setReports(p=>[...p,{spotId,fish:reportFish,note:reportNote,date:`${month}/${currentDay.getDate()}`,time:new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})}]);
    setReportModal(null); setReportFish(""); setReportNote("");
  };

  const dayNames=["日","月","火","水","木","金","土"];

  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"Hiragino Kaku Gothic ProN,Noto Sans JP,sans-serif",maxWidth:430,margin:"0 auto",paddingBottom:70}}>

      {/* ヘッダー */}
      <div style={{padding:"14px 16px 12px",borderBottom:`1px solid #0f2a0d`}}>
        <div style={{fontSize:10,color:"#335522",letterSpacing:"0.15em",marginBottom:6}}>KANAGAWA FISHING NAVI</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h1 style={{margin:0,fontSize:18,fontWeight:900}}>🎣 神奈川釣りナビ</h1>
          <div style={{fontSize:10,color:location?.fallback?"#ff8844":C.accent}}>
            {location?(location.fallback?"📍 横浜（推定）":"📍 現在地"):"📍 取得中..."}
          </div>
        </div>
      </div>

      {/* 7日カレンダー */}
      {(()=>{
        const scores=days.map((d,i)=>{
          const td=generateTide(d);
          const dw=weather7?.daily?.[i];
          return dayScore(td,dw?{windspeed:dw.wind,precipitation:dw.rain}:null);
        });
        const maxScore=Math.max(...scores);
        return(
          <div style={{padding:"10px 16px",borderBottom:`1px solid #0f2a0d`,overflowX:"auto"}}>
            <div style={{display:"flex",gap:6,minWidth:"max-content"}}>
              {days.map((d,i)=>{
                const td=generateTide(d);
                const dw=weather7?.daily?.[i];
                const ds=scores[i];
                const{color:dc}=scoreLabel(ds);
                const isSelected=selectedDay===i;
                const isBest=ds===maxScore&&maxScore>=3;
                const wcode=dw?.wcode??0;
                return(
                  <button key={i} onClick={()=>setSelectedDay(i)} style={{
                    display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                    padding:"8px 10px",
                    background:isBest&&!isSelected?"#1a2a08":isSelected?"#0f2a08":C.card,
                    border:`1px solid ${isSelected?"#3a6a28":isBest?"#2a5a18":C.border}`,
                    borderRadius:10,cursor:"pointer",minWidth:46,position:"relative",
                  }}>
                    {isBest&&(
                      <span style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",fontSize:14}}>🐟</span>
                    )}
                    <span style={{fontSize:9,color:isSelected?C.accent:C.muted,marginTop:isBest?4:0}}>{i===0?"今日":dayNames[d.getDay()]}</span>
                    <span style={{fontSize:14,fontWeight:700,color:isSelected?C.text:"#aaccaa"}}>{d.getDate()}</span>
                    <span style={{fontSize:14}}>{weatherEmoji(wcode)}</span>
                    <div style={{display:"flex",gap:2}}>
                      {Array.from({length:3},(_,j)=>(
                        <div key={j} style={{width:5,height:5,borderRadius:"50%",background:j<ds?dc:"#1a2a18"}}/>
                      ))}
                    </div>
                    <span style={{fontSize:8,color:dc,fontWeight:700}}>{td.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ナビ */}
      <div style={{display:"flex",borderBottom:`1px solid #0f2a0d`}}>
        {[["home","今日の状況"],["search","魚で探す"],["report","釣果"]].map(([id,label])=>(
          <button key={id} onClick={()=>setView(id)} style={{
            flex:1,padding:"10px 4px",background:view===id?"#0f2a08":"transparent",
            border:"none",borderBottom:`2px solid ${view===id?C.accent:"transparent"}`,
            color:view===id?C.accent:C.muted,fontSize:11,fontWeight:view===id?700:400,cursor:"pointer",
          }}>{label}</button>
        ))}
      </div>

      {/* ── HOME ── */}
      {view==="home"&&(
        <div style={{padding:"14px 16px 0"}}>

          {/* デイスコア */}
          <div style={{background:`linear-gradient(135deg,#0a1a08,#061204)`,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div>
                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>
                  {currentDay.getMonth()+1}月{currentDay.getDate()}日（{dayNames[currentDay.getDay()]}）の釣り指数
                </div>
                <div style={{fontSize:22,fontWeight:900,color:scoreColor}}>{scoreText}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:36,fontWeight:900,color:scoreColor,fontFamily:"monospace",lineHeight:1}}>{totalScore}</div>
                <div style={{fontSize:9,color:C.muted}}>/5</div>
              </div>
            </div>
            <div style={{fontSize:11,color:C.muted,borderTop:`1px solid #0f2a0d`,paddingTop:8}}>
              <span style={{color:"#334422"}}>根拠：</span>
              {[
                tide.isBig?"大潮（潮の動き◎）":tide.name==="中潮"?"中潮（潮の動き○）":"潮の動き小さめ",
                windOk?`風速${wind}m/s（穏やか）`:`風速${wind}m/s（強め・注意）`,
                rainOk?"雨少なく海が澄む":"雨後で濁りあり",
              ].join(" · ")}
            </div>
          </div>

          {/* 天気・風 */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:700}}>気象条件</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={()=>setShowDetail(p=>!p)} style={{background:showDetail?"#1a3a18":"#061204",border:`1px solid ${showDetail?C.accent:C.border}`,borderRadius:6,padding:"3px 8px",fontSize:10,color:showDetail?C.accent:C.muted,cursor:"pointer"}}>
                  {showDetail?"▲ 閉じる":"▼ 時間別"}
                </button>
                <span style={{fontSize:11,color:windOk&&rainOk?C.accent:"#ff8844",fontWeight:700}}>
                  {windOk&&rainOk?"✓ 釣り日和":"⚠ 要注意"}
                </span>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
              {[
                {label:"気温",value:`${temp}°C`,ok:true},
                {label:`風向き`,value:windDir(windDeg),ok:true},
                {label:"風速",value:`${wind}m/s`,ok:windOk},
                {label:"降水",value:`${rain}mm`,ok:rainOk},
              ].map(item=>(
                <div key={item.label} style={{background:"#061204",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:3}}>{item.label}</div>
                  <div style={{fontSize:13,fontWeight:700,color:item.ok?"#ccffaa":"#ff8844",fontFamily:"monospace"}}>{item.value}</div>
                </div>
              ))}
            </div>
            {!windOk&&<div style={{marginTop:8,fontSize:11,color:"#ff8844"}}>⚠ 風が強め。{windDir(windDeg)}風なので{windDir(windDeg)}向きポイントは要注意。</div>}
            {!rainOk&&<div style={{marginTop:4,fontSize:11,color:"#ff8844"}}>⚠ 雨後で濁りあり。シーバスは◎ キス・アジは△。</div>}
            {showDetail&&<HourlyDetail hourly={hourly} marineHourly={marineHourly} dayIndex={selectedDay}/>}
          </div>

          {/* 潮汐 */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{background:tide.isBig?"#1a4a08":"#0a2a18",border:`1px solid ${tide.isBig?"#4a8a28":"#2a4a38"}`,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:700,color:tide.isBig?C.accent:"#66aa88"}}>{tide.name}</span>
                <span style={{fontSize:11,color:C.muted}}>満潮{tide.high.hour}時 / 干潮{tide.low.hour}時</span>
              </div>
            </div>
            <TideChart data={tide}/>
            <div style={{marginTop:6,fontSize:9,color:"#223322"}}>
              <span style={{color:C.orange}}>│</span> 現在時刻 · 潮汐: 横浜港天文計算（M2・K1分潮）
            </div>
            {/* ベスト時間帯 */}
            <div style={{marginTop:10,borderTop:`1px solid #0f2a0d`,paddingTop:8}}>
              <div style={{fontSize:9,color:"#334422",marginBottom:5}}>ベスト時間帯</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {calcBestHours(tide,month).map((b,i)=>(
                  <div key={i} style={{background:"#061204",border:`1px solid #1a3a18`,borderRadius:6,padding:"4px 8px",fontSize:10}}>
                    {b.mark} {b.label}:{" "}
                    <span style={{color:C.accent,fontWeight:700}}>{b.start}〜{b.end}時</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 近くの釣り場 ソート・エリアフィルタ */}
          <div style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:10,color:"#334422",letterSpacing:"0.1em"}}>── 近くの釣り場（{filteredSpots.length}箇所）</div>
              <div style={{display:"flex",gap:4}}>
                {["asc","desc"].map(o=>(
                  <button key={o} onClick={()=>setSortOrder(o)} style={{
                    padding:"3px 10px",fontSize:10,cursor:"pointer",borderRadius:6,
                    background:sortOrder===o?"#0f2a08":"#061204",
                    border:`1px solid ${sortOrder===o?"#3a6a28":C.border}`,
                    color:sortOrder===o?C.accent:C.muted,
                  }}>{o==="asc"?"近い順":"遠い順"}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              <button onClick={()=>setSelectedArea(null)} style={{
                padding:"4px 10px",fontSize:10,cursor:"pointer",borderRadius:99,
                background:!selectedArea?"#0f2a08":"#061204",
                border:`1px solid ${!selectedArea?"#3a6a28":C.border}`,
                color:!selectedArea?C.accent:C.muted,
              }}>すべて</button>
              {nearbyAreas.map(a=>(
                <button key={a} onClick={()=>setSelectedArea(selectedArea===a?null:a)} style={{
                  padding:"4px 10px",fontSize:10,cursor:"pointer",borderRadius:99,
                  background:selectedArea===a?"#0f2a08":"#061204",
                  border:`1px solid ${selectedArea===a?"#3a6a28":C.border}`,
                  color:selectedArea===a?C.accent:C.muted,
                }}>{a}</button>
              ))}
            </div>
          </div>
          {filteredSpots.map((s,i)=>{
            const fs=calcFishScore(s,month,temp);
            const ws=windShelterInfo(windDeg,wind,s.windFacing);
            const spotScore=ws.ok?fs:Math.max(1,fs-1);
            const reason=calcFishScoreReason(s,month,temp);
            const spotReports=reports.filter(r=>r.spotId===s.id);
            const isOpen=openSpot===s.id;
            return(
              <div key={s.id} style={{background:C.card,border:`1px solid ${i===0?"#3a6a28":C.border}`,borderRadius:14,marginBottom:10,overflow:"hidden"}}>
                <div onClick={()=>setOpenSpot(isOpen?null:s.id)} style={{padding:"12px 14px",cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <span style={{fontSize:14,fontWeight:700}}>{s.name}</span>
                      <span style={{fontSize:10,color:C.muted,marginLeft:8}}>{s.area}</span>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:11,color:C.muted}}>{Math.round(s.dist)}km</div>
                      <div style={{fontSize:10,color:"#446633"}}>{distToTime(s.dist)}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <Dots score={spotScore} color={C.orange} size={10} radius="2px"/>
                      <div style={{fontSize:10,color:"#334422",marginTop:3}}>{reason}</div>
                      {ws.label&&<div style={{fontSize:10,color:ws.ok?C.accent:"#ff8844",marginTop:2}}>{ws.ok?"✓":"⚠"} {ws.label}</div>}
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {s.toilet&&<span style={{fontSize:10,color:"#446633"}}>🚻</span>}
                      {s.parking&&<span style={{fontSize:10,color:"#446633"}}>🅿</span>}
                      {spotReports.length>0&&<span style={{fontSize:10,color:C.accent}}>🎣{spotReports.length}</span>}
                      <span style={{fontSize:11,color:"#334422"}}>{isOpen?"▲":"▼"}</span>
                    </div>
                  </div>
                </div>

                {isOpen&&(
                  <div style={{borderTop:`1px solid #1a2a18`,padding:"12px 14px",background:"#061204"}}>
                    {/* 魚種タグ */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                      {s.fish.map(f=>(
                        <span key={f} style={{background:"#0a1a08",border:`1px solid #1a3a18`,borderRadius:99,padding:"2px 8px",fontSize:10,color:"#88bbff"}}>{f}</span>
                      ))}
                    </div>
                    {/* 詳細グリッド */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                      {[["💰",s.fee],["🅿️",s.parking?"あり":"なし"],["🚻",s.toilet?"あり":"なし"],["🎣",s.type.join("/")]].map(([l,v])=>(
                        <div key={l} style={{background:"#0a1a08",borderRadius:8,padding:"6px 10px",display:"flex",gap:6,alignItems:"center"}}>
                          <span style={{fontSize:14}}>{l}</span>
                          <span style={{fontSize:11,color:"#aaccaa"}}>{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* 釣果報告一覧 */}
                    {spotReports.length>0&&(
                      <div style={{marginBottom:10}}>
                        {spotReports.map((r,idx)=>(
                          <div key={idx} style={{fontSize:11,color:C.muted,padding:"4px 0",borderBottom:`1px solid #0a1a08`}}>
                            🎣 {r.date} {r.time} · {r.fish}{r.note?` · ${r.note}`:""}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 釣具屋・飲食店ロード */}
                    <button onClick={()=>loadNearby(s)} style={{width:"100%",padding:10,background:"#061204",border:`1px solid #1a3a18`,borderRadius:10,color:"#446633",fontSize:12,cursor:"pointer",marginBottom:8}}>
                      {loadingNearby&&selectedSpotForNearby===s.id?"読み込み中...":"🏪 近くの釣具屋・食事どころを探す"}
                    </button>

                    {selectedSpotForNearby===s.id&&!loadingNearby&&(
                      <div style={{marginBottom:10}}>
                        {tackle.length>0&&(
                          <div style={{marginBottom:8}}>
                            <div style={{fontSize:10,color:"#334422",marginBottom:5}}>🎣 近くの釣具屋</div>
                            {tackle.map((t,i)=>(
                              <div key={i} style={{background:"#0a1a08",borderRadius:8,padding:"8px 10px",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <div>
                                  <div style={{fontSize:12,color:C.text}}>{t.name}</div>
                                  <div style={{fontSize:10,color:C.muted}}>{distToTime(t.dist)} · {Math.round(t.dist*10)/10}km</div>
                                </div>
                                <button onClick={()=>window.open(`https://maps.google.com/?q=${t.lat},${t.lng}`,"_blank")} style={{padding:"4px 10px",background:"#0f2a08",border:`1px solid #3a6a28`,borderRadius:6,color:C.accent,fontSize:10,cursor:"pointer"}}>地図</button>
                              </div>
                            ))}
                            {tackle.length===0&&<div style={{fontSize:11,color:C.muted}}>近くに見つかりませんでした</div>}
                          </div>
                        )}
                        {food.length>0&&(
                          <div>
                            <div style={{fontSize:10,color:"#334422",marginBottom:5}}>🍜 近くの食事どころ</div>
                            {food.map((f,i)=>(
                              <div key={i} style={{background:"#0a1a08",borderRadius:8,padding:"8px 10px",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <div>
                                  <div style={{fontSize:12,color:C.text}}>{f.name}</div>
                                  <div style={{fontSize:10,color:C.muted}}>{distToTime(f.dist)} · {f.cuisine||"飲食店"}</div>
                                </div>
                                <button onClick={()=>window.open(`https://maps.google.com/?q=${f.lat},${f.lng}`,"_blank")} style={{padding:"4px 10px",background:"#0f2a08",border:`1px solid #3a6a28`,borderRadius:6,color:C.accent,fontSize:10,cursor:"pointer"}}>地図</button>
                              </div>
                            ))}
                          </div>
                        )}
                        {tackle.length===0&&food.length===0&&(
                          <div style={{fontSize:11,color:C.muted,textAlign:"center",padding:10}}>近くに情報が見つかりませんでした（OpenStreetMap）</div>
                        )}
                      </div>
                    )}

                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>window.open(`https://maps.google.com/?q=${s.lat},${s.lng}`,"_blank")} style={{flex:1,padding:10,background:"#0f2a08",border:`1px solid #3a6a28`,borderRadius:10,color:C.accent,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                        📍 Googleマップ
                      </button>
                      <button onClick={()=>setReportModal(s.id)} style={{flex:1,padding:10,background:"#2a1a08",border:`1px solid #6a3a18`,borderRadius:10,color:"#ff9944",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                        🎣 釣れた！
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── SEARCH ── */}
      {view==="search"&&(
        <div style={{padding:"14px 16px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:12,color:C.muted}}>釣りたい魚で絞り込み。<span style={{color:C.orange}}>●</span> = 今月が旬</div>
            <div style={{display:"flex",gap:4}}>
              {["asc","desc"].map(o=>(
                <button key={o} onClick={()=>setSortOrder(o)} style={{
                  padding:"3px 10px",fontSize:10,cursor:"pointer",borderRadius:6,
                  background:sortOrder===o?"#0f2a08":"#061204",
                  border:`1px solid ${sortOrder===o?"#3a6a28":C.border}`,
                  color:sortOrder===o?C.accent:C.muted,
                }}>{o==="asc"?"近い順":"遠い順"}</button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
            <button onClick={()=>setSelectedArea(null)} style={{
              padding:"4px 10px",fontSize:10,cursor:"pointer",borderRadius:99,
              background:!selectedArea?"#0f2a08":"#061204",
              border:`1px solid ${!selectedArea?"#3a6a28":C.border}`,
              color:!selectedArea?C.accent:C.muted,
            }}>すべて</button>
            {nearbyAreas.map(a=>(
              <button key={a} onClick={()=>setSelectedArea(selectedArea===a?null:a)} style={{
                padding:"4px 10px",fontSize:10,cursor:"pointer",borderRadius:99,
                background:selectedArea===a?"#0f2a08":"#061204",
                border:`1px solid ${selectedArea===a?"#3a6a28":C.border}`,
                color:selectedArea===a?C.accent:C.muted,
              }}>{a}</button>
            ))}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
            <button onClick={()=>setSelectedFish(null)} style={{padding:"6px 12px",background:!selectedFish?"#0f2a08":C.card,border:`1px solid ${!selectedFish?"#3a6a28":C.border}`,borderRadius:99,color:!selectedFish?C.accent:C.muted,fontSize:11,cursor:"pointer"}}>すべて</button>
            {FISH_MASTER.map(f=>{
              const inSeason=f.season.includes(month);
              const active=selectedFish===f.name;
              return(
                <button key={f.name} onClick={()=>setSelectedFish(active?null:f.name)} style={{padding:"6px 12px",background:active?"#0f2a08":C.card,border:`1px solid ${active?"#3a6a28":C.border}`,borderRadius:99,color:active?C.accent:inSeason?C.text:C.muted,fontSize:11,cursor:"pointer",position:"relative"}}>
                  {f.emoji} {f.name}
                  {inSeason&&<span style={{position:"absolute",top:-3,right:-3,width:7,height:7,borderRadius:"50%",background:C.orange}}/>}
                </button>
              );
            })}
          </div>
          {filteredSpots.map(s=>{
            const fs=calcFishScore(s,month,temp);
            const reason=calcFishScoreReason(s,month,temp);
            return(
              <div key={s.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:14,fontWeight:700}}>{s.name}</span>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:C.muted}}>{Math.round(s.dist)}km</div>
                    <div style={{fontSize:10,color:"#446633"}}>{distToTime(s.dist)}</div>
                  </div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                  {s.fish.filter(f=>!selectedFish||f===selectedFish).map(f=>(
                    <span key={f} style={{background:f===selectedFish?"#0f2a08":"#061204",border:`1px solid ${f===selectedFish?"#3a6a28":"#1a2a18"}`,borderRadius:99,padding:"2px 8px",fontSize:10,color:f===selectedFish?C.accent:"#88bbff"}}>{f}</span>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                  <div>
                    <Dots score={fs} color={C.orange} size={10} radius="2px"/>
                    <div style={{fontSize:10,color:"#334422",marginTop:3}}>{reason}</div>
                  </div>
                  <button onClick={()=>window.open(`https://maps.google.com/?q=${s.lat},${s.lng}`,"_blank")} style={{padding:"6px 12px",background:"#0f2a08",border:`1px solid #3a6a28`,borderRadius:8,color:C.accent,fontSize:11,cursor:"pointer"}}>📍 地図</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── REPORT ── */}
      {view==="report"&&(
        <div style={{padding:"14px 16px 0"}}>
          <div style={{fontSize:12,color:C.muted,marginBottom:14}}>みんなの釣果報告。データが積み上がるほど精度が上がる。</div>
          {reports.length===0?(
            <div style={{textAlign:"center",padding:30,color:"#1a3a18",fontSize:13}}>まだ報告がありません。<br/>釣り場を開いて「釣れた！」ボタンを押してね。</div>
          ):(
            reports.slice().reverse().map((r,i)=>{
              const spot=SPOTS.find(s=>s.id===r.spotId);
              return(
                <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:14,fontWeight:700}}>🎣 {r.fish}</span>
                    <span style={{fontSize:10,color:C.muted}}>{r.date} {r.time}</span>
                  </div>
                  <div style={{fontSize:12,color:C.muted}}>{spot?.name}</div>
                  {r.note&&<div style={{fontSize:11,color:"#445533",marginTop:4}}>{r.note}</div>}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 報告モーダル */}
      {reportModal&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"flex-end",zIndex:100}}>
          <div style={{background:"#0a1a08",border:`1px solid ${C.border}`,borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxWidth:430,margin:"0 auto"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:14}}>
              🎣 {SPOTS.find(s=>s.id===reportModal)?.name} で釣れた！
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              {FISH_MASTER.map(f=>(
                <button key={f.name} onClick={()=>setReportFish(f.name)} style={{padding:"6px 10px",background:reportFish===f.name?"#0f2a08":"#061204",border:`1px solid ${reportFish===f.name?"#3a6a28":"#1a2a18"}`,borderRadius:99,color:reportFish===f.name?C.accent:C.muted,fontSize:11,cursor:"pointer"}}>
                  {f.emoji} {f.name}
                </button>
              ))}
            </div>
            <input value={reportNote} onChange={e=>setReportNote(e.target.value)} placeholder="コメント（任意）例：サビキで10匹！" style={{width:"100%",padding:"10px 12px",background:"#061204",border:`1px solid #1a3a18`,borderRadius:10,color:C.text,fontSize:12,boxSizing:"border-box",marginBottom:12,outline:"none"}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setReportModal(null)} style={{flex:1,padding:12,background:"#061204",border:`1px solid #1a2a18`,borderRadius:10,color:C.muted,fontSize:13,cursor:"pointer"}}>キャンセル</button>
              <button onClick={()=>addReport(reportModal)} disabled={!reportFish} style={{flex:2,padding:12,background:reportFish?"#0f2a08":"#061204",border:`1px solid ${reportFish?"#3a6a28":"#1a2a18"}`,borderRadius:10,color:reportFish?C.accent:"#334422",fontSize:13,fontWeight:700,cursor:reportFish?"pointer":"default"}}>報告する</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
