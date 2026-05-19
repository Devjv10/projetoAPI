export interface IPedidoCacheService {
  invalidateAsync(keyOrPattern: string): Promise<void>;
}
