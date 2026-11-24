export function videoSources(src, delivery = {}) {
  return [...new Set([delivery.native, delivery.webm, delivery.smooth, src].filter(Boolean))];
}
