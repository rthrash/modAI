import {applyStyles, createElement, nlToBr} from "./utils";
import {createContentIframe} from "./iframe";
import {executor} from "../executor";
import {chatHistory, Message, UpdatableHTMLElement} from "../chatHistory";
import {ActionButton, createActionButton} from "./actionButton";

const modalTypes = ['text', 'image'] as const;
type ModalType = (typeof modalTypes)[number];

export type ModalConfig = {
    key: string;
    namespace?: string;
    context?: string;
    field?: string;
    customCSS?: string[];
    type?: ModalType,
    availableTypes?: ModalType[],
    resource?: number;
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

const styles = {
    resetStyles: {
        margin: '0',
        padding: '0',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif'
    },
    modalOverlay: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'none',
        zIndex: '100'
    },
    chatModal: {
        position: 'fixed',
        width: '1000px',
        minHeight: '170px',
        maxHeight: '600px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        display: 'none',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: '101',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'height 0.3s ease-in-out'
    },
    chatHeader: {
        backgroundColor: '#00B6DE',
        color: 'white',
        padding: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'move'
    },
    chatTitle: {
        fontWeight: 'bold',
        fontSize: '16px'
    },
    chatControls: {
        display: 'flex',
        gap: '10px'
    },
    controlButton: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer'
    },
    chatMessages: {
        flex: '1',
        padding: '15px',
        overflowY: 'auto',
        backgroundColor: '#f9f9f9',
        width: '100%',
        boxSizing: 'border-box',
        display: 'none'
    },
    message: {
        marginBottom: '20px',
        borderRadius: '8px',
        position: 'relative',
        wordWrap: 'break-word',
        width: '100%',
        boxSizing: 'border-box'
    },
    aiMessage: {
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
    },
    userMessage: {
        width: 'fit-content',
        padding: '10px 15px',
        backgroundColor: '#4299e1',
        color: 'white',
        marginLeft: 'auto',
        borderBottomRightRadius: '5px'
    },
    messageContent: {
        padding: '12px',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box'
    },
    messageActions: {
        display: 'flex',
        padding: '8px 12px',
        gap: '8px',
        backgroundColor: '#f7fafc',
        borderTop: '1px solid #e2e8f0',
        borderRadius: '0 0 8px 8px'
    },
    actionButton: {
        backgroundColor: '#edf2f7',
        border: '1px solid #cbd5e0',
        borderRadius: '4px',
        padding: '3px 8px',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        color: '#4a5568'
    },
    chatInput: {
        display: 'flex',
        padding: '15px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: 'white',
        position: 'relative'
    },
    inputRow: {
        display: 'flex',
        width: '100%',
        gap: '10px'
    },
    inputWrapper: {
        flex: '1',
        position: 'relative',
        minHeight: '48px',
        maxHeight: '150px',
        display: 'flex'
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        outline: 'none',
        fontSize: '14px',
        resize: 'none',
        minHeight: '48px',
        maxHeight: '150px',
        overflowY: 'auto',
        backgroundColor: '#fff',
        cursor: 'inherit'
    },
    buttonsColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100px'
    },
    sendButton: {
        backgroundColor: '#6CB24A',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        height: '40px',
        minWidth: '100px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        opacity: '1',
    },
    actionButtonsRow: {
        display: 'flex',
        gap: '4px',
        justifyContent: 'space-between'
    },
    iconButton: {
        backgroundColor: 'transparent',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        width: '48px',
        height: '32px',
        padding: '0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
        opacity: '1',
    },
    sendIcon: {
        width: '16px',
        height: '16px',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'white\'%3E%3Cpath d=\'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z\'/%3E%3C/svg%3E")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    stopIcon: {
        width: '16px',
        height: '16px',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23DC2626\'%3E%3Cpath d=\'M0 0h24v24H0z\' fill=\'none\'/%3E%3Cpath d=\'M6 6h12v12H6z\'/%3E%3C/svg%3E")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    refreshIcon: {
        width: '16px',
        height: '16px',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%234B5563\'%3E%3Cpath d=\'M0 0h24v24H0z\' fill=\'none\'/%3E%3Cpath d=\'M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z\'/%3E%3C/svg%3E")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    icon: {
        display: 'inline-block',
        width: '14px',
        height: '14px',
        marginRight: '5px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    disabledButton: {
        opacity: '0.5',
        cursor: 'not-allowed'
    },
    loadingInput: {
        backgroundColor: '#f3f4f6',
        cursor: 'not-allowed'
    },
    loadingIndicator: {
        display: 'none',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(243, 244, 246, 0.9)',
        borderRadius: '10px',
        color: '#6B7280',
        fontSize: '14px',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        flexDirection: 'row',
        zIndex: '10',
        backdropFilter: 'blur(2px)',
        border: '1px solid #e2e8f0',
        pointerEvents: 'none'
    },
    loadingDot: {
        width: '6px',
        height: '6px',
        backgroundColor: '#9CA3AF',
        borderRadius: '50%',
        animation: 'loadingDotPulse 1.4s infinite',
        display: 'inline-block'
    },
    typeSelector: {
        padding: '5px 15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: 'white'
    },
    typeLabel: {
        fontSize: '14px',
        color: '#4B5563',
        fontWeight: '500'
    },
    typeToggleGroup: {
        display: 'flex',
        gap: '4px'
    },
    typeToggleButton: {
        padding: '6px 12px',
        fontSize: '13px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        backgroundColor: '#fff',
        color: '#4B5563',
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: '1',
    },
    typeToggleButtonActive: {
        backgroundColor: '#00B6DE',
        color: '#fff',
        borderColor: '#00B6DE'
    },
    errorMessage: {
        width: 'fit-content',
        padding: '10px 15px',
        backgroundColor: '#DC2626',
        color: 'white',
        marginLeft: 'auto',
        borderBottomRightRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    errorIcon: {
        width: '16px',
        height: '16px',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'white\'%3E%3Cpath d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z\'/%3E%3C/svg%3E")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
};

export const createModal = (config: ModalConfig) => {
    if (!config.key) {
        alert('key is required config property');
        return;
    }

    if (!config.type) {
        config.type = 'text';
    }

    if (!config.availableTypes) {
        config.availableTypes = [];
    }

    config.availableTypes = config.availableTypes.filter((type: ModalType) => modalTypes.includes(type));

    if (config.availableTypes.length > 0 && !config.availableTypes.includes(config.type)) {
        config.availableTypes.unshift(config.type);
    }

    const buildModal = () => {
        const modalOverlay = createElement('div', styles.modalOverlay);

        const chatModal = createElement('div', styles.chatModal) as Modal;

        const chatHeader = createElement('div', styles.chatHeader);
        const chatTitle = createElement('div', styles.chatTitle, 'modAI Assistant');
        const chatControls = createElement('div', styles.chatControls);

        const closeBtn = createElement('button', styles.controlButton, '✕');
        chatControls.append(closeBtn);
        chatHeader.append(chatTitle, chatControls);

        const chatMessages = createElement('div', styles.chatMessages);

        const chatInputArea = createElement('div', styles.chatInput);

        const inputRow = createElement('div', styles.inputRow);
        const inputWrapper = createElement('div', styles.inputWrapper);

        const messageInput = createElement('textarea', styles.input);
        messageInput.placeholder = 'Type your message...';

        const buttonsColumn = createElement('div', styles.buttonsColumn);

        const sendBtn = createElement('button', styles.sendButton);
        const sendIcon = createElement('span', styles.sendIcon);
        const sendText = document.createTextNode('Send');
        sendBtn.append(sendIcon, sendText);

        const actionButtonsRow = createElement('div', styles.actionButtonsRow);

        const stopBtn = createElement('button', {...styles.iconButton, ...styles.disabledButton});
        const stopIcon = createElement('span', styles.stopIcon);
        stopBtn.appendChild(stopIcon);
        stopBtn.title = 'Stop Generation';

        const tryAgainBtn = createElement('button', styles.iconButton);
        const refreshIcon = createElement('span', styles.refreshIcon);
        tryAgainBtn.appendChild(refreshIcon);
        tryAgainBtn.title = 'Try Again';

        if (history.getMessages().length === 0) {
            tryAgainBtn.disabled = true;
            applyStyles(tryAgainBtn, {...styles.iconButton, ...styles.disabledButton});
        }

        actionButtonsRow.append(stopBtn, tryAgainBtn);
        buttonsColumn.append(sendBtn, actionButtonsRow);
        inputWrapper.append(messageInput);
        inputRow.append(inputWrapper, buttonsColumn);

        const loadingIndicator = createElement('div', styles.loadingIndicator);
        loadingIndicator.innerHTML = `
        <style>
            @keyframes loadingDotPulse {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
                40% { transform: scale(1); opacity: 1; }
            }
            .loading-dots {
                display: flex;
                gap: 4px;
                padding: 8px 16px;
                background-color: rgba(255, 255, 255, 0.8);
                border-radius: 16px;
            }
            .loading-dot {
                width: 8px;
                height: 8px;
                background-color: #6B7280;
                border-radius: 50%;
                display: inline-block;
                animation: loadingDotPulse 1.4s infinite ease-in-out both;
            }
            .loading-dot:nth-child(1) { animation-delay: -0.32s; }
            .loading-dot:nth-child(2) { animation-delay: -0.16s; }
            .loading-dot:nth-child(3) { animation-delay: 0s; }
        </style>
        <div class="loading-dots">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
    `;

        inputWrapper.append(loadingIndicator);

        const typeSelector = createElement('div', styles.typeSelector);
        const typeLabel = createElement('div', styles.typeLabel, 'Generate:');
        const typeToggleGroup = createElement('div', styles.typeToggleGroup);

        const typeButtons: {[key: string]: HTMLButtonElement} = {};
        const availableTypes = config.availableTypes ?? [];

        availableTypes.forEach((type) => {
            const button = createElement('button', styles.typeToggleButton, type.charAt(0).toUpperCase() + type.slice(1)) as HTMLButtonElement;
            if (type === config.type) {
                applyStyles(button, {...styles.typeToggleButton, ...styles.typeToggleButtonActive});
            }
            button.addEventListener('click', () => {
                Object.values(typeButtons).forEach(btn => {
                    applyStyles(btn, styles.typeToggleButton);
                });
                applyStyles(button, {...styles.typeToggleButton, ...styles.typeToggleButtonActive});

                switchType(type);
            });
            typeButtons[type] = button;
            typeToggleGroup.appendChild(button);
        });


        typeSelector.append(typeLabel, typeToggleGroup);
        chatInputArea.append(inputRow);
        chatModal.append(chatHeader, chatMessages, chatInputArea);

        if (availableTypes.length > 0) {
            chatModal.append(typeSelector);
        }

        document.body.append(modalOverlay, chatModal);

        closeBtn.addEventListener('click', closeModal);
        sendBtn.addEventListener('click', () => sendMessage());
        stopBtn.addEventListener('click', stopGeneration);
        tryAgainBtn.addEventListener('click', tryAgain);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    return;
                }

                e.preventDefault();
                void sendMessage();
            }
        });

        chatHeader.addEventListener('mousedown', initDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);

        chatModal.modalOverlay = modalOverlay;
        chatModal.chatHeader = chatHeader;
        chatModal.closeBtn = closeBtn;
        chatModal.chatMessages = chatMessages;
        chatModal.messageInput = messageInput;
        chatModal.sendBtn = sendBtn;
        chatModal.tryAgainBtn = tryAgainBtn;
        chatModal.stopBtn = stopBtn;
        chatModal.loadingIndicator = loadingIndicator;
        chatModal.typeSelector = typeSelector;
        chatModal.typeButtons = typeButtons;

        chatModal.isDragging = false;
        chatModal.isLoading = false;
        chatModal.abortController = undefined;
        chatModal.offsetX = 0;
        chatModal.offsetY = 0;

        return chatModal;
    }

    const openModal = () => {
        modal.chatMessages.innerHTML = '';
        modal.chatMessages.style.display = 'none';

        modal.style.visibility = 'hidden';
        modal.style.display = 'flex';
        modal.modalOverlay.style.display = 'block';

        const messages = history.getMessages().filter((m) => !m.hidden);
        if (messages.length > 0) {
            modal.chatMessages.style.display = 'block';
            messages.forEach((msg) => {
                renderMessage(msg);
            });
        }

        setTimeout(() => {
            modal.chatMessages.scrollTop = modal.chatMessages.scrollHeight;
            modal.style.visibility = 'visible';
        }, 100);

        return modal;
    }

    const closeModal = () => {
        // Remove event listeners
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', endDrag);

        if (modal.modalOverlay) {
            modal.modalOverlay.remove();
        }

        if (modal) {
            modal.remove();
        }
    }

    const initDrag = (e: MouseEvent) => {
        modal.isDragging = true;

        const rect = modal.getBoundingClientRect();

        modal.offsetX = e.clientX - rect.left;
        modal.offsetY = e.clientY - rect.top;

        document.body.style.userSelect = 'none';
    }

    const drag = (e: MouseEvent) => {
        if (!modal.isDragging) return;

        const newX = e.clientX - modal.offsetX;
        const newY = e.clientY - modal.offsetY;

        modal.style.left = newX + 'px';
        modal.style.top = newY + 'px';

        modal.style.transform = 'none';
    }

    const endDrag = () => {
        modal.isDragging = false;
        document.body.style.userSelect = '';
    }

    const stopGeneration = () => {
        if (!modal.isLoading || !modal.abortController) {
            return;
        }

        modal.abortController.abort();
        modal.abortController = undefined;
        setLoadingState(false);
    }

    const tryAgain = () => {
        if (history.getMessages().length === 0) {
            return;
        }

        if (config.type === 'text') {
            void sendMessage('Try again');
            return;
        }

        if (config.type === 'image') {
            const latestUserMsg = history.getMessages().reverse().find((msg) => msg.role === 'user');
            if (latestUserMsg) {
                void sendMessage(latestUserMsg.content);
            }

            return;
        }
    }

    const addUserMessage = (content: string) => {
        if (modal.chatMessages.style.display === 'none') {
            modal.chatMessages.style.display = 'block';
        }

        const messageDiv: UpdatableHTMLElement = createElement('div', {
            ...styles.message,
            ...styles.userMessage
        });

        messageDiv.innerHTML = nlToBr(content);

        messageDiv.update = (msg) => {
            messageDiv.innerHTML = nlToBr(msg.content);
        }

        modal.chatMessages.appendChild(messageDiv);
        modal.chatMessages.scrollTop = modal.chatMessages.scrollHeight;

        return messageDiv;
    }

    const addErrorMessage = (content: string) => {
        if (modal.chatMessages.style.display === 'none') {
            modal.chatMessages.style.display = 'block';
        }

        const messageDiv = createElement('div', {
            ...styles.message,
            ...styles.errorMessage
        });

        const errorIcon = createElement('span', styles.errorIcon);
        messageDiv.appendChild(errorIcon);

        const textSpan = createElement('span');
        textSpan.textContent = content;
        messageDiv.appendChild(textSpan);

        modal.chatMessages.appendChild(messageDiv);
        modal.chatMessages.scrollTop = modal.chatMessages.scrollHeight;

        return messageDiv;
    }

    const addAssistantMessage = (content: string, providedId?: string) => {
        if (modal.chatMessages.style.display === 'none') {
            modal.chatMessages.style.display = 'block';
        }

        const messageDiv: UpdatableHTMLElement = createElement('div', {
            ...styles.message,
            ...styles.aiMessage
        });

        const messageId = providedId || 'msg-' + Date.now();

        const contentDiv = createElement('div', styles.messageContent);

        const iframe = createContentIframe(content, modal, config.customCSS ?? []);

        contentDiv.appendChild(iframe);

        const actionsDiv = createElement('div', styles.messageActions);

        const message = history.getAssistantMessage(messageId);
        if (message) {
            if (config.type === 'text') {
                if (config.textActions?.copy !== false) {
                    actionsDiv.append(createActionButton({
                        message: message,
                        modal,
                        disabled: modal.isLoading,
                        icon: 'copy',
                        label: 'Copy',
                        completedText: 'Copied!',
                        onClick: typeof config.textActions?.copy === 'function' ? config.textActions.copy : copyToClipboard
                    }));
                }

                if (typeof config.textActions?.insert === 'function') {
                    actionsDiv.append(createActionButton({
                        message: message,
                        modal,
                        disabled: modal.isLoading,
                        icon: 'insert',
                        label: 'Insert',
                        completedText: 'Inserted!',
                        onClick: config.textActions.insert
                    }));
                }
            }

            if (config.type === 'image') {
                if (config.imageActions?.copy !== false) {
                    actionsDiv.append(createActionButton({
                        message: message,
                        modal,
                        disabled: modal.isLoading,
                        icon: 'copy',
                        label: 'Copy',
                        loadingText: 'Downloading...',
                        completedText: 'Copied!',
                        onClick: async (msg, modal) => {
                            const handler = typeof config.textActions?.copy === 'function' ? config.textActions.copy : copyToClipboard;

                            if (msg.ctx.downloaded === true) {
                                handler(msg, modal);
                                return;
                            }
                            const data = await executor.mgr.download.image({
                                url: msg.content,
                                field: config.field,
                                namespace: config.namespace,
                                resource: config.resource,
                                mediaSource: config.image?.mediaSource,
                            });

                            msg.content = data.fullUrl;
                            msg.ctx.downloaded = true;
                            msg.ctx.url = data.url;
                            msg.ctx.fullUrl = data.fullUrl;

                            handler(msg, modal);
                        }
                    }));
                }

                const insertCb = config.imageActions?.insert;
                if (typeof insertCb === 'function') {
                    actionsDiv.append(createActionButton({
                        message: message,
                        modal,
                        disabled: modal.isLoading,
                        icon: 'insert',
                        label: 'Insert',
                        completedText: 'Inserted!',
                        loadingText: 'Downloading...',
                        onClick: async (msg, modal) => {

                            if (msg.ctx.downloaded === true) {
                                insertCb(msg, modal);
                                return;
                            }
                            const data = await executor.mgr.download.image({
                                url: msg.content,
                                field: config.field,
                                namespace: config.namespace,
                                resource: config.resource,
                                mediaSource: config.image?.mediaSource,
                            });

                            msg.content = data.fullUrl;
                            msg.ctx.downloaded = true;
                            msg.ctx.url = data.url;
                            msg.ctx.fullUrl = data.fullUrl;

                            insertCb(msg, modal);
                        }
                    }));
                }
            }
        }

        messageDiv.append(contentDiv, actionsDiv);

        modal.chatMessages.appendChild(messageDiv);
        modal.chatMessages.scrollTop = modal.chatMessages.scrollHeight;

        messageDiv.update = (msg) => {
            const iframeDocument = iframe.contentDocument;
            if (!iframeDocument) {
                return;
            }
            if (msg.type === 'image') {
                iframeDocument.body.innerHTML = `<img src="${msg.content}" />`;
            } else {
                iframeDocument.body.innerHTML = nlToBr(msg.content);
            }

            iframe.syncHeight();
        }

        return messageDiv;
    }

    const renderMessage = (msg: Message) => {
        if (msg.hidden) {
            return;
        }

        if (msg.role === 'user') {
            return addUserMessage(msg.content);
        }

        if (msg.type === 'image') {
            return addAssistantMessage(`<img src="${msg.content}" />`, msg.id);
        }

        return addAssistantMessage(msg.content, msg.id);
    }

    const copyToClipboard = async (message: Message) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(message.content);
            } catch {
                addErrorMessage(_('modai.cmp.failed_copy'));
            }
        } else {
            try {
                const textarea = createElement('textarea');
                textarea.value = message.content;
                document.body.appendChild(textarea);
                textarea.select();

                document.execCommand("copy");
                document.body.removeChild(textarea);
            } catch (err) {
                addErrorMessage(_('modai.cmp.failed_copy'));
            }
        }
    }

    const setLoadingState = (loading: boolean) => {
        modal.isLoading = loading;

        if (loading) {
            modal.loadingIndicator.style.display = 'flex';
        } else {
            modal.loadingIndicator.style.display = 'none';
        }

        modal.messageInput.disabled = loading;
        if (loading) {
            applyStyles(modal.messageInput, {...styles.input, ...styles.loadingInput});
        } else {
            applyStyles(modal.messageInput, styles.input);
        }

        modal.sendBtn.disabled = loading;
        if (loading) {
            applyStyles(modal.sendBtn, {...styles.sendButton, ...styles.disabledButton});
        } else {
            applyStyles(modal.sendBtn, styles.sendButton);
        }

        modal.stopBtn.disabled = !loading;
        if (loading) {
            applyStyles(modal.stopBtn, styles.iconButton);
        } else {
            applyStyles(modal.stopBtn, {...styles.iconButton, ...styles.disabledButton});
        }

        const hasMessages = history.getMessages().length > 0;
        modal.tryAgainBtn.disabled = loading || !hasMessages;
        if (loading || !hasMessages) {
            applyStyles(modal.tryAgainBtn, {...styles.iconButton, ...styles.disabledButton});
        } else {
            applyStyles(modal.tryAgainBtn, styles.iconButton);
        }

        Object.values(modal.typeButtons).forEach(button => {
            button.disabled = loading;
            const isActive = button.textContent?.toLowerCase() === config.type;

            if (loading) {
                applyStyles(button, {
                    ...styles.typeToggleButton,
                    ...(isActive ? styles.typeToggleButtonActive : {}),
                    ...styles.disabledButton
                });
            } else {
                applyStyles(button, {
                    ...styles.typeToggleButton,
                    ...(isActive ? styles.typeToggleButtonActive : {})
                });
            }
        });

        const actionButtons = modal.chatMessages.querySelectorAll('.action-button') as NodeListOf<ActionButton>;
        actionButtons.forEach(button => {
            if (loading) {
                button.disable?.();
            } else {
                button?.enable?.();
            }
        });
    }

    const sendMessage = async (providedMessage?: string, hidePrompt?: boolean) => {
        const message = providedMessage ? providedMessage.trim() : modal.messageInput.value.trim();
        if (!message || modal.isLoading) {
            return;
        }

        setLoadingState(true);

        modal.messageInput.value = '';
        modal.abortController = new AbortController();

        const messages = history.getMessagesHistory();
        const messageId = 'user-msg-' + Date.now() + (Math.round(Math.random() * 1000));
        history.addUserMessage(message, messageId, hidePrompt);

        try {
            if (config.type === 'text') {
                const data = await executor.mgr.prompt.freeText(
                    {
                        namespace: config.namespace,
                        context: config.context,
                        prompt: message,
                        field: config.field || '',
                        messages,
                    },
                    (data) => {
                        history.updateAssistantMessage(data.id, data.content);
                    },
                    modal.abortController
                );

                history.updateAssistantMessage(data.id, data.content);
            }

            if (config.type === 'image') {
                const data = await executor.mgr.prompt.image({
                    prompt: message
                }, modal.abortController);

                history.addAssistantMessage(data.url, data.id, 'image');
            }

            modal.abortController = undefined;
        } catch (err) {
            if (err instanceof Error) {
                if (err.name === "AbortError") {
                    return;
                }

                addErrorMessage(err.message);
                return;
            }

            addErrorMessage('Unknown error');
        }

        setLoadingState(false);
    }

    const switchType = (type: ModalType) => {
        config.type = type;

        history = chatHistory.init(
            `${config.key}/${config.type}`,
            (msg) => {
                return renderMessage(msg);
            }
        );

        while (modal.chatMessages.firstChild) {
            modal.chatMessages.removeChild(modal.chatMessages.firstChild);
        }

        modal.chatMessages.style.display = 'none';
        const messages = history.getMessages().filter((m) => !m.hidden);
        if (messages.length > 0) {
            modal.chatMessages.style.display = 'block';
            messages.forEach((msg) => {
                renderMessage(msg);
            });
        }
    }

    let history = chatHistory.init(
        `${config.key}/${config.type}`,
        (msg) => {
            return renderMessage(msg);
        }
    );

    const modal = buildModal();

    modal.api = {
        sendMessage,
        closeModal,
    }

    openModal();

    return modal;
}
