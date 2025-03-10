import {createElement} from "./utils";
import {Message} from "../chatHistory";
import {Modal} from "./modal";

type ActionButtonConfig = {
    label: string;
    icon: keyof typeof icons;
    message: Message;
    loadingText?: string;
    completedText?: string;
    modal: Modal;
    completedTextDuration?: number;
    onClick: (msg: Message, modal: Modal) => void | Promise<void>;
}

const defaultConfig: Partial<ActionButtonConfig> = {
    loadingText: 'Loading...',
    completedText: 'Completed!',
    completedTextDuration: 2000,
};

const styles = {
    actionButton: {
        backgroundColor: '#edf2f7',
        border: '1px solid #cbd5e0',
        borderRadius: '4px',
        padding: '3px 8px',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        color: '#4a5568'
    },
    icon: {
        display: 'inline-block',
        width: '14px',
        height: '14px',
        marginRight: '5px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
};

const icons = {
    copy: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' fill=\'%234a5568\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z\'/%3E%3Cpath d=\'M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z\'/%3E%3C/svg%3E",
    insert: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' fill=\'%234a5568\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z\'/%3E%3Cpath d=\'M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z\'/%3E%3C/svg%3E",
}

export const createActionButton = (config: ActionButtonConfig) => {
    config = {
        ...defaultConfig,
        ...config,
    };

    const copyBtn = createElement('button', styles.actionButton);

    const copyIcon = createElement('span', {
        ...styles.icon,
        backgroundImage: `url("${icons[config.icon]}")`
    });
    copyBtn.append(copyIcon);

    copyBtn.append(document.createTextNode(config.label));
    copyBtn.addEventListener('click', async () => {
        const originalHTML = copyBtn.innerHTML;
        const result = config.onClick(config.message, config.modal);

        if (result instanceof Promise) {
            copyBtn.innerHTML = `
                <span style="
                    display: inline-block;
                    margin-right: 5px;
                    width: 12px;
                    height: 12px;
                    position: relative;
                    animation: spin 1s linear infinite;
                ">
                    <span style="
                        position: absolute;
                        width: 3px;
                        height: 3px;
                        background-color: currentColor;
                        border-radius: 50%;
                        top: 0;
                        left: 50%;
                        transform: translate(-50%, 0);
                    "></span>
                    <span style="
                        position: absolute;
                        width: 3px;
                        height: 3px;
                        background-color: currentColor;
                        border-radius: 50%;
                        top: 50%;
                        right: 0;
                        transform: translate(0, -50%);
                    "></span>
                    <span style="
                        position: absolute;
                        width: 3px;
                        height: 3px;
                        background-color: currentColor;
                        border-radius: 50%;
                        bottom: 0;
                        left: 50%;
                        transform: translate(-50%, 0);
                    "></span>
                    <span style="
                        position: absolute;
                        width: 3px;
                        height: 3px;
                        background-color: currentColor;
                        border-radius: 50%;
                        top: 50%;
                        left: 0;
                        transform: translate(0, -50%);
                    "></span>
                </span>
                ${config.loadingText}
            `;

            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);

            await result;

            document.head.removeChild(style);
        }

        copyBtn.innerHTML = `
                <span style="margin-right: 5px;">✓</span>
                ${config.completedText}
            `;
        await new Promise(resolve => setTimeout(resolve, 2000));
        copyBtn.innerHTML = originalHTML;
    });

    return copyBtn;
}
