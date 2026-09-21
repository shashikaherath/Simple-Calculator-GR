
# Simple Calculator GR

A responsive calculator built with **React 18 + Vite** (JavaScript).

## Features
- Basic operations: `+ − × ÷`
- Decimals and negative numbers (`±` key, or type `5×−3`)
- Percentage (`50%` = 0.5, `200×10%` = 20), Clear, Backspace
- Correct operator precedence and nested brackets (`( )` smart key auto-opens/closes)
- Live result preview while typing
- Calculation history (click an entry to reuse its result; clear anytime)
- Input validation: no double operators/decimals, no leading zeros, no unmatched `)`
- Error handling: divide by zero, incomplete expression, missing brackets
- Keyboard support: `0-9 + - * / ( ) % .`, `Enter`/`=`, `Backspace`, `Esc`
- Responsive layout, light/dark theme via system setting

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # expression engine tests
npm run build      # production build in dist/
```

## How it works
`src/evaluate.js` is a recursive-descent parser (no `eval`), so precedence and
brackets are handled explicitly: brackets → unary minus → `%` → `× ÷` → `+ −`.
`src/App.jsx` guards every key press so invalid input can't be typed.

## Screenshots
Add your own after running the app (see `screenshots/`):
- ![image alt](https://github.com/shashikaherath/Simple-Calculator-GR/blob/2a92431be2bf021d2f1cab3e85665087eb50d7b9/src/screenshots/Screenshot%202026-09-21%20094931.png)
  ![image alt](https://github.com/shashikaherath/Simple-Calculator-GR/blob/9a09fcdbb9b2fd777ddd3d78eef3b91bf6c1e993/src/screenshots/Screenshot%202026-09-21%20094909.png)
    ![image alt](https://github.com/shashikaherath/Simple-Calculator-GR/blob/9a09fcdbb9b2fd777ddd3d78eef3b91bf6c1e993/src/screenshots/Screenshot%202026-09-21%20095037.png)
=======
