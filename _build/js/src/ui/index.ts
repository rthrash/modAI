import {createModal, type ModalConfig} from "./modal";
import { createLoadingOverlay } from './overlay'


export const ui = {
    createLoadingOverlay,
    localChat: (config: ModalConfig) => {
        return createModal(config);
    }
};
