import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── Firebase config ───────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA4U23pSGfztXC4s1-TV61pdIQIcSwMJl4",
  authDomain: "churros-check.firebaseapp.com",
  projectId: "churros-check",
  storageBucket: "churros-check.firebasestorage.app",
  messagingSenderId: "940863064645",
  appId: "1:940863064645:web:60bc55b21e5d421a78712c",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ─── Helpers Firebase ──────────────────────────────────────────────
async function fbGet(key, fallback) {
  try {
    const snap = await getDoc(doc(db, "supervisor", key));
    return snap.exists() ? snap.data().value : fallback;
  } catch { return fallback; }
}
async function fbSet(key, val) {
  try {
    await setDoc(doc(db, "supervisor", key), { value: val });
  } catch (e) { console.error("fbSet error", e); }
}
function fbListen(key, cb) {
  return onSnapshot(doc(db, "supervisor", key), snap => {
    if (snap.exists()) cb(snap.data().value);
  });
}

// ─── Hook useCloud com Firebase em tempo real ──────────────────────
function useCloud(key, ini) {
  const [v, setV] = useState(ini);
  const [ok, setOk] = useState(false);
  const ref = useRef(ini);

  useEffect(() => {
    fbGet(key, ini).then(val => {
      ref.current = val;
      setV(val);
      setOk(true);
    });
    const unsub = fbListen(key, val => {
      ref.current = val;
      setV(val);
    });
    return () => unsub();
  }, [key]);

  const set = useCallback(async (nv) => {
    const val = typeof nv === "function" ? nv(ref.current) : nv;
    ref.current = val;
    setV(val);
    await fbSet(key, val);
  }, [key]);

  return [v, set, ok];
}

// ─── Constantes ────────────────────────────────────────────────────
const CATS_PADRAO = ["Abertura", "Manutenção Diurna", "Fim Expediente"];
const ALERTAS_PADRAO = [
  { cat: "Abertura",          hora: "09:00" },
  { cat: "Manutenção Diurna", hora: "13:00" },
  { cat: "Fim Expediente",    hora: "21:00" },
];
const TAREFAS_PADRAO = [
  {id:1,  titulo:"Verificar Nível do Óleo",                                  cat:"Abertura"},
  {id:2,  titulo:"Filtrar Óleo",                                             cat:"Abertura"},
  {id:3,  titulo:"Ligar Equipamentos de Trabalho",                           cat:"Abertura"},
  {id:4,  titulo:"Abrir Apps (IFOOD, 99FOOD, CARDÁPIO)",                     cat:"Abertura"},
  {id:5,  titulo:"Ligar Músicas",                                            cat:"Abertura"},
  {id:6,  titulo:"Passar Pano na Bancada de Pedra",                          cat:"Abertura"},
  {id:7,  titulo:"Passar Pano em Mesas e Cadeiras",                          cat:"Abertura"},
  {id:8,  titulo:"Reposição de Recheio Doceiras",                            cat:"Abertura"},
  {id:9,  titulo:"Limpeza Bico e Traseira Doceiras",                         cat:"Abertura"},
  {id:10, titulo:"Verificar Estado do Banheiro e Limpeza",                   cat:"Abertura"},
  {id:11, titulo:"Limpeza de Mesas no Salão",                                cat:"Manutenção Diurna"},
  {id:12, titulo:"Limpeza do Chão Salão",                                    cat:"Manutenção Diurna"},
  {id:13, titulo:"Limpeza Bicos e Traseira Doceira",                         cat:"Manutenção Diurna"},
  {id:14, titulo:"Limpeza Mesa Inox (Fritadeira)",                           cat:"Manutenção Diurna"},
  {id:15, titulo:"Limpeza Mesa (Pia)",                                       cat:"Manutenção Diurna"},
  {id:16, titulo:"Limpeza Mesa Embalagem",                                   cat:"Manutenção Diurna"},
  {id:17, titulo:"Limpeza Mesa Produção",                                    cat:"Manutenção Diurna"},
  {id:18, titulo:"Montagem de Embalagens",                                   cat:"Manutenção Diurna"},
  {id:19, titulo:"Verificar Banheiro",                                       cat:"Manutenção Diurna"},
  {id:20, titulo:"Não Acumular Louça na Pia",                                cat:"Manutenção Diurna"},
  {id:21, titulo:"Reposição Geladeira (Água/Refrigerante)",                  cat:"Fim Expediente"},
  {id:22, titulo:"Organização Geladeira",                                    cat:"Fim Expediente"},
  {id:23, titulo:"Lavar Escorredor (Churros/Salgado)",                       cat:"Fim Expediente"},
  {id:24, titulo:"Recolher Lixos",                                           cat:"Fim Expediente"},
  {id:25, titulo:"Limpar Bancada e Mesas",                                   cat:"Fim Expediente"},
  {id:26, titulo:"Fechar e Guardar Produtos Abertos",                        cat:"Fim Expediente"},
  {id:27, titulo:"Passar Pano Banheiro",                                     cat:"Fim Expediente"},
  {id:28, titulo:"Lavar Utensílios e Cuba",                                  cat:"Fim Expediente"},
  {id:29, titulo:"Passar Pano Cozinha",                                      cat:"Fim Expediente"},
  {id:30, titulo:"Varrer Salão",                                             cat:"Fim Expediente"},
  {id:31, titulo:"Desligar Todos Equipamentos (exceto Freezer e Geladeira)", cat:"Fim Expediente"},
];
const ESTOQUE_PADRAO = [
  {id:"e1", nome:"Churros Tradicional",   grupo:"Produtos Base",  freq:"2x",minimo:5,  unidade:"und"},
  {id:"e2", nome:"Churros Espanhol",      grupo:"Produtos Base",  freq:"2x",minimo:5,  unidade:"und"},
  {id:"e3", nome:"Churros Aniversario",   grupo:"Produtos Base",  freq:"2x",minimo:3,  unidade:"und"},
  {id:"e4", nome:"Acai",                  grupo:"Produtos Base",  freq:"2x",minimo:5,  unidade:"und"},
  {id:"e5", nome:"Cupuacu",               grupo:"Produtos Base",  freq:"2x",minimo:3,  unidade:"und"},
  {id:"e6", nome:"Milk-shake",            grupo:"Produtos Base",  freq:"2x",minimo:3,  unidade:"und"},
  {id:"e7", nome:"Doce de Leite",         grupo:"Recheios",       freq:"2x",minimo:3,  unidade:"und"},
  {id:"e8", nome:"Nutella",               grupo:"Recheios",       freq:"2x",minimo:2,  unidade:"und"},
  {id:"e9", nome:"Chocolate",             grupo:"Recheios",       freq:"2x",minimo:3,  unidade:"und"},
  {id:"e10",nome:"Galak",                 grupo:"Recheios",       freq:"2x",minimo:2,  unidade:"und"},
  {id:"e11",nome:"Leite em Po",           grupo:"Recheios",       freq:"1x",minimo:2,  unidade:"und"},
  {id:"e12",nome:"Pacoca",                grupo:"Recheios",       freq:"1x",minimo:5,  unidade:"und"},
  {id:"e13",nome:"Leite Condensado",      grupo:"Recheios",       freq:"2x",minimo:3,  unidade:"und"},
  {id:"e14",nome:"Chocoball",             grupo:"Recheios",       freq:"1x",minimo:2,  unidade:"und"},
  {id:"e15",nome:"Creme de Ninho",        grupo:"Recheios",       freq:"1x",minimo:2,  unidade:"und"},
  {id:"e16",nome:"Creme de Pacoca",       grupo:"Recheios",       freq:"1x",minimo:2,  unidade:"und"},
  {id:"e17",nome:"Creme de Morango",      grupo:"Recheios",       freq:"1x",minimo:2,  unidade:"und"},
  {id:"e18",nome:"Banana",                grupo:"Complementos",   freq:"2x",minimo:8,  unidade:"und"},
  {id:"e19",nome:"Morango",               grupo:"Complementos",   freq:"2x",minimo:8,  unidade:"und"},
  {id:"e20",nome:"Granola",               grupo:"Complementos",   freq:"1x",minimo:2,  unidade:"und"},
  {id:"e21",nome:"Granulado Preto",       grupo:"Complementos",   freq:"1x",minimo:2,  unidade:"und"},
  {id:"e22",nome:"Granulado Colorido",    grupo:"Complementos",   freq:"1x",minimo:2,  unidade:"und"},
  {id:"e23",nome:"Amendoim",              grupo:"Complementos",   freq:"1x",minimo:2,  unidade:"und"},
  {id:"e24",nome:"Acucar",                grupo:"Complementos",   freq:"1x",minimo:3,  unidade:"und"},
  {id:"e25",nome:"Canela",                grupo:"Complementos",   freq:"1x",minimo:1,  unidade:"und"},
  {id:"e26",nome:"Agua s/ Gas",           grupo:"Bebidas",        freq:"2x",minimo:6,  unidade:"und"},
  {id:"e27",nome:"Agua c/ Gas",           grupo:"Bebidas",        freq:"2x",minimo:6,  unidade:"und"},
  {id:"e28",nome:"Coca Zero",             grupo:"Bebidas",        freq:"2x",minimo:6,  unidade:"und"},
  {id:"e29",nome:"Coca Normal",           grupo:"Bebidas",        freq:"2x",minimo:6,  unidade:"und"},
  {id:"e30",nome:"Guarana Zero",          grupo:"Bebidas",        freq:"2x",minimo:6,  unidade:"und"},
  {id:"e31",nome:"Guarana Normal",        grupo:"Bebidas",        freq:"2x",minimo:6,  unidade:"und"},
  {id:"e32",nome:"Sprite",                grupo:"Bebidas",        freq:"2x",minimo:4,  unidade:"und"},
  {id:"e33",nome:"Suco Uva",              grupo:"Bebidas",        freq:"2x",minimo:4,  unidade:"und"},
  {id:"e34",nome:"Suco Maracuja",         grupo:"Bebidas",        freq:"2x",minimo:4,  unidade:"und"},
  {id:"e35",nome:"Leite",                 grupo:"Bebidas",        freq:"2x",minimo:3,  unidade:"und"},
  {id:"e36",nome:"Copo 300ml",            grupo:"Copos e Tampas", freq:"1x",minimo:20, unidade:"und"},
  {id:"e37",nome:"Copo 500ml",            grupo:"Copos e Tampas", freq:"1x",minimo:20, unidade:"und"},
  {id:"e38",nome:"Copo 700ml",            grupo:"Copos e Tampas", freq:"1x",minimo:20, unidade:"und"},
  {id:"e39",nome:"Tampa 300ml",           grupo:"Copos e Tampas", freq:"1x",minimo:20, unidade:"und"},
  {id:"e40",nome:"Tampa 500ml",           grupo:"Copos e Tampas", freq:"1x",minimo:20, unidade:"und"},
  {id:"e41",nome:"Tampa 700ml",           grupo:"Copos e Tampas", freq:"1x",minimo:20, unidade:"und"},
  {id:"e42",nome:"Saco Kraft P",          grupo:"Embalagens",     freq:"1x",minimo:20, unidade:"und"},
  {id:"e43",nome:"Saco Kraft M",          grupo:"Embalagens",     freq:"1x",minimo:20, unidade:"und"},
  {id:"e44",nome:"Saco Acai",             grupo:"Embalagens",     freq:"1x",minimo:20, unidade:"und"},
  {id:"e45",nome:"Embalagem Churros Int", grupo:"Embalagens",     freq:"1x",minimo:20, unidade:"und"},
  {id:"e46",nome:"Embalagem Churros Ext", grupo:"Embalagens",     freq:"1x",minimo:20, unidade:"und"},
  {id:"e47",nome:"Embalagem 2 Churros",   grupo:"Embalagens",     freq:"1x",minimo:15, unidade:"und"},
  {id:"e48",nome:"Embalagem Box Churros", grupo:"Embalagens",     freq:"1x",minimo:15, unidade:"und"},
];

