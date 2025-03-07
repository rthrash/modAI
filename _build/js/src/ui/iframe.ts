import {createElement, nlToBr} from "./utils";
import type { Modal } from "./modal";

export type Iframe = HTMLIFrameElement & {
    syncHeight: () => void;
}

export const createContentIframe = (providedContent: string, modal: Modal, customCSS: string[] = []) => {
    const content = nlToBr(providedContent);

    const iframe = createElement('iframe', {
        width: '100%',
        border: 'none',
        backgroundColor: 'white',
        pointerEvents: 'none',
        maxWidth: '100%',
        boxSizing: 'border-box'
    }) as Iframe;

    iframe.srcdoc = `
        <html>
        <head>
            <style>
                html {
                    width: 100%;
                    max-width: 100%;
                    padding: 0;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    overflow-x: hidden;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                }
                * {
                    box-sizing: border-box;
                    max-width: 100%;
                }
                pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    max-width: 100%;
                    padding: 12px;
                    margin: 0;
                    background-color: #f5f7fa;
                    border-radius: 5px;
                    font-size: 14px;
                }
                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                }
                code {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    max-width: 100%;
                    display: block;
                    overflow-x: hidden;
                    font-size: 14px;
                }
                table {
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                    display: block;
                    border-collapse: collapse;
                }
                div {
                    max-width: 100%;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    box-sizing: border-box;
                }
                p {
                    margin: 0 0 0.5em 0;
                    max-width: 100%;
                }
                h1, h2, h3, h4, h5, h6 {
                    margin: 0 0 0.1em 0;
                    max-width: 100%;
                }
            </style>
            ${customCSS.map((css) => {
        return `<link rel="stylesheet" type="text/css" href="${css}" />`;
    }).join('')}
        </head>
        <body style="padding: 0; max-width: 100%; width: 100%; box-sizing: border-box;">${content}</body>
        </html>
    `;

    iframe.syncHeight = () => {
        const body = iframe.contentWindow?.document.body;
        if (!body) {
            return;
        }

        const elements = body.getElementsByTagName('*');
        let maxHeight = body.offsetHeight;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLElement;
            const bottom = element.offsetTop + element.offsetHeight;
            maxHeight = Math.max(maxHeight, bottom);
        }

        iframe.style.height = (maxHeight + 5) + 'px';
        body.style.overflow = 'hidden';

        modal.chatMessages.scrollTop = modal.chatMessages.scrollHeight;
    }

    iframe.onload = iframe.syncHeight;

    return iframe;
}
