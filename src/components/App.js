'use client'
import { useState, useEffect, useCallback } from "react";

const SAMPLE_SCENES = [
  { id: 1, season: 3, episode: 1, episodeTitle: "Gay Witch Hunt",
    lines: [
      { character: "MICHAEL", en: "Oscar is gay. He is a homosexual. He is a gay man.", ko: "오스카는 게이야. 그는 동성애자야. 그는 게이 남성이야." },
      { character: "DWIGHT", en: "I come from a long line of fighters. My maternal grandfather was the toughest guy I ever knew.", ko: "나는 전사의 집안 출신이야. 외할아버지는 내가 알던 가장 강인한 분이셨어." },
      { character: "JIM", en: "I'm back. And I will be fine. I think.", ko: "돌아왔어. 그리고 괜찮을 거야. 아마도." },
      { character: "MICHAEL", en: "Webster's Dictionary defines 'wedding' as the fusing of two metals with a hot torch.", ko: "웹스터 사전에 따르면 '결혼'이란 뜨거운 토치로 두 금속을 융합하는 거래요." },
    ],
  },
  { id: 2, season: 3, episode: 2, episodeTitle: "The Convention",
    lines: [
      { character: "MICHAEL", en: "I'm not going to apologize for who I am.", ko: "나는 내 자신에 대해 사과하지 않을 거야." },
      { character: "JIM", en: "The thing about the convention is, you think it's going to be fun, and then it's just... really not.", ko: "컨벤션 얘기인데, 재미있을 거라고 생각하잖아. 근데 그냥... 정말 아니야." },
      { character: "DWIGHT", en: "I am fast. To give you a reference point, I am somewhere between a snake and a mongoose. And a panther.", ko: "나는 빨라. 참고로 말하자면, 뱀과 몽구스 사이 어딘가야. 그리고 표범도." },
    ],
  },
  { id: 3, season: 3, episode: 23, episodeTitle: "The Job",
    lines: [
      { character: "JIM", en: "Four years ago, I was just a guy who had a crush on a girl who had a boyfriend.", ko: "4년 전, 저는 그냥 남자친구가 있는 여자를 짝사랑하는 남자였어요." },
      { character: "PAM", en: "I didn't watch the whole documentary. Just the pilot. And it's weird watching it again now.", ko: "다큐 전체를 다 보지는 않았어요. 지금 다시 보니 이상해요." },
      { character: "JIM", en: "Pam. I just... I need you to know. I'm in love with you.", ko: "팸. 나 그냥... 알아줬으면 해. 나 너 사랑해." },
    ],
  },
];

const CHARACTER_COLORS = {
  MICHAEL: "#9a9a9a", JIM: "#9a9a9a", PAM: "#9a9a9a",
  DWIGHT: "#9a9a9a", ANDY: "#9a9a9a", RYAN: "#9a9a9a",
  KELLY: "#9a9a9a", KEVIN: "#9a9a9a", DEFAULT: "#9a9a9a",
};
// Use single neutral accent for all characters, varied only by left-border subtlety
const CHAR_BORDER = {
  MICHAEL: "#e8e8f0", JIM: "#8ab4e8", PAM: "#e88a9e",
  DWIGHT: "#8ae8a0", ANDY: "#c08ae8", RYAN: "#e8b48a",
  KELLY: "#e88ac0", KEVIN: "#8ab4c0", DEFAULT: "#666",
};

const STORAGE_KEY = "office_scenes_v4";
const FAV_KEY = "office_favs_v3";
const STREAK_KEY = "office_streak";

const KNOWN_CHARS = new Set([
  'MICHAEL','JIM','PAM','DWIGHT','ANDY','RYAN','KELLY','TOBY','ANGELA','KEVIN',
  'OSCAR','MEREDITH','STANLEY','CREED','PHYLLIS','ROY','JAN','KAREN','JOSH',
  'DARRYL','ERIN','GABE','HOLLY','ROBERT','NELLIE','PETE','CLARK','DAVID',
  'DEANGELO','CHARLES','HUNTER','SCOTT',
]);

function epLabel(s) { return `S${String(s.season).padStart(2,'0')}E${String(s.episode).padStart(2,'0')}` }
function getDailyScene(scenes) { return scenes[Math.floor(Date.now()/86400000) % scenes.length] }

