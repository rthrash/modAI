import { ChatHistory, Message } from '../../chatHistory';
import { Button } from '../dom/button';

export type ModalType = 'text' | 'image';

export interface Modal extends HTMLDivElement {
  modalOverlay: HTMLDivElement;
  chatHeader: HTMLDivElement;
  closeBtn: Button;
  chatMessages: HTMLDivElement;
  messageInput: HTMLTextAreaElement;
  sendBtn: Button;
  tryAgainBtn: Button;
  stopBtn: Button;
  clearChatBtn: Button;
  loadingIndicator: HTMLDivElement;
  typeSelector: HTMLDivElement;
  typeButtons: { [key: string]: HTMLButtonElement };
  inputWrapper: HTMLDivElement;
  isDragging: boolean;
  isLoading: boolean;
  abortController?: AbortController;
  offsetX: number;
  offsetY: number;
  uploadedImage?: string;
  imagePreview?: HTMLDivElement;

  history: ChatHistory;

  api: {
    sendMessage: (providedMessage?: string, hidePrompt?: boolean) => Promise<void>;
    closeModal: () => void;
  };
}

export interface ModalConfig {
  key: string;
  overlay?: boolean;
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
