import type { Prompt } from './executor';

export type MessageType = 'text' | 'image';

export type UpdatableHTMLElement = HTMLElement & {
  update?: (msg: Message) => void;
};

export type Message = {
  content: Prompt;
  id: string;
  hidden: boolean;
  role: string;
  type: MessageType;
  el?: UpdatableHTMLElement;
  ctx: Record<string, unknown>;
};

type Namespace = {
  history: Message[];
  idRef: Record<string, Message>;
  onAddMessage: (msg: Message) => UpdatableHTMLElement | undefined;
};

const _namespace: Record<string, Namespace> = {};

const ROLES = {
  user: 'user',
  assistant: 'assistant',
};

const addMessage = (
  key: string,
  content: Prompt,
  role: string,
  id: string,
  hidden: boolean = false,
  type: MessageType = 'text',
) => {
  const namespace = _namespace[key];
  if (!namespace) {
    return;
  }

  const msgObject: Message = { content, role, id, hidden, type, ctx: {} };

  const index = namespace.history.push(msgObject) - 1;
  if (id) {
    namespace.idRef[id] = namespace.history[index];
  }

  msgObject.el = namespace.onAddMessage(msgObject);
};

const updateMessage = (key: string, id: string, content: string, type: MessageType = 'text') => {
  const namespace = _namespace[key];
  if (!namespace) {
    return;
  }

  if (!namespace.idRef[id]) {
    addMessage(key, content, ROLES.assistant, id, false, type);
    return;
  }

  const msg = namespace.idRef[id];
  msg.content = content;

  if (msg.el && msg.el.update) {
    msg.el.update(msg);
  }
};

const getMessage = (key: string, id: string) => {
  const namespace = _namespace[key];
  if (!namespace) {
    return;
  }

  return namespace.idRef[id];
};

export type ChatHistory = {
  addUserMessage: (content: Prompt, id: string, hidden?: boolean, type?: MessageType) => void;
  addAssistantMessage: (content: string, id: string, type?: MessageType) => void;
  updateAssistantMessage: (id: string, content: string, type?: MessageType) => void;
  getAssistantMessage: (id: string) => Message | undefined;
  getMessages: () => Message[];
  getMessagesHistory: () => Pick<Message, 'role' | 'content'>[];
  clearHistory: () => void;
};

export const chatHistory = {
  init: (key: string, onAddMessage: Namespace['onAddMessage']): ChatHistory => {
    if (!_namespace[key]) {
      _namespace[key] = {
        history: [],
        idRef: {},
        onAddMessage,
      };
    }

    _namespace[key].onAddMessage = onAddMessage;

    return {
      addUserMessage: (
        content: Prompt,
        id: string,
        hidden?: boolean,
        type: MessageType = 'text',
      ) => {
        addMessage(key, content, ROLES.user, id, hidden, type);
      },
      addAssistantMessage: (content: string, id: string, type: MessageType = 'text') => {
        addMessage(key, content, ROLES.assistant, id, false, type);
      },
      updateAssistantMessage: (id: string, content: string, type: MessageType = 'text') => {
        updateMessage(key, id, content, type);
      },
      getAssistantMessage: (id: string) => {
        return getMessage(key, id);
      },
      getMessages: () => {
        return _namespace[key].history;
      },
      getMessagesHistory: () => {
        return _namespace[key].history.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      },
      clearHistory: () => {
        _namespace[key].history = [];
      },
    };
  },
};
