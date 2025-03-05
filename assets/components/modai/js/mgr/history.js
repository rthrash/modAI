modAI.history = {
    _cache: {},
    _formatOutput(key, value = undefined) {
        const cachedItem = this._cache[key];

        const prevStatus = (cachedItem.visible > 0);
        const nextStatus = (cachedItem.visible !== cachedItem.values.length - 1);

        return {
            value: value !== undefined ? value : (cachedItem.values[cachedItem.visible] ?? null),
            nextStatus,
            prevStatus,
            current: cachedItem.visible + 1,
            total: cachedItem.values.length,
            context: cachedItem.context,
        }
    },
    insert(key, value, noStore = false) {
        const cachedItem = this._cache[key];

        if (!noStore) {
            cachedItem.visible = cachedItem.values.push(value) - 1;
        }

        const output = this._formatOutput(key, value);
        if (typeof cachedItem.syncUI === 'function') {
            cachedItem.syncUI(output, noStore);
        }

        return output;
    },
    next(key) {
        const cachedItem = this._cache[key];

        if (cachedItem.visible === cachedItem.values.length - 1) {
            return this._formatOutput(key);
        }

        cachedItem.visible++;

        const output = this._formatOutput(key);

        if (typeof cachedItem.syncUI === 'function') {
            cachedItem.syncUI(output);
        }

        return output;
    },
    prev(key) {
        const cachedItem = this._cache[key];

        if (cachedItem.visible <= 0) {
            return this._formatOutput(key);
        }

        cachedItem.visible--;

        const output = this._formatOutput(key);

        if (typeof cachedItem.syncUI === 'function') {
            cachedItem.syncUI(output);
        }

        return output;
    },
    init(key, syncUI = undefined, initValue = undefined, context = {}) {
        if (!this._cache[key]) {
            this._cache[key] = {
                visible: -1,
                values: [],
                context,
            }
        }

        this._cache[key].syncUI = syncUI;

        if (initValue) {
            this._cache[key].values = [initValue];
            this._cache[key].visible = 0;
        }

        return {
            cachedItem: this._cache[key],
            getData: () => {
                return this._formatOutput(key);
            },
            getAll: () => {
                return this._cache[key].values;
            },
            syncUI: () => {
                if (typeof syncUI === 'function') {
                    this._cache[key].syncUI(this._formatOutput(key), false);
                }
            },
            insert: (value, noStore = false) => {
                return this.insert(key, value, noStore);
            },
            next: () => {
                return this.next(key);
            },
            prev: () => {
                return this.prev(key);
            }
        };
    }
};
