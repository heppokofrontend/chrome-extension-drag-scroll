(()=>{"use strict";const e={disabled:!1,target:window,x:0,y:0,startX:0,startY:0,pressSpace:!1,pressMouse:!1},t=t=>{const s=e.startX+e.x-t.screenX,n=e.startY+e.y-t.screenY;e.target?.scroll({top:n,left:s})},s={passive:!0},n=document.createElement("style"),r=()=>{e.pressSpace=!1,e.pressMouse=!1,n.textContent="",window.removeEventListener("mousemove",t,s)};chrome.storage.local.get(["disabled"],(({disabled:t})=>{e.disabled=Boolean(t)})),chrome.runtime.onMessage.addListener((({data:t})=>{e.disabled=t.disabled})),window.addEventListener("load",(()=>{document.head.append(n)})),window.addEventListener("keydown",(t=>{if(!e.disabled&&(t.target!==document.activeElement||"true"!==document.activeElement.contentEditable&&!["input","textarea","button"].some((e=>e===document.activeElement?.tagName.toLowerCase())))&&" "===t.key){if(t.preventDefault(),e.pressSpace)return;e.pressSpace=!0,n.textContent="* {cursor: move;!important}"}})),window.addEventListener("keyup",(t=>{" "===t.key&&e.pressSpace&&(e.pressSpace=!1,e.pressMouse||r())})),window.addEventListener("mousedown",(n=>{if(!e.disabled&&e.pressSpace){let r=n.target;for(n.preventDefault(),e.target=null,e.pressMouse=!0;r;){if(r.firstChild&&(r.clientWidth!==r.scrollWidth&&Math.abs(r.clientWidth-r.scrollWidth)<3||r.clientHeight!==r.scrollHeight&&Math.abs(r.clientHeight-r.scrollHeight)<3)){e.target=r.parentElement||window;break}r=r.parentElement}e.target||=window,e.x=n.screenX,e.y=n.screenY,e.target===window?(e.startX=window.pageXOffset,e.startY=window.pageYOffset):(e.startX=e.target.scrollLeft,e.startY=e.target.scrollTop),window.addEventListener("mousemove",t,s)}})),window.addEventListener("mouseup",(()=>{e.pressMouse=!1,e.pressSpace||r(),window.removeEventListener("mousemove",t,s)})),window.addEventListener("blur",(()=>r()))})();