import { useSyncExternalStore } from 'react';
const events=['play','pause','ended','emptied'];
function subscribe(callback){events.forEach(e=>document.addEventListener(e,callback,true));return()=>events.forEach(e=>document.removeEventListener(e,callback,true));}
const snapshot=()=>Array.from(document.querySelectorAll('video')).some(v=>!v.paused&&!v.ended);
export function useVideoPlayback(){return useSyncExternalStore(subscribe,snapshot,()=>false);}
