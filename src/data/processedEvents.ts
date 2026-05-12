export interface ProcessedEvent {
  consumerName: string;
  messageId: string;
  processedAt: string;
}

export const processedEvents: ProcessedEvent[] = [];

export const wasProcessed = (consumerName: string, messageId: string): boolean => {
  return processedEvents.some(
    (item) => item.consumerName === consumerName && item.messageId === messageId
  );
};

export const markProcessed = (consumerName: string, messageId: string): void => {
  processedEvents.push({
    consumerName,
    messageId,
    processedAt: new Date().toISOString()
  });
};
