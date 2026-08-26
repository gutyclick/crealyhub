export type NotificationEvent =
  | "APPROVAL_NEEDED" | "PUBLISHING_FAILED" | "INSTAGRAM_RECONNECT"
  | "BUFFER_LOW" | "BUDGET_WARNING";

export interface NotificationProvider {
  send(event: NotificationEvent, payload: Record<string, unknown>): Promise<void>;
}

export class NoopNotificationProvider implements NotificationProvider {
  async send(): Promise<void> { return; }
}
