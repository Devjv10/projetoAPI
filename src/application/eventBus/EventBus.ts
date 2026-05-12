import { PedidoCriadoEvent } from "../../domain/events/PedidoCriadoEvent";

export type PedidoCriadoHandler = (event: PedidoCriadoEvent) => Promise<void> | void;

export interface EventBus {
  publishPedidoCriado(event: PedidoCriadoEvent): Promise<void>;
  subscribePedidoCriado(handler: PedidoCriadoHandler): void;
}
