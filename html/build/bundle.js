var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(t,e){t.appendChild(e)}function l(t,e,n){t.insertBefore(e,n||null)}function u(t){t.parentNode.removeChild(t)}function a(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function i(t){return document.createElement(t)}function h(t){return document.createTextNode(t)}function f(){return h(" ")}function d(){return h("")}function p(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function m(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function g(t){return""===t?null:+t}function $(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function b(t,e){t.value=null==e?"":e}function v(t,e,n,o){null===n?t.style.removeProperty(e):t.style.setProperty(e,n,o?"important":"")}function _(t,e){for(let n=0;n<t.options.length;n+=1){const o=t.options[n];if(o.__value===e)return void(o.selected=!0)}t.selectedIndex=-1}function x(t){const e=t.querySelector(":checked")||t.options[0];return e&&e.__value}let y;function w(t){y=t}const C=[],k=[],L=[],M=[],E=Promise.resolve();let O=!1;function N(t){L.push(t)}const R=new Set;let j=0;function B(){const t=y;do{for(;j<C.length;){const t=C[j];j++,w(t),A(t.$$)}for(w(null),C.length=0,j=0;k.length;)k.pop()();for(let t=0;t<L.length;t+=1){const e=L[t];R.has(e)||(R.add(e),e())}L.length=0}while(C.length);for(;M.length;)M.pop()();O=!1,R.clear(),w(t)}function A(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(N)}}const H=new Set;let D;function q(){D={r:0,c:[],p:D}}function P(){D.r||o(D.c),D=D.p}function S(t,e){t&&t.i&&(H.delete(t),t.i(e))}function T(t,e,n,o){if(t&&t.o){if(H.has(t))return;H.add(t),D.c.push((()=>{H.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}}function z(t){t&&t.c()}function G(t,n,c,s){const{fragment:l,on_mount:u,on_destroy:a,after_update:i}=t.$$;l&&l.m(n,c),s||N((()=>{const n=u.map(e).filter(r);a?a.push(...n):o(n),t.$$.on_mount=[]})),i.forEach(N)}function I(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function W(t,e){-1===t.$$.dirty[0]&&(C.push(t),O||(O=!0,E.then(B)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function F(e,r,c,s,l,a,i,h=[-1]){const f=y;w(e);const d=e.$$={fragment:null,ctx:null,props:a,update:t,not_equal:l,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r.context||(f?f.$$.context:[])),callbacks:n(),dirty:h,skip_bound:!1,root:r.target||f.$$.root};i&&i(d.root);let p=!1;if(d.ctx=c?c(e,r.props||{},((t,n,...o)=>{const r=o.length?o[0]:n;return d.ctx&&l(d.ctx[t],d.ctx[t]=r)&&(!d.skip_bound&&d.bound[t]&&d.bound[t](r),p&&W(e,t)),n})):[],d.update(),p=!0,o(d.before_update),d.fragment=!!s&&s(d.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);d.fragment&&d.fragment.l(t),t.forEach(u)}else d.fragment&&d.fragment.c();r.intro&&S(e.$$.fragment),G(e,r.target,r.anchor,r.customElement),B()}w(f)}class J{$destroy(){I(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}let K=(t,e,n)=>{let o=999999;return t.forEach((t=>{t.Deps.forEach((t=>{let n=e.get(t);n&&n.Hours.forEach((t=>{var e;e=t,o=Math.min(o,e)}))}))})),n=720*n+o,t.forEach(((t,r,c)=>{let s=new Map;t.Deps.forEach((t=>{let r=e.get(t),c=0,l=0,u=0,a=0;r&&(c=r.Hours.length,l=r.Hours.reduce(((t,e)=>t+(e>n?n:e)-o),0),u=r.Committers,a=r.Authors),c<100&&(l+=(100-c)*(n-o)),l/=100;let i=(n-o)/100;l=100-Math.round(l/i);let h={health:l,committersCount:u,authorsCount:a};s.set(t,h)})),t.Repos=s,c.set(r,t)})),new Map([...t.entries()].sort((([t,e],[n,o])=>e.Oem>o.Oem||e.Oem==o.Oem&&e.Name>o.Name?1:-1)))};const Q="All";let U=t=>{let e=[Q];return t.forEach((t=>{!e.includes(t.Branch)&&t.Branch.length>0&&e.push(t.Branch)})),e},V=(t,e)=>{let n=[];return t.forEach((t=>{(e.branch==Q||t.Branch==e.branch)&&!n.includes(t.Oem)&&t.Oem.length>0&&n.push(t.Oem)})),n=n.sort(((t,e)=>t>e?1:-1)),[Q].concat(n)};function X(t){let e;return{c(){e=i("span"),e.textContent="Never",m(e,"class","badge bg-warning")},m(t,n){l(t,e,n)},d(t){t&&u(e)}}}function Y(t){let e;return{c(){e=i("span"),e.textContent="Nightly",m(e,"class","badge bg-success")},m(t,n){l(t,e,n)},d(t){t&&u(e)}}}function Z(t){let e;return{c(){e=i("span"),e.textContent="Weekly",m(e,"class","badge bg-success")},m(t,n){l(t,e,n)},d(t){t&&u(e)}}}function tt(t){let e;return{c(){e=i("span"),e.textContent="Monthly",m(e,"class","badge bg-success")},m(t,n){l(t,e,n)},d(t){t&&u(e)}}}function et(e){let n;function o(t,e){return 1==t[0]?tt:2==t[0]?Z:3==t[0]?Y:X}let r=o(e),c=r(e);return{c(){c.c(),n=d()},m(t,e){c.m(t,e),l(t,n,e)},p(t,[e]){r!==(r=o(t))&&(c.d(1),c=r(t),c&&(c.c(),c.m(n.parentNode,n)))},i:t,o:t,d(t){c.d(t),t&&u(n)}}}function nt(t,e,n){let{period:o}=e;return t.$$set=t=>{"period"in t&&n(0,o=t.period)},[o]}class ot extends J{constructor(t){super(),F(this,t,nt,et,c,{period:0})}}function rt(t,e,n){const o=t.slice();return o[4]=e[n][0],o[5]=e[n][1],o}function ct(t){let e,n,o,r,c,a,f,d,g,b=t[2].authors+"",_=t[2].committers+"";return{c(){e=i("a"),n=i("div"),o=i("div"),r=h(b),c=h(" ("),a=h(_),f=h(")"),m(o,"class","progress-bar bg-success"),m(o,"role","progressbar"),v(o,"width",t[2].health+"%"),m(n,"class","progress"),m(e,"href","##")},m(u,i){l(u,e,i),s(e,n),s(n,o),s(o,r),s(o,c),s(o,a),s(o,f),d||(g=p(e,"click",t[3]),d=!0)},p(t,e){4&e&&b!==(b=t[2].authors+"")&&$(r,b),4&e&&_!==(_=t[2].committers+"")&&$(a,_),4&e&&v(o,"width",t[2].health+"%")},d(t){t&&u(e),d=!1,g()}}}function st(t){let e,n=[...t[1].Repos],o=[];for(let e=0;e<n.length;e+=1)o[e]=lt(rt(t,n,e));return{c(){for(let t=0;t<o.length;t+=1)o[t].c();e=d()},m(t,n){for(let e=0;e<o.length;e+=1)o[e].m(t,n);l(t,e,n)},p(t,r){if(2&r){let c;for(n=[...t[1].Repos],c=0;c<n.length;c+=1){const s=rt(t,n,c);o[c]?o[c].p(s,r):(o[c]=lt(s),o[c].c(),o[c].m(e.parentNode,e))}for(;c<o.length;c+=1)o[c].d(1);o.length=n.length}},d(t){a(o,t),t&&u(e)}}}function lt(t){let e,n,o,r,c,a,d,p,g,b,_=t[5].authorsCount+"",x=t[5].committersCount+"";return{c(){e=i("a"),n=i("div"),o=i("div"),r=h(_),c=h(" ("),a=h(x),d=h(")"),g=f(),m(o,"class","progress-bar progress-bar-striped bg-success"),m(o,"role","progressbar"),v(o,"width",t[5].health+"%"),m(n,"class","progress"),m(n,"title",p=t[4]+" ("+t[5].health+"%) unique authors: "+t[5].authorsCount+"\n            committers: "+t[5].committersCount),m(e,"target","_blank"),m(e,"href",b="https://github.com/LineageOS/"+t[4])},m(t,u){l(t,e,u),s(e,n),s(n,o),s(o,r),s(o,c),s(o,a),s(o,d),s(e,g)},p(t,c){2&c&&_!==(_=t[5].authorsCount+"")&&$(r,_),2&c&&x!==(x=t[5].committersCount+"")&&$(a,x),2&c&&v(o,"width",t[5].health+"%"),2&c&&p!==(p=t[4]+" ("+t[5].health+"%) unique authors: "+t[5].authorsCount+"\n            committers: "+t[5].committersCount)&&m(n,"title",p),2&c&&b!==(b="https://github.com/LineageOS/"+t[4])&&m(e,"href",b)},d(t){t&&u(e)}}}function ut(t){let e,n,o,r,c,a,d,p,g,b,v,_,x,y,w,C,k,L,M,E,O,N,R,j,B=t[1].Model+"",A=t[1].Branch+"",H=t[1].Oem+"",D=t[1].Name+"";function q(t,e){return t[0]?st:ct}g=new ot({props:{period:t[1].Period}});let P=q(t),W=P(t);return{c(){e=i("tr"),n=i("td"),o=i("a"),r=h(B),a=f(),d=i("td"),p=i("a"),z(g.$$.fragment),v=f(),_=i("td"),x=h(A),y=f(),w=i("td"),C=h(H),k=f(),L=i("td"),M=h(D),E=f(),O=i("td"),W.c(),N=f(),R=i("td"),m(o,"target","_blank"),m(o,"href",c="https://wiki.lineageos.org/devices/"+t[1].Model),m(p,"target","_blank"),m(p,"href",b="https://download.lineageos.org/"+t[1].Model)},m(t,c){l(t,e,c),s(e,n),s(n,o),s(o,r),s(e,a),s(e,d),s(d,p),G(g,p,null),s(e,v),s(e,_),s(_,x),s(e,y),s(e,w),s(w,C),s(e,k),s(e,L),s(L,M),s(e,E),s(e,O),W.m(O,null),s(e,N),s(e,R),j=!0},p(t,[e]){(!j||2&e)&&B!==(B=t[1].Model+"")&&$(r,B),(!j||2&e&&c!==(c="https://wiki.lineageos.org/devices/"+t[1].Model))&&m(o,"href",c);const n={};2&e&&(n.period=t[1].Period),g.$set(n),(!j||2&e&&b!==(b="https://download.lineageos.org/"+t[1].Model))&&m(p,"href",b),(!j||2&e)&&A!==(A=t[1].Branch+"")&&$(x,A),(!j||2&e)&&H!==(H=t[1].Oem+"")&&$(C,H),(!j||2&e)&&D!==(D=t[1].Name+"")&&$(M,D),P===(P=q(t))&&W?W.p(t,e):(W.d(1),W=P(t),W&&(W.c(),W.m(O,null)))},i(t){j||(S(g.$$.fragment,t),j=!0)},o(t){T(g.$$.fragment,t),j=!1},d(t){t&&u(e),I(g),W.d()}}}function at(t,e,n){let o,{dev:r}=e,{expandRepos:c}=e;return t.$$set=t=>{"dev"in t&&n(1,r=t.dev),"expandRepos"in t&&n(0,c=t.expandRepos)},t.$$.update=()=>{2&t.$$.dirty&&n(2,o=(t=>{let e=e=>Math.round(e/t.Repos.size),n=0,o=0,r=0;return t.Repos.forEach((t=>{n+=t.health,o+=t.authorsCount,r+=t.committersCount})),{authors:e(o),committers:e(r),health:e(n)}})(r))},[c,r,o,()=>n(0,c=!c)]}class it extends J{constructor(t){super(),F(this,t,at,ut,c,{dev:1,expandRepos:0})}}function ht(t,e,n){const o=t.slice();return o[5]=e[n],o}function ft(t,e,n){const o=t.slice();return o[8]=e[n],o}function dt(t){let e,n,o,r=t[8]+"";return{c(){e=i("option"),n=h(r),e.__value=o=t[8],e.value=e.__value},m(t,o){l(t,e,o),s(e,n)},p(t,c){2&c&&r!==(r=t[8]+"")&&$(n,r),2&c&&o!==(o=t[8])&&(e.__value=o,e.value=e.__value)},d(t){t&&u(e)}}}function pt(t){let e,n,o,r=t[5]+"";return{c(){e=i("option"),n=h(r),e.__value=o=t[5],e.value=e.__value},m(t,o){l(t,e,o),s(e,n)},p(t,c){4&c&&r!==(r=t[5]+"")&&$(n,r),4&c&&o!==(o=t[5])&&(e.__value=o,e.value=e.__value)},d(t){t&&u(e)}}}function mt(e){let n,r,c,d,g,$,b,x,y,w,C,k,L,M,E,O,R,j,B,A=e[1],H=[];for(let t=0;t<A.length;t+=1)H[t]=dt(ft(e,A,t));let D=e[2],q=[];for(let t=0;t<D.length;t+=1)q[t]=pt(ht(e,D,t));return{c(){n=i("thead"),r=i("tr"),c=i("th"),c.textContent="Code",d=f(),g=i("th"),g.textContent="Build",$=f(),b=i("th"),x=h("Branch\n      "),y=i("select");for(let t=0;t<H.length;t+=1)H[t].c();w=f(),C=i("th"),k=h("OEM\n      "),L=i("select");for(let t=0;t<q.length;t+=1)q[t].c();M=f(),E=i("th"),E.textContent="Model",O=f(),R=i("th"),R.textContent="Repos",m(c,"scope","col"),m(g,"scope","col"),m(y,"class","form-select"),void 0===e[0].branch&&N((()=>e[3].call(y))),m(b,"scope","col"),m(L,"class","form-select"),void 0===e[0].oem&&N((()=>e[4].call(L))),m(C,"scope","col"),m(E,"scope","col"),m(R,"scope","col"),v(R,"width","25%")},m(t,o){l(t,n,o),s(n,r),s(r,c),s(r,d),s(r,g),s(r,$),s(r,b),s(b,x),s(b,y);for(let t=0;t<H.length;t+=1)H[t].m(y,null);_(y,e[0].branch),s(r,w),s(r,C),s(C,k),s(C,L);for(let t=0;t<q.length;t+=1)q[t].m(L,null);_(L,e[0].oem),s(r,M),s(r,E),s(r,O),s(r,R),j||(B=[p(y,"change",e[3]),p(L,"change",e[4])],j=!0)},p(t,[e]){if(2&e){let n;for(A=t[1],n=0;n<A.length;n+=1){const o=ft(t,A,n);H[n]?H[n].p(o,e):(H[n]=dt(o),H[n].c(),H[n].m(y,null))}for(;n<H.length;n+=1)H[n].d(1);H.length=A.length}if(3&e&&_(y,t[0].branch),4&e){let n;for(D=t[2],n=0;n<D.length;n+=1){const o=ht(t,D,n);q[n]?q[n].p(o,e):(q[n]=pt(o),q[n].c(),q[n].m(L,null))}for(;n<q.length;n+=1)q[n].d(1);q.length=D.length}3&e&&_(L,t[0].oem)},i:t,o:t,d(t){t&&u(n),a(H,t),a(q,t),j=!1,o(B)}}}function gt(t,e,n){let{value:o}=e,{branches:r}=e,{oems:c}=e;return t.$$set=t=>{"value"in t&&n(0,o=t.value),"branches"in t&&n(1,r=t.branches),"oems"in t&&n(2,c=t.oems)},[o,r,c,function(){o.branch=x(this),n(0,o),n(1,r)},function(){o.oem=x(this),n(0,o),n(1,r)}]}class $t extends J{constructor(t){super(),F(this,t,gt,mt,c,{value:0,branches:1,oems:2})}}function bt(t,e,n){const o=t.slice();return o[12]=e[n][0],o[13]=e[n][1],o}function vt(t){let e,n;return e=new it({props:{dev:t[13],expandRepos:t[3]}}),{c(){z(e.$$.fragment)},m(t,o){G(e,t,o),n=!0},p(t,n){const o={};4&n&&(o.dev=t[13]),8&n&&(o.expandRepos=t[3]),e.$set(o)},i(t){n||(S(e.$$.fragment,t),n=!0)},o(t){T(e.$$.fragment,t),n=!1},d(t){I(e,t)}}}function _t(t){let e,n,r,c,d,$,v,_,x,y,w,C,L,E,O,N,R,j,B,A,H,D;function W(e){t[10](e)}let F={branches:U(t[4]),oems:V(t[4],t[0])};void 0!==t[0]&&(F.value=t[0]),N=new $t({props:F}),k.push((()=>function(t,e,n){const o=t.$$.props[e];void 0!==o&&(t.$$.bound[o]=n,n(t.$$.ctx[o]))}(N,"value",W)));let J=[...t[2]],K=[];for(let e=0;e<J.length;e+=1)K[e]=vt(bt(t,J,e));const Q=t=>T(K[t],1,1,(()=>{K[t]=null}));return{c(){e=i("div"),n=i("div"),r=i("div"),c=i("label"),d=h("Max commit time (month)\n        "),$=i("input"),v=f(),_=i("input"),x=f(),y=i("div"),w=i("label"),C=h("Expand repos\n        "),L=i("input"),E=f(),O=i("table"),z(N.$$.fragment),j=f(),B=i("tbody");for(let t=0;t<K.length;t+=1)K[t].c();m($,"type","number"),m($,"name","quantity"),m($,"min","1"),m($,"max","60"),m($,"class","form-control w-50"),m(_,"class","form-range"),m(_,"type","range"),m(_,"min","1"),m(_,"max","60"),m(r,"class","col"),m(L,"class","form-check-input"),m(L,"type","checkbox"),m(y,"class","col"),m(n,"class","row align-items-center"),m(e,"class","container"),m(O,"class","table table-dark table-striped")},m(o,u){l(o,e,u),s(e,n),s(n,r),s(r,c),s(c,d),s(c,$),b($,t[1]),s(c,v),s(c,_),b(_,t[1]),s(n,x),s(n,y),s(y,w),s(w,C),s(w,L),L.checked=t[3],l(o,E,u),l(o,O,u),G(N,O,null),s(O,j),s(O,B);for(let t=0;t<K.length;t+=1)K[t].m(B,null);A=!0,H||(D=[p($,"input",t[7]),p(_,"change",t[8]),p(_,"input",t[8]),p(L,"change",t[9])],H=!0)},p(t,[e]){2&e&&g($.value)!==t[1]&&b($,t[1]),2&e&&b(_,t[1]),8&e&&(L.checked=t[3]);const n={};var o;if(1&e&&(n.oems=V(t[4],t[0])),!R&&1&e&&(R=!0,n.value=t[0],o=()=>R=!1,M.push(o)),N.$set(n),12&e){let n;for(J=[...t[2]],n=0;n<J.length;n+=1){const o=bt(t,J,n);K[n]?(K[n].p(o,e),S(K[n],1)):(K[n]=vt(o),K[n].c(),S(K[n],1),K[n].m(B,null))}for(q(),n=J.length;n<K.length;n+=1)Q(n);P()}},i(t){if(!A){S(N.$$.fragment,t);for(let t=0;t<J.length;t+=1)S(K[t]);A=!0}},o(t){T(N.$$.fragment,t),K=K.filter(Boolean);for(let t=0;t<K.length;t+=1)T(K[t]);A=!1},d(t){t&&u(e),t&&u(E),t&&u(O),I(N),a(K,t),H=!1,o(D)}}}function xt(t,e,n){let o,{deviceList:r}=e,{repoList:c}=e,s={oem:Q,branch:Q},l=!1,u=12;const a=(t=>{let e=new Map;for(let n of Object.keys(t)){let o=t[n];o.Deps.forEach(((t,e,n)=>{n[e]=t.toLowerCase()})),e.set(n,o)}return e})(r),i=(t=>{let e=new Map,n=Date.now();for(let o of Object.keys(t)){let r=t[o],c={Authors:r.a,Committers:r.c,Hours:[]};for(let t in Object.keys(r.t)){let e=new Date(r.t[t]),o=Math.round((n-e.getTime())/36e5);c.Hours.push(o)}e.set(o.toLowerCase(),c),e=e}return e})(c);return t.$$set=t=>{"deviceList"in t&&n(5,r=t.deviceList),"repoList"in t&&n(6,c=t.repoList)},t.$$.update=()=>{3&t.$$.dirty&&n(2,o=K(((t,e)=>{let n=new Map;return t.forEach(((t,o)=>{e.branch!=Q&&t.Branch!=e.branch||e.oem!=Q&&t.Oem!=e.oem||n.set(o,t)})),n})(a,s),i,u))},[s,u,o,l,a,r,c,function(){u=g(this.value),n(1,u)},function(){u=g(this.value),n(1,u)},function(){l=this.checked,n(3,l)},function(t){s=t,n(0,s)}]}class yt extends J{constructor(t){super(),F(this,t,xt,_t,c,{deviceList:5,repoList:6})}}function wt(t,e,n){const o=t.slice();return o[8]=e[n],o}function Ct(t){let e,n=t[4],o=[];for(let e=0;e<n.length;e+=1)o[e]=kt(wt(t,n,e));return{c(){for(let t=0;t<o.length;t+=1)o[t].c();e=d()},m(t,n){for(let e=0;e<o.length;e+=1)o[e].m(t,n);l(t,e,n)},p(t,r){if(16&r){let c;for(n=t[4],c=0;c<n.length;c+=1){const s=wt(t,n,c);o[c]?o[c].p(s,r):(o[c]=kt(s),o[c].c(),o[c].m(e.parentNode,e))}for(;c<o.length;c+=1)o[c].d(1);o.length=n.length}},d(t){a(o,t),t&&u(e)}}}function kt(t){let e,n,o=t[8]+"";return{c(){e=i("div"),n=h(o),m(e,"class","alert alert-danger"),m(e,"role","alert")},m(t,o){l(t,e,o),s(e,n)},p(t,e){16&e&&o!==(o=t[8]+"")&&$(n,o)},d(t){t&&u(e)}}}function Lt(e){let n,o,r,c,a,d;return{c(){n=i("button"),o=h("Load data"),r=f(),c=i("p"),c.textContent=`Now: ${Date()}`,n.disabled=e[2],m(n,"type","button"),m(n,"class","btn btn-primary")},m(t,u){l(t,n,u),s(n,o),l(t,r,u),l(t,c,u),a||(d=p(n,"click",e[5]),a=!0)},p(t,e){4&e&&(n.disabled=t[2])},i:t,o:t,d(t){t&&u(n),t&&u(r),t&&u(c),a=!1,d()}}}function Mt(e){let n;return{c(){n=i("p"),n.textContent="Loading..."},m(t,e){l(t,n,e)},p:t,i:t,o:t,d(t){t&&u(n)}}}function Et(t){let e,n;return e=new yt({props:{deviceList:t[0],repoList:t[1]}}),{c(){z(e.$$.fragment)},m(t,o){G(e,t,o),n=!0},p(t,n){const o={};1&n&&(o.deviceList=t[0]),2&n&&(o.repoList=t[1]),e.$set(o)},i(t){n||(S(e.$$.fragment,t),n=!0)},o(t){T(e.$$.fragment,t),n=!1},d(t){I(e,t)}}}function Ot(t){let e,n,o,r,c,a,h,d=t[4]&&Ct(t);const p=[Et,Mt,Lt],m=[];function g(t,e){return t[3]?0:t[2]?1:2}return o=g(t),r=m[o]=p[o](t),{c(){e=i("main"),d&&d.c(),n=f(),r.c(),c=f(),a=i("p"),a.innerHTML='<a target="_blank" href="https://github.com/mejgun/lineageos-devices-stats">GitHub</a>'},m(t,r){l(t,e,r),d&&d.m(e,null),s(e,n),m[o].m(e,null),s(e,c),s(e,a),h=!0},p(t,[s]){t[4]?d?d.p(t,s):(d=Ct(t),d.c(),d.m(e,n)):d&&(d.d(1),d=null);let l=o;o=g(t),o===l?m[o].p(t,s):(q(),T(m[l],1,1,(()=>{m[l]=null})),P(),r=m[o],r?r.p(t,s):(r=m[o]=p[o](t),r.c()),S(r,1),r.m(e,c))},i(t){h||(S(r),h=!0)},o(t){T(r),h=!1},d(t){t&&u(e),d&&d.d(),m[o].d()}}}function Nt(t,e,n){let o,r,c=!1,s=!1,l=[],u=()=>{fetch("/repos.json").then((t=>t.json().then((t=>{n(1,r=t),n(3,s=!0)})).catch(a))).catch(a)},a=t=>{l.push(t),n(4,l)};return[o,r,c,s,l,()=>{n(2,c=!0),fetch("/devices.json").then((t=>t.json().then((t=>{n(0,o=t),u()})).catch(a))).catch(a)}]}return new class extends J{constructor(t){super(),F(this,t,Nt,Ot,c,{})}}({target:document.body})}();
