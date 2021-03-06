import { createAction } from 'typesafe-actions';

type MessageText = string | { __html: string };

export type MessageColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export interface Message {
  id?: string;
  text: MessageText;
  color: MessageColor;
}

export const showMessage = createAction('SHOW_MESSAGE', (message: Message) => ({
  type: 'SHOW_MESSAGE',
  payload: message,
}));

/**
 * Hides a message with the given ID.
 *
 * Message IDs are simply sequential index numbers; they change as messages
 * are shown and hidden.
 */
export const hideMessage = createAction('HIDE_MESSAGE', (messageIdOrIndex: number | string) => ({
  type: 'HIDE_MESSAGE',
  payload: messageIdOrIndex,
}));

export const showDanger = (text: MessageText) => showMessage({ text, color: 'danger' });

export type MessagesAction = ReturnType<typeof showMessage | typeof hideMessage>;
