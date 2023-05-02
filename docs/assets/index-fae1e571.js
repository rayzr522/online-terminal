var N=Object.defineProperty;var j=(r,e,t)=>e in r?N(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var b=(r,e,t)=>(j(r,typeof e!="symbol"?e+"":e,t),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const d of s.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&n(d)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();function x(r){let e=new p(r.name);return r.children.map(n=>{if(n.type==="f")return k(n);if(n.type==="d")return x(n)}).forEach(n=>e.add(n)),e}function k(r){return new O(r.name,r.content)}const g=class{constructor(e,t){this._id=g.nextID++,this.name=e,this.type=t}static deserialize(e){return e?x(e):new p("")}getPath(){let e="",t=this;for(;t;)e=t.name+"/"+e,t=t.parent;return e}};let u=g;b(u,"nextID",0);class p extends u{constructor(e){super(e,"d"),this.children=[]}get(e){return this.children.find(t=>t.name===e)}exists(e){return!!this.get(e)}add(e){return this.exists(e.name)||e.parent?!1:(Object.defineProperty(e,"parent",{value:this}),this.children.push(e),!0)}remove(e){let t=this.children.findIndex(n=>n._id===e._id);t>-1&&this.children.splice(t,1)}}class O extends u{constructor(e,t){super(e,"f"),this.content=t||""}erase(){this.content=""}write(e){this.content=e}append(e){this.write(this.content+e)}}const a={dirname:r=>r.substr(0,r.lastIndexOf("/"))||"/",basename:r=>r.substr(r.lastIndexOf("/")+1),join:(r,e)=>r+(r.endsWith("/")?"":"/")+e};class h{constructor(e=new p(""),t="/"){this.root=e,this.pwd=t,(!this.exists(this.pwd)||this.get(this.pwd).type!=="d")&&(this.pwd="/")}static deserialize(e){return e?new h(u.deserialize(e.root),e.pwd):new h}_resolve(e){let t=e,n=this.pwd;if(t===".")return n;if(t==="..")return a.dirname(n);for(t.startsWith("./")&&(t=t.substr(2));t.startsWith("../");)t=t.substr(3),n=a.dirname(n);return t.startsWith("/")||(t=a.join(n,t)),t}get(e){let n=this._resolve(e).substr(1).split("/"),i=this.root;for(;n.length;){let s=n.shift();if(s&&(i=i.get(s),!i||n.length>0&&i.type!=="d"))return}return i}exists(e){return!!this.get(e)}touch(e){if(this.exists(e))return;let t=this.get(a.dirname(this._resolve(e)));!t||!t.type==="d"||t.add(new O(a.basename(e)))}mkdir(e){if(this.exists(e))return;let t=this.get(a.dirname(this._resolve(e)));!t||!t.type==="d"||t.add(new p(a.basename(e)))}readDir(e){let t=this.get(e);if(!(!t||t.type!=="d"))return t.children}readFile(e){let t=this.get(e);if(!(!t||t.type!=="f"))return t.content}writeFile(e,t){let n=this.get(e);!n||n.type!=="f"||n.write(t)}appendFile(e,t){let n=this.get(e);!n||n.type!=="f"||n.append(t)}delete(e){let t=this.get(e);!t||!t.parent||t.parent.remove(t)}}const P=r=>document.querySelector(r),L={default:["output-item"],error:["output-item","output-item-error"]},w=P(".commandOutput"),I=r=>e=>{const t=document.createElement("div");t.classList.add(...r),t.innerText=e+`
`,w.appendChild(t),w.scrollTop=w.scrollHeight},v=I(L.default),$=I(L.error);let o,f,m={};window.addEventListener("load",function(){o=JSON.parse(localStorage.getItem("sys")||"{}"),o.fs=h.deserialize(o.fs),f=document.querySelector(".commandInput"),f.focus(),document.addEventListener("keydown",r=>{r.keyCode===13&&(E(f.value),f.value="")})});window.addEventListener("unload",function(){localStorage.setItem("sys",JSON.stringify(o))});function E(r){v(`$ ${r}`);let e=r.split(" "),t=e[0].toLowerCase(),n=e.slice(1),i=m[t],s;if(i)try{let d=i(n);d!==void 0&&v(`${d}`)}catch(d){s=d}else s="Unknown command: "+t;s&&$(s)}function l(r,e,t){let n=[].concat(r).map(i=>i.toLowerCase());t.description=e,n.forEach(i=>m[i]=t)}function c(r,e,t){if(r.length<e)throw"Usage: "+t}function y(r){return r.map(e=>parseInt(e)).filter(e=>!isNaN(e))}l(["add","+"],"adds two or more numbers",r=>y(r).reduce((e,t)=>e+t,0));l(["subtract","-"],"subtracts two or more numbers",r=>{let e=y(r),t=e.shift();return e.reduce((n,i)=>n-i,t)});l(["multiply","*"],"multiplies two or more numbers",r=>y(r).reduce((e,t)=>e*t,1));l("cd","changes the current working directory to a different folder",r=>{c(r,1,"cd <folder>");let e=o.fs._resolve(r[0]),t=o.fs.get(e);if(t&&t.type==="d")o.fs.pwd=e;else throw'The folder "'+e+'" does not exist!';return e});l("pwd","shows the current working directory",()=>o.fs.pwd||"/");l("ls","lists all files in the current directory",r=>o.fs.readDir(r[0]||"").map(e=>e.name+(e.type==="d"?"/":"")).join(`
`));l("touch","creates or updates the timestamp for the given file",r=>c(r,1,"touch <file>")||o.fs.touch(r[0]));l("mkdir","makes a new directory",r=>c(r,1,"mkdir <folder>")||o.fs.mkdir(r[0]));l("cat","outputs the contents of a file",r=>c(r,1,"cat <file>")||o.fs.readFile(r[0]));l("write","writes the given contents to a file",r=>c(r,1,"write <file> [contents]")||o.fs.writeFile(r[0],r.slice(1).join(" ")+`
`));l("append","appends the given contents to a file",r=>c(r,1,"append <file> [contents]")||o.fs.appendFile(r[0],r.slice(1).join(" ")+`
`));l("rm","removes a file",r=>c(r,1,"rm <path>")||o.fs.delete(r[0]));l("help","shows a list of all commands",()=>{let r=Object.keys(m).sort(),e=r.reduce((t,n)=>Math.max(t,n.length),0);return r.map(t=>`${t}${" ".repeat(e-t.length)} : ${m[t].description}`).join(`
`)});
