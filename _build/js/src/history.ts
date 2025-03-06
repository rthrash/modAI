type Cache = {
    visible: number;
    values: string[];
    context: unknown;
    syncUI?: (data: unknown, noStore?: boolean) => void;
}

const _cache: Record<string, Cache> = {};

export const history = {
    _formatOutput(key: string, value?: string) {
        const cachedItem = _cache[key];

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
    insert(key: string, value: string, noStore: boolean = false) {
        const cachedItem = _cache[key];

        if (!noStore) {
            cachedItem.visible = cachedItem.values.push(value) - 1;
        }

        const output = this._formatOutput(key, value);
        if (typeof cachedItem.syncUI === 'function') {
            cachedItem.syncUI(output, noStore);
        }

        return output;
    },
    next(key: string) {
        const cachedItem = _cache[key];

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
    prev(key: string) {
        const cachedItem = _cache[key];

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
    init(key: string, syncUI?: () => void, initValue?: string, context: unknown = {}) {
        if (!_cache[key]) {
            _cache[key] = {
                visible: -1,
                values: [],
                context,
            }
        }

        _cache[key].syncUI = syncUI;

        if (initValue) {
            _cache[key].values = [initValue];
            _cache[key].visible = 0;
        }

        return {
            cachedItem: _cache[key],
            getData: () => {
                return this._formatOutput(key);
            },
            getAll: () => {
                return _cache[key].values;
            },
            syncUI: () => {
                if (typeof _cache[key].syncUI === 'function') {
                    _cache[key].syncUI(this._formatOutput(key), false);
                }
            },
            insert: (value: string, noStore: boolean = false) => {
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