// ── Icons (all neutral white/gray, no emoji) ──────────────────────────────────
const BookmarkIcon = ({ filled, size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?"#e8e8f0":"none"} stroke={filled?"#e8e8f0":"#444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const StarIcon = ({ filled, size=14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?"#e8e8f0":"none"} stroke={filled?"#e8e8f0":"#555"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const CalendarIcon = ({ size=13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const GridIcon = ({ size=13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const CloseIcon = ({ size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const RefreshIcon = ({ size=12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

// ── Script parser ─────────────────────────────────────────────────────────────
function parseOfficeScript(text) {
  const isCharName = (line) => {
    const clean = line.trim();
    if (!clean || clean.length > 25) return false;
    if (/[\[\].?!,;:0-9]/.test(clean)) return false;
    const letters = clean.replace(/[' ]/g, '');
    if (!letters || !/^[A-Z]+$/.test(letters)) return false;
    return KNOWN_CHARS.has(clean) || (letters.length >= 2 && /^[A-Z ]+$/.test(clean));
  };
  const rawLines = text.split('\n');
  const lines = [];
  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i].trim();
    if (isCharName(line) && i + 1 < rawLines.length) {
      const character = line;
      const parts = [];
      let j = i + 1;
      while (j < rawLines.length) {
        const next = rawLines[j].trim();
        if (!next) { j++; break; }
        if (isCharName(next)) break;
        parts.push(next);
        j++;
      }
      const full = parts.join(' ');
      const cleaned = full.replace(/\[.*?\]/g,'').replace(/\s+/g,' ').trim().replace(/^[–—…]+|[–—…]+$/g,'').trim();
      if (cleaned) lines.push({ character, en: cleaned, ko: '' });
      i = j;
    } else { i++; }
  }
  return lines;
}

// ── AI calls ──────────────────────────────────────────────────────────────────
async function callClaude(body) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return res.json();
}
async function translateLines(lines) {
  const toTranslate = lines.filter(l => !l.ko);
  if (!toTranslate.length) return lines;
  const data = await callClaude({
    model: "claude-sonnet-4-6", max_tokens: 4000,
    messages: [{ role: "user", content:
      `아래 The Office 대사들을 자연스러운 한국어로 번역해줘. 드라마 특유의 말투와 뉘앙스를 살려줘.\nJSON 배열만 반환해. 다른 텍스트 없이:\n[{"en":"원문","ko":"번역"}]\n\n대사:\n${toTranslate.map(l=>`{"en":${JSON.stringify(l.en)}}`).join('\n')}`
    }],
  });
  const raw = (data.content?.[0]?.text||'').trim();
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return lines;
  const map = {};
  JSON.parse(match[0]).forEach(t => { map[t.en] = t.ko; });
  return lines.map(l => ({ ...l, ko: map[l.en] || l.ko || '' }));
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onAdded }) {
  const [season, setSeason] = useState(3);
  const [episode, setEpisode] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!episode) { setError('화 번호를 입력해주세요.'); return; }
    if (!text.trim()) { setError('스크립트를 붙여넣어 주세요.'); return; }
    const lines = parseOfficeScript(text);
    if (!lines.length) { setError('대사를 찾지 못했어요. 캐릭터 이름이 대문자 단독 줄인지 확인해주세요.'); return; }
    setLoading(true);
    setError('번역 중… 잠깐만요!');
    try {
      const translated = await translateLines(lines);
      onAdded({ id: Date.now(), season: Number(season), episode: Number(episode), episodeTitle: episodeTitle.trim() || `Episode ${episode}`, lines: translated });
      onClose();
    } catch {
      onAdded({ id: Date.now(), season: Number(season), episode: Number(episode), episodeTitle: episodeTitle.trim() || `Episode ${episode}`, lines });
      onClose();
    } finally { setLoading(false); }
  }

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:100,background:"rgba(13,13,20,0.92)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#1a1a24",border:"1px solid #2e2e42",borderRadius:16,padding:28,width:"100%",maxWidth:560,boxShadow:"0 24px 64px rgba(0,0,0,0.6)",maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div>
            <h2 style={{ color:"#e8e8f0",fontSize:18,fontWeight:700,margin:0 }}>스크립트 추가</h2>
            <p style={{ color:"#555",fontSize:12,marginTop:4 }}>시즌·화를 지정하고 스크립트를 붙여넣으세요</p>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"#555",cursor:"pointer" }}><CloseIcon/></button>
        </div>
        <div style={{ display:"flex",gap:10,marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <label style={{ color:"#888",fontSize:11,letterSpacing:1,display:"block",marginBottom:5 }}>SEASON</label>
            <select value={season} onChange={e=>setSeason(e.target.value)}
              style={{ width:"100%",background:"#12121a",border:"1px solid #2e2e42",borderRadius:8,padding:"10px 12px",color:"#e8e8f0",fontSize:14,outline:"none" }}>
              {[1,2,3,4,5,6,7,8,9].map(s=><option key={s} value={s}>Season {s}</option>)}
            </select>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ color:"#888",fontSize:11,letterSpacing:1,display:"block",marginBottom:5 }}>EPISODE</label>
            <input type="number" min="1" max="30" value={episode} onChange={e=>setEpisode(e.target.value)} placeholder="1"
              style={{ width:"100%",background:"#12121a",border:"1px solid #2e2e42",borderRadius:8,padding:"10px 12px",color:"#e8e8f0",fontSize:14,outline:"none" }}/>
          </div>
        </div>
        <div style={{ marginBottom:10 }}>
          <label style={{ color:"#888",fontSize:11,letterSpacing:1,display:"block",marginBottom:5 }}>EPISODE TITLE</label>
          <input value={episodeTitle} onChange={e=>setEpisodeTitle(e.target.value)} placeholder="예: Gay Witch Hunt"
            style={{ width:"100%",background:"#12121a",border:"1px solid #2e2e42",borderRadius:8,padding:"10px 12px",color:"#e8e8f0",fontSize:14,outline:"none" }}/>
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ color:"#888",fontSize:11,letterSpacing:1,display:"block",marginBottom:5 }}>SCRIPT</label>
          <textarea value={text} onChange={e=>setText(e.target.value)}
            placeholder={"사이트에서 복사한 스크립트를 그대로 붙여넣으세요.\n\nMICHAEL\nThat's what she said.\nJIM\nOh my god."}
            style={{ width:"100%",height:220,background:"#12121a",border:"1px solid #2e2e42",borderRadius:8,padding:"12px 14px",color:"#e8e8f0",fontSize:13,fontFamily:"monospace",lineHeight:1.6,resize:"vertical",outline:"none" }}/>
        </div>
        {error && <p style={{ color:"#f88",fontSize:12,marginBottom:12 }}>{error}</p>}
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onClose} style={{ flex:1,background:"#12121a",border:"1px solid #2e2e42",borderRadius:10,padding:12,color:"#888",fontSize:14,cursor:"pointer" }}>취소</button>
          <button onClick={handleAdd} disabled={loading} style={{ flex:2,background:loading?"#2a2a2a":"#e8e8f0",border:"none",borderRadius:10,padding:12,color:loading?"#888":"#0d0d14",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            {loading && <span style={{ display:"inline-block",width:14,height:14,border:"2px solid #555",borderTopColor:"#e8e8f0",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>}
            {loading ? "번역 중…" : "추가하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Word Popup ────────────────────────────────────────────────────────────────
function WordPopup({ word, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    callClaude({
      model:"claude-sonnet-4-6", max_tokens:1000,
      messages:[{ role:"user", content:`The Office 맥락에서 단어/표현 "${word}"를 한국어로 설명해줘. JSON만:
{"word":"${word}","pronunciation":"발음기호","partOfSpeech":"품사","meaning":"뜻(2-3줄)","example":"짧은예문","exampleKo":"예문번역","tip":"문화팁(없으면빈문자열)"}` }],
    }).then(data => {
      const raw = (data.content?.[0]?.text||'{}').replace(/```json|```/g,'').trim();
      const j=raw.indexOf('{'), k=raw.lastIndexOf('}');
      setResult(JSON.parse(raw.slice(j,k+1)));
    }).catch(()=>setResult({word,meaning:'단어 정보를 불러올 수 없어요.',pronunciation:'',partOfSpeech:'',example:'',exampleKo:'',tip:''}))
    .finally(()=>setLoading(false));
  },[word]);

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(15,15,20,0.75)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#1a1a24",border:"1px solid #2e2e42",borderRadius:16,padding:28,maxWidth:420,width:"100%",boxShadow:"0 24px 64px rgba(0,0,0,0.5)" }}>
        {loading ? (
          <div style={{ textAlign:"center",padding:"32px 0" }}>
            <div style={{ display:"inline-block",width:32,height:32,border:"3px solid #2e2e42",borderTopColor:"#e8e8f0",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
            <p style={{ color:"#888",marginTop:12,fontSize:14 }}>단어 찾는 중…</p>
          </div>
        ) : result && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
              <div>
                <h2 style={{ margin:0,color:"#e8e8f0",fontSize:26,fontWeight:700 }}>{result.word}</h2>
                <span style={{ color:"#888",fontSize:13 }}>{result.pronunciation} · {result.partOfSpeech}</span>
              </div>
              <button onClick={onClose} style={{ background:"none",border:"none",color:"#555",cursor:"pointer" }}><CloseIcon/></button>
            </div>
            <div style={{ background:"#12121a",borderRadius:10,padding:"14px 16px",marginBottom:14 }}>
              <p style={{ margin:0,color:"#e8e8f0",fontSize:15,lineHeight:1.6 }}>{result.meaning}</p>
            </div>
            {result.example && (
              <div style={{ borderLeft:"3px solid #e8e8f0",paddingLeft:14,marginBottom:14 }}>
                <p style={{ margin:"0 0 4px",color:"#c8c8d8",fontSize:14,fontStyle:"italic" }}>"{result.example}"</p>
                <p style={{ margin:0,color:"#888",fontSize:13 }}>{result.exampleKo}</p>
              </div>
            )}
            {result.tip && (
              <div style={{ background:"#1e1e30",borderRadius:8,padding:"10px 14px" }}>
                <p style={{ margin:0,color:"#aaa",fontSize:13,lineHeight:1.5 }}>{result.tip}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Saved Panel (grouped by episode, with importance + review count) ─────────
function SavedPanel({ favorites, onClose, onWordClick, onRemove, onToggleStar, onReview, jumpToKey }) {
  const grouped = {};
  favorites.forEach(fav => {
    const key = epLabel(fav);
    if (!grouped[key]) grouped[key] = { key, season:fav.season, episode:fav.episode, title:fav.episodeTitle, lines:[] };
    grouped[key].lines.push(fav);
  });
  const groups = Object.values(grouped).sort((a,b)=> a.season!==b.season ? a.season-b.season : a.episode-b.episode);
  const [activeKey, setActiveKey] = useState(jumpToKey || (groups[0]?.key ?? null));

  const activeGroup = groups.find(g => g.key === activeKey) || groups[0];

  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"#0d0d14",overflowY:"auto" }}>
      <div style={{ maxWidth:680,margin:"0 auto",padding:24 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div>
            <h2 style={{ color:"#e8e8f0",fontSize:20,fontWeight:700,margin:0 }}>저장된 문장</h2>
            <p style={{ color:"#555",fontSize:13,marginTop:4 }}>{favorites.length}개 저장됨</p>
          </div>
          <button onClick={onClose} style={{ background:"#1a1a24",border:"1px solid #2e2e42",color:"#aaa",borderRadius:8,padding:"8px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
            <CloseIcon size={14}/> 닫기
          </button>
        </div>

        {groups.length === 0 ? (
          <div style={{ textAlign:"center",padding:"60px 0",color:"#555" }}>
            <BookmarkIcon size={32}/>
            <p style={{ marginTop:12 }}>스크립트에서 북마크를 눌러 문장을 저장해봐요</p>
          </div>
        ) : (
          <>
            {/* Episode quick-jump menu */}
            <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:10,marginBottom:18,borderBottom:"1px solid #1e1e2e" }}>
              {groups.map(g => (
                <button key={g.key} onClick={()=>setActiveKey(g.key)}
                  style={{ flexShrink:0,background:activeKey===g.key?"#e8e8f0":"#1a1a24",color:activeKey===g.key?"#0d0d14":"#888",border:"1px solid #2e2e42",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,fontFamily:"monospace",cursor:"pointer",whiteSpace:"nowrap" }}>
                  {g.key} ({g.lines.length})
                </button>
              ))}
            </div>

            {activeGroup && (
              <div>
                <p style={{ color:"#888",fontSize:13,marginBottom:14 }}>{activeGroup.title}</p>
                {activeGroup.lines
                  .slice()
                  .sort((a,b)=> (b.starred?1:0)-(a.starred?1:0))
                  .map((fav,i) => {
                  const border = CHAR_BORDER[fav.character] || CHAR_BORDER.DEFAULT;
                  return (
                    <div key={i} style={{ background:"#12121a",border:"1px solid #1e1e2e",borderRadius:12,padding:"14px 18px",marginBottom:10,borderLeft:`3px solid ${border}` }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                        <span style={{ color:"#aaa",fontSize:11,fontWeight:700,letterSpacing:1.5,fontFamily:"monospace" }}>{fav.character}</span>
                        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                          {fav.reviewCount > 0 && (
                            <span style={{ display:"flex",alignItems:"center",gap:3,color:"#666",fontSize:11 }}>
                              <RefreshIcon size={11}/> {fav.reviewCount}
                            </span>
                          )}
                          <button onClick={()=>onToggleStar(fav.en)} style={{ background:"none",border:"none",cursor:"pointer",display:"flex" }}>
                            <StarIcon filled={!!fav.starred}/>
                          </button>
                          <button onClick={()=>onRemove(fav.en)} style={{ background:"none",border:"none",cursor:"pointer",display:"flex" }}>
                            <BookmarkIcon filled={true} size={14}/>
                          </button>
                        </div>
                      </div>
                      <p onClick={()=>onReview(fav.en)} style={{ margin:"0 0 4px",color:"#e8e8f0",fontSize:14,lineHeight:1.7,fontFamily:"Georgia,serif",cursor:"pointer" }}>{fav.en}</p>
                      {fav.ko && <p style={{ margin:0,color:"#888",fontSize:12,lineHeight:1.6 }}>{fav.ko}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Review Mode (flashcard style for starred / all saved sentences) ──────────
function ReviewMode({ favorites, onClose, onReview }) {
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  // Prioritize starred + least-reviewed
  const queue = favorites.slice().sort((a,b) => {
    if (!!b.starred !== !!a.starred) return (b.starred?1:0) - (a.starred?1:0);
    return (a.reviewCount||0) - (b.reviewCount||0);
  });
  const current = queue[idx];

  function next() {
    if (current) onReview(current.en);
    setShowAnswer(false);
    setIdx(i => (i+1) % queue.length);
  }

  if (!queue.length) {
    return (
      <div style={{ position:"fixed",inset:0,zIndex:60,background:"#0d0d14",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16 }}>
        <p style={{ color:"#888" }}>복습할 저장된 문장이 없어요.</p>
        <button onClick={onClose} style={{ background:"#e8e8f0",border:"none",borderRadius:8,padding:"10px 20px",color:"#0d0d14",fontWeight:700,cursor:"pointer" }}>닫기</button>
      </div>
    );
  }

  const border = CHAR_BORDER[current.character] || CHAR_BORDER.DEFAULT;

  return (
    <div style={{ position:"fixed",inset:0,zIndex:60,background:"#0d0d14",display:"flex",flexDirection:"column" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:20 }}>
        <span style={{ color:"#666",fontSize:13 }}>{idx+1} / {queue.length}</span>
        <button onClick={onClose} style={{ background:"none",border:"none",color:"#888",cursor:"pointer" }}><CloseIcon/></button>
      </div>
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
        <div onClick={()=>setShowAnswer(v=>!v)} style={{ maxWidth:520,width:"100%",background:"#12121a",border:`2px solid ${border}`,borderRadius:20,padding:"40px 32px",cursor:"pointer",textAlign:"center" }}>
          <div style={{ display:"flex",justifyContent:"center",gap:8,marginBottom:18 }}>
            <span style={{ color:"#aaa",fontSize:12,fontWeight:700,letterSpacing:1.5,fontFamily:"monospace" }}>{current.character}</span>
            {current.starred && <StarIcon filled size={13}/>}
          </div>
          <p style={{ color:"#e8e8f0",fontSize:19,lineHeight:1.7,fontFamily:"Georgia,serif",marginBottom: showAnswer ? 20 : 0 }}>{current.en}</p>
          {showAnswer ? (
            <p style={{ color:"#888",fontSize:14,lineHeight:1.7,borderTop:"1px solid #2a2a3a",paddingTop:18 }}>{current.ko || "번역 없음"}</p>
          ) : (
            <p style={{ color:"#444",fontSize:12,marginTop:18 }}>탭하여 번역 보기</p>
          )}
        </div>
      </div>
      <div style={{ padding:24,display:"flex",gap:10,maxWidth:520,width:"100%",margin:"0 auto",boxSizing:"border-box" }}>
        <button onClick={next} style={{ flex:1,background:"#e8e8f0",border:"none",borderRadius:12,padding:14,color:"#0d0d14",fontWeight:700,fontSize:15,cursor:"pointer" }}>다음 →</button>
      </div>
    </div>
  );
}

// ── Script Line ───────────────────────────────────────────────────────────────
function ScriptLine({ line, showKoAll, onWordClick, isSaved, onToggleSave }) {
  const [showKoLine, setShowKoLine] = useState(false);
  const showKo = showKoAll || showKoLine;
  const border = CHAR_BORDER[line.character] || CHAR_BORDER.DEFAULT;
  const tokens = line.en.split(/(\s+)/);

  return (
    <div style={{ marginBottom:14,padding:"14px 18px",background:"#12121a",borderRadius:12,borderLeft:`3px solid ${border}` }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
        <span style={{ color:"#aaa",fontWeight:700,fontSize:11,letterSpacing:1.5,fontFamily:"monospace" }}>{line.character}</span>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          <button onClick={()=>setShowKoLine(v=>!v)}
            style={{ background:showKoLine?"#e8e8f0":"transparent",border:`1px solid ${showKoLine?"#e8e8f0":"#333"}`,borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700,letterSpacing:0.5,color:showKoLine?"#0d0d14":"#555",cursor:"pointer" }}>
            KOR
          </button>
          <button onClick={onToggleSave} style={{ background:"none",border:"none",cursor:"pointer",padding:2,display:"flex" }}>
            <BookmarkIcon filled={isSaved} size={15}/>
          </button>
        </div>
      </div>
      <p style={{ margin:0,color:"#e8e8f0",fontSize:15,lineHeight:1.8,fontFamily:"Georgia,serif" }}>
        {tokens.map((token,i) => {
          const clean = token.replace(/[.,!?'"();:]/g,'').trim();
          if (!clean||/^\s+$/.test(token)) return <span key={i}>{token}</span>;
          return <span key={i} onClick={()=>onWordClick(clean)} style={{ cursor:"pointer",borderRadius:3,padding:"0 1px" }}
            onMouseEnter={e=>e.target.style.background="#2a2a3a"} onMouseLeave={e=>e.target.style.background="transparent"}>{token}</span>;
        })}
      </p>
      {showKo && (
        <p style={{ margin:"8px 0 0",color:"#888",fontSize:13,lineHeight:1.7,borderTop:"1px solid #1e1e2e",paddingTop:8 }}>
          {line.ko || "번역 중…"}
        </p>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [scenes, setScenes] = useState(SAMPLE_SCENES);
  const [favorites, setFavorites] = useState([]);
  const [streak, setStreak] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState(3);
  const [selectedSceneId, setSelectedSceneId] = useState(1);
  const [isDailyMode, setIsDailyMode] = useState(true);

  const [showKo, setShowKo] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [jumpToKey, setJumpToKey] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if (saved?.length) setScenes(saved);
      setFavorites(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'));
      setStreak(parseInt(localStorage.getItem(STREAK_KEY)||'0',10));
    } catch {}
    setHydrated(true);

    // PWA service worker registration (no-op safe)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes)); } catch {}
  }, [scenes, hydrated]);

  useEffect(() => {
    if (isDailyMode && scenes.length) {
      const daily = getDailyScene(scenes);
      setSelectedSeason(daily.season);
      setSelectedSceneId(daily.id);
    }
  }, [isDailyMode, scenes.length]);

  const seasons = [...new Set(scenes.map(s=>s.season))].sort((a,b)=>a-b);
  const scenesInSeason = scenes.filter(s=>s.season===selectedSeason).sort((a,b)=>a.episode-b.episode);
  const scene = scenes.find(s=>s.id===selectedSceneId) || scenesInSeason[0] || scenes[0];

  useEffect(() => {
    if (!showKo || !scene) return;
    if (!scene.lines.some(l=>!l.ko)) return;
    setTranslating(true);
    translateLines(scene.lines).then(translated => {
      setScenes(prev => prev.map(s => s.id===scene.id ? {...s,lines:translated} : s));
      setTranslating(false);
    }).catch(()=>setTranslating(false));
  }, [showKo, selectedSceneId]);

  const addScene = useCallback((parsed) => {
    setScenes(prev => {
      const filtered = prev.filter(s => !(s.season===parsed.season && s.episode===parsed.episode));
      return [...filtered, parsed].sort((a,b)=>a.season!==b.season?a.season-b.season:a.episode-b.episode);
    });
    setSelectedSeason(parsed.season);
    setSelectedSceneId(parsed.id);
    setIsDailyMode(false);
    setUploadMsg(`${epLabel(parsed)} 추가됨`);
    setTimeout(()=>setUploadMsg(''),3000);
  }, []);

  const deleteScene = useCallback((sceneId) => {
    const target = scenes.find(s=>s.id===sceneId);
    if (!target) return;
    if (scenes.length <= 1) return;
    if (!window.confirm(`${epLabel(target)} 를 삭제할까요?`)) return;
    setScenes(prev => prev.filter(s=>s.id!==sceneId));
    const remaining = scenes.filter(s=>s.id!==sceneId);
    if (remaining.length) setSelectedSceneId(remaining[0].id);
  }, [scenes]);

  const toggleSave = (line) => {
    if (!scene) return;
    const key = line.en;
    const next = favorites.find(f=>f.en===key)
      ? favorites.filter(f=>f.en!==key)
      : [...favorites, { ...line, season:scene.season, episode:scene.episode, episodeTitle:scene.episodeTitle, starred:false, reviewCount:0 }];
    setFavorites(next);
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  };

  const removeFav = (en) => {
    const next = favorites.filter(f=>f.en!==en);
    setFavorites(next);
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  };

  const toggleStar = (en) => {
    const next = favorites.map(f => f.en===en ? { ...f, starred: !f.starred } : f);
    setFavorites(next);
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  };

  const markReviewed = (en) => {
    const next = favorites.map(f => f.en===en ? { ...f, reviewCount: (f.reviewCount||0)+1 } : f);
    setFavorites(next);
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  };

  const markDone = () => {
    const n = streak+1;
    setStreak(n);
    localStorage.setItem(STREAK_KEY, String(n));
  };

  if (!scene) return null;

  return (
    <div style={{ minHeight:"100vh",background:"#0d0d14",color:"#e8e8f0",fontFamily:"sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0d0d14}::-webkit-scrollbar-thumb{background:#2e2e42;border-radius:3px}`}</style>

      {selectedWord && <WordPopup word={selectedWord} onClose={()=>setSelectedWord(null)}/>}
      {showSaved && <SavedPanel favorites={favorites} onClose={()=>{setShowSaved(false);setJumpToKey(null);}} onWordClick={setSelectedWord} onRemove={removeFav} onToggleStar={toggleStar} onReview={markReviewed} jumpToKey={jumpToKey}/>}
      {showReview && <ReviewMode favorites={favorites} onClose={()=>setShowReview(false)} onReview={markReviewed}/>}
      {showUpload && <UploadModal onClose={()=>setShowUpload(false)} onAdded={addScene}/>}

      <header style={{ borderBottom:"1px solid #1e1e2e",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#0d0d14",zIndex:10 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <img src="/logo.png" alt="The Office" style={{ height:24,filter:"invert(1)",opacity:0.9 }}/>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:15,fontWeight:700,color:"#e8e8f0" }}>{streak}</div>
            <div style={{ fontSize:9,color:"#555" }}>연속</div>
          </div>
          <button onClick={()=>{setShowSaved(true);setJumpToKey(null);}} style={{ background:"#1a1a24",border:"1px solid #2e2e42",borderRadius:8,padding:"7px 10px",fontSize:12,color:"#aaa",cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
            <BookmarkIcon size={13}/> <span style={{ background:"#e8e8f0",color:"#0d0d14",borderRadius:10,padding:"1px 5px",fontSize:10,fontWeight:700 }}>{favorites.length}</span>
          </button>
          <button onClick={()=>setShowReview(true)} style={{ background:"#1a1a24",border:"1px solid #2e2e42",borderRadius:8,padding:"7px 10px",fontSize:12,color:"#aaa",cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
            <RefreshIcon size={13}/> 복습
          </button>
          <button onClick={()=>setShowUpload(true)} style={{ background:"#e8e8f0",border:"none",borderRadius:8,padding:"7px 12px",fontSize:12,color:"#0d0d14",fontWeight:700,cursor:"pointer" }}>+ 추가</button>
        </div>
      </header>

      {uploadMsg && (
        <div style={{ background:"#1a1a2a",borderBottom:"1px solid #2e2e42",padding:"10px 20px",fontSize:13,color:"#aaa",textAlign:"center" }}>
          {uploadMsg}
        </div>
      )}

      {/* Quick jump to saved episodes */}
      {favorites.length > 0 && (
        <div style={{ borderBottom:"1px solid #1e1e2e",padding:"10px 20px",display:"flex",gap:6,overflowX:"auto" }}>
          <span style={{ color:"#555",fontSize:11,flexShrink:0,alignSelf:"center",marginRight:4 }}>저장함:</span>
          {[...new Set(favorites.map(f=>epLabel(f)))].sort().map(key => (
            <button key={key} onClick={()=>{ setJumpToKey(key); setShowSaved(true); }}
              style={{ flexShrink:0,background:"#1a1a24",border:"1px solid #2e2e42",borderRadius:6,padding:"3px 10px",fontSize:11,color:"#888",fontFamily:"monospace",cursor:"pointer" }}>
              {key}
            </button>
          ))}
        </div>
      )}

      <main style={{ maxWidth:680,margin:"0 auto",padding:"16px" }}>

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <div style={{ display:"flex",gap:6 }}>
            <button onClick={()=>setIsDailyMode(true)} style={{ background:isDailyMode?"#e8e8f0":"#1a1a24",color:isDailyMode?"#0d0d14":"#888",border:"none",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
              <CalendarIcon/> 오늘의 씬
            </button>
            <button onClick={()=>setIsDailyMode(false)} style={{ background:!isDailyMode?"#e8e8f0":"#1a1a24",color:!isDailyMode?"#0d0d14":"#888",border:"none",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
              <GridIcon/> 전체 보기
            </button>
          </div>
          <button onClick={()=>setShowKo(v=>!v)} style={{ background:showKo?"#e8e8f0":"#1a1a24",border:"1px solid #2e2e42",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,letterSpacing:0.5,color:showKo?"#0d0d14":"#666",cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
            {translating && <span style={{ display:"inline-block",width:9,height:9,border:"2px solid currentColor",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>}
            KOR ALL {showKo?"ON":"OFF"}
          </button>
        </div>

        {!isDailyMode && (
          <div style={{ marginBottom:12 }}>
            <div style={{ display:"flex",gap:6,marginBottom:10 }}>
              {seasons.map(s => (
                <button key={s} onClick={()=>{ setSelectedSeason(s); const first=scenes.filter(sc=>sc.season===s).sort((a,b)=>a.episode-b.episode)[0]; if(first) setSelectedSceneId(first.id); }}
                  style={{ background:selectedSeason===s?"#e8e8f0":"#1a1a24",color:selectedSeason===s?"#0d0d14":"#888",border:"1px solid #2e2e42",borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer" }}>
                  S{s}
                </button>
              ))}
            </div>
            <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:8 }}>
              {scenesInSeason.map(s => (
                <div key={s.id} style={{ flexShrink:0,display:"flex" }}>
                  <button onClick={()=>setSelectedSceneId(s.id)}
                    style={{ background:s.id===selectedSceneId?"#e8e8f0":"#1a1a24",color:s.id===selectedSceneId?"#0d0d14":"#888",border:"1px solid #2e2e42",borderRadius:s.id > 3?"8px 0 0 8px":"8px",padding:"5px 12px",fontSize:11,cursor:"pointer",whiteSpace:"nowrap" }}>
                    E{String(s.episode).padStart(2,'0')} {s.episodeTitle}
                  </button>
                  {s.id > 3 && (
                    <button onClick={()=>deleteScene(s.id)}
                      style={{ background:"#1a1a24",border:"1px solid #2e2e42",borderLeft:"none",borderRadius:"0 8px 8px 0",padding:"5px 8px",fontSize:11,color:"#555",cursor:"pointer" }}>
                      <CloseIcon size={10}/>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom:16,padding:"14px 18px",background:"#12121a",borderRadius:12 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <span style={{ background:"#e8e8f0",color:"#0d0d14",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,fontFamily:"monospace" }}>{epLabel(scene)}</span>
              <h2 style={{ fontSize:18,fontWeight:700,color:"#e8e8f0",marginTop:6 }}>{scene.episodeTitle}</h2>
            </div>
            <p style={{ color:"#444",fontSize:11,textAlign:"right" }}>단어 클릭<br/>→ AI 설명</p>
          </div>
        </div>

        {scene.lines.map((line,i) => (
          <ScriptLine key={i} line={line} showKoAll={showKo} onWordClick={setSelectedWord}
            isSaved={!!favorites.find(f=>f.en===line.en)}
            onToggleSave={()=>toggleSave(line)}/>
        ))}

        <button onClick={markDone} style={{ width:"100%",marginTop:16,background:"#e8e8f0",border:"none",borderRadius:12,padding:14,fontSize:15,fontWeight:700,color:"#0d0d14",cursor:"pointer" }}>
          오늘 학습 완료! (+1 스트릭)
        </button>
      </main>
    </div>
  );
}
