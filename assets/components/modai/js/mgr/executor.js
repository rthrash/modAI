(() => {
    const serviceExecutor = async (details, onChunkStream = undefined) => {
        if (!details.forExecutor) {
            return details;
        }

        const executorDetails = details.forExecutor;

        const errorHandler = async (res) => {
            if (!res.ok) {
                const data = await res.json();
                if (data?.error) {
                    throw new Error(data.error.message);
                }

                throw new Error(`${res.status} ${res.statusText}`);
            }
        }

        const callService = async (details) => {
            const res = await fetch(details.url, {
                method: 'POST',
                body: details.body,
                headers: details.headers
            });

            await errorHandler(res);

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            return data;
        }

        const callStreamService = async (details) => {
            const res = await fetch(details.url, {
                method: 'POST',
                body: details.body,
                headers: details.headers
            });

            await errorHandler(res);

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let currentData = undefined;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                if (executorDetails.service === 'gemini') {
                    const jsonLines = chunk.trim().split(",\r\n").map((line) => line.replace(/^\[|\]$/g, '')).filter(line => line.trim() !== '');
                    for (const line of jsonLines) {
                        try {
                            const parsedData = JSON.parse(line);
                            currentData = services.stream[executorDetails.service][executorDetails.parser](parsedData, currentData);
                            if(onChunkStream) {
                                onChunkStream(currentData);
                            }
                        } catch {}
                    }
                }

                if (details.service === 'chatgpt') {
                    buffer += chunk;

                    let lastNewlineIndex = 0;
                    let newlineIndex;

                    while ((newlineIndex = buffer.indexOf('\n', lastNewlineIndex)) !== -1) {
                        const line = buffer.slice(lastNewlineIndex, newlineIndex).trim();
                        lastNewlineIndex = newlineIndex + 1;

                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);

                            if (data === '[DONE]') {
                                continue;
                            }

                            try {
                                const parsedData = JSON.parse(data);
                                currentData = services.stream[executorDetails.service][executorDetails.parser](parsedData, currentData);
                                if(onChunkStream) {
                                    onChunkStream(currentData);
                                }
                            } catch {}
                        }
                    }

                    buffer = buffer.slice(lastNewlineIndex);
                }
            }

            return currentData;
        }

        const services = {
            buffered: {
                chatgpt: {
                    content: (data) => {
                        const content = data?.choices?.[0]?.message?.content;

                        if (!content) {
                            throw new Error(_('modai.cmp.failed_request'));
                        }

                        return {
                            content
                        }
                    },
                    image: (data) => {
                        const url = data?.data?.[0]?.url;

                        if (!url) {
                            throw new Error(_('modai.cmp.failed_request'));
                        }

                        return {
                            url
                        }
                    }
                },
                claude: {
                    content: (data) => {
                        const content = data?.content?.[0]?.text;

                        if (!content) {
                            throw new Error(_('modai.cmp.failed_request'));
                        }

                        return {
                            content
                        }
                    }
                },
                gemini: {
                    content: (data) => {
                        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                        if (!content) {
                            throw new Error(_('modai.cmp.failed_request'));
                        }

                        return {
                            content
                        }
                    },
                    image: (data) => {
                        const base64 = data?.predictions?.[0]?.bytesBase64Encoded;

                        if (!base64) {
                            throw new Error(_('modai.cmp.failed_request'));
                        }

                        return {
                            base64: `data:image/png;base64,${base64}`
                        }
                    }
                }
            },
            stream: {
                chatgpt: {
                    content: (newData, currentData = undefined) => {
                        const currentContent = currentData?.content ?? '';

                        const content = newData.choices[0]?.delta?.content || '';

                        return {
                            content: `${currentContent}${content}`
                        };
                    }
                },
                gemini: {
                    content: (newData, currentData = undefined) => {
                        const currentContent = currentData?.content ?? '';

                        const content = newData.candidates[0]?.content?.parts[0]?.text || '';

                        return {
                            content: `${currentContent}${content}`
                        };
                    }
                }
            },
        };

        if (!executorDetails.service || !executorDetails.parser) {
            throw new Error(_('modai.cmp.service_required'));
        }

        if (!services[executorDetails.stream ? 'stream' : 'buffered']?.[executorDetails.service]?.[executorDetails.parser]) {
            throw new Error(_('modai.cmp.service_unsupported'));
        }

        if (executorDetails.stream) {
            return callStreamService(executorDetails)
        }

        const data = await callService(executorDetails);
        return services['buffered'][executorDetails.service][executorDetails.parser](data);
    }

    const modxFetch = async (action, params) => {
        const formData = new FormData();
        for (const [key, value] of Object.entries(params)) {
            formData.set(key, value);
        }

        formData.set('HTTP_MODAUTH', MODx.siteId);
        formData.set('action', `modAI\\Processors\\${action}`);

        const res = await fetch(MODx.config.connector_url, {
            method: 'POST',
            body: formData,
            headers: {
                modauth: MODx.siteId
            }
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const data = await res.json();

        if (typeof data.success === undefined || data.success === false || data.success === 'false') {
            throw new Error(data.message);
        }

        return data;
    }

    modAI.executor = {
        mgr: {
            download: {
                image: async (params) => {
                    const data = await modxFetch('Download\\Image', params);
                    return data.object;
                }
            },
            prompt: {
                freeText: async (params, onChunkStream) => {
                    const data = await modxFetch('Prompt\\FreeText', params);
                    return serviceExecutor(data.object, onChunkStream);
                },
                text: async (params, onChunkStream) => {
                    const data = await modxFetch('Prompt\\Text', params);
                    return serviceExecutor(data.object, onChunkStream);
                },
                vision: async (params, onChunkStream) => {
                    const data = await modxFetch('Prompt\\Vision', params);
                    return serviceExecutor(data.object, onChunkStream);
                },
                image: async (params) => {
                    const data = await modxFetch('Prompt\\Image', params);
                    return serviceExecutor(data.object);
                }
            }
        }
    }
})();
