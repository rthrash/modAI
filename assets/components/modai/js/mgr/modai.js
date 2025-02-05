var ModAI = function (config) {
    config = config || {};
    ModAI.superclass.constructor.call(this, config);
};
Ext.extend(ModAI, Ext.Component, {

    page: {},
    window: {},
    grid: {},
    tree: {},
    panel: {},
    combo: {},
    field: {},
    config: {},

});
Ext.reg('modai', ModAI);
modAI = new ModAI();
