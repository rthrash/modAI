import { create } from '@stylexjs/stylex';

import { createActionButton } from './actionButton';
import { createContentIframe } from './iframe';
import { executor } from '../../executor';
import { createElement, nlToBr } from '../utils';

import type { Modal, ModalConfig } from './types';
import type { Message, UpdatableHTMLElement } from '../../chatHistory';
import type { Prompt } from '../../executor';

const styles = create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  imageRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    width: '100px',
    height: '100px',
    borderRadius: '5px',
    overflow: 'hidden',
    marginTop: '4px',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  message: {
    fontSize: '14px',
    marginBottom: '20px',
    borderRadius: '5px',
    position: 'relative',
    wordWrap: 'break-word',
    width: '100%',
    boxSizing: 'border-box',
  },
  aiMessage: {
    width: '100%',
    backgroundColor: '#efefee',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    borderTopLeftRadius: '3px',
  },
  userMessage: {
    width: 'fit-content',
    padding: '10px 15px',
    backgroundColor: '#4299e1',
    color: 'white',
    marginLeft: 'auto',
    borderTopRightRadius: '3px',
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
    gap: '8px',
  },
  errorIcon: {
    width: '16px',
    height: '16px',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E\")",
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  messageContent: {
    padding: '12px',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  messageActions: {
    display: 'flex',
    padding: '8px 12px',
    gap: '8px',
    backgroundColor: '#efefee',
    borderRadius: '0 0 5px 5px',
  },
});

export const addUserMessage = (modal: Modal, content: Prompt) => {
  if (modal.chatMessages.style.display === 'none') {
    modal.chatMessages.style.display = 'block';
  }

  const messageDiv: UpdatableHTMLElement = createElement('div', {
    ...styles.message,
    ...styles.userMessage,
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

  const contentWrapper = createElement('div', styles.wrapper);

  const textDiv = createElement('div');
  textDiv.innerHTML = nlToBr(textContent);
  contentWrapper.appendChild(textDiv);

  if (imagesContent) {
    const imageRow = createElement('div', styles.imageRow);

    for (const imgContent of imagesContent) {
      const imageWrapper = createElement('div', styles.imageWrapper);

      const img = createElement('img', styles.img);
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
  };

  modal.chatMessages.appendChild(messageDiv);
  modal.chatMessages.scrollTop = modal.chatMessages.scrollHeight;

  return messageDiv;
};

export const addErrorMessage = (modal: Modal, content: string) => {
  if (modal.chatMessages.style.display === 'none') {
    modal.chatMessages.style.display = 'block';
  }

  const messageDiv = createElement('div', {
    ...styles.message,
    ...styles.errorMessage,
  });

  const errorIcon = createElement('span', styles.errorIcon);
  messageDiv.appendChild(errorIcon);

  const textSpan = createElement('span');
  textSpan.textContent = content;
  messageDiv.appendChild(textSpan);

  modal.chatMessages.appendChild(messageDiv);
  modal.chatMessages.scrollTop = modal.chatMessages.scrollHeight;

  return messageDiv;
};

export const addAssistantMessage = (
  modal: Modal,
  content: Prompt,
  config: ModalConfig,
  providedId?: string,
) => {
  if (modal.chatMessages.style.display === 'none') {
    modal.chatMessages.style.display = 'block';
  }

  const messageDiv: UpdatableHTMLElement = createElement('div', {
    ...styles.message,
    ...styles.aiMessage,
  });

  const messageId = providedId || 'msg-' + Date.now();

  const contentDiv = createElement('div', styles.messageContent);

  const textContent = Array.isArray(content) ? content[0].value : content;
  const iframe = createContentIframe(textContent, modal, config.customCSS ?? []);

  contentDiv.appendChild(iframe);

  const actionsDiv = createElement('div', styles.messageActions);

  const message = modal.history
    .getMessages()
    .find((m) => m.id === messageId && m.role === 'assistant');

  if (message) {
    if (config.type === 'text') {
      if (config.textActions?.copy !== false) {
        actionsDiv.append(
          createActionButton({
            message: message,
            modal,
            disabled: modal.isLoading,
            icon: 'copy',
            label: 'Copy',
            completedText: 'Copied!',
            onClick:
              typeof config.textActions?.copy === 'function'
                ? config.textActions.copy
                : copyToClipboard,
          }),
        );
      }

      if (typeof config.textActions?.insert === 'function') {
        actionsDiv.append(
          createActionButton({
            message: message,
            modal,
            disabled: modal.isLoading,
            icon: 'insert',
            label: 'Insert',
            completedText: 'Inserted!',
            onClick: config.textActions.insert,
          }),
        );
      }
    }

    if (config.type === 'image') {
      if (config.imageActions?.copy !== false) {
        actionsDiv.append(
          createActionButton({
            message: message,
            modal,
            disabled: modal.isLoading,
            icon: 'copy',
            label: 'Copy',
            loadingText: 'Downloading...',
            completedText: 'Copied!',
            onClick: async (msg, modal) => {
              const handler =
                typeof config.textActions?.copy === 'function'
                  ? config.textActions.copy
                  : copyToClipboard;

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
            },
          }),
        );
      }

      const insertCb = config.imageActions?.insert;
      if (typeof insertCb === 'function') {
        actionsDiv.append(
          createActionButton({
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
            },
          }),
        );
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
  };

  return messageDiv;
};

export const renderMessage = (msg: Message, modal: Modal, config: ModalConfig) => {
  if (msg.hidden) {
    return;
  }

  if (msg.role === 'user') {
    return addUserMessage(modal, msg.content);
  }

  if (msg.type === 'image') {
    return addAssistantMessage(modal, `<img src="${msg.content}" />`, config, msg.id);
  }

  return addAssistantMessage(modal, msg.content, config, msg.id);
};

export const copyToClipboard = async (message: Message, modal: Modal) => {
  const textContent = Array.isArray(message.content) ? message.content[0].value : message.content;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(textContent);
    } catch {
      addErrorMessage(modal, _('modai.cmp.failed_copy'));
    }
  } else {
    try {
      const textarea = createElement('textarea');
      textarea.value = textContent;
      document.body.appendChild(textarea);
      textarea.select();

      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      addErrorMessage(modal, _('modai.cmp.failed_copy'));
    }
  }
};
