var t,e,n,o,i,a,r,f,d,c,u,s,l,g,h,v=0,m=0;let p,w;var E,L;function I(){n?.clearRect(0,0,v,m),n?.drawImage(o,g,h,a,i)}function y(t=!0){r=Math.max(m/i,v/a),c=(d=i*=r)/(f=a*=r),I()}function R(t,e,n){return Math.max(e,Math.min(t,n))}function k(){let t=0,e=0;for(var n=0;n<E.length;n++)t+=E[n].offsetX,e+=E[n].offsetY;return t/=E.length,e/=E.length,[t,e]}function B(t,e){p=(-g+t)/a,w=(-h+e)/i}function M(t,e){g=R(g-t*p,v-a,0),h=R(h-e*w,m-i,0)}function D(){if(2==E.length){var e=Math.hypot(E[0].offsetX-E[1].offsetX,E[0].offsetY-E[1].offsetY);if(L>0){const n=e-L;!function(e,n){const o=a+e;o<f||i+n<d||o/f>5||(t&&(t.value=String(r=o/f)),a=o,i+=n,M(e,n))}(n,n*c)}L=e}}function H(t){const e=t.target.value;(function(t){L=-1;let e=a,n=i;e-=a=f*t,n-=i=d*t,B(v/2,m/2),M(-e,-n)})(r=+e),I()}function S(t){(E=E.filter((e=>e.pointerId!=t.pointerId))).length<2&&(L=-1),[s,l]=k(),0==E.length&&(u=!1)}function W(t){for(var e=0;e<E.length;e++)if(t.pointerId==E[e].pointerId){E[e]=t;break}let[n,o]=k();u&&function(t,e){var n=t-s,o=e-l;s=t,l=e,g=R(g+n,v-a,0),h=R(h+o,m-i,0)}(n,o),D(),B(v/2,m/2),I()}const b=function(t,e){let n;return(...o)=>{clearTimeout(n),n=setTimeout((()=>{t(...o)}),e)}}((()=>{const n=e.offsetWidth-v,o=e.offsetHeight-m;v=e.width=e.offsetWidth,m=e.height=e.offsetHeight,a<v?(g=0,y()):i<m?(h=0,y()):(g+=n/2,h+=o/2,f=v,d=v*c,I()),t.value=String(r=Math.min(a/v,a/m)||1)}),300);function x(t){t.preventDefault(),t.stopPropagation()}function P(){e.addEventListener("pointerdown",(t=>{x(t),function(t){E.push(t),[s,l]=k(),u=!0}(t)})),e.addEventListener("pointermove",(t=>{x(t),W(t)})),e.addEventListener("pointerout",(t=>{x(t),S(t)})),e.addEventListener("pointerup",(t=>{x(t),S(t)})),e.addEventListener("pointercancel",(t=>{x(t),S(t)})),e.addEventListener("pointerleave",(t=>{x(t),S(t)})),new ResizeObserver(b).observe(e)}function T(e){(o=new Image).onload=()=>{u=!1,g=0,h=0,E=[],L=-1,t&&(t.value="1"),i=o.naturalHeight,a=o.naturalWidth,y()},o.src=e}function X(){const t=document.createElement("a");t.download="canvas.png",t.href=e.toDataURL("image/png"),t.click()}var Y;Y=document.getElementById("canvas"),n=(e=Y).getContext("2d"),v=e.width=e.offsetWidth,m=e.height=e.offsetHeight,P(),T("https://www.tailwind-kit.com/images/landscape/3.jpg"),function(e){(t=e).value=String(o&&r||1),t.addEventListener("input",(t=>{x(t),H(t)}))}(document.getElementById("myRange"));var U=document.getElementById("filePicker");U.addEventListener("change",(t=>{!function(t){t.preventDefault(),t.stopPropagation()}(t),function(){var t=U.files?.[0];if(t){var e=new FileReader;e.onload=()=>T(String(e.result)),e.readAsDataURL(t)}}()}));const j=document.getElementById("dropdown");document.getElementById("menu").addEventListener("click",(()=>{j.classList.toggle("hidden")})),setTimeout((()=>{window.download=X}),2e3);
//# sourceMappingURL=index.9961a13d.js.map
