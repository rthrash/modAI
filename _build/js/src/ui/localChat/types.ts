import {Message} from "../../chatHistory";
import {modalTypes} from "./index";

export type ModalType = (typeof modalTypes)[number];

export type ModalConfig = {
    key: string;
    namespace?: string;
    context?: string;
    field?: string;
    customCSS?: string[];
    type?: ModalType,
    availableTypes?: ModalType[],
    resource?: number;
    overlay?: boolean;
    image?: {
        mediaSource?: number;
    };
    textActions?: {
        copy?: boolean | ((msg: Message, modal: Modal) => void);
        insert?: (msg: Message, modal: Modal) => void;
    },
    imageActions?: {
        copy?: boolean | ((msg: Message, modal: Modal) => void);
        insert?: (msg: Message, modal: Modal) => void;
    }
};

export type Modal = HTMLDivElement & {
    modalOverlay: HTMLDivElement;
    chatHeader: HTMLDivElement;
    chatMessages: HTMLDivElement;
    loadingIndicator: HTMLDivElement;

    messageInput: HTMLTextAreaElement;
    typeSelector: HTMLDivElement;
    typeButtons: {[key: string]: HTMLButtonElement};
    uploadedImage?: string;
    imagePreview?: HTMLDivElement;
    inputWrapper: HTMLDivElement;

    closeBtn: HTMLButtonElement;
    sendBtn: HTMLButtonElement;
    tryAgainBtn: HTMLButtonElement;
    stopBtn: HTMLButtonElement;

    isDragging: boolean;
    isLoading: boolean;
    abortController?: AbortController;
    offsetX: number;
    offsetY: number;

    api: {
        sendMessage: (providedMessage?: string, hidePrompt?: boolean) => Promise<void>;
        closeModal: () => void;
    }
};
