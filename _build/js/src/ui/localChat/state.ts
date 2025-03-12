import { applyStyles, createElement } from '../utils';
import { addErrorMessage } from './messageHandlers';
import { styles } from './styles';
import { Button } from '../dom/button';

import type { Modal, ModalConfig } from './types';

export const globalState = {
  modalOpen: false,
};

export const setLoadingState = (modal: Modal, loading: boolean, config: ModalConfig) => {
  modal.isLoading = loading;

  if (loading) {
    modal.loadingIndicator.style.display = 'flex';
  } else {
    modal.loadingIndicator.style.display = 'none';
  }

  modal.messageInput.disabled = loading;
  if (loading) {
    applyStyles(modal.messageInput, { ...styles.input, ...styles.loadingInput });
  } else {
    applyStyles(modal.messageInput, styles.input);
  }

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
    const isActive = button.textContent?.toLowerCase() === config.type;

    if (loading) {
      applyStyles(button, {
        ...styles.typeToggleButton,
        ...(isActive ? styles.typeToggleButtonActive : {}),
        ...styles.disabledButton,
      });
    } else {
      applyStyles(button, {
        ...styles.typeToggleButton,
        ...(isActive ? styles.typeToggleButtonActive : {}),
      });
    }
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
  const img = createElement('img', styles.imagePreviewImg) as HTMLImageElement;
  const removeBtn = createElement('div', styles.imagePreviewRemove, '×');

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
};
