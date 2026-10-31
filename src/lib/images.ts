import manifest from '../data/image-manifest.json';

type ImageAsset = { src: string; srcSet?: string; width?: number; height?: number };

export function imageFor(source: string): ImageAsset {
  return (manifest as Record<string, ImageAsset>)[source] ?? { src: source };
}
