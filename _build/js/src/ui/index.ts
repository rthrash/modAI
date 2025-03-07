import {createModal, type ModalConfig} from "./modal";
import { createLoadingOverlay } from './overlay'


export const ui = {
    createLoadingOverlay,
    freePrompt: (config: ModalConfig) => {
        return createModal(config);
    }
};
