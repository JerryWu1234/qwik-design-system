import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { IconifyJSON } from "@iconify/types";
import { getIconData, iconToSVG } from "@iconify/utils";
import { getAvailableCollections } from "../naming";

export type LazyCollections = Map<string, Promise<IconifyJSON>>;
export type IconData = { body: string; viewBox: string };
export type LazyIconCache = Map<string, Promise<IconData | null>>;

/**
 * Collection loader with lazy loading and caching
 */
export class CollectionLoader {
  private lazyCollections: LazyCollections = new Map();
  private lazyIconCache: LazyIconCache = new Map();
  private availableCollections = new Set<string>();
  private require = createRequire(import.meta.url);

  constructor(private debug: (message: string, ...data: unknown[]) => void) {}

  /**
   * Discover all available collections
   */
  discoverCollections(): void {
    if (this.availableCollections.size > 0) return;

    const collections = getAvailableCollections();
    for (const name of collections) {
      this.availableCollections.add(name);
    }
    this.debug(
      `Discovered ${collections.length} Iconify collections:`,
      collections.slice(0, 10),
      collections.length > 10 ? `...and ${collections.length - 10} more` : ""
    );
  }

  /**
   * Get available collections
   */
  getAvailableCollections(): Set<string> {
    return this.availableCollections;
  }

  /**
   * Check if a collection is available
   */
  hasCollection(name: string): boolean {
    return this.availableCollections.has(name);
  }

  /**
   * Lazy load a collection
   */
  async loadCollectionLazy(prefix: string): Promise<IconifyJSON> {
    if (this.lazyCollections.has(prefix)) {
      return await this.lazyCollections.get(prefix)!;
    }

    const loadPromise = (async () => {
      try {
        const collectionPath = this.require.resolve(`@iconify/json/json/${prefix}.json`);
        const collectionData = readFileSync(collectionPath, "utf-8");
        const collection = JSON.parse(collectionData) as IconifyJSON;
        this.debug(
          `Lazy-loaded ${prefix} collection with ${Object.keys(collection.icons || {}).length} icons`
        );
        return Promise.resolve(collection);
      } catch (error) {
        this.debug(`Failed to load ${prefix} collection: ${String(error)}`);
        return Promise.reject(error);
      }
    })();

    this.lazyCollections.set(prefix, loadPromise);
    return loadPromise;
  }

  /**
   * Lazy load icon data
   */
  async loadIconDataLazy(prefix: string, name: string): Promise<IconData | null> {
    const cacheKey = `${prefix}:${name}`;
    if (this.lazyIconCache.has(cacheKey)) {
      return await this.lazyIconCache.get(cacheKey)!;
    }

    const loadPromise = (async () => {
      try {
        const collection = await this.loadCollectionLazy(prefix);
        const iconDataRaw = getIconData(collection, name);

        if (!iconDataRaw) {
          this.debug(`Icon "${name}" not found in ${prefix} collection`);
          return null;
        }

        const svgData = iconToSVG(iconDataRaw);
        const result = {
          body: svgData.body,
          viewBox: `${iconDataRaw.left || 0} ${iconDataRaw.top || 0} ${iconDataRaw.width} ${iconDataRaw.height}`
        };

        return result;
      } catch (error) {
        this.debug(`Error loading icon "${name}" from ${prefix}: ${String(error)}`);
        return null;
      }
    })();

    this.lazyIconCache.set(cacheKey, loadPromise);
    return loadPromise;
  }
}
