import {applyStyles, createElement, nlToBr} from "../utils";
import {createContentIframe} from "./iframe";
import {executor, Prompt} from "../../executor";
import {chatHistory, Message, UpdatableHTMLElement} from "../../chatHistory";
import {ActionButton, createActionButton} from "./actionButton";
import {styles} from "./styles";
import {Modal, ModalConfig, ModalType} from "./types";

export const modalTypes = ['text', 'image'] as const;


let modalExists = false;

export const createModal = (config: ModalConfig) => {
    if (modalExists) {
        return;
    }

    if (!config.key) {
        alert('key is required config property');
        return;
    }

    if (config.overlay === undefined) {
        config.overlay = true;
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

        messageInput.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            messageInput.style.borderColor = '#00B6DE';
        });

        messageInput.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            messageInput.style.borderColor = '#e2e8f0';
        });

        messageInput.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            messageInput.style.borderColor = '#e2e8f0';

            let imageFile: File | null = null;
            let remoteImageUrl: string | null = null;

            const dataTransfer = e.dataTransfer;
            if (!dataTransfer) return;

            const files = dataTransfer.files;
            if (files?.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    imageFile = file;
                }
            }

            if (!imageFile) {
                const imgUrl = dataTransfer.getData('text/uri-list');
                if (imgUrl) {
                    remoteImageUrl = imgUrl;
                }
            }

            if (imageFile) {
                await handleImageUpload(imageFile);
                return;
            }

            if (remoteImageUrl) {
                const url = new URL(window.location.href);
                const isRemote = !remoteImageUrl.startsWith(url.origin);

                if (isRemote) {
                    await handleImageUpload(remoteImageUrl, true);
                    return;
                }

                try {
                    const response = await fetch(remoteImageUrl);
                    if (response.ok) {
                        const blob = await response.blob();
                        if (blob.type.startsWith('image/')) {
                            const file = new File([blob], 'image.png', {type: blob.type});
                            await handleImageUpload(file);
                        }
                    }
                } catch (err) {
                    addErrorMessage('Filed to fetch an image');
                }
                return;
            }

            addErrorMessage('Only image files are allowed');
        });

        messageInput.addEventListener('paste', async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        e.preventDefault();
                        await handleImageUpload(file);
                        break;
                    }
                }
            }
        });

        closeBtn.addEventListener('click', () => {
            closeModal();
        });

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

        if (config.overlay) {
            document.body.append(modalOverlay);
        }

        document.body.append(chatModal);

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
        chatModal.inputWrapper = inputWrapper;

        chatModal.isDragging = false;
        chatModal.isLoading = false;
        chatModal.abortController = undefined;
        chatModal.offsetX = 0;
        chatModal.offsetY = 0;

        return chatModal;
    }

    const handleImageUpload = async (fileOrUrl: File | string, isRemoteUrl: boolean = false) => {
        if (!isRemoteUrl && fileOrUrl instanceof File && !fileOrUrl.type.startsWith('image/')) {
            addErrorMessage('Only image files are allowed');
            return;
        }

        if (modal.uploadedImage) {
            removeUploadedImage();
        }

        const imagePreview = createElement('div', styles.imagePreview);
        const img = createElement('img', styles.imagePreviewImg) as HTMLImageElement;
        const removeBtn = createElement('div', styles.imagePreviewRemove, '×');

        if (isRemoteUrl) {
            img.src = fileOrUrl as string;
            modal.uploadedImage = img.src;
        } else {
            const dataURL = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = function(event) {
                    resolve(event.target?.result as string);
                };

                reader.onerror = function(error) {
                    reject(error);
                };

                reader.readAsDataURL(fileOrUrl as File);
            });

            img.src = dataURL;
            modal.uploadedImage = dataURL;
        }

        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeUploadedImage();
        });

        imagePreview.addEventListener('mouseenter', () => {
            imagePreview.style.transform = 'scale(1.05)';
            removeBtn.style.opacity = '1';
        });

        imagePreview.addEventListener('mouseleave', () => {
            imagePreview.style.transform = '';
            removeBtn.style.opacity = '0';
        });

        imagePreview.append(img, removeBtn);
        modal.imagePreview = imagePreview;
        modal.messageInput.style.paddingLeft = '85px';
        modal.inputWrapper.append(imagePreview);
    }

    const removeUploadedImage = () => {
        if (modal.imagePreview) {
            modal.imagePreview.remove();
            modal.imagePreview = undefined;
        }
        modal.uploadedImage = undefined;
        modal.messageInput.style.paddingLeft = '15px';
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
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', endDrag);

        if (modal.modalOverlay) {
            modal.modalOverlay.remove();
        }

        if (modal) {
            modal.remove();
        }

        modalExists = false;
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
                void sendMessage(latestUserMsg.content as string);
            }

            return;
        }
    }

    const addUserMessage = (content: Prompt) => {
        if (modal.chatMessages.style.display === 'none') {
            modal.chatMessages.style.display = 'block';
        }

        const messageDiv: UpdatableHTMLElement = createElement('div', {
            ...styles.message,
            ...styles.userMessage
        });

        let textContent;
        let imagesContent = null;

        if (Array.isArray(content)) {
            const [text, ...images] = content;
            textContent = text.value;
            imagesContent = images;
        } else {
            textContent = content;
        }

        const contentWrapper = createElement('div', {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        });

        const textDiv = createElement('div');
        textDiv.innerHTML = nlToBr(textContent);
        contentWrapper.appendChild(textDiv);

        if (imagesContent) {
            const imageRow = createElement('div', {
                display: 'flex',
                flexDirection: 'row',
                gap: '8px',
                flexWrap: 'wrap'
            });

            for (const imgContent of imagesContent) {
                const imageWrapper = createElement('div', {
                    width: '100px',
                    height: '100px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginTop: '4px'
                });

                const img = createElement('img', {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                });
                img.src = imgContent.value;

                imageWrapper.appendChild(img);
                imageRow.appendChild(imageWrapper);
            }
            contentWrapper.appendChild(imageRow);
        }

        messageDiv.appendChild(contentWrapper);

        messageDiv.update = (msg) => {
            const textContent = Array.isArray(msg.content) ? msg.content[0].value : msg.content;
            textDiv.innerHTML = nlToBr(textContent);
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

    const addAssistantMessage = (content: Prompt, providedId?: string) => {
        if (modal.chatMessages.style.display === 'none') {
            modal.chatMessages.style.display = 'block';
        }

        const messageDiv: UpdatableHTMLElement = createElement('div', {
            ...styles.message,
            ...styles.aiMessage
        });

        const messageId = providedId || 'msg-' + Date.now();

        const contentDiv = createElement('div', styles.messageContent);

        const textContent = Array.isArray(content) ? content[0].value : content;
        const iframe = createContentIframe(textContent, modal, config.customCSS ?? []);

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
                                url: msg.content as string,
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
                                url: msg.content as string,
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
            const textContent = Array.isArray(msg.content) ? msg.content[0].value : msg.content;
            const content = msg.type === 'image' ? `<img src="${textContent}" />` : nlToBr(textContent);
            iframe.syncContent(content);
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
        const textContent = Array.isArray(message.content) ? message.content[0].value : message.content;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(textContent);
            } catch {
                addErrorMessage(_('modai.cmp.failed_copy'));
            }
        } else {
            try {
                const textarea = createElement('textarea');
                textarea.value = textContent;
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
        let message: Prompt = providedMessage ? providedMessage.trim() : modal.messageInput.value.trim();
        if (!message || modal.isLoading) {
            return;
        }

        setLoadingState(true);

        modal.messageInput.value = '';
        modal.abortController = new AbortController();

        if (modal.uploadedImage && config.type === 'text') {
            message = [
                {
                    type: 'text',
                    value: message,
                },
                {
                    type: 'image',
                    value: modal.uploadedImage,
                }
            ];
        }

        removeUploadedImage();

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
                    prompt: message as string
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
    modalExists = true;

    return modal;
}
