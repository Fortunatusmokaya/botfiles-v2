const axios = require('axios');

async function gpt(prompt) {
    try {
        const { data } = await axios.post(
            'https://us-central1-openaiprojects-1fba2.cloudfunctions.net/chat_gpt_ai/api.live.text.gen',
            {
                model: 'gpt-4o-mini',
                temperature: 0.2,
                top_p: 0.2,
                prompt: prompt
            },
            {
                headers: {
                    'content-type': 'application/json; charset=UTF-8'
                }
            }
        );

        return {
            response: data.choices?.[0]?.message?.content || "No response"
        };
    } catch (error) {
        return {
            response: "Error: " + error.message
        };
    }
}

module.exports = { gpt };