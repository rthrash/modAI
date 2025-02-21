modAI.window.ImagePrompt = function(config) {
    config = config || {};

    this.addEvents('afterrender');

    const pagination = this.init(config);

    Ext.applyIf(config,{
        title: _('modai.cmp.image'),
        closeAction: 'close',
        width: 600,
        autoHeight: true,
        url: MODx.config.connector_url,
        action: 'modAI\\Processors\\Download\\Image',
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
            this.downloadButton
        ]
    });

    modAI.window.ImagePrompt.superclass.constructor.call(this,config);
};
Ext.extend(modAI.window.ImagePrompt,MODx.Window, {
    _history: null,

    init: function(config) {
        const syncUI = (data) => {
            info.update({currentPage: data.current, total: data.total})
            info.show();

            if (data.value.url) {
                this.hidenUrl.setValue(data.value.url);
            } else {
                this.hidenUrl.setValue('');
            }

            if (data.value.base64) {
                this.hidenBase64.setValue(data.value.base64);
            } else {
                this.hidenBase64.setValue('');
            }

            this.prompt.setValue(data.value.prompt)
            this.imagePreview.update({url: data.value?.url || data.value.base64});

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

            this.imagePreview.show();
            this.downloadButton.enable();
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

        this.imagePreview = new Ext.Component({
            hidden: true,
            data: {url: ''},
            tpl: new Ext.XTemplate(
                '<img src="{url}" style="width:100%;margin-top:10px;" />',
            )
        });

        this.hidenUrl = new Ext.form.Hidden({
            name: 'url'
        });

        this.hidenBase64 = new Ext.form.Hidden({
            name: 'image'
        });

        this.downloadButton = new Ext.Button({
            text: _('save'),
            cls: 'primary-button',
            scope: this,
            handler: this.submit,
            disabled: true
        });

        this.pagination = {
            addItem,
        };

        this._history = modAI.history.init(config.cacheKey, syncUI);

        if (this._history.cachedItem.values.length > 0) {
            this.addListener('afterrender', () => {
                this._history.syncUI();

                this.imagePreview.show();
                this.downloadButton.enable();
                prev.show();
                next.show();

            }, this, {single: true});
        }

        return [prev, next, info];
    },

    getFields: function(config) {

        return [
            {
                xtype: 'hidden',
                name: 'resource'
            },
            {
                xtype: 'hidden',
                name: 'mediaSource'
            },
            {
                xtype: 'hidden',
                name: 'fieldName'
            },
            this.hidenUrl,
            this.hidenBase64,
            this.prompt,
            {
                style: 'margin-top: 10px;',
                xtype: 'button',
                anchor: '100%',
                text: 'Generate Image',
                handler: () => {
                    const prompt = this.prompt.getValue();
                    if (!prompt) {
                        this.prompt.markInvalid(_('modai.cmp.prompt_required'));
                        return;
                    }
                    this.prompt.clearInvalid();

                    Ext.Msg.wait(_('modai.cmp.generate_ing'), _('modai.cmp.please_wait'));
                    MODx.Ajax.request({
                        url: MODx.config.connector_url,
                        timeout: 0,
                        params: {
                            action: 'modAI\\Processors\\Prompt\\Image',
                            prompt: this.prompt.getValue(),
                            fieldName: config.record.fieldName || ''
                        },
                        listeners: {
                            success: {
                                fn: (r) => {
                                    modAI.serviceExecutor(r.object).then((result) => {
                                        this.pagination.addItem({prompt: this.prompt.getValue(), ...result});
                                        Ext.Msg.hide();
                                    }).catch((err) => {
                                        Ext.Msg.hide();
                                        Ext.Msg.alert(_('modai.cmp.failed'), _('modai.cmp.failed_try_again', {"msg": err.message}));
                                    });
                                }
                            },
                            failure: {
                                fn: function() {
                                    Ext.Msg.hide();
                                    Ext.Msg.alert(_('modai.cmp.failed'), _('modai.cmp.failed_try_again'));
                                } ,
                                scope: this
                            }
                        }
                    });
                }
            },
            this.imagePreview
        ];
    }
});
Ext.reg('modai-window-image_prompt',modAI.window.ImagePrompt);
