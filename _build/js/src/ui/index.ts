import { createModal } from './localChat';
import { createLoadingOverlay } from './overlay';

import type { ModalConfig } from './localChat/types';

export const ui = {
  createLoadingOverlay,
  localChat: (config: ModalConfig) => {
    return createModal(config);
  },
};
