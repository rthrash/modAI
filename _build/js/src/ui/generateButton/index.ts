import { Message } from '../../chatHistory';
import { executor, TextData, TextParams } from '../../executor';
import { DataOutput, history } from '../../history';
import { confirmDialog } from '../cofirmDialog';
import { button } from '../dom/button';
import { ui } from '../index';
import { LocalChatConfig, Modal } from '../localChat/types';
import { createLoadingOverlay } from '../overlay';
import { createElement } from '../utils';

type HistoryButton = HTMLButtonElement & {
  enable: () => void;
  disable: () => void;
};
type HistoryInfo = HTMLElement & {
  update: (showing: number, total: number) => void;
};
type HistoryNav = HTMLElement & {
  show: () => void;
  hide: () => void;
  prevButton: HistoryButton;
  nextButton: HistoryButton;
  info: HistoryInfo;
};
type HistoryElement = HTMLElement & { historyNav: HistoryNav };
type DataContext = {
  els: {
    onFieldChange: (data: DataOutput<DataContext>, noStore?: boolean) => void;
    wrapper: HistoryElement;
  }[];
};

const createWandEl = (onClick: () => void | Promise<void>) => {
  return createElement(
    'span',
    'modai--root generate',
    button('✦', onClick, 'generate', {
      type: 'button',
      title: 'Generate using AI',
    }),
  );
};

const createHistoryNav = (cache: ReturnType<typeof history.init<DataContext>>) => {
  const prevButton = button(
    'prev',
    () => {
      cache.prev();
    },
    'history_prev',
    {
      type: 'button',
      title: 'Previous Version',
    },
  );

  const nextButton = button(
    'next',
    () => {
      cache.next();
    },
    'history_next',
    {
      type: 'button',
      title: 'Next Version',
    },
  );

  const info = createElement('span') as HistoryInfo;
  info.update = (showing, total) => {
    info.innerText = `${showing}/${total}`;
  };

  const wrapper = createElement('span') as HistoryNav;
  wrapper.show = () => {
    wrapper.style.display = 'initial';
  };

  wrapper.hide = () => {
    wrapper.style.display = 'none';
  };

  wrapper.prevButton = prevButton;
  wrapper.nextButton = nextButton;
  wrapper.info = info;

  wrapper.appendChild(prevButton);
  wrapper.appendChild(nextButton);
  wrapper.appendChild(info);

  wrapper.hide();
  prevButton.disable();
  nextButton.disable();

  return wrapper;
};

const createLocalChat = (config: LocalChatConfig) => {
  return createWandEl(() => {
    ui.localChat(config);
  });
};

type ForcedTextConfig = {
  field: string;
  input: HTMLElement;
  onChange: (data: DataOutput<DataContext>, noStore?: boolean) => void;
  initialValue?: string;
} & TextParams;
const createForcedTextPrompt = ({
  input,
  onChange,
  initialValue,
  field,
  ...rest
}: ForcedTextConfig) => {
  const wrapper = createWandEl(async () => {
    const done = createLoadingOverlay(input);

    try {
      const result = await executor.mgr.prompt.text(
        {
          field,
          ...rest,
        },
        (data) => {
          cache.insert(data.content, true);
        },
      );
      cache.insert(result.content);
      done();
    } catch (err) {
      done();
      confirmDialog({
        title: 'Failed',
        content: _('modai.cmp.failed_try_again', { msg: err instanceof Error ? err.message : '' }),
        confirmText: 'Close',
        showCancel: false,
        onConfirm: () => {},
      });
    }
  }) as HistoryElement;

  const cache = history.init<DataContext>(
    field,
    (data, noStore) => {
      data.context.els.forEach(({ wrapper, onFieldChange }) => {
        onFieldChange(data, noStore);

        if (data.total > 0) {
          wrapper.historyNav.show();
        }

        wrapper.historyNav.info.update(data.current, data.total);

        if (data.prevStatus) {
          wrapper.historyNav.prevButton.enable();
        } else {
          wrapper.historyNav.prevButton.disable();
        }

        if (data.nextStatus) {
          wrapper.historyNav.nextButton.enable();
        } else {
          wrapper.historyNav.nextButton.disable();
        }
      });
    },
    initialValue,
    {} as DataContext,
  );

  if (!cache.cachedItem.context.els) {
    cache.cachedItem.context.els = [];
  }
  cache.cachedItem.context.els.push({ onFieldChange: onChange, wrapper });

  const historyNav = createHistoryNav(cache);

  wrapper.appendChild(historyNav);
  wrapper.historyNav = historyNav;

  return wrapper;
};

type VisionConfig = {
  image: HTMLImageElement;
  input: HTMLElement;
  field: string;
  onUpdate: (data: TextData) => void;
  namespace?: string;
};

const createVisionPrompt = (config: VisionConfig) => {
  return createWandEl(async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = config.image.width;
    canvas.height = config.image.height;

    ctx.drawImage(config.image, 0, 0);

    const base64Data = canvas.toDataURL('image/png');

    const done = createLoadingOverlay(config.input);

    try {
      const result = await executor.mgr.prompt.vision(
        {
          image: base64Data,
          field: config.field,
          namespace: config.namespace,
        },
        (data) => {
          config.onUpdate(data);
        },
      );

      config.onUpdate(result);
      done();
    } catch (err) {
      done();
      confirmDialog({
        title: 'Failed',
        content: _('modai.cmp.failed_try_again', { msg: err instanceof Error ? err.message : '' }),
        confirmText: 'Close',
        showCancel: false,
        onConfirm: () => {},
      });
    }
  });
};

export const createGenerateButton = {
  localChat: createLocalChat,
  forcedText: createForcedTextPrompt,
  vision: createVisionPrompt,
};
