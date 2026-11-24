import { SRGBColorSpace } from 'three';

// Keep authored UVs and diffuse colors; do not share mutable GLTF cache materials.
export function restoreAvatarMaterials(object, diffuse) {
  diffuse.colorSpace = SRGBColorSpace;
  diffuse.flipY = false;
  diffuse.needsUpdate = true;
  object.traverse(node => {
    if (!node.isMesh) return;
    const restore = source => {
      const material = source.clone();
      material.map = diffuse;
      material.color.set('#ffffff');
      material.metalness = 0;
      material.metalnessMap = null;
      material.roughness = .82;
      material.roughnessMap = null;
      material.normalScale?.set(.3, .3);
      material.needsUpdate = true;
      return material;
    };
    node.material = Array.isArray(node.material) ? node.material.map(restore) : restore(node.material);
    node.castShadow = true;
  });
  return object;
}
