modAI.window.TextPrompt = function(config) {
    config = config || {};

    this.addEvents('afterrender');

    const pagination = this.init(config);

    Ext.applyIf(config,{
        title: _('modai.cmp.text'),
        closeAction: 'close',
        width: 600,
        autoHeight: true,
        fields: this.getFields(config),
        buttonAlign: 'left',
        modal: true,
        buttons: [
            ...pagination,
            '->',
            {
                text: _('cancel'),
                scope: this,
                handler: function() {
                    this.close();
                }
            },
            this.copyClose
        ],
    });

    modAI.window.TextPrompt.superclass.constructor.call(this,config);
};
Ext.extend(modAI.window.TextPrompt,MODx.Window, {
    _history: null,

    init: function(config) {
        const syncUI = (data) => {
            info.update({currentPage: data.current, total: data.total})
            info.show();

            this.prompt.setValue(data.value.prompt)
            this.preview.show();
            this.preview.setValue(data.value.content);


            if (data.prevStatus) {
                prev.enable();
            } else {
                prev.disable();
            }

            if (data.nextStatus) {
                next.enable();
            } else {
                next.disable();
            }
        }

        const addItem = (item) => {
            this._history.insert(item);

            this.preview.show();
            this.copyClose.enable();
            prev.show();
            next.show();
        }

        const prev = new Ext.Button({
            hidden: true,
            text: '<<',
            handler: () => {
                this._history.prev();
            }
        });

        const next = new Ext.Button({
            hidden: true,
            text: '>>',
            handler: () => {
                this._history.next();
            }
        });

        const info = new Ext.Component({
            hidden: true,
            data: {currentPage: 1, total: 1},
            tpl: new Ext.XTemplate(
                '<span style="margin-left: 10px;">{currentPage}/{total}</span>',
            )
        });

        this.prompt = new Ext.form.TextArea({
            fieldLabel: _('modai.cmp.prompt'),
            name: 'prompt',
            anchor: '100%',
            required: true,
        });

        this.preview = new Ext.form.TextArea({
            hidden: true,
            anchor: '100%',
            height: '300px'
        });

        this.copyClose = new Ext.Button({
            text: 'Copy & Close',
            cls: 'primary-button',
            scope: this,
            handler: () => {
                this.preview.el.dom.select()
                this.preview.el.dom.setSelectionRange(0, this.preview.el.dom.value.length);

                // 4. Use the Clipboard API (modern approach)
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(this.preview.getValue())
                        .then(() => {
                            this.close();
                        })
                        .catch(() => {
                            Ext.Msg.alert(_('modai.cmp.failed'), _('modai.cmp.failed_copy'));
                        });
                } else {
                    try {
                        document.execCommand("copy");
                        this.close();
                    } catch (err) {
                        Ext.Msg.alert(_('modai.cmp.failed'), _('modai.cmp.failed_copy'));
                    }
                }
            },
            disabled: true
        });

        this.pagination = {
            addItem,
        };

        this._history = modAI.history.init(config.cacheKey, syncUI);

        if (this._history.cachedItem.values.length > 0) {
            this.addListener('afterrender', () => {
                this._history.syncUI();

                this.preview.show();
                this.copyClose.enable();
                prev.show();
                next.show();

            }, this, {single: true});
        }

        return [prev, next, info];
    },

    getFields: function(config) {

        return [
            this.prompt,
            {
                style: 'margin-top: 10px;',
                xtype: 'button',
                anchor: '100%',
                text: 'Generate',
                handler: () => {
                    const prompt = this.prompt.getValue();
                    if (!prompt) {
                        this.prompt.markInvalid(_('modai.cmp.prompt_required'));
                        return;
                    }
                    this.prompt.clearInvalid();

                    Ext.Msg.wait(_('modai.cmp.generate_ing'), _('modai.cmp.please_wait'));

                    modAI.executor.mgr.prompt.freeText(
                        { prompt: this.prompt.getValue(), field: config.fieldName || '' },
                        (result) => {
                            this.pagination.addItem({prompt: this.prompt.getValue(), content: result.content});
                            Ext.Msg.hide();
                        },
                        (msg) => {
                            Ext.Msg.hide();
                            Ext.Msg.alert("Failed", _('modai.cmp.failed_try_again', {"msg": msg}));
                        }
                    )
                }
            },
            this.preview
        ];
    }
});
Ext.reg('modai-window-text_prompt', modAI.window.TextPrompt);
