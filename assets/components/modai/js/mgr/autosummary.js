Ext.onReady(function() {

    const historyNavSync = (data) => {
        data.context.els.forEach(({wrapper, field}) => {
            const prevValue = field.getValue();
            field.setValue(data.value);
            field.fireEvent('change', field, data.value, prevValue);

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

    const createHistoryNav = (cache) => {
        const prevButton = document.createElement('button');
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

        const nextButton = document.createElement('button');
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

        const info = document.createElement('span');
        info.update = (showing, total) => {
            info.innerText = `${showing}/${total}`;
        }
        info.innerText = '';

        const wrapper = document.createElement('span');
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

    const createFreeTextPrompt = (fieldName) => {
        const wandEl = createWandEl();
        wandEl.addEventListener('click', () => {
            const win = MODx.load({
                xtype: 'modai-window-text_prompt',
                title: 'Text',
                field: fieldName,
                cacheKey: fieldName
            });

            win.show();
        });

        return wandEl;
    }

    const createForcedTextPrompt = (field, fieldName) => {
        const aiWrapper = document.createElement('span');

        const wandEl = createWandEl();
        wandEl.addEventListener('click', async () => {
            Ext.Msg.wait(_('modai.cmp.generate_ing'), _('modai.cmp.please_wait'));

            try {
                const result = await modAI.executor.mgr.prompt.text({
                    id: MODx.request.id,
                    field: fieldName
                });
                cache.insert(result.content);
                Ext.Msg.hide();
            } catch (err) {
                Ext.Msg.hide();
                Ext.Msg.alert("Failed", _('modai.cmp.failed_try_again', {"msg": err.message}));
            }
        });

        aiWrapper.appendChild(wandEl);

        const cache = modAI.history.init(
            fieldName,
            historyNavSync,
            field.getValue()
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

    const createImagePrompt = (defaultPrompt, mediaSource, fieldName, onSuccess) => {
        const imageWand = createWandEl();
        imageWand.addEventListener('click', () => {
            const createColumn = MODx.load({
                xtype: 'modai-window-image_prompt',
                title: 'Image',
                cacheKey: fieldName,
                record: {
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

    const attachField = (cmp, fieldName) => {
        const field = Ext.getCmp(cmp);
        if (!field) return;

        const wrapper = document.createElement('span');


        const wandEl = createWandEl();
        wandEl.addEventListener('click', async () => {
            Ext.Msg.wait(_('modai.cmp.generate_ing'), _('modai.cmp.please_wait'));

            try {
                const result = await modAI.executor.mgr.prompt.text({
                    id: MODx.request.id,
                    field: fieldName
                });
                cache.insert(result.content);
                Ext.Msg.hide();
            } catch (err) {
                Ext.Msg.hide();
                Ext.Msg.alert("Failed", _('modai.cmp.failed_try_again', {"msg": err.message}));
            }
        });

        wrapper.appendChild(wandEl);

        const cache = modAI.history.init(
            fieldName,
            historyNavSync,
            field.getValue()
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

    const attachImagePlus = (imgPlusPanel, fieldName) => {
        const imagePlus = Ext.getCmp(imgPlusPanel.firstChild.id);

        const imageWand = createImagePrompt(
            '',
            imagePlus.imageBrowser.source,
            fieldName,
            function(res) {
                imagePlus.imageBrowser.setValue(res.url);
                imagePlus.onImageChange(res.url)
            }
        );

        const altTextWand = createWandEl();
        altTextWand.style.marginTop = '6px';
        altTextWand.addEventListener('click', async () => {
            const imgElement = imagePlus.imagePreview.el.dom;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = imgElement.width;
            canvas.height = imgElement.height;

            ctx.drawImage(imgElement, 0, 0);

            const base64Data = canvas.toDataURL('image/png');

            Ext.Msg.wait(_('modai.cmp.generate_ing'), _('modai.cmp.please_wait'));

            try {
                const result = await modAI.executor.mgr.prompt.vision({
                    image: base64Data,
                    field: fieldName
                });
                imagePlus.altTextField.items.items[0].setValue(result.content);
                imagePlus.image.altTag = result.content;
                imagePlus.updateValue();
                Ext.Msg.hide();
            } catch (err) {
                Ext.Msg.hide();
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
        const cmp = Ext.getCmp('modx-resource-content');
        const label = cmp.el.dom.querySelector('label');
        label.appendChild(createFreeTextPrompt('res.content'));
    };

    const attachTVs = () => {
        const form = Ext.getCmp('modx-panel-resource').getForm();
        for (const [tvId, tvName] of (modAI?.tvs || [])) {
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
                const prompt = MODx.config[`modai.tv.${tvName}.prompt`];

                const label = wrapper.dom.querySelector('label');

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
                        const eventData = {
                            relativeUrl: res.url,
                            url: res.url
                        };

                        field.items.items[1].fireEvent('select', eventData)
                        field.fireEvent('select', eventData);
                    }
                );

                const label = wrapper.dom.querySelector('label');
                label.appendChild(imageWand);
            }
        }

    }

    const attachResourceFields = () => {
        const fieldsMap = {
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

    Ext.defer(function() {
        attachResourceFields();
        attachTVs();
    }, 500);
});
