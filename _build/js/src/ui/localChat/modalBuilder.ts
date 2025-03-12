import { applyStyles, createElement } from '../utils';
import { drag, endDrag, initDrag } from './dragHandlers';
import { addErrorMessage, renderMessage } from './messageHandlers';
import { closeModal, sendMessage, stopGeneration, switchType, tryAgain } from './modalActions';
import { handleImageUpload } from './state';
import { styles } from './styles';
import { chatHistory } from '../../chatHistory';

import type { Modal, ModalConfig } from './types';

export const buildModal = (config: ModalConfig) => {
  const modalOverlay = createElement('div', styles.modalOverlay);

  const chatModal = createElement('div', styles.chatModal) as Modal;
  chatModal.history = chatHistory.init(`${config.key}/${config.type}`, (msg) => {
    return renderMessage(msg, chatModal, config);
  });

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
      await handleImageUpload(chatModal, imageFile);
      return;
    }

    if (remoteImageUrl) {
      const url = new URL(window.location.href);
      const isRemote = !remoteImageUrl.startsWith(url.origin);

      if (isRemote) {
        await handleImageUpload(chatModal, remoteImageUrl, true);
        return;
      }

      try {
        const response = await fetch(remoteImageUrl);
        if (response.ok) {
          const blob = await response.blob();
          if (blob.type.startsWith('image/')) {
            const file = new File([blob], 'image.png', { type: blob.type });
            await handleImageUpload(chatModal, file);
          }
        }
      } catch {
        addErrorMessage(chatModal, 'Failed to fetch an image');
      }
      return;
    }

    addErrorMessage(chatModal, 'Only image files are allowed');
  });

  messageInput.addEventListener('paste', async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          await handleImageUpload(chatModal, file);
          break;
        }
      }
    }
  });

  closeBtn.addEventListener('click', () => {
    closeModal(chatModal);
  });

  const buttonsColumn = createElement('div', styles.buttonsColumn);

  const sendBtn = createElement('button', styles.sendButton);
  const sendIcon = createElement('span', styles.sendIcon);
  const sendText = document.createTextNode('Send');
  sendBtn.append(sendIcon, sendText);

  const actionButtonsRow = createElement('div', styles.actionButtonsRow);

  const stopBtn = createElement('button', { ...styles.iconButton, ...styles.disabledButton });
  const stopIcon = createElement('span', styles.stopIcon);
  stopBtn.appendChild(stopIcon);
  stopBtn.title = 'Stop Generation';

  const tryAgainBtn = createElement('button', styles.iconButton);
  const refreshIcon = createElement('span', styles.refreshIcon);
  tryAgainBtn.appendChild(refreshIcon);
  tryAgainBtn.title = 'Try Again';

  if (chatModal.history.getMessages().length === 0) {
    tryAgainBtn.disabled = true;
    applyStyles(tryAgainBtn, { ...styles.iconButton, ...styles.disabledButton });
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

  const typeButtons: { [key: string]: HTMLButtonElement } = {};
  const availableTypes = config.availableTypes ?? [];

  availableTypes.forEach((type) => {
    const button = createElement(
      'button',
      styles.typeToggleButton,
      type.charAt(0).toUpperCase() + type.slice(1),
    ) as HTMLButtonElement;
    if (type === config.type) {
      applyStyles(button, { ...styles.typeToggleButton, ...styles.typeToggleButtonActive });
    }

    button.addEventListener('click', () => {
      Object.values(typeButtons).forEach((btn) => {
        applyStyles(btn, styles.typeToggleButton);
      });
      applyStyles(button, { ...styles.typeToggleButton, ...styles.typeToggleButtonActive });

      switchType(type, chatModal, config);
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

  closeBtn.addEventListener('click', () => closeModal(chatModal));
  sendBtn.addEventListener('click', () => sendMessage(chatModal, config));
  stopBtn.addEventListener('click', () => stopGeneration(chatModal, config));
  tryAgainBtn.addEventListener('click', () => tryAgain(chatModal, config));
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      }

      e.preventDefault();
      void sendMessage(chatModal, config);
    }
  });

  chatHeader.addEventListener('mousedown', (e) => initDrag(e, chatModal));
  document.addEventListener('mousemove', (e) => drag(e, chatModal));
  document.addEventListener('mouseup', () => endDrag(chatModal));

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
};
