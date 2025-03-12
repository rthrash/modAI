import { drag, endDrag } from './dragHandlers';
import { addErrorMessage, renderMessage } from './messageHandlers';
import { removeUploadedImage, setLoadingState, globalState } from './state';
import { chatHistory, Message } from '../../chatHistory';
import { executor } from '../../executor';

import type { Modal, ModalConfig, ModalType } from './types';
import type { Prompt } from '../../executor';

export const openModal = (modal: Modal, config: ModalConfig) => {
  modal.chatMessages.innerHTML = '';
  modal.chatMessages.style.display = 'none';

  modal.style.visibility = 'hidden';
  modal.style.display = 'flex';
  modal.modalOverlay.style.display = 'block';

  const messages = modal.history.getMessages().filter((m: Message) => !m.hidden);
  if (messages.length > 0) {
    modal.chatMessages.style.display = 'block';
    messages.forEach((msg: Message) => {
      renderMessage(msg, modal, config);
    });
  }

  setTimeout(() => {
    modal.chatMessages.scrollTop = modal.chatMessages.scrollHeight;
    modal.style.visibility = 'visible';
  }, 100);

  return modal;
};

export const closeModal = (modal: Modal) => {
  document.removeEventListener('mousemove', (e) => drag(e, modal));
  document.removeEventListener('mouseup', () => endDrag(modal));

  if (modal.modalOverlay) {
    modal.modalOverlay.remove();
  }

  if (modal) {
    modal.remove();
  }

  globalState.modalOpen = false;
};

export const sendMessage = async (
  modal: Modal,
  config: ModalConfig,
  providedMessage?: string,
  hidePrompt?: boolean,
) => {
  const message: Prompt = providedMessage
    ? providedMessage.trim()
    : modal.messageInput.value.trim();
  if (!message || modal.isLoading) {
    return;
  }

  setLoadingState(modal, true);

  modal.messageInput.value = '';
  modal.abortController = new AbortController();

  let messageToSend: Prompt = message;
  if (modal.uploadedImage && config.type === 'text') {
    messageToSend = [
      {
        type: 'text',
        value: message as string,
      },
      {
        type: 'image',
        value: modal.uploadedImage,
      },
    ];
  }

  removeUploadedImage(modal);

  const messages = modal.history.getMessagesHistory();
  const messageId = 'user-msg-' + Date.now() + Math.round(Math.random() * 1000);
  modal.history.addUserMessage(messageToSend, messageId, hidePrompt);

  try {
    if (config.type === 'text') {
      const data = await executor.mgr.prompt.freeText(
        {
          namespace: config.namespace,
          context: config.context,
          prompt: messageToSend,
          field: config.field || '',
          messages,
        },
        (data) => {
          modal.history.updateAssistantMessage(data.id, data.content);
        },
        modal.abortController,
      );

      modal.history.updateAssistantMessage(data.id, data.content);
    }

    if (config.type === 'image') {
      const data = await executor.mgr.prompt.image(
        {
          prompt: messageToSend as string,
        },
        modal.abortController,
      );

      modal.history.addAssistantMessage(data.url, data.id, 'image');
    }

    modal.abortController = undefined;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return;
      }

      addErrorMessage(modal, err.message);
      return;
    }

    addErrorMessage(modal, 'Unknown error');
  }

  setLoadingState(modal, false);
};

export const stopGeneration = (modal: Modal) => {
  if (!modal.isLoading || !modal.abortController) {
    return;
  }

  modal.abortController.abort();
  modal.abortController = undefined;
  setLoadingState(modal, false);
};

export const tryAgain = (modal: Modal, config: ModalConfig) => {
  if (modal.history.getMessages().length === 0) {
    return;
  }

  if (config.type === 'text') {
    void sendMessage(modal, config, 'Try again');
    return;
  }

  if (config.type === 'image') {
    const latestUserMsg = modal.history
      .getMessages()
      .reverse()
      .find((msg) => msg.role === 'user');
    if (latestUserMsg) {
      void sendMessage(modal, config, latestUserMsg.content as string);
    }
  }
};

export const switchType = (type: ModalType, modal: Modal, config: ModalConfig) => {
  config.type = type;

  modal.history = chatHistory.init(`${config.key}/${config.type}`, (msg) => {
    return renderMessage(msg, modal, config);
  });

  while (modal.chatMessages.firstChild) {
    modal.chatMessages.removeChild(modal.chatMessages.firstChild);
  }

  modal.chatMessages.style.display = 'none';
  const messages = modal.history.getMessages().filter((m) => !m.hidden);
  if (messages.length > 0) {
    modal.chatMessages.style.display = 'block';
    messages.forEach((msg) => {
      renderMessage(msg, modal, config);
    });
    modal.tryAgainBtn.enable();
    modal.clearChatBtn.enable();
  } else {
    modal.tryAgainBtn.disable();
    modal.clearChatBtn.disable();
  }
};

export const clearChat = (modal: Modal) => {
  while (modal.chatMessages.firstChild) {
    modal.chatMessages.removeChild(modal.chatMessages.firstChild);
  }
  modal.chatMessages.style.display = 'none';

  modal.history.clearHistory();
  modal.tryAgainBtn.disable();
  modal.clearChatBtn.disable();
};
