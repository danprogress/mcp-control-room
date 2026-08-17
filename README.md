# MCP Control Room

A visual configuration editor for MCP (Model Context Protocol) servers. Instead of hand-editing a large JSON file, you get a clean, organized interface where every setting is a labeled field with helpful hints. Validate your configuration, then export it as a ready-to-use JSON file.

---

## What it does

MCP Control Room lets you manage five areas of an MCP server configuration through a sidebar-and-form interface:

| Section | Purpose |
|---|---|
| **API contract** | Points the server at the OpenAPI spec that describes available operations. |
| **Security** | Controls authentication: service-account JWT validation, JWKS, allowed algorithms, required scopes, and user auth. |
| **Runtime** | Server transport, HTTP backend, TLS, middleware (error handling, logging, timeouts, circuit breaker, rate limiting, audit), and tool parameter validation. |
| **Assistant** | Directory where prompt templates live. |
| **Observability** | Log levels, JSON logging, and per-logger verbosity. |

### Key features

- **Live JSON preview** — every change you make is reflected instantly in a side panel showing the full configuration as JSON.
- **Search** — filter settings within a section by name or path.
- **Validate** — checks for missing required values, out-of-range numbers, malformed URLs, and empty lists. Shows a clear valid/invalid message plus a detailed list of each issue.
- **Import / Export** — load an existing JSON config from disk, or save your current one as a `.json` file. Export is blocked if validation finds errors.
- **Copy to clipboard** — grab the full JSON with one click.
- **Reset** — restore every setting to its defaults with a confirmation prompt.
- **Delete sections** — remove an entire configuration section you don't need.
- **Auto-save** — your configuration is saved to your browser's local storage, so it survives page reloads.

---

## Prerequisites

To run this app locally you need:

- **Node.js 18 or newer** — download from https://nodejs.org (the LTS version is recommended). This also installs `npm`.
- A modern browser (Chrome, Firefox, Edge, or Safari).

Check that Node is installed:

```bash
node --version
npm --version
```

---

## Run locally (development mode)

This is the fastest way to get started and see live updates as you edit.

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start the dev server
npm run dev
```

The terminal will print a local URL (typically `http://localhost:5173`). Open it in your browser. Changes to the code refresh the page automatically.

---

## Build for production

This compiles the app into static files you can host anywhere.

```bash
# 1. Install dependencies (if you haven't already)
npm install

# 2. Build the production bundle
npm run build
```

The optimized output is written to the `dist/` folder. You can serve it with any static host:

```bash
# Preview the production build locally
npm run preview
```

---

## Run with Docker

This is the easiest way to run the app as a self-contained, production-like server without installing Node.

```bash
# Build the Docker image
docker build -t mcp-control-room .

# Run it on port 8080
docker run -p 8080:80 mcp-control-room
```

Then open http://localhost:8080 in your browser. The Docker image uses nginx to serve the built files and handle client-side routing.

---

## How to use the editor

1. **Pick a section** from the left sidebar (Security, Runtime, etc.).
2. **Edit the fields** — toggles flip switches on/off, text fields accept strings, number fields accept numbers, and list fields accept comma-separated values.
3. **Search** within a section using the search bar if you can't find a setting.
4. **Validate** by clicking the Validate button. A panel appears showing whether your configuration is valid, plus any issues to fix.
5. **Export** by clicking Export. If there are no blocking errors, a JSON file downloads to your computer.
6. **Import** an existing config by clicking Import and selecting a `.json` file from your disk.
7. **Reset** to start over from the defaults, or **delete a section** if your server doesn't use it.

---

## Tech stack

- **React 18** — UI framework
- **TypeScript** — type safety
- **Vite 6** — build tool and dev server
- **lucide-react** — icon set
- **nginx** — static file server (used in the Docker image)

---

## Project structure

```
.
├── src/
│   ├── App.tsx         # Main application component (all editor logic)
│   ├── main.tsx        # React entry point
│   └── styles.css      # All styling
├── index.html          # HTML shell
├── Dockerfile          # Docker build + nginx serve
├── nginx.conf          # nginx server config
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies and scripts
```

---

## License

This project is private. Feel free to fork and adapt it for your own MCP server configurations.
