import { create } from '@stylexjs/stylex';

import { createElement, nlToBr } from '../utils';

import type { Modal } from './types';

export type Iframe = HTMLIFrameElement & {
  syncHeight: () => void;
  syncContent: (content: string) => void;
};

const styles = create({
  iframe: {
    width: '100%',
    border: 'none',
    backgroundColor: '#efefee',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
});

export const createContentIframe = (
  providedContent: string,
  modal: Modal,
  customCSS: string[] = [],
) => {
  const content = nlToBr(providedContent);
  let isLoaded = false;
  let pendingContent: string | null = null;

  const iframe = createElement('iframe', styles.iframe) as Iframe;

  const getIframeDocument = () => {
    return iframe.contentDocument || iframe.contentWindow?.document;
  };

  const createStyleSheet = () => {
    return `
            html {
                width: 100%;
                max-width: 100%;
                padding: 0;
                margin: 0;
            }
            body {
                background-color: #efefee;
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
        `;
  };

  const createIframeContent = (content: string) => {
    return `
        <html>
        <head>
            <style>${createStyleSheet()}</style>
            ${customCSS
              .map((css) => {
                return `<link rel="stylesheet" type="text/css" href="${css}" />`;
              })
              .join('')}
        </head>
        <body style="padding: 0; max-width: 100%; width: 100%; box-sizing: border-box;">${content}</body>
        </html>
    `;
  };

  const setupIframeContent = (doc: Document, content: string) => {
    const style = doc.createElement('style');
    style.textContent = createStyleSheet();
    doc.head.appendChild(style);

    customCSS.forEach((css) => {
      const link = doc.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = css;
      doc.head.appendChild(link);
    });

    doc.body.innerHTML = content;
    doc.body.style.padding = '0';
    doc.body.style.maxWidth = '100%';
    doc.body.style.width = '100%';
    doc.body.style.boxSizing = 'border-box';
  };

  const updateContent = (newContent: string) => {
    if (!isLoaded) {
      pendingContent = newContent;
      iframe.srcdoc = createIframeContent(newContent);
      return;
    }

    const doc = getIframeDocument();
    if (!doc) {
      pendingContent = newContent;
      iframe.srcdoc = createIframeContent(newContent);
      return;
    }

    if (doc.head.querySelector('style')) {
      doc.body.innerHTML = newContent;
    } else {
      setupIframeContent(doc, newContent);
    }

    iframe.syncHeight();
  };

  iframe.syncContent = (newContent: string) => {
    updateContent(newContent);
  };

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

    iframe.style.height = maxHeight + 5 + 'px';
    body.style.overflow = 'hidden';

    modal.chatMessages.scrollTop = modal.chatMessages.scrollHeight;
  };

  iframe.onload = () => {
    isLoaded = true;
    if (pendingContent !== null) {
      const content = pendingContent;
      pendingContent = null;
      const doc = getIframeDocument();
      if (doc) {
        setupIframeContent(doc, content);
        iframe.syncHeight();
      }
    }
    iframe.syncHeight();
  };

  iframe.srcdoc = createIframeContent(content);

  return iframe;
};
