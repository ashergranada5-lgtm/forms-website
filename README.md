# Formly

Formly is a standalone form builder for creating, publishing, and reviewing forms. It runs in a modern browser and does not need a build step or server.

## Run locally

Open `index.html` in a browser. Form drafts, design settings, and responses are stored in that browser's local storage.

## Features

- Nine question types, required questions, and simple answer scoring
- Per-form themes and design controls
- Draft autosave, preview, and publish/update workflow
- Response summary, individual answers, and CSV export
- Hash-based routes that work when hosted under a repository subpath

## Publish with GitHub Pages

Enable GitHub Pages for the `main` branch and the repository root (`/`). The website entry point is `index.html`; its stylesheet and JavaScript are loaded from the relative paths `style.css` and `script.js`.

This is a browser-only project. Saved forms and responses are local to the browser and are not shared between people or devices.
