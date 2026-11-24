import asyncio,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent/'python'))
import edge_tts
segments=[
(0,6,"Meet Muhammad Huzaifa. Game designer, three D artist, and creative developer."),
(6,6,"Final year at N E D University, connecting games, immersive worlds, and the web."),
(12,5,"Unity, Blender, React. Ideas become games."),
(17,6,"Creative interfaces and intelligent applications, designed to feel alive."),
(23,7,"WADA's Arabian world, and The Signal Shutdown. Original games, built to play."),
(30,7,"R I S E brings virtual reality, hand tracking, and visual feedback into rehabilitation and learning."),
(37,4,"Original characters and playful arcade worlds."),
(41,3,"A GameCon runner up."),
(44,4,"Let's create. With Muhammad Huzaifa.")]
async def main():
 root=Path(__file__).resolve().parent
 (root/'narration.json').write_text(json.dumps([{'start':a,'duration':b,'text':c} for a,b,c in segments],indent=2))
 for i,(_,_,text) in enumerate(segments):
  if len(sys.argv)>1 and str(i) not in sys.argv[1:]: continue
  await edge_tts.Communicate(text,'en-US-GuyNeural',rate='+4%').save(str(root/f'voice-{i}.mp3'))
  print('Narration segment',i+1,'ready',flush=True)
asyncio.run(main())
