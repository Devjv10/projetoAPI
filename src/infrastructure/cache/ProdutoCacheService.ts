import { IProdutoCacheService, CacheMetricSnapshot } from "../../application/Interfaces/IProdutoCacheService";
import { Product } from "../../models/Product";
import { cacheClient, CacheClient } from "./RedisClient";

export class ProdutoCacheService implements IProdutoCacheService {
  private readonly instanceName = "GestaoPedidos:";
  private hits = 0;
  private misses = 0;
  private tempoComCacheTotal = 0;
  private tempoSemCacheTotal = 0;

  constructor(private readonly client: CacheClient = cacheClient) {}

  async getAsync(key: string): Promise<Product | Product[] | null> {
    const value = await this.client.get(this.normalizeKey(key));
    return value ? (JSON.parse(value) as Product | Product[]) : null;
  }

  async setAsync(key: string, value: Product | Product[]): Promise<void> {
    const ttlSeconds = key.startsWith("produto:item:") ? 300 : 120;
    await this.client.setEx(this.normalizeKey(key), ttlSeconds, JSON.stringify(value));
  }

  async invalidateAsync(keyOrPattern: string): Promise<void> {
    const normalized = this.normalizeKey(keyOrPattern);
    const keys = keyOrPattern.includes("*") ? await this.client.keys(normalized) : [normalized];

    await Promise.all(keys.map((key) => this.client.del(key)));
    console.log(`Cache INVALIDADO key=${normalized}`);
  }

  async getStatsAsync(): Promise<CacheMetricSnapshot> {
    const totalChaves = (await this.client.keys(`${this.instanceName}produto:*`)).length;
    const total = this.hits + this.misses;

    return {
      totalChaves,
      hitRate: total === 0 ? 0 : this.hits / total,
      missRate: total === 0 ? 0 : this.misses / total,
      tempoMedioComCacheMs: this.hits === 0 ? 0 : this.tempoComCacheTotal / this.hits,
      tempoMedioSemCacheMs: this.misses === 0 ? 0 : this.tempoSemCacheTotal / this.misses
    };
  }

  recordHit(elapsedMs: number): void {
    this.hits += 1;
    this.tempoComCacheTotal += elapsedMs;
  }

  recordMiss(elapsedMs: number): void {
    this.misses += 1;
    this.tempoSemCacheTotal += elapsedMs;
  }

  private normalizeKey(key: string): string {
    return key.startsWith(this.instanceName) ? key : `${this.instanceName}${key}`;
  }
}