const GRUPOS_EST = [...new Set(ESTOQUE_PADRAO.map(i => i.grupo))];
const PERFIS = [
  {id:"gestor", nome:"Luan (Gestor)",  role:"gestor",      emoji:"👑"},
  {id:"func1",  nome:"Funcionario 1",  role:"funcionario", emoji:"👤"},
  {id:"func2",  nome:"Funcionario 2",  role:"funcionario", emoji:"👤"},
];

const hoje      = () => new Date().toISOString().split("T")[0];
const fmtD      = d => { try { const [y,m,dia] = d.split("-"); return `${dia}/${m}/${y}`; } catch { return d; } };
const dsem      = d => new Date(d + "T12:00:00").getDay();
const isDia2x   = d => [1, 5].includes(dsem(d));
const isDia1x   = d => [3].includes(dsem(d));
const isDiaI    = (freq, d) => freq === "2x" ? isDia2x(d) : isDia1x(d);
const isDiaQq   = d => isDia2x(d) || isDia1x(d);
const horaAtual = () => { const n = new Date(); return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`; };
const horaMin   = h => { const [hh, mm] = h.split(":").map(Number); return hh * 60 + mm; };

function calcSeq(regs, concl, cats) {
  const dias = Object.keys(regs).sort().reverse(); let seq = 0;
  for (const d of dias) { const c = concl[d] || {}; if (cats.every(x => !!c[x])) seq++; else break; }
  return seq;
}

async function compFoto(file, maxW = 1200, maxKB = 150) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => {
      const img = new Image();
      img.onload = () => {
        const fn = q => {
          const c = document.createElement("canvas");
          const sc = Math.min(1, maxW / img.width);
          c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          const b64 = c.toDataURL("image/jpeg", q);
          const kb = (b64.length * 0.75) / 1024;
          if (kb > maxKB && q > 0.25) return fn(q - 0.1);
          return res({ b64, kb: Math.round(kb) });
        }; fn(0.75);
      }; img.src = e.target.result;
    }; r.readAsDataURL(file);
  });
}

const TEMAS = {
  fogo:     {emoji:"🔥",titulo:"Pegou fogo!",    sub:"Voce esta em chamas hoje!",        cor:"#f97316",fundo:"linear-gradient(135deg,#7c2d12,#ea580c)",pts:["🔥","💥","✨","🔥","🌟"]},
  foguete:  {emoji:"🚀",titulo:"Decolando!",     sub:"Missao em andamento, continue!",   cor:"#6366f1",fundo:"linear-gradient(135deg,#1e1b4b,#4f46e5)",pts:["🚀","⭐","✨","🌟","💫"]},
  estrela:  {emoji:"⭐",titulo:"Brilhando!",     sub:"Voce esta no caminho certo!",      cor:"#eab308",fundo:"linear-gradient(135deg,#713f12,#ca8a04)",pts:["⭐","🌟","✨","💫","⭐"]},
  trofeu:   {emoji:"🏆",titulo:"Campeao!",       sub:"Nivel de lenda atingido!",         cor:"#f59e0b",fundo:"linear-gradient(135deg,#78350f,#d97706)",pts:["🏆","🥇","🎖️","⭐","🌟"]},
  diamante: {emoji:"💎",titulo:"Raro!",          sub:"Poucos chegam aqui. Voce chegou!", cor:"#06b6d4",fundo:"linear-gradient(135deg,#0c4a6e,#0891b2)",pts:["💎","✨","💫","🌟","💎"]},
  coroa:    {emoji:"👑",titulo:"Realeza!",       sub:"Voce governa a produtividade!",    cor:"#a855f7",fundo:"linear-gradient(135deg,#4a044e,#9333ea)",pts:["👑","💜","✨","🌟","👑"]},
  confete:  {emoji:"🎉",titulo:"Incrivel!",      sub:"Cada tarefa e uma vitoria!",       cor:"#22c55e",fundo:"linear-gradient(135deg,#14532d,#16a34a)",pts:["🎉","🎊","🥳","✨","🎈"]},
};

function Celebracao({ cel, nome }) {
  const t = TEMAS[cel.tema] || TEMAS.fogo;
  const [pts, setPts] = useState([]);
  useEffect(() => { setPts(Array.from({length:12}, (_,i) => ({id:i,emoji:t.pts[i%t.pts.length],x:Math.random()*85+5,y:Math.random()*70+5,size:Math.random()*18+16,delay:Math.random()*0.8}))); }, []);
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.78)",backdropFilter:"blur(4px)"}}>
      {pts.map(p => <div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,fontSize:p.size,animation:`floatUp 2.5s ease-out ${p.delay}s both`,pointerEvents:"none"}}>{p.emoji}</div>)}
      <div style={{background:t.fundo,borderRadius:24,padding:"32px 28px",width:"85%",maxWidth:340,textAlign:"center",boxShadow:`0 0 60px ${t.cor}88`,animation:"popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both",border:`1px solid ${t.cor}44`}}>
        <div style={{fontSize:72,marginBottom:8,animation:"bounce 0.6s ease infinite alternate"}}>{t.emoji}</div>
        <div style={{fontSize:26,fontWeight:900,color:"#fff",marginBottom:6}}>{t.titulo}</div>
        <div style={{fontSize:14,color:"rgba(255,255,255,0.85)",marginBottom:4}}>{nome}, {t.sub}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginTop:8}}>{cel.contexto==="estoque"?`${cel.total} itens · Estoque finalizado!`:`${cel.total} tarefas · Nivel ${cel.nivel}`}</div>
      </div>
      <style>{`@keyframes floatUp{0%{opacity:0;transform:translateY(20px) scale(0.5)}30%{opacity:1;transform:translateY(-10px) scale(1)}100%{opacity:0;transform:translateY(-60px) scale(0.8)}}@keyframes popIn{0%{opacity:0;transform:scale(0.3) rotate(-10deg)}100%{opacity:1;transform:scale(1) rotate(0)}}@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-10px)}}`}</style>
    </div>
  );
}

function dispCel(total, set, ctx = "tarefas") {
  const nivel = Math.max(1, Math.floor(total / 7));
  const chaves = Object.keys(TEMAS);
  set({ nivel, tema: chaves[(nivel - 1) % chaves.length], total, contexto: ctx });
  setTimeout(() => set(null), 4000);
}

function Toast({ msg, tipo }) {
  return <div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",padding:"10px 20px",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 20px #0008",background:tipo==="erro"?"#ef4444":"#22c55e"}}>{msg}</div>;
}

function Modal({ icone, titulo, sub, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#1e293b",borderRadius:20,padding:28,width:"100%",maxWidth:360,display:"flex",flexDirection:"column",alignItems:"center",gap:12,border:"1px solid #334155"}}>
        <div style={{fontSize:44}}>{icone}</div>
        <div style={{fontSize:18,fontWeight:900,color:"#f1f5f9",textAlign:"center"}}>{titulo}</div>
        {sub && <div style={{fontSize:13,color:"#94a3b8",textAlign:"center",lineHeight:1.5}}>{sub}</div>}
        {children}
      </div>
    </div>
  );
}
const BtnM = ({cor, children, onClick}) => <button onClick={onClick} style={{width:"100%",padding:14,background:cor||"#22c55e",border:"none",borderRadius:12,color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",marginTop:4}}>{children}</button>;
const BtnC = ({onClick, label}) => <button onClick={onClick} style={{width:"100%",padding:12,background:"transparent",border:"1px solid #334155",borderRadius:12,color:"#64748b",fontWeight:700,fontSize:14,cursor:"pointer"}}>{label||"Cancelar"}</button>;

function Loading() {
  return (
    <div style={{position:"fixed",inset:0,background:"#0f172a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:56}}>🌀</div>
      <div style={{fontSize:18,fontWeight:800,color:"#f97316"}}>Meu Supervisor</div>
      <div style={{fontSize:13,color:"#64748b"}}>Conectando ao Firebase...</div>
      <div style={{width:40,height:40,border:"3px solid #334155",borderTop:"3px solid #f97316",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Estoque({ nomeusr, isG, estItens, setEstItens, onCel }) {
  const [cont, setCont, cOk] = useCloud("est_cont_v2", {});
  const [conc, setConc, ncOk] = useCloud("est_concl_v2", {});
  const [sub, setSub] = useState("contar");
  const [grp, setGrp] = useState(GRUPOS_EST[0]);
  const [editMin, setEditMin] = useState(null);
  const [novoMin, setNovoMin] = useState("");
  const [mFin, setMFin] = useState(false);
  const [toast, setToast] = useState(null);
  const showT = (msg, tipo = "ok") => { setToast({msg, tipo}); setTimeout(() => setToast(null), 2500); };
  const dh = hoje();
  const chj = cont[dh] || {};
  const concHj = conc[dh];
  const bloq = !isG && !!concHj;
  const itensDia = estItens.filter(i => isDiaI(i.freq, dh));
  const itensVis = isG ? estItens.filter(i => i.grupo === grp) : estItens.filter(i => i.grupo === grp && isDiaI(i.freq, dh));
  const grpsVis = isG ? GRUPOS_EST : GRUPOS_EST.filter(g => estItens.some(i => i.grupo === g && isDiaI(i.freq, dh)));
  const contados = itensDia.filter(i => chj[i.id] !== undefined && chj[i.id] !== null && chj[i.id] !== "");
  const tudoOk = contados.length === itensDia.length && itensDia.length > 0;
  const pct = itensDia.length > 0 ? Math.round((contados.length / itensDia.length) * 100) : 0;
  const alertas = estItens.filter(i => {
    const ult = Object.keys(cont).sort().reverse().map(d => cont[d][i.id]).find(v => v !== undefined && v !== null);
    return ult !== undefined && Number(ult) < i.minimo;
  });
  if (!cOk || !ncOk) return <div style={{textAlign:"center",padding:40,color:"#64748b"}}>Carregando estoque…</div>;

  const saveCont = async (id, val) => {
    if (!isDiaQq(dh)) return showT("Hoje nao e dia de contagem!", "erro");
    if (bloq) return showT("Ja finalizada!", "erro");
    await setCont({...cont, [dh]: {...chj, [id]: val === "" ? null : Number(val)}});
  };
  const finalizar = async () => {
    const hora = new Date().toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"});
    await setConc({...conc, [dh]: {quem: nomeusr, hora}});
    setMFin(false); showT("Contagem finalizada!");
    if (onCel) dispCel(contados.length, onCel, "estoque");
  };
  const subs = isG
    ? [{id:"contar",lb:"Contagem"},{id:"historico",lb:"Historico"},{id:"alertas",lb:"Alertas"},{id:"config",lb:"Config"}]
    : [{id:"contar",lb:"Contagem"},{id:"historico",lb:"Historico"}];

  return (
    <div>
      {toast && <Toast msg={toast.msg} tipo={toast.tipo}/>}
      {mFin && <Modal icone="📦" titulo="Finalizar contagem?" sub="Confirme que todos os itens foram contados."><BtnM onClick={finalizar}>Confirmar e Finalizar</BtnM><BtnC onClick={() => setMFin(false)}/></Modal>}
      <div style={{display:"flex",gap:8,margin:"12px 0"}}>{subs.map(s => <button key={s.id} onClick={() => setSub(s.id)} style={{flex:1,padding:"10px 4px",borderRadius:12,border:`1px solid ${sub===s.id?"#22c55e":"#334155"}`,background:"#1e293b",color:sub===s.id?"#22c55e":"#94a3b8",fontSize:12,fontWeight:700,cursor:"pointer"}}>{s.lb}</button>)}</div>
      {sub === "contar" && (
        <div>
          {!isDiaQq(dh) && <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:"12px 16px",marginBottom:12,fontSize:13,color:"#64748b",textAlign:"center",fontWeight:700}}>Hoje nao e dia de contagem<br/><span style={{fontSize:11,fontWeight:400}}>Seg/Sex 2x/sem - Qua 1x/sem</span></div>}
          {isDiaQq(dh) && (
            <div>
              <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:"10px 14px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:"#94a3b8"}}>Progresso</span><span style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{contados.length}/{itensDia.length}</span></div>
                <div style={{background:"#334155",borderRadius:999,height:6,overflow:"hidden"}}><div style={{height:"100%",borderRadius:999,width:`${pct}%`,background:"#22c55e",transition:"width 0.4s"}}/></div>
                <div style={{fontSize:11,color:"#64748b",marginTop:4,textAlign:"right"}}>{pct}%</div>
              </div>
              {alertas.length > 0 && <div style={{background:"#2a1a1a",border:"1px solid #ef444466",borderRadius:12,padding:"10px 14px",marginBottom:10,fontSize:12,color:"#ef4444",fontWeight:700}}>{alertas.length} item(s) abaixo do minimo!</div>}
              <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:4}}>{grpsVis.map(g => <button key={g} onClick={() => setGrp(g)} style={{flexShrink:0,padding:"8px 12px",borderRadius:10,border:`1px solid ${grp===g?"#22c55e":"#334155"}`,background:"#1e293b",color:grp===g?"#22c55e":"#94a3b8",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{g}</button>)}</div>
              {itensVis.map(item => {
                const val = chj[item.id];
                const baixo = val !== undefined && val !== null && val !== "" && Number(val) < item.minimo;
                return (
                  <div key={item.id} style={{background:"#1e293b",borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${baixo?"#ef444466":val!==undefined&&val!==null&&val!==""?"#22c55e44":"#334155"}`}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{item.nome}</div>
                        <div style={{fontSize:11,color:"#64748b",marginTop:2}}>Minimo: {item.minimo} {item.unidade}</div>
                        {baixo && <div style={{fontSize:11,color:"#ef4444",fontWeight:700,marginTop:2}}>Abaixo do minimo!</div>}
                      </div>
                      {bloq
                        ? <div style={{background:"#0f172a",borderRadius:8,padding:"8px 14px",fontSize:15,fontWeight:800,color:"#22c55e",minWidth:60,textAlign:"center"}}>{val ?? "-"}</div>
                        : <input type="number" min="0" value={val ?? ""} placeholder="0" onChange={e => saveCont(item.id, e.target.value)} style={{width:72,background:"#0f172a",border:`1px solid ${baixo?"#ef4444":"#334155"}`,borderRadius:8,color:"#f1f5f9",padding:"8px 10px",fontSize:16,fontWeight:800,textAlign:"center"}}/>}
                    </div>
                  </div>
                );
              })}
              {!bloq && itensDia.length > 0 && <button onClick={() => { if (!tudoOk) return showT("Preencha todos os itens!", "erro"); setMFin(true); }} style={{width:"100%",padding:15,background:tudoOk?"linear-gradient(135deg,#22c55e,#16a34a)":"#334155",border:"none",borderRadius:12,color:tudoOk?"#fff":"#64748b",fontWeight:900,fontSize:15,cursor:"pointer",marginTop:4,boxShadow:tudoOk?"0 4px 16px #22c55e44":"none"}}>{tudoOk?"Finalizar Contagem":"Preencha todos os itens"}</button>}
              {bloq && <div style={{background:"#1a2e22",border:"1px solid #22c55e44",borderRadius:12,padding:14,textAlign:"center",fontSize:14,color:"#22c55e",fontWeight:800}}>Contagem finalizada as {concHj.hora} por {concHj.quem}</div>}
            </div>
          )}
        </div>
      )}
      {sub === "historico" && (
        <div>
          {Object.keys(cont).sort().reverse().map(d => {
            const c = cont[d]; const feitos = Object.keys(c).filter(k => c[k] !== null && c[k] !== "").length; const cc = conc[d];
            return <div key={d} style={{background:"#1e293b",borderRadius:12,padding:"12px 16px",marginBottom:8,border:"1px solid #334155"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{fmtD(d)}</div><div style={{fontSize:11,color:"#64748b",marginTop:2}}>{feitos} itens contados</div></div><div style={{padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:800,background:cc?"#22c55e22":"#f9741622",color:cc?"#22c55e":"#f97316"}}>{cc?"Finalizado":"Incompleto"}</div></div></div>;
          })}
          {Object.keys(cont).length === 0 && <div style={{textAlign:"center",padding:24,color:"#64748b",fontSize:14}}>Nenhuma contagem registrada</div>}
        </div>
      )}
      {sub === "alertas" && isG && (
        <div>{alertas.length === 0 ? <div style={{background:"#1a2e22",border:"1px solid #22c55e44",borderRadius:12,padding:14,textAlign:"center",fontSize:14,color:"#22c55e",fontWeight:800}}>Todos os itens acima do minimo!</div> : alertas.map(item => <div key={item.id} style={{background:"#2a1a1a",borderRadius:14,padding:"14px 16px",marginBottom:10,border:"1px solid #ef444466"}}><div style={{fontSize:15,fontWeight:700,color:"#ef4444"}}>{item.nome}</div><div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>Minimo: {item.minimo} - {item.grupo}</div></div>)}</div>
      )}
      {sub === "config" && isG && (
        <div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Minimos por item</div>
          {GRUPOS_EST.map(g => (
            <div key={g} style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:800,color:"#94a3b8",marginBottom:8}}>{g}</div>
              {estItens.filter(i => i.grupo === g).map(item => (
                <div key={item.id} style={{background:"#1e293b",borderRadius:12,padding:"12px 16px",marginBottom:8,border:"1px solid #334155",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9"}}>{item.nome}</div>
                  {editMin === item.id
                    ? <div style={{display:"flex",gap:6,alignItems:"center"}}><input type="number" value={novoMin} onChange={e => setNovoMin(e.target.value)} style={{width:60,background:"#0f172a",border:"1px solid #f97316",borderRadius:8,color:"#f1f5f9",padding:"6px 8px",fontSize:14,textAlign:"center"}}/><button onClick={async () => { const v = parseInt(novoMin); if (isNaN(v)||v<0) return showT("Invalido!","erro"); await setEstItens(estItens.map(i => i.id===item.id?{...i,minimo:v}:i)); setEditMin(null); showT("Salvo!"); }} style={{background:"#22c55e22",border:"1px solid #22c55e44",color:"#22c55e",borderRadius:8,padding:"6px 10px",fontSize:13,cursor:"pointer"}}>OK</button><button onClick={() => setEditMin(null)} style={{background:"#ef444422",border:"none",color:"#ef4444",borderRadius:8,padding:"6px 10px",fontSize:13,cursor:"pointer"}}>X</button></div>
                    : <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,color:"#94a3b8",background:"#0f172a",padding:"4px 10px",borderRadius:8,fontWeight:700}}>min {item.minimo}</span><button onClick={() => { setEditMin(item.id); setNovoMin(String(item.minimo)); }} style={{background:"#f9731622",border:"1px solid #f9741644",color:"#f97316",borderRadius:8,padding:"4px 8px",fontSize:13,cursor:"pointer"}}>editar</button></div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [perfil, setPerfil, pfOk] = useCloud("ms_perfil_v1", null);
  const [alertas, setAlertas, alOk] = useCloud("ms_alertas_v2", ALERTAS_PADRAO);
  const [tarefas, setTarefas, tfOk] = useCloud("ms_tarefas_v2", TAREFAS_PADRAO);
  const [cats, setCats, ctOk] = useCloud("ms_cats_v2", CATS_PADRAO);
  const [estItens, setEstItens, esOk] = useCloud("ms_est_v2", ESTOQUE_PADRAO);
  const [regs, setRegs, rgOk] = useCloud("ms_regs_v2", {});
  const [fotos, setFotos, ftOk] = useCloud("ms_fotos_v2", {});
  const [concl, setConcl, cnOk] = useCloud("ms_concl_v2", {});
  const [tela, setTela] = useState("checklist");
  const [catSel, setCatSel] = useState(CATS_PADRAO[0]);
  const [dataSel, setDataSel] = useState(hoje());
  const [toast, setToast] = useState(null);
  const [fotoZoom, setFotoZoom] = useState(null);
  const [modoEdit, setModoEdit] = useState(false);
  const [cel, setCel] = useState(null);
  const [alertaAtivo, setAlertaAtivo] = useState(null);
  const [dismissed, setDismissed] = useState({});
  const [mConc, setMConc] = useState(false);
  const [mRenom, setMRenom] = useState(null);
  const [renomTxt, setRenomTxt] = useState("");
  const [novaDesc, setNovaDesc] = useState("");
  const [novaCat, setNovaCat] = useState(CATS_PADRAO[0]);
  const [novaFotoObrig, setNovaFotoObrig] = useState(false);
  const [novaCatNome, setNovaCatNome] = useState("");
  const [subNova, setSubNova] = useState("tarefa");
  const [infoFoto, setInfoFoto] = useState(null);
  const fileRef = useRef();

  const tudoOkApp = pfOk && alOk && tfOk && ctOk && esOk && rgOk && ftOk && cnOk;
  const isG = perfil?.role === "gestor";
  const nomeUsr = perfil?.nome || "";
  const dh = hoje();
  const showT = (msg, tipo = "ok") => { setToast({msg, tipo}); setTimeout(() => setToast(null), 2800); };

  const regsHj  = regs[dh]  || {};
  const fotosHj = fotos[dh] || {};
  const conclHj = concl[dh] || {};
  const regsSel  = regs[dataSel]  || {};
  const fotosSel = fotos[dataSel] || {};
  const conclSel = concl[dataSel] || {};
  const tfscat    = tarefas.filter(t => t.cat === catSel);
  const totalCat  = tfscat.length;
  const feitasCat = tfscat.filter(t => regsHj[t.id]).length;
  const todasF    = feitasCat === totalCat && totalCat > 0;
  const fotosC    = fotosHj[catSel] || [];
  const temFoto   = fotosC.length > 0;
  const catPF     = tfscat.some(t => t.fotoObrig);
  const catBloq   = !isG && !!conclHj[catSel];
  const totalG    = tarefas.length;
  const feitasHj  = Object.keys(regsHj).length;
  const feitasSel = Object.keys(regsSel).length;
  const pctHj  = totalG > 0 ? Math.round((feitasHj  / totalG) * 100) : 0;
  const pctSel = totalG > 0 ? Math.round((feitasSel / totalG) * 100) : 0;
  const seq = calcSeq(regs, concl, cats);

  useEffect(() => { if (!isG && (tela === "nova" || tela === "gestor")) setTela("checklist"); }, [perfil]);
  useEffect(() => {
    if (!perfil || isG) return;
    const check = () => {
      const agora = horaMin(horaAtual());
      for (const al of alertas) {
        if (!!conclHj[al.cat]) continue;
        const chave = `${dh}_${al.cat}`;
        if (dismissed[chave]) continue;
        const alMin = horaMin(al.hora);
        if (agora >= alMin && agora < alMin + 60) { setAlertaAtivo(al); return; }
      }
    };
    check(); const t = setInterval(check, 30000); return () => clearInterval(t);
  }, [perfil, concl, dismissed]);

  const dispensar = cat => { setDismissed({...dismissed, [`${dh}_${cat}`]: true}); setAlertaAtivo(null); };
  const trocar = () => { setPerfil(null); setTela("checklist"); setModoEdit(false); setAlertaAtivo(null); };

  const marcar = async id => {
    if (catBloq) return showT("Categoria ja concluida!", "erro");
    const fez = regsHj[id];
    if (fez && !isG && fez.quem !== nomeUsr) return showT(`Marcado por ${fez.quem}. Apenas gestor pode desmarcar.`, "erro");
    const novo = {...regsHj};
    if (fez) delete novo[id];
    else novo[id] = {feito:true, quem:nomeUsr, hora:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})};
    await setRegs({...regs, [dh]: novo});
    if (!fez) { showT(`${nomeUsr}`); const tot = Object.keys(novo).length; if (tot > 0 && tot % 7 === 0) dispCel(tot, setCel, "tarefas"); }
  };

  const addFoto = async e => {
    if (catBloq) return showT("Categoria ja concluida!", "erro");
    if (!todasF) return showT("Conclua todas as tarefas antes!", "erro");
    const files = Array.from(e.target.files); if (!files.length) return;
    showT("Comprimindo fotos…");
    const res = await Promise.all(files.map(f => compFoto(f)));
    const hora = new Date().toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"});
    const arr = [...(fotosHj[catSel]||[]), ...res.map(r => ({src:r.b64, quem:nomeUsr, hora, kb:r.kb}))];
    await setFotos({...fotos, [dh]: {...fotosHj, [catSel]: arr}});
    const totalKb = res.reduce((a,r) => a+r.kb, 0);
    setInfoFoto({qtd:files.length, kb:totalKb}); showT(`${files.length} foto(s) - ${totalKb}KB total`);
    e.target.value = ""; setTimeout(() => setInfoFoto(null), 4000);
  };

  const remFoto = (cat, idx, data) => { const fd = fotos[data]||{}, arr = [...(fd[cat]||[])]; arr.splice(idx,1); setFotos({...fotos,[data]:{...fd,[cat]:arr}}); showT("Foto removida"); };

  const concluirCat = async () => {
    const hora = new Date().toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"});
    await setConcl({...concl, [dh]: {...conclHj, [catSel]: {quem:nomeUsr, hora}}});
    setMConc(false); dispensar(catSel); showT(`${catSel} concluida!`);
    const prox = cats.find(c => c !== catSel && !conclHj[c]);
    if (prox) setTimeout(() => { setCatSel(prox); showT(`Proxima: ${prox}`); }, 1200);
    else setTimeout(() => showT("Tudo concluido hoje!"), 1200);
  };

  const addTarefa = async () => {
    if (!novaDesc.trim()) return showT("Digite a descricao!", "erro");
    await setTarefas([...tarefas, {id:Date.now(), titulo:novaDesc.trim(), cat:novaCat, fotoObrig:novaFotoObrig}]);
    setNovaDesc(""); setNovaFotoObrig(false); showT("Tarefa adicionada!"); setTela("checklist");
  };

  const navItems = isG
    ? [{id:"checklist",icon:"✅",label:"Tarefas"},{id:"estoque",icon:"📦",label:"Estoque"},{id:"nova",icon:"➕",label:"Nova"},{id:"gestor",icon:"📊",label:"Gestor"}]
    : [{id:"checklist",icon:"✅",label:"Tarefas"},{id:"estoque",icon:"📦",label:"Estoque"}];

  if (!tudoOkApp) return <Loading/>;

  if (!perfil) {
    return (
      <div style={g.tela}>
        <div style={{padding:32,display:"flex",flexDirection:"column",gap:20,minHeight:"100vh",justifyContent:"center"}}>
          <div style={{textAlign:"center",marginBottom:8}}>
            <div style={{fontSize:60}}>🌀</div>
            <h1 style={{fontSize:30,fontWeight:800,color:"#f97316",margin:"8px 0 4px",letterSpacing:-1}}>Meu Supervisor</h1>
            <p style={{color:"#94a3b8",fontSize:14,lineHeight:1.6}}>Quem esta usando agora?</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {PERFIS.map(p => (
              <button key={p.id} onClick={() => setPerfil(p)} style={{padding:"18px 20px",background:p.role==="gestor"?"linear-gradient(135deg,#1c2333,#0f172a)":"#1e293b",border:`2px solid ${p.role==="gestor"?"#f97316":"#334155"}`,borderRadius:16,color:"#f1f5f9",cursor:"pointer",display:"flex",alignItems:"center",gap:16,textAlign:"left"}}>
                <span style={{fontSize:34}}>{p.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:17,fontWeight:800,color:p.role==="gestor"?"#f97316":"#f1f5f9"}}>{p.nome}</div>
                  <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{p.role==="gestor"?"Acesso completo - Painel gestor":"Acesso as tarefas e estoque"}</div>
                </div>
                <span style={{fontSize:22,color:"#475569"}}>›</span>
              </button>
            ))}
          </div>
          <div style={{background:"#1e293b",border:"1px solid #22c55e44",borderRadius:12,padding:"10px 14px",textAlign:"center"}}>
            <div style={{fontSize:12,color:"#22c55e",fontWeight:700}}>🔴 Dados em tempo real via Firebase</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:2}}>Todos os dispositivos sincronizados automaticamente</div>
          </div>
        </div>
        <style>{css}</style>
      </div>
    );
  }

  const AlertaOv = alertaAtivo ? (
    <div style={{position:"fixed",inset:0,background:"#000c",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:16}}>
      <div style={{background:"#1e293b",borderRadius:20,padding:24,width:"100%",maxWidth:440,border:"2px solid #f97316",boxShadow:"0 8px 40px #f9741644"}}>
        <div style={{fontSize:32,textAlign:"center",marginBottom:8}}>⏰</div>
        <div style={{fontSize:18,fontWeight:900,color:"#f97316",textAlign:"center",marginBottom:6}}>Atencao, {nomeUsr.split(" ")[0]}!</div>
        <div style={{fontSize:14,color:"#f1f5f9",textAlign:"center",lineHeight:1.6,marginBottom:16}}>Ja passou das <strong>{alertaAtivo.hora}</strong> e a categoria <strong style={{color:"#f97316"}}>{alertaAtivo.cat}</strong> nao foi concluida!</div>
        <button onClick={() => { setCatSel(alertaAtivo.cat); setTela("checklist"); setAlertaAtivo(null); }} style={{width:"100%",padding:14,background:"#f97316",border:"none",borderRadius:12,color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",marginBottom:8}}>Ir para {alertaAtivo.cat}</button>
        <button onClick={() => dispensar(alertaAtivo.cat)} style={{width:"100%",padding:12,background:"transparent",border:"1px solid #334155",borderRadius:12,color:"#64748b",fontWeight:700,fontSize:14,cursor:"pointer"}}>Lembrar mais tarde</button>
      </div>
    </div>
  ) : null;

  return (
    <div style={g.tela}>
      {toast && <Toast msg={toast.msg} tipo={toast.tipo}/>}
      {AlertaOv}
      {cel && <Celebracao cel={cel} nome={nomeUsr.split(" ")[0]}/>}
      {fotoZoom && <div style={{position:"fixed",inset:0,background:"#000d",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}} onClick={() => setFotoZoom(null)}><img src={fotoZoom} style={{maxWidth:"95vw",maxHeight:"80vh",borderRadius:12}} alt="zoom"/><div style={{color:"#fff",fontSize:14,fontWeight:700,background:"#ffffff22",padding:"8px 20px",borderRadius:20}}>Fechar</div></div>}
      {mConc && <Modal icone="🏁" titulo={`Concluir ${catSel}?`} sub="As tarefas ficam bloqueadas para hoje."><BtnM onClick={concluirCat}>Sim, concluir</BtnM><BtnC onClick={() => setMConc(false)}/></Modal>}
      {mRenom && <Modal icone="✏️" titulo="Renomear Tarefa"><input style={{...g.input,marginTop:4}} value={renomTxt} onChange={e => setRenomTxt(e.target.value)} autoFocus/><BtnM onClick={async () => { if (!renomTxt.trim()) return showT("Nome vazio!","erro"); await setTarefas(tarefas.map(t => t.id===mRenom?{...t,titulo:renomTxt.trim()}:t)); setMRenom(null); showT("Renomeada!"); }}>Salvar</BtnM><BtnC onClick={() => setMRenom(null)}/></Modal>}

      <div style={g.header}>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:"#f97316"}}>Meu Supervisor</div>
          <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{nomeUsr}{isG && <span style={{color:"#f97316",fontWeight:800}}> Gestor</span>}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {seq > 0 && <div style={{background:"#f9731622",border:"1px solid #f9741644",borderRadius:8,padding:"3px 8px",fontSize:11,fontWeight:800,color:"#f97316"}}>🔥{seq}d</div>}
          <button onClick={trocar} style={{background:"#334155",border:"none",color:"#94a3b8",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>Trocar</button>
        </div>
      </div>

      {tela === "checklist" && <div style={{background:"#1e293b",margin:"10px 16px",borderRadius:14,padding:"12px 16px",border:"1px solid #334155"}}>
        {!isG && <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>{seq>=7?"🏆":seq>=3?"🔥":"⚡"}</span>
            <span style={{fontSize:12,fontWeight:800,color:"#f1f5f9"}}>{seq} {seq===1?"dia":"dias"} seguidos</span>
            <span style={{fontSize:10,color:"#64748b"}}>{seq===0?"Comece hoje!":seq<7?`${7-seq}d p/ semana perfeita`:"Semana perfeita!"}</span>
          </div>
          <div style={{fontSize:18,fontWeight:900,color:seq>=7?"#22c55e":seq>0?"#f97316":"#475569"}}>{seq}🔥</div>
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:"#94a3b8"}}>{fmtD(dh)}</span><span style={{fontSize:12,color:"#f1f5f9",fontWeight:700}}>{feitasHj}/{totalG}</span></div>
        <div style={{background:"#334155",borderRadius:999,height:7,overflow:"hidden"}}><div style={{height:"100%",borderRadius:999,width:`${pctHj}%`,background:pctHj===100?"#22c55e":"#f97316",transition:"width 0.4s"}}/></div>
        <div style={{fontSize:11,color:"#64748b",marginTop:5,textAlign:"right"}}>{pctHj}% concluido hoje</div>
      </div>}
      {tela === "estoque" && <div style={{background:"#1e293b",margin:"10px 16px",borderRadius:14,padding:"12px 16px",border:"1px solid #334155"}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#94a3b8"}}>Controle de Estoque</span><span style={{fontSize:12,color:"#f1f5f9",fontWeight:700}}>{isDiaQq(dh)?"Dia de contagem":"Sem contagem"}</span></div><div style={{fontSize:11,color:"#64748b",marginTop:4}}>Seg e Sex 2x/sem - Qua 1x/sem</div></div>}

      <div style={{padding:"0 16px 16px"}}>
        {tela === "checklist" && (
          <div>
            <div style={{display:"flex",gap:6,margin:"10px 0"}}>
              {cats.map(c => {
                const ts = tarefas.filter(t => t.cat===c); const fs = ts.filter(t => regsHj[t.id]).length; const ok = !!conclHj[c];
                const ic = c==="Abertura"?"🌅":c==="Manutenção Diurna"?"🔧":c==="Fim Expediente"?"🌙":"📋";
                const alrt = alertas.find(a => a.cat===c); const atrasado = alrt&&!ok&&horaMin(horaAtual())>=horaMin(alrt.hora);
                return <button key={c} onClick={() => { setCatSel(c); setModoEdit(false); }} style={{flex:1,padding:"10px 4px",borderRadius:12,border:`2px solid ${catSel===c?"#f97316":ok?"#22c55e":atrasado?"#ef444466":"#334155"}`,background:ok?"#1a2e22":atrasado?"#2a1a1a":"#1e293b",color:ok?"#22c55e":catSel===c?"#f97316":atrasado?"#ef4444":"#94a3b8",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><span>{ok?"✅":atrasado?"⏰":ic}</span><span style={{fontSize:10,textAlign:"center",lineHeight:1.2}}>{c}</span><span style={{fontSize:10,background:"#0f172a",borderRadius:6,padding:"1px 6px",color:"#64748b"}}>{fs}/{ts.length}</span></button>;
              })}
            </div>
            {catBloq && <div style={g.bannerLaranja}>Concluida por {conclHj[catSel]?.quem} as {conclHj[catSel]?.hora}</div>}
            {isG && <button onClick={() => setModoEdit(!modoEdit)} style={{width:"100%",padding:10,background:"#1e293b",border:`1px solid ${modoEdit?"#f97316":"#475569"}`,borderRadius:10,color:modoEdit?"#f97316":"#94a3b8",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10}}>{modoEdit?"Sair da edicao":"Editar tarefas"}</button>}
            {tfscat.map(t => {
              const reg = regsHj[t.id]; const outro = reg&&!isG&&reg.quem!==nomeUsr;
              return (
                <div key={t.id} onClick={() => !modoEdit&&!catBloq&&!outro&&marcar(t.id)} style={{background:reg?"#1a2e22":"#1e293b",borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${reg?"#22c55e44":"#334155"}`,cursor:modoEdit||catBloq||outro?"default":"pointer",opacity:catBloq?0.75:1}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                    <div style={{width:24,height:24,borderRadius:8,border:`2px solid ${reg?"#22c55e":"#475569"}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1,background:reg?"#22c55e":"transparent"}}>{reg?<span style={{color:"#fff",fontSize:14,fontWeight:800}}>✓</span>:outro?<span style={{fontSize:12}}>🔒</span>:null}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:700,color:reg?"#64748b":"#f1f5f9",textDecoration:reg?"line-through":"none"}}>{t.titulo}</div>
                      {t.fotoObrig&&!reg&&<div style={{fontSize:10,color:"#ef4444",fontWeight:700,marginTop:2}}>FOTO OBRIGATÓRIA</div>}
                      {reg&&<div style={{fontSize:11,color:"#22c55e",marginTop:3,fontWeight:600}}>{reg.quem} - {reg.hora}</div>}
                    </div>
                    {modoEdit&&isG&&<button onClick={e=>{e.stopPropagation();setMRenom(t.id);setRenomTxt(t.titulo);}} style={{background:"#f9731622",border:"1px solid #f9741644",color:"#f97316",borderRadius:8,padding:"6px 10px",fontSize:14,cursor:"pointer",flexShrink:0}}>✏️</button>}
                  </div>
                </div>
              );
            })}
            {!modoEdit&&catPF&&(
              <div style={{background:temFoto?"#1a2e22":"#1e293b",borderRadius:14,padding:16,marginTop:4,marginBottom:12,border:`2px ${temFoto?"solid #22c55e":todasF?"solid #f97316":"dashed #334155"}`}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                  <span style={{fontSize:24,flexShrink:0}}>📸</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:"#f1f5f9"}}>Fotos - {catSel}</div>
                    <div style={{fontSize:12,color:"#94a3b8",marginTop:3}}>{catBloq?`${fotosC.length} foto(s)`:temFoto?`${fotosC.length} foto(s)`:todasF?"Tarefas ok! Adicione as fotos.":`Conclua as ${totalCat} tarefas para liberar`}</div>
                    {infoFoto&&<div style={{fontSize:10,color:"#22c55e",marginTop:3,fontWeight:700}}>{infoFoto.qtd} foto(s) - {infoFoto.kb}KB total</div>}
                  </div>
                </div>
                {fotosC.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>{fotosC.map((f,i)=><div key={i} style={{position:"relative",borderRadius:10,overflow:"hidden",background:"#0f172a"}}><img src={f.src} style={{width:"100%",height:110,objectFit:"cover",cursor:"pointer",display:"block"}} onClick={()=>setFotoZoom(f.src)} alt={`f${i}`}/><div style={{fontSize:10,color:"#94a3b8",padding:"3px 8px",background:"#1e293b"}}>{f.quem?.split(" ")[0]} - {f.hora}{f.kb?` - ${f.kb}KB`:""}</div>{isG&&<button onClick={()=>remFoto(catSel,i,dh)} style={{position:"absolute",top:4,right:4,background:"#ef444499",border:"none",color:"#fff",borderRadius:"50%",width:22,height:22,fontSize:11,cursor:"pointer",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>X</button>}</div>)}</div>}
                {!catBloq&&<><input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={addFoto}/><button onClick={()=>todasF?fileRef.current.click():showT("Conclua as tarefas primeiro!","erro")} style={{width:"100%",padding:13,background:todasF?"#f97316":"#334155",border:"none",borderRadius:10,color:todasF?"#fff":"#64748b",fontWeight:800,fontSize:14,cursor:"pointer"}}>{todasF?(temFoto?"Mais fotos":"Tirar ou Escolher Fotos"):"Libera apos concluir tarefas"}</button></>}
              </div>
            )}
            {!modoEdit&&!catBloq&&(
              <button onClick={()=>{if(!todasF)return showT("Conclua todas as tarefas!","erro");if(catPF&&!temFoto)return showT("Adicione ao menos uma foto!","erro");setMConc(true);}} style={{width:"100%",padding:15,background:(todasF&&(!catPF||temFoto))?"linear-gradient(135deg,#22c55e,#16a34a)":"#334155",border:"none",borderRadius:12,color:(todasF&&(!catPF||temFoto))?"#fff":"#64748b",fontWeight:900,fontSize:15,cursor:"pointer",marginTop:4,marginBottom:8,boxShadow:(todasF&&(!catPF||temFoto))?"0 4px 16px #22c55e44":"none"}}>
                {(todasF&&(!catPF||temFoto))?"🏁 Tarefa Concluida":catPF&&todasF?"Adicione a foto para finalizar":"Conclua tarefas para finalizar"}
              </button>
            )}
            {catBloq&&<div style={g.bannerVerde}>Categoria concluida e bloqueada para hoje</div>}
          </div>
        )}

        {tela === "estoque" && <Estoque nomeusr={nomeUsr} isG={isG} estItens={estItens} setEstItens={setEstItens} onCel={setCel}/>}

        {tela === "nova" && isG && (
          <div>
            <div style={{display:"flex",gap:8,margin:"12px 0"}}>
              {[["tarefa","📋","Tarefa"],["categoria","🗂️","Categoria"],["alertas","⏰","Alertas"]].map(([id,ic,lb]) => (
                <button key={id} onClick={() => setSubNova(id)} style={{flex:1,padding:"10px 4px",borderRadius:12,border:`1px solid ${subNova===id?"#f97316":"#334155"}`,background:"#1e293b",color:subNova===id?"#f97316":"#94a3b8",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><span>{ic}</span><span>{lb}</span></button>
              ))}
            </div>
            {subNova === "tarefa" && (
              <div style={g.formCard}>
                <label style={g.label}>Descricao</label>
                <input style={g.input} placeholder="Ex: Limpar maquina de milkshake" value={novaDesc} onChange={e => setNovaDesc(e.target.value)}/>
                <label style={g.label}>Categoria</label>
                <select style={g.input} value={novaCat} onChange={e => setNovaCat(e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select>
                <div onClick={() => setNovaFotoObrig(!novaFotoObrig)} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",padding:"10px 12px",background:"#0f172a",borderRadius:10,border:`1px solid ${novaFotoObrig?"#ef4444":"#334155"}`}}>
                  <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${novaFotoObrig?"#ef4444":"#475569"}`,background:novaFotoObrig?"#ef4444":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{novaFotoObrig&&<span style={{color:"#fff",fontSize:13,fontWeight:800}}>✓</span>}</div>
                  <div><div style={{fontSize:13,fontWeight:700,color:novaFotoObrig?"#ef4444":"#94a3b8"}}>Foto obrigatoria</div><div style={{fontSize:11,color:"#64748b",marginTop:1}}>Funcionario vera aviso em vermelho</div></div>
                </div>
                <button style={g.btnPrimary} onClick={addTarefa}>+ Adicionar Tarefa</button>
                <div style={{fontSize:12,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginTop:8}}>Tarefas cadastradas</div>
                {tarefas.map(t => (
                  <div key={t.id} style={{background:"#0f172a",borderRadius:10,padding:"10px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #1e293b"}}>
                    <div><div style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{t.titulo}{t.fotoObrig&&<span style={{fontSize:10,color:"#ef4444",marginLeft:6}}>📸</span>}</div><div style={{fontSize:10,color:"#64748b"}}>{t.cat}</div></div>
                    <button onClick={async () => { await setTarefas(tarefas.filter(x => x.id!==t.id)); showT("Removida"); }} style={{background:"#ef444422",border:"none",color:"#ef4444",borderRadius:8,width:28,height:28,fontSize:13,cursor:"pointer",fontWeight:800}}>X</button>
                  </div>
                ))}
              </div>
            )}
            {subNova === "categoria" && (
              <div>
                <div style={g.formCard}>
                  <label style={g.label}>Nova categoria</label>
                  <input style={g.input} placeholder="Ex: Pre-Abertura" value={novaCatNome} onChange={e => setNovaCatNome(e.target.value)}/>
                  <button style={{...g.btnPrimary,background:"#6366f1"}} onClick={async () => { const n = novaCatNome.trim(); if (!n) return showT("Digite um nome!","erro"); if (cats.includes(n)) return showT("Ja existe!","erro"); await setCats([...cats,n]); setNovaCatNome(""); showT(`${n} criada!`); }}>+ Criar Categoria</button>
                </div>
                <div style={{fontSize:12,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:1,margin:"16px 0 8px"}}>Categorias</div>
                {cats.map(c => (
                  <div key={c} style={{background:"#1e293b",borderRadius:12,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #334155"}}>
                    <span style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{c}</span>
                    {!CATS_PADRAO.includes(c)&&<button onClick={async () => { await setCats(cats.filter(x => x!==c)); showT("Removida"); }} style={{background:"#ef444422",border:"none",color:"#ef4444",borderRadius:8,width:32,height:32,fontSize:14,cursor:"pointer",fontWeight:800}}>X</button>}
                  </div>
                ))}
              </div>
            )}
            {subNova === "alertas" && (
              <div>
                <div style={g.banner}>Configure o horario limite de cada categoria.</div>
                {cats.map(cat => {
                  const al = alertas.find(a => a.cat===cat) || {cat, hora:"00:00"};
                  return (
                    <div key={cat} style={{background:"#1e293b",borderRadius:12,padding:"14px 16px",marginBottom:10,border:"1px solid #334155"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div><div style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{cat}</div><div style={{fontSize:11,color:"#64748b",marginTop:2}}>Alerta se nao concluida ate:</div></div>
                        <input type="time" value={al.hora} onChange={async e => { const h = e.target.value; await setAlertas(prev => [...prev.filter(a => a.cat!==cat), {cat, hora:h}]); }} style={{background:"#0f172a",border:"1px solid #334155",borderRadius:8,color:"#f97316",padding:"8px 10px",fontSize:16,fontWeight:800}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tela === "gestor" && isG && (
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:1,margin:"12px 0 10px"}}>Painel do Gestor</div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <label style={{fontSize:13,color:"#94a3b8",whiteSpace:"nowrap"}}>Data:</label>
              <input type="date" value={dataSel} onChange={e => setDataSel(e.target.value)} style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#f1f5f9",padding:"8px 10px",fontSize:14,flex:1}}/>
            </div>
            <div style={{background:"#1e293b",borderRadius:14,padding:16,marginBottom:8,border:"1px solid #334155"}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:14,color:"#f1f5f9"}}>📊 {fmtD(dataSel)}</div>
              <div style={{display:"flex"}}>
                <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:"#22c55e"}}>{feitasSel}</div><div style={{fontSize:11,color:"#64748b",marginTop:2}}>Feitas</div></div>
                <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:"#ef4444"}}>{totalG-feitasSel}</div><div style={{fontSize:11,color:"#64748b",marginTop:2}}>Pendentes</div></div>
                <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:"#f97316"}}>{pctSel}%</div><div style={{fontSize:11,color:"#64748b",marginTop:2}}>Conclusao</div></div>
              </div>
              <div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap"}}>{cats.map(c => { const cl = conclSel[c]; return <div key={c} style={{padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:800,background:cl?"#22c55e22":"#ef444422",color:cl?"#22c55e":"#ef4444"}}>{cl?"✅":"⏳"} {c}</div>; })}</div>
            </div>
            {cats.map(cat => {
              const ts = tarefas.filter(t => t.cat===cat); const fa = fotosSel[cat]||[]; const cl = conclSel[cat];
              return (
                <div key={cat}>
                  <div style={{fontSize:13,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:1,margin:"20px 0 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span>{cat}</span>{cl&&<span style={{fontSize:10,color:"#22c55e",fontWeight:700,textTransform:"none"}}>{cl.quem} - {cl.hora}</span>}
                  </div>
                  {ts.map(t => { const reg = regsSel[t.id]; return (
                    <div key={t.id} style={{background:"#1e293b",borderRadius:14,padding:"14px 16px",marginBottom:10,border:"1px solid #334155",opacity:reg?1:0.55}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                        <div style={{width:24,height:24,borderRadius:8,border:`2px solid ${reg?"#22c55e":"#475569"}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1,background:reg?"#22c55e":"transparent"}}>{reg&&<span style={{color:"#fff",fontSize:14,fontWeight:800}}>✓</span>}</div>
                        <div><div style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{t.titulo}</div>{reg?<div style={{fontSize:11,color:"#22c55e",marginTop:3,fontWeight:600}}>{reg.quem} - {reg.hora}</div>:<div style={{fontSize:11,color:"#ef4444",marginTop:3,fontWeight:600}}>Nao realizada</div>}</div>
                      </div>
                    </div>
                  );})}
                  {fa.length>0&&<div style={{background:"#1a2e22",borderRadius:14,padding:16,marginBottom:8,border:"1px solid #22c55e44"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{fa.map((f,i)=><div key={i} style={{position:"relative",borderRadius:10,overflow:"hidden",background:"#0f172a"}}><img src={f.src} style={{width:"100%",height:100,objectFit:"cover",cursor:"pointer",display:"block"}} onClick={()=>setFotoZoom(f.src)} alt={`f${i}`}/><button onClick={()=>remFoto(cat,i,dataSel)} style={{position:"absolute",top:4,right:4,background:"#ef444499",border:"none",color:"#fff",borderRadius:"50%",width:20,height:20,fontSize:10,cursor:"pointer",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>X</button></div>)}</div></div>}
                </div>
              );
            })}
            <div style={{fontSize:13,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:1,margin:"20px 0 10px"}}>Historico recente</div>
            {Object.keys(regs).sort().reverse().slice(0,7).map(d => {
              const qtd = Object.keys(regs[d]||{}).length; const p = totalG>0?Math.round((qtd/totalG)*100):0; const cls = concl[d]||{};
              return (
                <div key={d} onClick={() => setDataSel(d)} style={{background:"#1e293b",borderRadius:12,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #334155",cursor:"pointer"}}>
                  <div><div style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{fmtD(d)}</div><div style={{fontSize:11,color:"#64748b",marginTop:2}}>{qtd}/{totalG} tarefas - {Object.keys(cls).length}/{cats.length} cats</div></div>
                  <div style={{padding:"4px 10px",borderRadius:8,fontSize:13,fontWeight:800,background:p===100?"#22c55e22":"#f9741622",color:p===100?"#22c55e":"#f97316"}}>{p}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#1e293b",borderTop:"1px solid #334155",display:"flex",padding:"8px 0 14px",zIndex:20}}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => { setTela(n.id); setModoEdit(false); }} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",color:tela===n.id?"#f97316":"#64748b",cursor:"pointer",padding:"4px 0"}}>
            <span style={{fontSize:20}}>{n.icon}</span>
            <span style={{fontSize:11,fontWeight:700}}>{n.label}</span>
          </button>
        ))}
      </div>
      <style>{css}</style>
    </div>
  );
}

const g = {
  tela:         {fontFamily:"system-ui,sans-serif",background:"#0f172a",minHeight:"100vh",color:"#f1f5f9",maxWidth:480,margin:"0 auto",position:"relative",paddingBottom:88},
  formCard:     {background:"#1e293b",borderRadius:14,padding:20,border:"1px solid #334155",display:"flex",flexDirection:"column",gap:14},
  label:        {fontSize:13,fontWeight:700,color:"#94a3b8"},
  input:        {background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#f1f5f9",padding:"12px 14px",fontSize:15,width:"100%",boxSizing:"border-box"},
  btnPrimary:   {background:"#f97316",border:"none",color:"#fff",borderRadius:10,padding:14,fontSize:15,fontWeight:800,cursor:"pointer",width:"100%"},
  header:       {background:"#1e293b",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #334155",position:"sticky",top:0,zIndex:10},
  banner:       {background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#94a3b8",lineHeight:1.5},
  bannerLaranja:{background:"#1e293b",border:"1px solid #f9741633",borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#f97316",fontWeight:700,textAlign:"center"},
  bannerVerde:  {background:"#1a2e22",border:"1px solid #22c55e44",borderRadius:12,padding:14,marginTop:8,fontSize:14,color:"#22c55e",fontWeight:800,textAlign:"center"},
};
const css = `*{box-sizing:border-box;margin:0;padding:0;}body{background:#0f172a;}input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1);}input[type=number]::-webkit-inner-spin-button{opacity:1;}input[type=time]{color-scheme:dark;}::-webkit-scrollbar{display:none;}select{appearance:none;}select option{background:#1e293b;}`;
