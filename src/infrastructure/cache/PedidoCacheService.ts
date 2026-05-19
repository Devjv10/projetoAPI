import { IPedidoCacheService } from "../../application/Interfaces/IPedidoCacheService";
import { cacheClient, CacheClient } from "./RedisClient";

export class PedidoCacheService implements IPedidoCacheService {
  private readonly instanceName = "GestaoPedidos:";

  constructor(private readonly client: CacheClient = cacheClient) {}

  async invalidateAsync(keyOrPattern: string): Promise<void> {
    const normalized = keyOrPattern.startsWith(this.instanceName)
      ? keyOrPattern
      : `${this.instanceName}${keyOrPattern}`;
    const keys = keyOrPattern.includes("*") ? await this.client.keys(normalized) : [normalized];

    await Promise.all(keys.map((key) => this.client.del(key)));
    console.log(`Cache INVALIDADO key=${normalized}`);
  }
}
