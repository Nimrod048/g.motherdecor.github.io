// TROQUE pelo número da loja: código do país + DDD + número, só dígitos (ex.: 5511999999999)
const WHATSAPP="5548999010844";
const API="api/api.php";

/* Chamada à API: api("acao") faz GET; api("acao",{...}) faz POST com JSON; o 3º argumento são parâmetros de URL */
async function api(a,dados,qs){
if(location.protocol==="file:")throw new Error("Abra o site por http://localhost/motherdecor/ (com o Laragon ligado) em vez de clicar duas vezes no arquivo.");
const u=`${API}?a=${a}${qs?"&"+new URLSearchParams(qs):""}`;
let r,t,j;
try{r=await fetch(u,dados===undefined?{}:{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(dados)});t=await r.text()}
catch(e){throw new Error("Não foi possível conectar ao servidor. Confira se o Apache e o MySQL estão ligados e se o endereço começa com http://localhost.")}
try{j=JSON.parse(t)}catch(e){throw new Error(`O servidor respondeu algo que não é JSON (HTTP ${r.status}): ${t.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,200)||"resposta vazia"}`)}
if(!r.ok)throw new Error(j.erro||"Erro inesperado.");
return j}

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const brl=v=>Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const norm=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const opts=(l,v,all)=>(all?`<option value="">${all}</option>`:"")+l.map(x=>`<option${x===v?" selected":""}>${esc(x)}</option>`).join("");
const STATUS=["Pendente","Confirmado","Em Trânsito","Concluído","Cancelado"];
let CATS=[]; // {nome,e}: vem da API
const emoji=c=>(CATS.find(x=>x.nome===c)||{e:"✨"}).e;
const bg=i=>+i.foto?`background-image:url(${API}?a=foto&id=${i.id}&v=${i.v})`:`--h:${i.h}`;
const waLink=m=>`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(m)}`;
const ICON_LOCK='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const ICON_WA='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z"/></svg>';

/* datas: sempre texto AAAA-MM-DD */
const hoje=()=>new Date().toLocaleDateString("sv-SE");
const soma=(d,n)=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return x.toLocaleDateString("sv-SE")};
const fd=s=>String(s).split("-").reverse().join("/");
const dias=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5)+1;

let tt;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),2600)}

/* Carrinho: fica no navegador {inicio,fim,itens:{idDecoracao:quantidade}}; o servidor confere preços e estoque ao finalizar */
const CK="motherdecor_carrinho";
const vazio=()=>({inicio:"",fim:"",itens:{}});
const cart=()=>{try{return JSON.parse(localStorage.getItem(CK))||vazio()}catch(e){return vazio()}};
const setCart=c=>{try{localStorage.setItem(CK,JSON.stringify(c))}catch(e){}};
function atualizaCarrinho(){const e=$("#cartn");if(e){const n=Object.values(cart().itens).reduce((s,q)=>s+q,0);e.textContent=n?` (${n})`:""}}

/* Painel: se não houver funcionário logado, mostra o formulário de login no lugar da página */
function guarda(U){
if(U.staff)return true;
$("main").innerHTML=`<div class="authbox"><h1>Acesso restrito</h1><p class="nota">Área exclusiva para funcionários.</p><form id="lf"><label>E-mail<input name="email" type="email" required autocomplete="username"></label><label>Senha<input name="senha" type="password" required autocomplete="current-password"></label><p class="msg" id="lm" role="alert"></p><button class="btn">Entrar</button><span class="nota">Demonstração: admin@motherdecor.com / admin123</span></form></div>`;
$("#lf").onsubmit=async e=>{e.preventDefault();const f=e.target;try{await api("staff_login",{email:f.email.value,senha:f.senha.value});location.reload()}catch(x){$("#lm").textContent=x.message}};
return false}

/* Cabeçalho e rodapé iguais em todas as páginas (a página só precisa de <div id="topo"></div> e <div id="rodape"></div>). Devolve {cliente,staff,demo} */
async function layout(pg){
const adm=["admin","alugueis","relatorios"].includes(pg),on=p=>pg===p?' class="on" aria-current="page"':"";
let U={cliente:null,staff:false,demo:false};try{U=await api("eu")}catch(e){}
const nav=adm
?`<span class="badge">Painel administrativo</span><nav class="menu"><a href="admin.html"${on("admin")}>Acervo</a><a href="alugueis.html"${on("alugueis")}>Aluguéis</a><a href="relatorios.html"${on("relatorios")}>Relatórios</a><a href="index.html">Ver site</a>${U.staff?'<a href="#" id="sair">Sair</a>':""}</nav>`
:`<nav class="menu"><a href="index.html"${on("inicio")}>Início</a><a href="catalogo.html"${on("catalogo")}>Catálogo</a><a href="carrinho.html"${on("carrinho")}>Carrinho<span id="cartn"></span></a>${U.cliente?`<a href="meus-pedidos.html"${on("pedidos")}>Meus pedidos</a><span class="ola">Olá, ${esc(U.cliente.nome.split(" ")[0])}</span><a href="#" id="sair">Sair</a>`:`<a href="login.html"${on("login")}>Entrar</a>`}</nav></nav>${U.demo?`<a class="icone" href="admin.html" aria-label="Área administrativa" title="Área administrativa">${ICON_LOCK}</a>`:""}`; // o ícone do painel só aparece com MODO_DEMO=true (api/config.php);
$("#topo").outerHTML=`<header class="topo"><div class="wrap topo-in"><a class="marca" href="index.html"><img src="images/logo.png" alt="" width="40" height="40">MotherDecor</a>${nav}</div></header>`;
$("#rodape").outerHTML=`<footer class="rodape"><div class="wrap">© ${new Date().getFullYear()} MotherDecor</div></footer>`;
document.body.insertAdjacentHTML("beforeend",'<div id="toast" role="status"></div>');
atualizaCarrinho();
const s=$("#sair");if(s)s.onclick=async e=>{e.preventDefault();try{await api("sair",{tipo:adm?"f":"c"})}catch(x){}if(adm)location.reload();else location.href="index.html"};
return U}