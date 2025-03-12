import { create, keyframes } from '@stylexjs/stylex';

import { createElement } from '../utils';
import { addErrorMessage } from './messageHandlers';
import { sendMessage } from './modalActions';
import { handleImageUpload } from './state';

import type { Modal, ModalConfig } from './types';

const loadingDotPulse = keyframes({
  '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.3 },
  '40%': { transform: 'scale(1)', opacity: 1 },
});

const styles = create({
  inputWrapper: {
    flex: '1',
    position: 'relative',
    minHeight: '48px',
    maxHeight: '150px',
    display: 'flex',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #e2e8f0',
    borderRadius: '5px',
    outline: 'none',
    fontSize: '14px',
    resize: 'none',
    minHeight: '48px',
    maxHeight: '150px',
    overflowY: 'auto',
    backgroundColor: '#fff',
    cursor: 'inherit',
    ':disabled': {
      backgroundColor: '#f3f4f6',
      cursor: 'not-allowed',
    },
  },
  loadingIndicator: {
    display: 'none',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(243, 244, 246, 0.9)',
    borderRadius: '5px',
    color: '#6B7280',
    fontSize: '14px',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    flexDirection: 'row',
    zIndex: 10,
    backdropFilter: 'blur(2px)',
    border: '1px solid #e2e8f0',
    pointerEvents: 'none',
  },
  loadingDots: {
    display: 'flex',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '16px',
  },
  loadingDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#6B7280',
    borderRadius: '50%',
    display: 'inline-block',
    animationName: loadingDotPulse,
    animationDuration: '1.4s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    animationFillMode: 'both',
    ':nth-child(1)': { animationDelay: '-0.32s' },
    ':nth-child(2)': { animationDelay: '-0.16s' },
    ':nth-child(3)': { animationDelay: '0s' },
  },
});

export const buildPromptInput = (modal: Modal, config: ModalConfig) => {
  const inputWrapper = createElement('div', styles.inputWrapper);

  const messageInput = createElement('textarea', styles.input);
  messageInput.placeholder = 'How can modAI help you today?';

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
      await handleImageUpload(modal, imageFile);
      return;
    }

    if (remoteImageUrl) {
      const url = new URL(window.location.href);
      const isRemote = !remoteImageUrl.startsWith(url.origin);

      if (isRemote) {
        await handleImageUpload(modal, remoteImageUrl, true);
        return;
      }

      try {
        const response = await fetch(remoteImageUrl);
        if (response.ok) {
          const blob = await response.blob();
          if (blob.type.startsWith('image/')) {
            const file = new File([blob], 'image.png', { type: blob.type });
            await handleImageUpload(modal, file);
          }
        }
      } catch {
        addErrorMessage(modal, 'Failed to fetch an image');
      }
      return;
    }

    addErrorMessage(modal, 'Only image files are allowed');
  });

  messageInput.addEventListener('paste', async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          await handleImageUpload(modal, file);
          break;
        }
      }
    }
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      }

      e.preventDefault();
      void sendMessage(modal, config);
    }
  });

  const loadingIndicator = createElement('div', styles.loadingIndicator, [
    createElement('div', styles.loadingDots, [
      createElement('div', styles.loadingDot),
      createElement('div', styles.loadingDot),
      createElement('div', styles.loadingDot),
    ]),
  ]);

  inputWrapper.append(messageInput);
  inputWrapper.append(loadingIndicator);

  modal.messageInput = messageInput;
  modal.loadingIndicator = loadingIndicator;

  return inputWrapper;
};
