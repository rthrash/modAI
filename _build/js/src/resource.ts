import {executor, ImageData} from "./executor";
import {DataOutput, history} from './history';
import {ui} from "./ui";
import {createLoadingOverlay} from "./ui/overlay";

type DataContext = {els: { field: any, wrapper: HistoryElement }[]};
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
type HistoryElement = HTMLElement & { historyNav: HistoryNav }

const historyNavSync = (data: DataOutput<DataContext>, noStore?: boolean) => {
    data.context.els.forEach(({wrapper, field}) => {
        const prevValue = field.getValue();
        field.setValue(data.value);
        field.fireEvent('change', field, data.value, prevValue);

        if (noStore) {
            field.el.dom.scrollTop = field.el.dom.scrollHeight;
        }

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
};

const createWandEl = () => {
    const wandEl = document.createElement('button');
    wandEl.className = 'modai-generate';
    wandEl.innerText = '✦'
    wandEl.type = 'button'
    wandEl.title = 'Generate using AI'

    return wandEl;
}

const createHistoryNav = (cache: ReturnType<typeof history.init<DataContext>>) => {
    const prevButton = document.createElement('button') as HistoryButton;
    prevButton.type = 'button';
    prevButton.title = 'Previous Version';
    prevButton.className = 'modai-history_prev';
    prevButton.disable = () => {
        prevButton.disabled = true;
    }
    prevButton.enable = () => {
        prevButton.disabled = false;
    }
    prevButton.innerHTML = 'prev';
    prevButton.addEventListener('click', () => {
        cache.prev();
    });

    const nextButton = document.createElement('button') as HistoryButton;
    nextButton.type = 'button';
    nextButton.title = 'Next Version';
    nextButton.className = 'modai-history_next';
    nextButton.disable = () => {
        nextButton.disabled = true;
    }
    nextButton.enable = () => {
        nextButton.disabled = false;
    }
    nextButton.innerHTML = 'next';
    nextButton.addEventListener('click', () => {
        cache.next();
    });

    const info = document.createElement('span') as HistoryInfo;
    info.update = (showing, total) => {
        info.innerText = `${showing}/${total}`;
    }
    info.innerText = '';

    const wrapper = document.createElement('span') as HistoryNav;
    wrapper.show = () => {
        wrapper.style.display = 'initial';
    }

    wrapper.hide = () => {
        wrapper.style.display = 'none';
    }

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
}

const createFreeTextPrompt = (fieldName: string) => {
    const wandEl = createWandEl();
    wandEl.addEventListener('click', () => {
        ui.freePrompt({
            key: fieldName,
            field: fieldName,
        });
    });

    return wandEl;
}

const createForcedTextPrompt = (field: any, fieldName: string) => {
    const aiWrapper = document.createElement('span') as HistoryElement;

    const wandEl = createWandEl();
    wandEl.addEventListener('click', async () => {
        const done = createLoadingOverlay(field.el.dom);

        try {
            const result = await executor.mgr.prompt.text({
                //@ts-expect-error Ext
                id: MODx.request.id,
                field: fieldName
            });
            cache.insert(result.content);
            done();
        } catch (err) {
            done();
            //@ts-expect-error Ext
            Ext.Msg.alert("Failed", _('modai.cmp.failed_try_again', {"msg": err.message}));
        }
    });

    aiWrapper.appendChild(wandEl);

    const cache = history.init(
        fieldName,
        historyNavSync,
        field.getValue(),
        {} as DataContext
    );

    if (!cache.cachedItem.context.els) {
        cache.cachedItem.context.els = [];
    }
    cache.cachedItem.context.els.push({field, wrapper: aiWrapper});

    const historyNav = createHistoryNav(cache);

    aiWrapper.appendChild(historyNav);
    aiWrapper.historyNav = historyNav;

    return aiWrapper;
}

const createImagePrompt = (defaultPrompt: string, mediaSource: string, fieldName: string, onSuccess: (res: ImageData) => void) => {
    const imageWand = createWandEl();
    imageWand.addEventListener('click', () => {
        //@ts-expect-error Ext
        const createColumn = MODx.load({
            xtype: 'modai-window-image_prompt',
            title: 'Image',
            cacheKey: fieldName,
            record: {
                //@ts-expect-error Ext
                resource: MODx.request.id,
                prompt: defaultPrompt,
                mediaSource,
                field: fieldName,
            },
            listeners: {
                success: {
                    fn: onSuccess,
                    scope:this
                }
            }
        });

        createColumn.show();
    });

    return imageWand;
}

const attachField = (cmp: string, fieldName: string) => {
    // @ts-expect-error Ext
    const field = Ext.getCmp(cmp);
    if (!field) return;

    const wrapper = document.createElement('span') as HistoryElement;

    const wandEl = createWandEl();
    wandEl.addEventListener('click', async () => {
        const done = createLoadingOverlay(field.el.dom);

        try {
            const result = await executor.mgr.prompt.text({
                // @ts-expect-error MODx
                id: MODx.request.id,
                field: fieldName
            }, (data) => {
                cache.insert(data.content, true);
            });
            cache.insert(result.content);
            done();
        } catch (err) {
            done();
            // @ts-expect-error Ext
            Ext.Msg.alert("Failed", _('modai.cmp.failed_try_again', {"msg": err.message}));
        }
    });

    wrapper.appendChild(wandEl);

    const cache = history.init<DataContext>(
        fieldName,
        historyNavSync,
        field.getValue(),
        {} as DataContext,
    );

    if (!cache.cachedItem.context.els) {
        cache.cachedItem.context.els = [];
    }
    cache.cachedItem.context.els.push({field, wrapper});

    const historyNav = createHistoryNav(cache);

    wrapper.appendChild(historyNav);
    wrapper.historyNav = historyNav;

    field.label.appendChild(wrapper);
}

const attachImagePlus = (imgPlusPanel: Element, fieldName: string) => {
    // @ts-expect-error Ext
    const imagePlus = Ext.getCmp(imgPlusPanel.firstElementChild?.id);

    const imageWand = createImagePrompt(
        '',
        imagePlus.imageBrowser.source,
        fieldName,
        function(res) {
            if ('url' in res) {
                imagePlus.imageBrowser.setValue(res.url);
                imagePlus.onImageChange(res.url)
            }
        }
    );

    const altTextWand = createWandEl();
    altTextWand.style.marginTop = '6px';
    altTextWand.addEventListener('click', async () => {
        const imgElement = imagePlus.imagePreview.el.dom;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = imgElement.width;
        canvas.height = imgElement.height;

        ctx.drawImage(imgElement, 0, 0);

        const base64Data = canvas.toDataURL('image/png');

        const done = createLoadingOverlay(imagePlus.altTextField.items.items[0].el.dom);

        try {
            const result = await executor.mgr.prompt.vision({
                image: base64Data,
                field: fieldName
            }, (data) => {
                imagePlus.altTextField.items.items[0].setValue(data.content);
                imagePlus.altTextField.items.items[0].el.dom.scrollTop = imagePlus.altTextField.items.items[0].el.dom.scrollHeight;
                imagePlus.image.altTag = data.content;
                imagePlus.updateValue();
            });
            imagePlus.altTextField.items.items[0].setValue(result.content);
            imagePlus.image.altTag = result.content;
            imagePlus.updateValue();
            done();
        } catch (err) {
            done();
            // @ts-expect-error Ext
            Ext.Msg.alert("Failed", _('modai.cmp.failed_try_again', {"msg": err.message}));
        }

    });

    imagePlus.altTextField.el.dom.style.display = 'flex';
    imagePlus.altTextField.el.dom.style.justifyItems = 'center';
    imagePlus.altTextField.el.dom.style.alignItems = 'center';

    imagePlus.el.dom.parentElement.parentElement.parentElement.querySelector('label').appendChild(imageWand);
    imagePlus.altTextField.el.dom.appendChild(altTextWand);
};

const attachContent = () => {
    // @ts-expect-error Ext
    const cmp = Ext.getCmp('modx-resource-content');
    const label = cmp.el.dom.querySelector('label');
    label.appendChild(createFreeTextPrompt('res.content'));
};

const attachTVs = () => {
    // @ts-expect-error Ext
    const form = Ext.getCmp('modx-panel-resource').getForm();
    for (const [tvId, tvName] of (modAI?.tvs || [])) {
        //@ts-expect-error Ext
        const wrapper = Ext.get(`tv${tvId}-tr`);
        if (!wrapper) {
            continue;
        }

        const field = form.findField(`tv${tvId}`);
        const fieldName = `tv.${tvName}`;

        if (!field) {
            const imgPlusPanel = wrapper.dom.querySelector('.imageplus-panel-input');
            if (imgPlusPanel) {
                attachImagePlus(imgPlusPanel, fieldName);
            }
            continue;
        }

        if (field.xtype === 'textfield' || field.xtype === 'textarea') {
            // @ts-expect-error MODx
            const prompt = MODx.config[`modai.tv.${tvName}.text.prompt`];

            const label = wrapper.dom.querySelector('label');
            if (!label) return;

            if (prompt) {
                label.appendChild(createForcedTextPrompt(field, fieldName));
            } else {
                label.appendChild(createFreeTextPrompt(fieldName));
            }
        }

        if (field.xtype === 'modx-panel-tv-image') {
            const imageWand = createImagePrompt(
                '',
                field.source,
                fieldName,
                function(res) {
                    if ('url' in res) {
                        const eventData = {
                            relativeUrl: res.url,
                            url: res.url
                        };

                        field.items.items[1].fireEvent('select', eventData)
                        field.fireEvent('select', eventData);
                    }
                }
            );

            const label = wrapper.dom.querySelector('label');
            if (!label) return;

            label.appendChild(imageWand);
        }
    }

}

const attachResourceFields = () => {
    const fieldsMap: Record<string, string[]> = {
        pagetitle: ['modx-resource-pagetitle'],
        longtitle: ['modx-resource-longtitle', 'seosuite-longtitle'],
        introtext: ['modx-resource-introtext'],
        description: ['modx-resource-description', 'seosuite-description'],
        content: ['modx-resource-content'],
    };

    for (const field of modAI?.resourceFields || []) {
        if (!fieldsMap[field]) {
            continue;
        }

        if (field === 'content') {
            attachContent();
            continue;
        }

        fieldsMap[field].forEach((cmpId) => {
            attachField(cmpId, `res.${field}`);
        })

    }
}


(() => {
    // @ts-ignore
    Ext.onReady(function() {
        // @ts-ignore
        Ext.defer(function() {
            attachResourceFields();
            attachTVs();
        }, 500);
    });
})();
