import { createClient, RedisClientType } from "redis";

type StoredValue = {
  value: string;
  expiresAt: number | null;
};

export interface CacheClient {
  get(key: string): Promise<string | null>;
  setEx(key: string, ttlSeconds: number, value: string): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}

class InMemoryCacheClient implements CacheClient {
  private readonly store = new Map<string, StoredValue>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);

    if (!item) {
      return null;
    }

    if (item.expiresAt && item.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);
    const keys: string[] = [];

    for (const key of this.store.keys()) {
      await this.get(key);
      if (regex.test(key)) {
        keys.push(key);
      }
    }

    return keys;
  }
}

class RedisCacheClient implements CacheClient {
  private client: RedisClientType | null = null;
  private readonly fallback = new InMemoryCacheClient();

  async get(key: string): Promise<string | null> {
    const client = await this.getClient();
    return client ? client.get(key) : this.fallback.get(key);
  }

  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    const client = await this.getClient();

    if (client) {
      await client.setEx(key, ttlSeconds, value);
      return;
    }

    await this.fallback.setEx(key, ttlSeconds, value);
  }

  async del(key: string): Promise<void> {
    const client = await this.getClient();

    if (client) {
      await client.del(key);
      return;
    }

    await this.fallback.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    const client = await this.getClient();
    return client ? client.keys(pattern) : this.fallback.keys(pattern);
  }

  private async getClient(): Promise<RedisClientType | null> {
    if (process.env.NODE_ENV === "test") {
      return null;
    }

    if (this.client?.isOpen) {
      return this.client;
    }

    const password = process.env.REDIS_PASSWORD;
    const url = process.env.REDIS_URL || (password ? `redis://:${password}@redis:6379` : "redis://redis:6379");

    try {
      this.client = createClient({ url });
      this.client.on("error", (error) => {
        if (process.env.NODE_ENV !== "test") {
          console.warn(`Redis indisponivel: ${error.message}`);
        }
      });
      await this.client.connect();
      return this.client;
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          error instanceof Error
            ? `Redis indisponivel, usando cache local: ${error.message}`
            : "Redis indisponivel, usando cache local."
        );
      }
      this.client = null;
      return null;
    }
  }
}

export const cacheClient: CacheClient = new RedisCacheClient();
