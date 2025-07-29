const axios = require('axios');

async function venicechat(question) {
    try {
        if (!question) throw new Error('Question is required');
        
        const { data } = await axios.request({
            method: 'POST',
            url: 'https://outerface.venice.ai/api/inference/chat',
            headers: {
                accept: '*/*',
                'content-type': 'application/json',
                origin: 'https://venice.ai',
                referer: 'https://venice.ai/',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
                'x-venice-version': 'interface@20250523.214528+393d253'
            },
            data: JSON.stringify({
                requestId: 'nekorinn',
                modelId: 'dolphin-3.0-mistral-24b',
                prompt: [
                    {
                        content: question,
                        role: 'user'
                    }
                ],
                systemPrompt: '',
                conversationType: 'text',
                temperature: 0.8,
                webEnabled: true,
                topP: 0.9,
                isCharacter: false,
                clientProcessingTime: 15
            })
        });

        const chunks = data.split('\n').filter(chunk => chunk).map(chunk => JSON.parse(chunk));
        const result = chunks.map(chunk => chunk.content).join('');

        return {
            question,
            response: result
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = venicechat;

