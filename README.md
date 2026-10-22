# Akbarsha S | Stark Protocol Portfolio

A personal portfolio with a Stark Industries-inspired interface, J.A.R.V.I.S. terminal, video showcase, project and skills sections, and a contact form.

## Features

- Responsive single-page portfolio built with HTML, Tailwind CSS CDN, and vanilla JavaScript.
- Featured MP4 video with playback and audio controls.
- Contact links for email, phone, LinkedIn, GitHub, Instagram, and WhatsApp.
- Contact form submissions saved to an Excel workbook on the server.

## Run Locally

Requirements: Node.js and npm.

```bash
npm install
npm start
```

Open [http://localhost:8000](http://localhost:8000). To use a different port, set the `PORT` environment variable before starting the server.

On first startup, the server creates `transmissions.xlsx` in the project folder. Each form submission adds a row to its `Transmissions` sheet with the submission time, name, email, subject, and message. The workbook and `node_modules` are excluded from Git by `.gitignore`.

## Deployment

Deploy this project to a host that can run a persistent Node.js process and provides persistent disk storage. Install dependencies with `npm install` and start the app with `npm start` (or the host's equivalent). The server binds to `0.0.0.0` and uses the `PORT` environment variable when provided by the host.

GitHub Pages and other static-only hosting cannot run `server.js` or save form submissions to the workbook. The video and portfolio page can be served statically, but the contact form requires the Node.js API.

## Submission Data

Form submissions contain personal information. Restrict access to the server and workbook, use HTTPS in production, and make secure backups of `transmissions.xlsx`. The workbook is intentionally not served as a public download. This project does not include authentication or an administrative dashboard for viewing submissions.

## Main Files

- `akbarsha_s_stark_industries_portfolio.html`: portfolio interface and form.
- `gemini_generated_video_809125a6.mp4`: featured video asset.
- `server.js`: HTTP server and Excel submission endpoint.
- `package.json`: start command and dependencies.