import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
// A small acknowledgement nod, preserving the model's original bone transforms.
export function useAvatarGesture(object, reduced) {
  const state = useRef({ until: 0, thinking: false, applied: false });
  const target = useMemo(() => { let head; object.traverse(node => { if (!head && node.isBone && /head/i.test(node.name)) head = node; }); const node = head || object; return { node, baseX: node.rotation.x }; }, [object]);
  useEffect(() => {
    const event = ({ detail }) => { state.current.thinking = detail?.state === 'thinking'; state.current.until = detail?.state === 'speaking' ? performance.now() + 1800 : 0; };
    window.addEventListener('portfolio:assistant', event);
    return () => { window.removeEventListener('portfolio:assistant', event); target.node.rotation.x = target.baseX; };
  }, [target]);
  useFrame(() => {
    if (reduced) return;
    const now = performance.now(), active = state.current.thinking || now < state.current.until;
    if (active) { target.node.rotation.x = target.baseX + Math.sin(now * (state.current.thinking ? 0.003 : 0.009)) * (state.current.thinking ? 0.035 : 0.075); state.current.applied = true; }
    else if (state.current.applied) { target.node.rotation.x = target.baseX; state.current.applied = false; }
  });
}
