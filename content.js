(()=>{"use strict";const e={disabled:!1,target:window,x:0,y:0,startX:0,startY:0,pressSpace:!1,pressMouse:!1},t=t=>{const s=e.startX+e.x-t.screenX,n=e.startY+e.y-t.screenY;e.target?.scroll({top:n,left:s})},s={passive:!0},n=(()=>{const e=document.createElement("style");return e.dataset.from="chrome-extenstion",e.textContent="* {cursor: move !important;}",e})(),r=(()=>{const e=document.createElement("drag-screen");return e.style.cssText="\n    position: fixed;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    z-index: 2147483647;\n  ",e.dataset.from="chrome-extenstion",e})(),o=()=>{e.pressSpace=!1,e.pressMouse=!1,n.remove(),window.removeEventListener("mousemove",t,s)};chrome.storage.local.get(["disabled"],(({disabled:t})=>{e.disabled=Boolean(t)})),chrome.runtime.onMessage.addListener((({data:t})=>{e.disabled=t.disabled})),window.addEventListener("keydown",(t=>{if(!e.disabled&&(t.target!==document.activeElement||"true"!==document.activeElement.contentEditable&&!["input","textarea","button"].some((e=>e===document.activeElement?.tagName.toLowerCase())))&&" "===t.key){if(t.preventDefault(),e.pressSpace)return;e.pressSpace=!0,document.head.append(n)}})),window.addEventListener("keyup",(t=>{" "===t.key&&e.pressSpace&&(e.pressSpace=!1,e.pressMouse||o())})),window.addEventListener("mousedown",(n=>{if(!e.disabled&&e.pressSpace){let o=n.target;for(n.preventDefault(),e.target=null,e.pressMouse=!0;o;){if(o.firstChild&&(o.clientWidth!==o.scrollWidth&&3<Math.abs(o.clientWidth-o.scrollWidth)||o.clientHeight!==o.scrollHeight&&3<Math.abs(o.clientHeight-o.scrollHeight))&&"visible"!==getComputedStyle(o).overflow){e.target=o||window;break}o=o.parentElement}e.target||=window,e.x=n.screenX,e.y=n.screenY,e.target===window?(e.startX=window.pageXOffset,e.startY=window.pageYOffset):(e.startX=e.target.scrollLeft,e.startY=e.target.scrollTop),document.body.append(r),window.addEventListener("mousemove",t,s)}})),window.addEventListener("mouseup",(()=>{e.pressMouse=!1,e.pressSpace||o(),r.remove(),window.removeEventListener("mousemove",t,s)})),window.addEventListener("blur",(()=>o()))})();