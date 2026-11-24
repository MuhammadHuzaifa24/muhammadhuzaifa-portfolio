// Adobe After Effects: File > Scripts > Run Script File.
// Adds editable 1920x1080/60fps compositions without deleting existing work.
(function () {
  app.beginUndoGroup('Build Warm Studio Portfolio Showreel');
  try {
    if (!app.project) app.newProject();
    var dir=File($.fileName).parent, root=dir.parent.parent;
    var json=File(dir.fsName+'/storyboard.json'); json.open('r'); var data=JSON.parse(json.read()); json.close();
    var orange=[249/255,115/255,22/255], ink=[23/255,33/255,43/255], cream=[244/255,243/255,239/255];
    var main=app.project.items.addComp('Huzaifa / 60-second showreel',1920,1080,1,60,60); main.motionBlur=true;
    function text(comp,value,size,pos,color,start,end) {
      var layer=comp.layers.addText(value), prop=layer.property('Source Text'), doc=prop.value;
      doc.font='Arial-BoldMT'; doc.fontSize=size; doc.fillColor=color; prop.setValue(doc);
      layer.inPoint=start||0; layer.outPoint=end||comp.duration; layer.motionBlur=true;
      layer.property('Position').setValueAtTime(layer.inPoint,[pos[0]+70,pos[1]]);
      layer.property('Position').setValueAtTime(layer.inPoint+.5,pos);
      layer.property('Opacity').setValueAtTime(layer.inPoint,0); layer.property('Opacity').setValueAtTime(layer.inPoint+.2,100);
      return layer;
    }
    function media(comp,relative,x,y,w,h,duration,offset,start,cover) {
      var file=File(root.fsName+'/'+relative); if(!file.exists)return null;
      var item=app.project.importFile(new ImportOptions(file));
      var clip=app.project.items.addComp('Asset / '+file.name,w,h,1,duration,60), source=clip.layers.add(item);
      source.startTime=-(offset||0); source.inPoint=0; source.outPoint=duration;
      var scale=(cover?Math.max(w/item.width,h/item.height):Math.min(w/item.width,h/item.height))*100;
      source.property('Scale').setValue([scale,scale]); source.property('Position').setValue([w/2,h/2]);
      source.audioEnabled=false; source.motionBlur=true;
      var layer=comp.layers.add(clip); layer.startTime=start||0; layer.inPoint=start||0; layer.outPoint=(start||0)+duration;
      layer.property('Position').setValue([x+w/2,y+h/2]); layer.motionBlur=true; return layer;
    }
    function card(comp,x,y,w,h) { var l=comp.layers.addSolid([1,1,1],'Glass card',w,h,1,comp.duration);l.property('Position').setValue([x+w/2,y+h/2]);l.property('Opacity').setValue(85);return l; }
    for(var i=0;i<data.scenes.length;i++) {
      var scene=data.scenes[i], shot=app.project.items.addComp((i+1)+' / '+scene.title,1920,1080,1,scene.duration,60);
      shot.motionBlur=true; shot.layers.addSolid(cream,'Cream studio',1920,1080,1,scene.duration);
      if(i===0) {
        var art=media(shot,'public/media/images/myavatar.png',1010,120,820,780,8,0,0,true);
        if(art){art.threeDLayer=true;art.property('Position').setValueAtTime(0,[1510,510,50]);art.property('Position').setValueAtTime(8,[1420,510,0]);}
        text(shot,'MUHAMMAD',100,[90,430],ink,0,8);text(shot,'HUZAIFA.',110,[90,570],orange,0,8);
        text(shot,'Game Designer / 3D Artist / Web3D Developer',29,[96,745],ink,0,8);
        var rgb=text(shot,'MUHAMMAD',100,[94,430],[0,.65,.75],0,.25);rgb.property('Opacity').setValueAtTime(0,40);rgb.property('Opacity').setValueAtTime(.2,0);
      } else if(i===1) {
        var names=['Unity','Blender','React','Threedotjs','Csharp','Python'], labels=['UNITY','BLENDER','REACT','THREE.JS','C#','PYTHON'];
        text(shot,'THE TOOLS / BEHIND THE WORLDS',44,[100,120],ink,0,10);
        for(var n=0;n<6;n++) {
          var x=100+(n%3)*600,y=190+Math.floor(n/3)*390; card(shot,x,y,520,320);
          var logo=media(shot,'creative/promo/branding/'+names[n]+'.png',x+185,y+55,150,150,10,0,0,false);
          if(logo){logo.threeDLayer=true;logo.property('Position').expression='value+[0,12*Math.sin(time*1.5+'+n+'),25*Math.sin(time*.7)]';logo.property('Scale').setValueAtTime(n*.12,[60,60,60]);logo.property('Scale').setValueAtTime(n*.12+.35,[100,100,100]);}
          text(shot,labels[n],30,[x+170,y+285],ink,n*.12,10);
        }
        var camera=shot.layers.addCamera('Floating grid camera',[960,540]);camera.property('Position').setValue([960,540,-2000]);camera.property('Point of Interest').setValue([960,540,0]);camera.property('Camera Options').property('Zoom').setValue(2000);
      } else if(i===2) {
        media(shot,'public/media/videos/WADA.mp4',0,0,1920,1080,6,10,0,true);
        var sci=media(shot,'public/media/videos/signal-shutdown.mp4',0,0,1920,1080,6,4,6,true);
        if(sci){sci.property('Position').setValueAtTime(6,[2880,540]);sci.property('Position').setValueAtTime(6.25,[960,540]);}
        text(shot,'WADA',48,[86,130],[1,1,1],0,6);text(shot,'THE SIGNAL SHUTDOWN',44,[86,130],[1,1,1],6,12);
      } else if(i===3) {
        media(shot,'public/media/videos/fyp.mp4',570,210,1260,710,12,42,0,true);
        text(shot,'R.I.S.E',78,[90,150],ink,0,12);
        var tags=['HAND TRACKING','VR SHAPE SORTING','PARENT ANALYTICS'];
        for(var t=0;t<3;t++){card(shot,90,300+t*190,420,140);text(shot,tags[t],30,[120,390+t*190],orange,0,12);}
      } else if(i===4) {
        var sources=['public/media/images/flappybird.jpg','public/media/images/mrjungle.jpg','public/media/videos/ninnitrap.mp4','creative/promo/turntables/kiki.mp4','creative/promo/turntables/mochi.mp4','creative/promo/turntables/avatar.mp4'];
        var titles=['FlappyBird','MrJungle','NinniTrap','Kiki the Explorer','Mochi 3D','MyAvatar'];
        text(shot,'ARCADE WORLDS / 3D CHARACTERS',44,[70,110],ink,0,10);
        for(var a=0;a<6;a++){var px=70+(a%3)*600,py=a<3?155:605;media(shot,sources[a],px,py,570,330,10,a===2?4:0,0,false);text(shot,titles[a],28,[px+20,py+375],ink,0,10);}
      } else {
        media(shot,'public/media/images/GameConRunner.jpg',1020,170,820,740,8,0,0,false);
        text(shot,'GAMECON / RUNNER-UP',30,[100,170],orange,0,8);
        text(shot,'LET US BUILD',88,[100,390],ink,0,8);text(shot,'SOMETHING',88,[100,500],ink,0,8);text(shot,'TOGETHER.',88,[100,610],orange,0,8);
        text(shot,'huzaifaraees6146@gmail.com',30,[106,835],ink,0,8);
        for(var p=0;p<12;p++){var dot=text(shot,'·',40,[70+p*150,80+(p%4)*230],orange,0,8);dot.property('Position').expression='wiggle(.4,15)';dot.property('Opacity').setValueAtTime(0,25);dot.property('Opacity').setValueAtTime(.2,25);}
      }
      var placed=main.layers.add(shot);placed.startTime=scene.start;placed.inPoint=scene.start;placed.outPoint=scene.start+scene.duration;
      if(i===5){placed.property('Opacity').setValueAtTime(59,100);placed.property('Opacity').setValueAtTime(60,0);}
    }
    var music=File(dir.fsName+'/background.wav');if(music.exists)main.layers.add(app.project.importFile(new ImportOptions(music)));
    main.workAreaStart=0;main.workAreaDuration=60;main.openInViewer();
  } finally { app.endUndoGroup(); }
})();
