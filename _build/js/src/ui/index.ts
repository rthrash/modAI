import { createGenerateButton } from './generateButton';
import { createModal } from './localChat';
import { createLoadingOverlay } from './overlay';

export const ui = {
  createLoadingOverlay,
  localChat: createModal,
  generateButton: createGenerateButton,
};
