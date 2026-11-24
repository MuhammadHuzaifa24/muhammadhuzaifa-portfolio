import { Box3, Group, Vector3 } from 'three';

export const MODEL_CAMERA = { position: [0, 1.2, 3.5], fov: 45 };
// Center before the first Bounds measurement; preserve the asset's authored root transform.
export function frameModel(object, size = 2.4) {
  const offset = new Group(), normalized = new Group();
  offset.add(object); offset.updateMatrixWorld(true);
  const box = new Box3().setFromObject(offset), dimensions = box.getSize(new Vector3());
  const longest = Math.max(dimensions.x, dimensions.y, dimensions.z);
  if (!Number.isFinite(longest) || longest <= 0) throw new Error('This model has no visible geometry.');
  offset.position.copy(box.getCenter(new Vector3())).multiplyScalar(-1);
  normalized.add(offset); normalized.scale.setScalar(size / longest);
  normalized.updateMatrixWorld(true);
  return normalized;
}
