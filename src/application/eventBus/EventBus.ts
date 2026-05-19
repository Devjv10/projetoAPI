import { PedidoCriadoEvent } from "../../domain/events/PedidoCriadoEvent";
import { PedidoStatusAlteradoEvent } from "../../domain/events/PedidoStatusAlteradoEvent";

export type PedidoCriadoHandler = (event: PedidoCriadoEvent) => Promise<void> | void;
export type PedidoStatusAlteradoHandler = (event: PedidoStatusAlteradoEvent) => Promise<void> | void;

export interface EventBus {
  publishPedidoCriado(event: PedidoCriadoEvent): Promise<void>;
  subscribePedidoCriado(handler: PedidoCriadoHandler): void;
  publishPedidoStatusAlterado(event: PedidoStatusAlteradoEvent): Promise<void>;
  subscribePedidoStatusAlterado(handler: PedidoStatusAlteradoHandler): void;
}
