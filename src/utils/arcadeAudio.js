// Original procedural arcade sounds; no downloads, samples or autoplay permission hacks.
export class ArcadeAudio {
  constructor() { this.context=null; this.master=null; this.engine=null; this.enabled=true; this.lastCrash=-Infinity; }
  async unlock() {
    const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Audio) return false;
    if (!this.context) { this.context=new Audio(); this.master=this.context.createGain(); this.master.gain.value=.22; this.master.connect(this.context.destination); }
    if (this.context.state==='suspended') await this.context.resume();
    return this.context.state==='running';
  }
  tone(from,to,duration=.2,type='sine',volume=.3,delay=0) {
    const c=this.context; if (!c || c.state!=='running' || !this.enabled) return;
    const o=c.createOscillator(),g=c.createGain(),at=c.currentTime+delay;
    o.type=type; o.frequency.setValueAtTime(from,at); o.frequency.exponentialRampToValueAtTime(Math.max(20,to),at+duration);
    g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.015);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
    o.connect(g);g.connect(this.master);o.start(at);o.stop(at+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  start() {
    if(!this.context || this.engine || !this.enabled) return;
    const c=this.context,o=c.createOscillator(),g=c.createGain(),filter=c.createBiquadFilter();
    o.type='sawtooth';o.frequency.value=48;filter.type='lowpass';filter.frequency.value=550;g.gain.value=.06;
    o.connect(filter);filter.connect(g);g.connect(this.master);o.start();this.engine={o,g,filter};
    this.tone(65,260,.35,'triangle',.3);this.tone(180,80,.25,'triangle',.2,.3);
  }
  update(speed,throttle=false,reverse=false) {
    if(!this.engine)return;
    const c=this.context,rpm=48+Math.min(180,Math.abs(speed)*22)+(throttle?28:0);
    this.engine.o.frequency.setTargetAtTime(rpm,c.currentTime,.12);this.engine.g.gain.setTargetAtTime(throttle ? .1 : .045,c.currentTime,.12);
    if(reverse && c.currentTime-(this.reverseAt ?? -10)>.7){this.reverseAt=c.currentTime;this.tone(650,650,.12,'sine',.13);}
  }
  horn(){const now=this.context?.currentTime??0;if(now-(this.lastHorn??-10)<.35)return;this.lastHorn=now;this.tone(740,660,.12,'square',.13);this.tone(1110,990,.12,'sine',.12);this.tone(880,620,.2,'square',.14,.18);this.tone(1320,930,.2,'sine',.1,.18);}
  crash(){const now=this.context?.currentTime??0;if(now-this.lastCrash<.3)return;this.lastCrash=now;this.tone(190,38,.35,'sawtooth',.35);this.tone(800,130,.23,'sine',.4,.02);this.tone(140,420,.16,'triangle',.15,.23);}
  brake(){this.tone(1050,220,.22,'triangle',.15);}
  gate(){[523,659,784].forEach((f,i)=>this.tone(f,f,.15,'sine',.2,i*.09));}
  test(){this.tone(440,660,.22,'sine',.35);this.tone(660,880,.18,'sine',.25,.2);}
  setEnabled(value){this.enabled=value;if(this.master)this.master.gain.setTargetAtTime(value ? .22 : 0,this.context.currentTime,.04);if(!value)this.stop();}
  stop(){if(this.engine){this.engine.o.stop();this.engine.o.disconnect();this.engine.g.disconnect();this.engine.filter.disconnect();this.engine=null;}}
  dispose(){this.stop();this.context?.close();this.context=null;}
}
