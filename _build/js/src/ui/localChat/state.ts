import { create } from '@stylexjs/stylex';

import { createElement } from '../utils';
import { addErrorMessage } from './messageHandlers';
import { Button } from '../dom/button';

import type { Modal } from './types';

export const globalState = {
  modalOpen: false,
};

const styles = create({
  imagePreview: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    width: '65px',
    height: '65px',
    borderRadius: '5px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    ':hover': {
      transform: 'scale(1.05)',
    },
  },
  imagePreviewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePreviewRemove: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    cursor: 'pointer',
    opacity: '0',
    transition: 'opacity 0.2s ease',
    ':hover': {
      opacity: 1,
    },
  },
});

export const setLoadingState = (modal: Modal, loading: boolean) => {
  modal.isLoading = loading;

  if (loading) {
    modal.loadingIndicator.style.display = 'flex';
  } else {
    modal.loadingIndicator.style.display = 'none';
  }

  modal.messageInput.disabled = loading;

  if (loading) {
    modal.clearChatBtn.disable();
    modal.sendBtn.disable();

    modal.stopBtn.enable();
  } else {
    modal.clearChatBtn.enable();
    modal.sendBtn.enable();

    modal.stopBtn.disable();
  }

  const hasMessages = modal.history.getMessages().length > 0;
  if (loading || !hasMessages) {
    modal.tryAgainBtn.disable();
  } else {
    modal.tryAgainBtn.enable();
  }

  Object.values(modal.typeButtons).forEach((button) => {
    button.disabled = loading;
  });

  const actionButtons = modal.chatMessages.querySelectorAll('.action-button') as NodeListOf<Button>;
  actionButtons.forEach((button) => {
    if (loading) {
      button.disable?.();
    } else {
      button?.enable?.();
    }
  });
};

export const removeUploadedImage = (modal: Modal) => {
  if (modal.imagePreview) {
    modal.imagePreview.remove();
    modal.imagePreview = undefined;
  }
  modal.uploadedImage = undefined;
  modal.messageInput.style.paddingLeft = '15px';
};

export const handleImageUpload = async (
  modal: Modal,
  fileOrUrl: File | string,
  isRemoteUrl: boolean = false,
) => {
  if (!isRemoteUrl && fileOrUrl instanceof File && !fileOrUrl.type.startsWith('image/')) {
    addErrorMessage(modal, 'Only image files are allowed');
    return;
  }

  if (modal.uploadedImage) {
    removeUploadedImage(modal);
  }

  const imagePreview = createElement('div', styles.imagePreview);
  const img = createElement('img', styles.imagePreviewImg);
  const removeBtn = createElement('button', styles.imagePreviewRemove, '×');

  if (isRemoteUrl) {
    img.src = fileOrUrl as string;
    modal.uploadedImage = img.src;
  } else {
    const dataURL = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (event) {
        resolve(event.target?.result as string);
      };

      reader.onerror = function (error) {
        reject(error);
      };

      reader.readAsDataURL(fileOrUrl as File);
    });

    img.src = dataURL;
    modal.uploadedImage = dataURL;
  }

  removeBtn.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    removeUploadedImage(modal);
  });

  imagePreview.append(img, removeBtn);
  modal.imagePreview = imagePreview;
  modal.messageInput.style.paddingLeft = '85px';
  modal.inputWrapper.append(imagePreview);
};
