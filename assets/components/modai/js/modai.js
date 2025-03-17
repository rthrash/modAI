var ModAI;(()=>{"use strict";var e={d:(t,o)=>{for(var n in o)e.o(o,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:o[n]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},t={};e.d(t,{default:()=>J});const o={},n="assistant",a=(e,t,n,a,i=!1,r="text")=>{const s=o[e];if(!s)return;const l={content:t,role:n,id:a,hidden:i,type:r,ctx:{}},d=s.history.push(l)-1;a&&(s.idRef[a]=s.history[d]),l.el=s.onAddMessage(l)},i={init:(e,t)=>(o[e]||(o[e]={history:[],idRef:{},onAddMessage:t}),o[e].onAddMessage=t,{addUserMessage:(t,o,n="text")=>{const i="user-msg-"+Date.now()+Math.round(1e3*Math.random());a(e,t,"user",i,o,n)},addAssistantMessage:(t,o,i="text")=>{a(e,t,n,o,!1,i)},updateAssistantMessage:(t,i,r="text")=>{((e,t,i,r="text")=>{const s=o[e];if(!s)return;if(!s.idRef[t])return void a(e,i,n,t,!1,r);const l=s.idRef[t];l.content=i,l.el&&l.el.update&&l.el.update(l)})(e,t,i,r)},getAssistantMessage:t=>((e,t)=>{const n=o[e];if(n)return n.idRef[t]})(e,t),getMessages:()=>o[e].history,getMessagesHistory:()=>o[e].history.map((e=>({role:e.role,content:e.content}))),clearHistory:()=>{o[e].history.forEach((e=>{e.el?.remove()})),o[e].history=[]},clearHistoryFrom:t=>{const n=o[e].history.findIndex((e=>e.id===t));if(-1!==n){for(let t=n;t<o[e].history.length;t++){const n=o[e].history[t];n.el?.remove()}o[e].history.splice(n)}}})},r={modalOpen:!1,alertOpen:!1,config:{},modal:{}},s=e=>{r.modal.isLoading=e,r.modal.loadingIndicator.style.display=e?"flex":"none",r.modal.messageInput.disabled=e,e?(r.modal.sendBtn.disable(),r.modal.stopBtn.enable()):(r.modal.sendBtn.disable(),r.modal.stopBtn.disable()),r.modal.modeButtons.forEach((t=>{e?t.disable():t.enable()}));const t=r.modal.history.getMessages().length>0;r.modal.actionButtons.forEach((o=>{e||!t?o.disable():o.enable()})),r.modal.chatMessages.querySelectorAll(".action-button").forEach((t=>{e?t.disable?.():t?.enable?.()}))},l={buffered:{chatgpt:{content:e=>{const t=e?.choices?.[0]?.message?.content;if(!t)throw new Error(_("modai.cmp.failed_request"));return{id:e.id,content:t}},image:e=>{let t=e?.data?.[0]?.url;if(!t){if(t=e?.data?.[0]?.b64_json,!t)throw new Error(_("modai.cmp.failed_request"));t=`data:image/png;base64,${t}`}return{id:`chatgpt-${Date.now()}-${Math.round(1e3*Math.random())}`,url:t}}},claude:{content:e=>{const t=e?.content?.[0]?.text;if(!t)throw new Error(_("modai.cmp.failed_request"));return{id:e.id,content:t}}},gemini:{content:e=>{const t=e?.candidates?.[0]?.content?.parts?.[0]?.text;if(!t)throw new Error(_("modai.cmp.failed_request"));return{id:`gemini-${Date.now()}-${Math.round(1e3*Math.random())}`,content:t}},image:e=>{const t=e?.predictions?.[0]?.bytesBase64Encoded;if(!t)throw new Error(_("modai.cmp.failed_request"));return{id:`gemini-${Date.now()}-${Math.round(1e3*Math.random())}`,url:`data:image/png;base64,${t}`}}}},stream:{chatgpt:{content:(e,t)=>{const o=t?.content??"",n=e.choices?.[0]?.delta?.content||"";return{...t,id:e.id,content:`${o}${n}`}}},claude:{content:(e,t)=>{const o=t?.content??"",n=e.delta?.text||"";return{...t,content:`${o}${n}`}}},gemini:{content:(e,t)=>{const o=t?.content??"",n=e.candidates?.[0]?.content?.parts?.[0]?.text||"";return{...t,content:`${o}${n}`}}}}},d=async e=>{if(!e.ok){const t=await e.json();if(t?.error)throw new Error(t.error.message);throw new Error(`${e.status} ${e.statusText}`)}},c=async(e,t,o,n,a)=>{if(!e.body)throw new Error("failed");const i=e.body.getReader(),r=new TextDecoder("utf-8");let s="",d={id:`${t}-${Date.now()}-${Math.round(1e3*Math.random())}`,content:""};for(;!a||!a.aborted;){const{done:e,value:a}=await i.read();if(e)break;const c=r.decode(a,{stream:!0});if("gemini"===t){const e=c.trim().split(",\r\n").map((e=>e.replace(/^\[|]$/g,""))).filter((e=>""!==e.trim()));for(const a of e)try{const e=JSON.parse(a);d=l.stream[t][o](e,d),n&&n(d)}catch{}}if("chatgpt"===t){s+=c;let e,a=0;for(;-1!==(e=s.indexOf("\n",a));){const i=s.slice(a,e).trim();if(a=e+1,i.startsWith("data: ")){const e=i.slice(6);if("[DONE]"===e)continue;try{const a=JSON.parse(e);d=l.stream[t][o](a,d),n&&n(d)}catch{}}}s=s.slice(a)}if("claude"===t){s+=c;let e,a=0;for(;-1!==(e=s.indexOf("\n",a));){const i=s.slice(a,e).trim();if(a=e+1,i.startsWith("data: ")){const e=i.slice(6);try{const a=JSON.parse(e);if("message_start"===a.type){d.id=a.message.id;continue}if("content_block_delta"!==a.type)continue;d=l.stream[t][o](a,d),n&&n(d)}catch{}}}s=s.slice(a)}}return d},p=async(e,t,o,n)=>{const a=(n=n||new AbortController).signal,i=await fetch(`${r.config.apiURL}?action=${e}`,{signal:a,method:"POST",body:JSON.stringify(t),headers:{"Content-Type":"application/json"}});if(!i.ok){const e=await i.json();if(e.error)throw new Error(e.error.message);throw new Error(e.detail)}const s=i.headers.get("x-modai-service")??"chatgpt",p=i.headers.get("x-modai-parser")??"content",m=1===parseInt(i.headers.get("x-modai-stream")??"0");if(1!==parseInt(i.headers.get("x-modai-proxy")??"0")){return(async(e,t,o)=>{if("object"!=typeof e||!e.forExecutor)return e;const n=e.forExecutor,a=(o=o||new AbortController).signal;if(!n.service||!n.parser)throw new Error(_("modai.cmp.service_required"));if(!l[n.stream?"stream":"buffered"]?.[n.service]?.[n.parser])throw new Error(_("modai.cmp.service_unsupported"));if(n.stream)return(async e=>{if("content"!==n.parser)throw new Error(_("modai.cmp.service_unsupported"));const o=await fetch(e.url,{signal:a,method:"POST",body:e.body,headers:e.headers});return await d(o),c(o,n.service,n.parser,t)})(n);const i=await(async e=>{const t=await fetch(e.url,{signal:a,method:"POST",body:e.body,headers:e.headers});await d(t);const o=await t.json();if(o.error)throw new Error(o.error.message);return o})(n);return l.buffered[n.service][n.parser](i)})(await i.json(),o,n)}if(!s||!p)throw n.abort(),new Error(_("modai.cmp.service_required"));if(!l[m?"stream":"buffered"]?.[s]?.[p])throw n.abort(),new Error(_("modai.cmp.service_unsupported"));if(!m){const e=await i.json();return l.buffered[s][p](e)}if("content"!==p)throw new Error(_("modai.cmp.service_unsupported"));return await c(i,s,p,o,a)},m={mgr:{download:{image:async e=>await(async(e,t)=>{const o=await fetch(`${r.config.apiURL}?action=Download\\Image`,{method:"POST",body:JSON.stringify(t),headers:{"Content-Type":"application/json"}});if(!o.ok){const e=await o.json();if(e.error)throw new Error(e.error.message);throw new Error(e.detail)}return await o.json()})(0,e)},prompt:{freeText:async(e,t,o)=>p("Prompt\\FreeText",e,t,o),text:async(e,t,o)=>p("Prompt\\Text",e,t,o),vision:async(e,t,o)=>p("Prompt\\Vision",e,t,o),image:async(e,t)=>p("Prompt\\Image",e,void 0,t)}}},h={},u={_formatOutput(e,t){const o=h[e],n=o.visible>0,a=o.visible!==o.values.length-1;return{value:void 0!==t?t:o.values[o.visible]??null,nextStatus:a,prevStatus:n,current:o.visible+1,total:o.values.length,context:o.context}},insert(e,t,o=!1){const n=h[e];o||(n.visible=n.values.push(t)-1);const a=this._formatOutput(e,t);return"function"==typeof n.syncUI&&n.syncUI(a,o),a},next(e){const t=h[e];if(t.visible===t.values.length-1)return this._formatOutput(e);t.visible++;const o=this._formatOutput(e);return"function"==typeof t.syncUI&&t.syncUI(o),o},prev(e){const t=h[e];if(t.visible<=0)return this._formatOutput(e);t.visible--;const o=this._formatOutput(e);return"function"==typeof t.syncUI&&t.syncUI(o),o},init(e,t,o,n){return h[e]||(h[e]={visible:-1,values:[],context:n}),h[e].syncUI=t,o&&(h[e].values=[o],h[e].visible=0),{cachedItem:h[e],getData:()=>this._formatOutput(e),getAll:()=>h[e].values,syncUI:()=>{"function"==typeof h[e].syncUI&&h[e].syncUI(this._formatOutput(e),!1)},insert:(t,o=!1)=>this.insert(e,t,o),next:()=>this.next(e),prev:()=>this.prev(e)}}},g=(e,t)=>{e.className=t},y=(e,t,o,n)=>{const a="string"==typeof o?o:"";o&&"string"!=typeof o&&!Array.isArray(o)&&(o=[o]);const i=document.createElement(e);if(n&&Object.assign(i,n),t&&(i.className=t),a)i.textContent=a;else if(o&&Array.isArray(o))for(const e of o)e&&("string"!=typeof e?i.append(e):i.append(document.createTextNode(e)));return i},f=e=>/<[^>]*>/g.test(e)?e:e.replace(/\r\n|\n|\r/g,"<br>"),v=(e,t,o,n)=>{const a="string"==typeof e?e:"";"string"==typeof e||Array.isArray(e)||(e=[e]);const i=y("button",o,a);return i.type="button",Array.isArray(e)&&e.forEach((e=>{"string"==typeof e?i.append(document.createTextNode(e)):i.append(e)})),i.addEventListener("click",t),i.enable=()=>{i.disabled=!1},i.disable=()=>{i.disabled=!0},n&&Object.assign(i,n),i},w=e=>{e={showConfirm:!0,showCancel:!0,...e};const t=v(e.cancelText??"Cancel",(()=>{i()}),"cancelBtn",{tabIndex:0}),o=v(e.confirmText,(()=>{a(),e.onConfirm()}),"confirmBtn",{tabIndex:0}),n=y("div","modai--root overlay",[y("div","dialog",[y("h3","title",e.title),y("p","message",e.content),y("div","buttons",[e.showCancel&&t,e.showConfirm&&o])],{tabIndex:-1})],{ariaModal:"true",role:"dialog",ariaLabel:e.title}),a=()=>{document.removeEventListener("keydown",r),n.remove()},i=()=>{a(),e.onCancel?.()},r=n=>{if("Escape"===n.key&&(n.stopImmediatePropagation(),n.preventDefault(),n.stopPropagation(),i()),"Tab"===n.key){const a=[t,o];e.showCancel&&a.push(t),e.showConfirm&&a.push(o);const i=document.activeElement;let r=i?a.indexOf(i):-1;r=n.shiftKey?(r-1+a.length)%a.length:(r+1)%a.length,a.length>0&&a[r].focus(),n.preventDefault()}};document.addEventListener("keydown",r),document.body.append(n),e.showConfirm&&o.focus(),!e.showConfirm&&e.showCancel&&t.focus()},x=(e,t={})=>{const o={indicatorType:t.indicatorType||"spinner",overlayColor:t.overlayColor||"rgba(255, 255, 255, 0.7)",indicatorColor:t.indicatorColor||"#3498db"},n=document.createElement("div"),a=document.createElement("div"),i=window.getComputedStyle(e),r=e.getBoundingClientRect();t.indicatorColor||(o.indicatorType=r.height<=50?"dots":"spinner"),n.style.position="absolute",n.style.top="0",n.style.left="0",n.style.width="100%",n.style.height="100%",n.style.backgroundColor=o.overlayColor,n.style.display="flex",n.style.justifyContent="center",n.style.alignItems="center",n.style.zIndex="10000",n.style.borderRadius=i.borderRadius;let s="";if("spinner"===o.indicatorType)a.style.border="4px solid #f3f3f3",a.style.borderTop=`4px solid ${o.indicatorColor}`,a.style.borderRadius="50%",a.style.width="30px",a.style.height="30px",a.style.animation="textareaOverlaySpin 1s linear infinite",s="\n      @keyframes textareaOverlaySpin {\n        0% { transform: rotate(0deg); }\n        100% { transform: rotate(360deg); }\n      }\n    ";else if("dots"===o.indicatorType){a.style.display="flex",a.style.alignItems="center",a.style.justifyContent="center",a.style.height="20px";for(let e=0;e<3;e++){const t=document.createElement("div");t.style.width="8px",t.style.height="8px",t.style.borderRadius="50%",t.style.backgroundColor=o.indicatorColor,t.style.margin="0 4px",t.style.animation="textareaOverlayDotPulse 1.4s infinite ease-in-out",t.style.animationDelay=.2*e+"s",a.appendChild(t)}s="\n      @keyframes textareaOverlayDotPulse {\n        0%, 80%, 100% { transform: scale(0); opacity: 0.5; }\n        40% { transform: scale(1); opacity: 1; }\n      }\n    "}const l=document.createElement("style");l.textContent=s,document.head.appendChild(l),n.appendChild(a);const d=window.getComputedStyle(e.parentElement);let c;-1===["relative","absolute","fixed"].indexOf(d.position)?(c=document.createElement("div"),c.style.position="relative",c.style.width=`${r.width}px`,c.style.height=`${r.height}px`,c.style.display="inline-block",e.parentNode?.insertBefore(c,e),c.appendChild(e)):c=e.parentElement,n.style.display="none",c.appendChild(n);const p=e.getBoundingClientRect();return c!==e.parentElement&&(c.style.width=`${p.width}px`,c.style.height=`${p.height}px`),n.style.display="flex",e.setAttribute("disabled","disabled"),()=>{n.style.display="none",e.removeAttribute("disabled"),n.remove(),l.remove(),c!==e.parentElement&&(c.parentNode?.insertBefore(e,c),c.remove())}},b=e=>y("span","modai--root generate",v("✦",e,"generate",{type:"button",title:"Generate using AI"})),C={localChat:e=>b((()=>{q.localChat(e)})),forcedText:({input:e,onChange:t,initialValue:o,field:n,...a})=>{const i=b((async()=>{const t=x(e);try{const e=await m.mgr.prompt.text({field:n,...a},(e=>{r.insert(e.content,!0)}));r.insert(e.content),t()}catch(e){t(),w({title:"Failed",content:_("modai.cmp.failed_try_again",{msg:e instanceof Error?e.message:""}),confirmText:"Close",showCancel:!1,onConfirm:()=>{}})}})),r=u.init(n,((e,t)=>{e.context.els.forEach((({wrapper:o,onFieldChange:n})=>{n(e,t),e.total>0&&o.historyNav.show(),o.historyNav.info.update(e.current,e.total),e.prevStatus?o.historyNav.prevButton.enable():o.historyNav.prevButton.disable(),e.nextStatus?o.historyNav.nextButton.enable():o.historyNav.nextButton.disable()}))}),o,{});r.cachedItem.context.els||(r.cachedItem.context.els=[]),r.cachedItem.context.els.push({onFieldChange:t,wrapper:i});const s=(e=>{const t=v("prev",(()=>{e.prev()}),"history_prev",{type:"button",title:"Previous Version"}),o=v("next",(()=>{e.next()}),"history_next",{type:"button",title:"Next Version"}),n=y("span");n.update=(e,t)=>{n.innerText=`${e}/${t}`};const a=y("span");return a.show=()=>{a.style.display="initial"},a.hide=()=>{a.style.display="none"},a.prevButton=t,a.nextButton=o,a.info=n,a.appendChild(t),a.appendChild(o),a.appendChild(n),a.hide(),t.disable(),o.disable(),a})(r);return i.appendChild(s),i.historyNav=s,i},vision:e=>b((async()=>{const t=document.createElement("canvas"),o=t.getContext("2d");if(!o)return;t.width=e.image.width,t.height=e.image.height,o.drawImage(e.image,0,0);const n=t.toDataURL("image/png"),a=x(e.input);try{const t=await m.mgr.prompt.vision({image:n,field:e.field,namespace:e.namespace},(t=>{e.onUpdate(t)}));e.onUpdate(t),a()}catch(e){a(),w({title:"Failed",content:_("modai.cmp.failed_try_again",{msg:e instanceof Error?e.message:""}),confirmText:"Close",showCancel:!1,onConfirm:()=>{}})}}))},k=e=>{if(!r.modal.isDragging)return;const t=r.modal.modal,o=e.clientX-r.modal.offsetX,n=e.clientY-r.modal.offsetY;t.style.left=o+"px",t.style.top=n+"px",t.style.transform="none"},M=()=>{r.modal.isDragging=!1,document.body.style.userSelect=""},E='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>',T='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>',A={loadingText:"Loading...",completedText:"Completed!",completedTextDuration:2e3,disabled:!1,disableCompletedState:!1},L=e=>{const t=(e={...A,...e}).icon;t.ariaHidden="true";const o=y("div",void 0,e.label),n=v([t,o],(async()=>{const a=n.innerHTML,i=e.onClick(e.message,r.modal);if(i instanceof Promise){const n=y("span","spinner",[y("span","dot top"),y("span","dot right"),y("span","dot bottom"),y("span","dot left")]);t.innerHTML="",t.appendChild(n),o.innerHTML=e.loadingText||"",await i}e.disableCompletedState||(t.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>',o.innerHTML=e.completedText||"Completed!",await new Promise((e=>setTimeout(e,2e3)))),n.innerHTML=a}),"action-button",{ariaLabel:e.label,tabIndex:0});return e.disabled&&n.disable(),n},I=(e,t)=>{const o=y("div","icon");return o.style.width=`${e}px`,o.style.height=`${e}px`,o.innerHTML=t.trim(),o},O=()=>{const e=r.modal.chatContainer.scrollHeight-r.modal.chatContainer.scrollTop-r.modal.chatContainer.clientHeight<10;r.modal.chatContainer.scrollHeight>r.modal.chatContainer.clientHeight&&!e?r.modal.scrollWrapper.style.display="flex":r.modal.scrollWrapper.style.display="none"},B=e=>{r.modal.welcomeMessage.style.display="none";const t=y("div","message error");t.appendChild(I(14,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>'));const o=y("span");return o.textContent=e,t.appendChild(o),r.modal.chatMessages.appendChild(t),t},S=(e,t)=>{if(!e.hidden){if("user"===e.role){const t=(e=>{const t=y("div","message user");let o,n=null;if(Array.isArray(e.content)){const[t,...a]=e.content;o=t.value,n=a}else o=e.content;const a=y("div");if(a.innerHTML=f(o),t.appendChild(a),n){const e=y("div","imageRow");for(const t of n){const o=y("div"),n=y("img");n.src=t.value,o.appendChild(n),e.appendChild(o)}t.appendChild(e)}const i=y("div","actions");return i.appendChild(L({message:e,disabled:r.modal.isLoading,disableCompletedState:!0,icon:I(14,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>'),label:"Edit",onClick:e=>{r.alertOpen=!0,w({title:"Confirm Edit",content:"Editing this message will delete all responses that came after it. Do you want to proceed?",confirmText:"Edit Message",onCancel:()=>{r.alertOpen=!1},onConfirm:()=>{if(r.alertOpen=!1,r.modal.messageInput.setValue("string"==typeof e.content?e.content:e.content[0].value),"string"!=typeof e.content)for(const t of e.content)"text"!==t.type&&"image"===t.type&&r.modal.attachments.addImageAttachment(t.value);r.modal.history.clearHistoryFrom(e.id),0===r.modal.history.getMessages().length&&(r.modal.welcomeMessage.style.display="block")}})}})),t.appendChild(i),t.update=e=>{const t=Array.isArray(e.content)?e.content[0].value:e.content;a.innerHTML=f(t)},r.modal.chatMessages.appendChild(t),t})(e);return t.scrollIntoView({behavior:"smooth",block:"start"}),t}return e.type,((e,t)=>{const o=y("div","message ai");let n=Array.isArray(e.content)?e.content[0].value:e.content;"image"===e.type&&(n=`<img src="${n}" />`);const a=((e,t=[])=>{const o=y("div");o.updateContent=e=>{n.innerHTML=f(e),O()};const n=y("div");n.innerHTML=f(e);const a=o.attachShadow({mode:"open"}),i=y("style");return i.textContent="\n    html {\n        width: 100%;\n        max-width: 100%;\n        padding: 0;\n        margin: 0;\n    }\n    body {\n        background-color: #F1F1F2;\n        margin: 0;\n        padding: 0;\n        font-family: Arial, sans-serif;\n        overflow-x: hidden;\n        width: 100%;\n        max-width: 100%;\n        box-sizing: border-box;\n    }\n    * {\n        box-sizing: border-box;\n        max-width: 100%;\n    }\n    pre {\n        white-space: pre-wrap;\n        word-wrap: break-word;\n        overflow-wrap: break-word;\n        max-width: 100%;\n        padding: 12px;\n        margin: 0;\n        background-color: #f5f7fa;\n        border-radius: 5px;\n        font-size: 14px;\n    }\n    img {\n        max-width: 100%;\n        height: auto;\n        display: block;\n    }\n    code {\n        white-space: pre-wrap;\n        word-wrap: break-word;\n        max-width: 100%;\n        display: block;\n        overflow-x: hidden;\n        font-size: 14px;\n    }\n    table {\n        width: 100%;\n        max-width: 100%;\n        overflow-x: hidden;\n        display: block;\n        border-collapse: collapse;\n    }\n    div {\n        max-width: 100%;\n        overflow-wrap: break-word;\n        word-wrap: break-word;\n        box-sizing: border-box;\n    }\n    p {\n        margin: 0 0 0.5em 0;\n        max-width: 100%;\n    }\n    h1, h2, h3, h4, h5, h6 {\n        margin: 0 0 0.1em 0;\n        max-width: 100%;\n    }\n",a.appendChild(i),t.forEach((e=>{a.appendChild(y("link",void 0,"",{rel:"stylesheet",type:"text/css",href:e}))})),a.append(n),o})(n,t.customCSS??[]);o.appendChild(a);const i=y("div","actions");if("text"===t.type&&(!1!==t.textActions?.copy&&i.appendChild(L({message:e,disabled:r.modal.isLoading,icon:I(14,E),label:"Copy",completedText:"Copied!",onClick:"function"==typeof t.textActions?.copy?t.textActions.copy:$})),"function"==typeof t.textActions?.insert&&i.append(L({message:e,disabled:r.modal.isLoading,icon:I(14,T),label:"Insert",completedText:"Inserted!",onClick:t.textActions.insert}))),"image"===t.type){!1!==t.imageActions?.copy&&i.append(L({message:e,disabled:r.modal.isLoading,icon:I(14,E),label:"Copy",loadingText:"Downloading...",completedText:"Copied!",onClick:async(e,o)=>{const n="function"==typeof t.textActions?.copy?t.textActions.copy:$;if(!0===e.ctx.downloaded)return void n(e,o);const a=await m.mgr.download.image({url:e.content,field:t.field,namespace:t.namespace,resource:t.resource,mediaSource:t.image?.mediaSource});e.content=a.fullUrl,e.ctx.downloaded=!0,e.ctx.url=a.url,e.ctx.fullUrl=a.fullUrl,n(e,o)}}));const o=t.imageActions?.insert;"function"==typeof o&&i.append(L({message:e,disabled:r.modal.isLoading,icon:I(14,T),label:"Insert",completedText:"Inserted!",loadingText:"Downloading...",onClick:async(e,n)=>{if(!0===e.ctx.downloaded)return void o(e,n);const a=await m.mgr.download.image({url:e.content,field:t.field,namespace:t.namespace,resource:t.resource,mediaSource:t.image?.mediaSource});e.content=a.fullUrl,e.ctx.downloaded=!0,e.ctx.url=a.url,e.ctx.fullUrl=a.fullUrl,o(e,n)}}))}return o.appendChild(i),r.modal.chatMessages.appendChild(o),o.update=e=>{const t=Array.isArray(e.content)?e.content[0].value:e.content,o="image"===e.type?`<img src="${t}" />`:f(t);a.updateContent(o)},o})(e,t)}},$=async e=>{await new Promise((e=>setTimeout(e,2e3)));const t=Array.isArray(e.content)?e.content[0].value:e.content;if(navigator.clipboard&&navigator.clipboard.writeText)try{await navigator.clipboard.writeText(t)}catch{B(_("modai.cmp.failed_copy"))}else try{const e=y("textarea");e.value=t,document.body.appendChild(e),e.select(),document.execCommand("copy"),document.body.removeChild(e)}catch{B(_("modai.cmp.failed_copy"))}},D=()=>{document.removeEventListener("mousemove",(e=>k(e))),document.removeEventListener("mouseup",(()=>M())),r.modal&&r.modal.remove(),r.modalOpen=!1},H=async(e,t,o)=>{const n=t?t.trim():r.modal.messageInput.value.trim();if(!n||r.modal.isLoading)return;s(!0),r.modal.messageInput.value="",r.modal.messageInput.style.height="auto",r.modal.abortController=new AbortController,r.modal.welcomeMessage.style.display="none";let a=n;r.modal.attachments.attachments.length>0&&"text"===e.type&&(a=[{type:"text",value:n},...r.modal.attachments.attachments.map((e=>({type:e.type,value:e.value})))]),r.modal.attachments.removeAttachments();const i=r.modal.history.getMessagesHistory();r.modal.history.addUserMessage(a,o);try{if("text"===e.type){const t=await m.mgr.prompt.freeText({namespace:e.namespace,context:e.context,prompt:a,field:e.field||"",messages:i},(e=>{r.modal.history.updateAssistantMessage(e.id,e.content)}),r.modal.abortController);r.modal.history.updateAssistantMessage(t.id,t.content)}if("image"===e.type){const e=await m.mgr.prompt.image({prompt:a},r.modal.abortController);r.modal.history.addAssistantMessage(e.url,e.id,"image")}r.modal.abortController=void 0}catch(e){if(e instanceof Error){if("AbortError"===e.name)return;return s(!1),void B(e.message)}B("Unknown error")}s(!1),r.modal.messageInput.focus()},j=(e,t)=>{for(t.type=e,r.modal.history=i.init(`${t.key}/${t.type}`,(e=>S(e,t)));r.modal.chatMessages.firstChild;)r.modal.chatMessages.removeChild(r.modal.chatMessages.firstChild);const o=r.modal.history.getMessages().filter((e=>!e.hidden));o.length>0?(r.modal.welcomeMessage.style.display="none",o.forEach((e=>{e.el&&r.modal.chatMessages.appendChild(e.el)})),r.modal.actionButtons.forEach((e=>{e.enable()}))):(r.modal.welcomeMessage.style.display="block",r.modal.actionButtons.forEach((e=>{e.disable()}))),P()},U=async(e,t=!1)=>{if(!t&&e instanceof File&&!e.type.startsWith("image/"))return void B("Only image files are allowed");if(t)return void r.modal.attachments.addImageAttachment(e);const o=await new Promise(((t,o)=>{const n=new FileReader;n.onload=function(e){t(e.target?.result)},n.onerror=function(e){o(e)},n.readAsDataURL(e)}));r.modal.attachments.addImageAttachment(o)},P=()=>{r.modal.chatContainer.scrollTop=r.modal.chatContainer.scrollHeight},F=e=>{const t=y("div","inputContainer"),o=y("div","inputSection"),n=y("div","inputWrapper"),a=y("textarea","","",{placeholder:"Ask me anything…",rows:1,ariaLabel:"Type your message"});a.setValue=e=>{a.value=e,a.focus(),""!==e.trim()?(l.disabled=!1,g(l,"active")):(l.disabled=!0,g(l,""))};const i=y("div","loadingDots",[y("div","loadingDot"),y("div","loadingDot"),y("div","loadingDot")],{ariaLabel:"AI is thinking"}),l=v(I(20,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>'),(()=>H(e)),"",{ariaLabel:"Send message"});l.disable(),l.enable=()=>{l.disabled=!1,g(l,"active")},l.disable=()=>{l.disabled=!0,g(l,"")};const d=v(I(20,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"></rect></svg>'),(()=>{r.modal.isLoading&&r.modal.abortController&&(r.modal.abortController.abort(),r.modal.abortController=void 0,s(!1))}),"",{ariaLabel:"Stop generating message"});d.disable(),d.enable=()=>{d.disabled=!1,g(d,"active sending")},d.disable=()=>{d.disabled=!0,g(d,"")},n.append(a,i,l,d),o.append((()=>{const e=y("div","attachmentsWrapper");return e.visible=!1,e.attachments=[],e.show=()=>{e.visible||(e.visible=!0,g(e,"attachmentsWrapper visible"))},e.hide=()=>{e.visible&&(e.visible=!1,g(e,"attachmentsWrapper"))},e.addImageAttachment=e=>{(e=>{r.modal.attachments.attachments.length>0&&r.modal.attachments.removeAttachments();const t=y("div","imagePreview");t.type="image",t.value=e;const o=y("img",void 0,"",{src:e}),n=y("button",void 0,"×");n.addEventListener("click",(e=>{e.stopPropagation(),r.modal.attachments.removeAttachment(t)})),t.append(o,n),r.modal.attachments.addAttachment(t)})(e)},e.removeAttachments=()=>{r.modal.attachments.attachments.forEach((e=>{r.modal.attachments.removeAttachment(e)}))},e.addAttachment=t=>{e.show(),e.appendChild(t),e.attachments.push(t)},e.removeAttachment=t=>{const o=e.attachments.indexOf(t);-1!==o&&(t.remove(),e.attachments.splice(o,1),0===e.attachments.length&&e.hide())},r.modal.attachments=e,e})(),n);const c=[],p=v([I(24,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text"><path d="M17 6.1H3"></path><path d="M21 12.1H3"></path><path d="M15.1 18H3"></path></svg>'),y("span","tooltip","Text Mode")],(()=>{"text"!==e.type&&(j("text",e),c.forEach((e=>{g(e,"")})),g(p,"active"))}),"",{ariaLabel:"Text mode"});"text"===e.type&&g(p,"active");const m=v([I(24,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>'),y("span","tooltip","Image Mode")],(()=>{"image"!==e.type&&(j("image",e),c.forEach((e=>{g(e,"")})),g(m,"active"))}),"",{ariaLabel:"Image mode"});"image"===e.type&&g(m,"active"),c.push(p),c.push(m);const h=v([I(24,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>'),y("span","tooltip","Retry Last Message")],(()=>{(e=>{if(0!==r.modal.history.getMessages().length)if("text"!==e.type){if("image"===e.type){const t=r.modal.history.getMessages().reverse().find((e=>"user"===e.role));t&&H(e,t.content)}}else H(e,"Try again")})(e)}),"",{ariaLabel:"Retry last message"});h.disable();const u=v([I(24,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>'),y("span","tooltip","Clear Chat")],(()=>{r.modal.history.clearHistory(),r.modal.chatMessages.innerHTML="",r.modal.welcomeMessage.style.display="block",r.modal.actionButtons.forEach((e=>{e.disable()}))}),"",{ariaLabel:"Clear chat"});u.disable();const f=y("div","options",[p,m,h,u],{ariaLabel:"Chat options",role:"toolbar"}),w=(()=>{const e=y("div","scrollToBottomContainer",[v([y("div",void 0,"Scroll to bottom"),I(14,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"></path></svg>')],(()=>{P(),O()}))]);return r.modal.chatContainer.addEventListener("scroll",(()=>{O()})),new MutationObserver((()=>{O()})).observe(r.modal.chatContainer,{childList:!0,subtree:!0}),r.modal.scrollWrapper=e,e})();return t.append(w),t.append(o,f),a.addEventListener("keydown",(t=>{if("Enter"===t.key){if(t.shiftKey)return;t.preventDefault(),H(e)}})),a.addEventListener("input",(function(){this.style.height="auto",this.style.height=this.scrollHeight+"px",""!==this.value.trim()?(l.disabled=!1,g(l,"active")):(l.disabled=!0,g(l,""))})),o.addEventListener("dragover",(e=>{e.preventDefault(),e.stopPropagation(),g(o,"inputSection dragOver")})),o.addEventListener("dragleave",(e=>{e.preventDefault(),e.stopPropagation(),g(o,"inputSection")})),o.addEventListener("drop",(async e=>{e.preventDefault(),e.stopPropagation(),g(o,"inputSection");let t=null,n=null;const a=e.dataTransfer;if(!a)return;const i=a.files;if(i?.length>0){const e=i[0];e.type.startsWith("image/")&&(t=e)}if(!t){const e=a.getData("text/uri-list");e&&(n=e)}if(t)await U(t);else if(n){const e=new URL(window.location.href);if(!n.startsWith(e.origin))return void await U(n,!0);try{const e=await fetch(n);if(e.ok){const t=await e.blob();if(t.type.startsWith("image/")){const e=new File([t],"image.png",{type:t.type});await U(e)}}}catch{B("Failed to fetch an image")}}else B("Only image files are allowed")})),a.addEventListener("paste",(async e=>{const t=e.clipboardData?.items;if(t)for(let o=0;o<t.length;o++)if(-1!==t[o].type.indexOf("image")){const n=t[o].getAsFile();if(n){e.preventDefault(),await U(n);break}}})),r.modal.loadingIndicator=i,r.modal.messageInput=a,r.modal.sendBtn=l,r.modal.stopBtn=d,r.modal.modeButtons=c,r.modal.actionButtons=[h,u],t},R=e=>{const t=y("div"),o=y("div","modai--root chat-modal","",{ariaLabel:"modAI Assistant chat dialog"});t.modal=o,r.modal=t,t.history=i.init(`${e.key}/${e.type}`,(t=>S(t,e))),o.append((()=>{const e=y("header","header",[y("h1","","modAI Assistant"),v(I(24,'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>'),(()=>{D()}),"closeBtn",{ariaLabel:"Close dialog"})]);return e.addEventListener("mousedown",(e=>{(e=>{r.modal.isDragging=!0;const t=r.modal.modal.getBoundingClientRect();r.modal.offsetX=e.clientX-t.left,r.modal.offsetY=e.clientY-t.top,document.body.style.userSelect="none"})(e),document.addEventListener("mousemove",k),document.addEventListener("mouseup",(()=>{M(),document.removeEventListener("mousemove",k),document.removeEventListener("mouseup",M)}))})),document.addEventListener("keydown",(e=>{r.alertOpen||"Escape"===e.key&&(e.preventDefault(),D())})),e})()),o.append((()=>{const e=y("div","chatContainer","",{ariaLive:"polite"}),t=y("div","welcome",[y("p","greeting",r.config.name?`Welcome, ${r.config.name}.`:"Welcome!"),y("p","msg","How can I help you today? ✨")]);e.append(t);const o=y("div","history","",{ariaLabel:"Conversation history"});return e.append(o),r.modal.welcomeMessage=t,r.modal.chatMessages=o,r.modal.chatContainer=e,e})()),o.append(F(e));const n=y("div","disclaimer","AI can make mistakes. Please double-check responses.");o.append(n),t.appendChild(o),document.body.append(t),t.isDragging=!1,t.isLoading=!1,t.abortController=void 0,t.offsetX=0,t.offsetY=0;const a=t.history.getMessages().filter((e=>!e.hidden));return a.length>0&&(t.welcomeMessage.style.display="none",t.actionButtons.forEach((e=>{e.enable()})),a.forEach((e=>{e.el&&t.chatMessages.appendChild(e.el)}))),setTimeout((()=>{P(),o.style.visibility="visible",t.messageInput.focus()}),100),t},V=["text","image"],q={createLoadingOverlay:x,localChat:e=>{if(r.modalOpen)return;if(!e.key)return void alert("key is required config property");e.type||(e.type="text"),e.availableTypes||(e.availableTypes=[e.type]),e.availableTypes=e.availableTypes.filter((e=>V.includes(e))),e.availableTypes.length>0&&!e.availableTypes.includes(e.type)&&e.availableTypes.unshift(e.type);const t=R(e);return window.x=t,t.api={sendMessage:async(t,o)=>{await H(e,t,o)},closeModal:()=>{D()}},r.modalOpen=!0,t},generateButton:C},N=(e,t)=>{const o=Ext.getCmp(e.firstElementChild?.id),n=q.generateButton.localChat({key:t,field:t,type:"image",resource:MODx.request.id,image:{mediaSource:o.imageBrowser.source},imageActions:{insert:(e,t)=>{o.imageBrowser.setValue(e.ctx.url),o.onImageChange(e.ctx.url),t.api.closeModal()}}}),a=q.generateButton.vision({input:o.altTextField.items.items[0].el.dom,field:t,image:o.imagePreview.el.dom,onUpdate:e=>{o.altTextField.items.items[0].setValue(e.content),o.image.altTag=e.content,o.updateValue()}});a.style.marginTop="6px",o.altTextField.el.dom.style.display="flex",o.altTextField.el.dom.style.justifyItems="center",o.altTextField.el.dom.style.alignItems="center",o.el.dom.parentElement?.parentElement?.parentElement?.querySelector("label")?.appendChild(n),o.altTextField.el.dom.appendChild(a)},W=()=>{const e=Ext.getCmp("modx-resource-content").el.dom.querySelector("label");e?.appendChild(q.generateButton.localChat({key:"res.content",field:"res.content",type:"text",availableTypes:["text","image"],resource:MODx.request.id}))},z=e=>{(e=>{const t={pagetitle:["modx-resource-pagetitle"],longtitle:["modx-resource-longtitle","seosuite-longtitle"],introtext:["modx-resource-introtext"],description:["modx-resource-description","seosuite-description"],content:["modx-resource-content"]};for(const o of e.resourceFields||[])t[o]&&("content"!==o?t[o].forEach((e=>{const t=Ext.getCmp(e);t&&t.label.appendChild(q.generateButton.forcedText({resourceId:MODx.request.id,field:`res.${o}`,input:t.el.dom,initialValue:t.getValue(),onChange:(e,o)=>{const n=t.getValue();t.setValue(e.value),t.fireEvent("change",t,e.value,n),o&&(t.el.dom.scrollTop=t.el.dom.scrollHeight)}}))})):W())})(e),(e=>{const t=Ext.getCmp("modx-panel-resource").getForm();for(const[o,n]of e.tvs||[]){const e=Ext.get(`tv${o}-tr`);if(!e)continue;const a=t.findField(`tv${o}`),i=`tv.${n}`;if(a){if("textfield"===a.xtype||"textarea"===a.xtype){const t=MODx.config[`modai.tv.${n}.text.prompt`],o=e.dom.querySelector("label");if(!o)return;t?o.appendChild(q.generateButton.forcedText({input:a.el.dom,resourceId:MODx.request.id,field:i,initialValue:a.getValue(),onChange:(e,t)=>{const o=a.getValue();a.setValue(e.value),a.fireEvent("change",a,e.value,o),t&&(a.el.dom.scrollTop=a.el.dom.scrollHeight)}})):o.appendChild(q.generateButton.localChat({key:i,field:i,type:"text",availableTypes:["text","image"],resource:MODx.request.id}))}if("modx-panel-tv-image"===a.xtype){const t=q.generateButton.localChat({key:i,field:i,type:"image",resource:MODx.request.id,image:{mediaSource:a.source},imageActions:{insert:(e,t)=>{const o={relativeUrl:e.ctx.url,url:e.ctx.url};a.items.items[1].fireEvent("select",o),a.fireEvent("select",o),t.api.closeModal()}}}),o=e.dom.querySelector("label");if(!o)return;o.appendChild(t)}}else{const t=e.dom.querySelector(".imageplus-panel-input");t&&N(t,i)}}})(e)},J=e=>(r.config=e,{chatHistory:i,history:u,executor:m,ui:q,initOnResource:z});ModAI=t.default})();