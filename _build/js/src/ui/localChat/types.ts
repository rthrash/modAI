import { UserInput } from './modalInput';
import { AttachmentsWrapper } from './modalInputAttachments';
import { ChatHistory, Message } from '../../chatHistory';
import { Button } from '../dom/button';

export type ModalType = 'text' | 'image';

export interface Modal extends HTMLDivElement {
  modal: HTMLDivElement;
  welcomeMessage: HTMLDivElement;
  chatMessages: HTMLDivElement;
  chatContainer: HTMLDivElement;
  scrollWrapper: HTMLDivElement;
  loadingIndicator: HTMLDivElement;

  attachments: AttachmentsWrapper;
  messageInput: UserInput;

  modeButtons: Button[];
  actionButtons: Button[];
  stopBtn: Button;
  sendBtn: Button;

  isDragging: boolean;
  isLoading: boolean;
  offsetX: number;
  offsetY: number;

  abortController?: AbortController;
  history: ChatHistory;

  api: {
    sendMessage: (providedMessage?: string, hidePrompt?: boolean) => Promise<void>;
    closeModal: () => void;
  };
}

export interface ModalConfig {
  key: string;
  type?: ModalType;
  availableTypes?: ModalType[];
  namespace?: string;
  context?: string;
  field?: string;
  resource?: number | string;
  customCSS?: string[];
  textActions?: {
    copy?: boolean | ((message: Message, modal: Modal) => void);
    insert?: (message: Message, modal: Modal) => void;
  };
  imageActions?: {
    copy?: boolean | ((message: Message, modal: Modal) => void);
    insert?: (message: Message, modal: Modal) => void;
  };
  image?: {
    mediaSource?: number;
  };
}
