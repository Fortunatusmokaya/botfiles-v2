const ws = require('ws');


async function searchai(query) {
    if (!query) throw new Error('Query is required');

    const socket = new ws('wss://searc.ai/ws');
    const result = {
        query: query,
        subqueries: [],
        report: '',
        source_url: [],
        selected_images: [],
        files: {},
        metadata: {
            total_cost: null,
            agent_type: null,
            scraped_pages: 0,
            scraped_images: 0
        }
    };

    return new Promise((resolve, reject) => {
        socket.on('open', () => {
            socket.send('start ' + JSON.stringify({
                task: query,
                report_type: 'research_report',
                report_source: 'web',
                tone: 'Objective',
                query_domains: []
            }));
        });

        socket.on('message', (data) => {
            const d = JSON.parse(data);

            if (d.type === 'logs') {
                if (d.content === 'subqueries' && d.metadata) {
                    result.subqueries.push(...d.metadata);
                } else if (d.content === 'added_source_url' && d.metadata) {
                    result.source_url.push(d.metadata);
                } else if (d.content === 'agent_generated' && d.output) {
                    result.metadata.agent_type = d.output;
                } else if (d.content === 'research_step_finalized' && d.output.includes('Total Research Costs:')) {
                    const costMatch = d.output.match(/\$([0-9.]+)/);
                    if (costMatch) {
                        result.metadata.total_cost = parseFloat(costMatch[1]);
                    }
                } else if (d.content === 'scraping_content' && d.output.includes('Scraped')) {
                    const pagesMatch = d.output.match(/(\d+) pages/);
                    if (pagesMatch) {
                        result.metadata.scraped_pages += parseInt(pagesMatch[1]);
                    }
                } else if (d.content === 'scraping_images' && d.output.includes('Selected')) {
                    const imagesMatch = d.output.match(/(\d+) new images/);
                    if (imagesMatch) {
                        result.metadata.scraped_images += parseInt(imagesMatch[1]);
                    }
                }
            } else if (d.type === 'images') {
                if (d.content === 'selected_images' && d.metadata) {
                    result.selected_images.push(...d.metadata);
                }
            } else if (d.type === 'report') {
                result.report += d.output || '';
            } else if (d.type === 'path') {
                const baseUrl = 'https://searc.ai/';
                const filesWithUrls = {};

                for (const [key, value] of Object.entries(d.output)) {
                    filesWithUrls[key] = baseUrl + value;
                }

                result.files = filesWithUrls;

                socket.close();
                resolve({
                    query: result.query,
                    subqueries: result.subqueries,
                    report: result.report,
                    source_urls: result.source_url,
                    selected_images: result.selected_images,
                    files: result.files,
                    metadata: result.metadata,
                });
            }
        });

        socket.on('error', (err) => {
            socket.close();
            reject(err);
        });

        socket.on('close', () => {
            
        });
    });
}

module.exports = { searchai };