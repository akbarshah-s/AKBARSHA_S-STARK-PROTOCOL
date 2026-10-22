const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const ExcelJS = require('exceljs');

const root = __dirname;
const workbookPath = path.join(root, 'transmissions.xlsx');
const port = Number(process.env.PORT || 8000);
const workbook = new ExcelJS.Workbook();
let saveQueue = Promise.resolve();

async function initializeWorkbook() {
    if (fs.existsSync(workbookPath)) {
        await workbook.xlsx.readFile(workbookPath);
        if (!workbook.getWorksheet('Transmissions')) {
            workbook.addWorksheet('Transmissions').addRow([
                'Submitted At', 'Name', 'Email', 'Subject', 'Message'
            ]);
            await workbook.xlsx.writeFile(workbookPath);
        }
        return;
    }

    const sheet = workbook.addWorksheet('Transmissions');
    sheet.columns = [
        { header: 'Submitted At', key: 'submittedAt', width: 24 },
        { header: 'Name', key: 'name', width: 28 },
        { header: 'Email', key: 'email', width: 34 },
        { header: 'Subject', key: 'subject', width: 40 },
        { header: 'Message', key: 'message', width: 80 }
    ];
    sheet.getRow(1).font = { bold: true };
    await workbook.xlsx.writeFile(workbookPath);
}

function sendJson(response, status, payload) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload));
}

function handleSubmission(request, response) {
    let body = '';
    request.on('data', chunk => {
        body += chunk;
        if (body.length > 16_384) {
            sendJson(response, 413, { error: 'Submission is too large.' });
            request.destroy();
        }
    });

    request.on('end', async () => {
        if (response.writableEnded) return;

        let submission;
        try {
            submission = JSON.parse(body);
        } catch {
            sendJson(response, 400, { error: 'Invalid submission data.' });
            return;
        }

        const entry = {
            submittedAt: new Date().toISOString(),
            name: String(submission.name || '').trim(),
            email: String(submission.email || '').trim(),
            subject: String(submission.subject || '').trim(),
            message: String(submission.message || '').trim()
        };
        if (!entry.name || entry.name.length > 120 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email) || entry.email.length > 254 ||
            entry.subject.length > 200 || !entry.message || entry.message.length > 5000) {
            sendJson(response, 400, { error: 'Please check the required fields and length limits.' });
            return;
        }

        saveQueue = saveQueue.then(async () => {
            const sheet = workbook.getWorksheet('Transmissions');
            sheet.addRow(entry);
            await workbook.xlsx.writeFile(workbookPath);
        });

        try {
            await saveQueue;
            sendJson(response, 201, { saved: true });
        } catch (error) {
            console.error('Could not save transmission:', error);
            sendJson(response, 500, { error: 'The server could not save your message. Please try again later.' });
        }
    });
}

function serveFile(response, filePath, contentType) {
    fs.readFile(filePath, (error, contents) => {
        if (error) {
            response.writeHead(404);
            response.end('Not found');
            return;
        }
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(contents);
    });
}

async function startServer() {
    await initializeWorkbook();
    const server = http.createServer((request, response) => {
        const requestPath = new URL(request.url, 'http://localhost').pathname;
        if (request.method === 'POST' && requestPath === '/api/transmissions') {
            handleSubmission(request, response);
            return;
        }
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            response.writeHead(405);
            response.end('Method not allowed');
            return;
        }

        if (requestPath === '/' || requestPath === '/akbarsha_s_stark_industries_portfolio.html') {
            serveFile(response, path.join(root, 'akbarsha_s_stark_industries_portfolio.html'), 'text/html; charset=utf-8');
        } else if (requestPath === '/gemini_generated_video_809125a6.mp4') {
            response.writeHead(200, { 'Content-Type': 'video/mp4' });
            fs.createReadStream(path.join(root, 'gemini_generated_video_809125a6.mp4')).pipe(response);
        } else {
            response.writeHead(404);
            response.end('Not found');
        }
    });

    server.listen(port, '0.0.0.0', () => {
        console.log(`Portfolio server running at http://localhost:${port}`);
        console.log(`Submissions are saved privately in ${workbookPath}`);
    });
}

startServer().catch(error => {
    console.error('Could not start portfolio server:', error);
    process.exitCode = 1;
});