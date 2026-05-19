import { Product } from "../../models/Product";

export interface CacheMetricSnapshot {
  totalChaves: number;
  hitRate: number;
  missRate: number;
  tempoMedioComCacheMs: number;
  tempoMedioSemCacheMs: number;
}

export interface IProdutoCacheService {
  getAsync(key: string): Promise<Product | Product[] | null>;
  setAsync(key: string, value: Product | Product[]): Promise<void>;
  invalidateAsync(keyOrPattern: string): Promise<void>;
  getStatsAsync(): Promise<CacheMetricSnapshot>;
  recordHit(elapsedMs: number): void;
  recordMiss(elapsedMs: number): void;
}
