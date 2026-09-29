# 🔮 NovaCalc — Modern Glassmorphic Scientific & Standard Web Calculator

NovaCalc is a state-of-the-art web calculator built with vanilla HTML5, CSS3, and modern JavaScript. Designed with ultra-modern glassmorphic aesthetics, dynamic color themes, synthesized tactile audio feedback, and rich calculation features.

![NovaCalc Glassmorphic Preview](https://img.shields.io/badge/NovaCalc-v2.0-8b5cf6?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ Features

- 💎 **Glassmorphic Luxe UI**: Frosted glass surfaces (`backdrop-filter: blur`), floating ambient glow orbs, and neon gradient accents.
- 🎨 **5 Curated Color Themes**:
  - **Cyber Obsidian** (Dark deep space with neon cyan & electric violet)
  - **Midnight Violet** (Luxe deep purple & neon pink)
  - **Aurora Emerald** (Deep teal & glowing mint)
  - **Sunset Crimson** (Deep midnight ember & warm amber)
  - **Frosted Pearl** (Crystal light glassmorphism)
- 🔊 **Synthesized Tactile Audio**: Built-in sound effects generated in real-time via the **Web Audio API** (distinct tones for numbers, operators, equals chime, clear, and error buzz) — toggleable mute/unmute.
- 📐 **Dual Mode System**:
  - **Standard Mode**: Arithmetic operations (`+`, `−`, `×`, `÷`, `%`, `±`), parentheses, backspace, and clear.
  - **Scientific Mode**: Trigonometry (`sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹`), logarithmic (`ln`, `log`), constants (`π`, `e`), powers (`xʸ`, `x²`, `x³`), roots (`√x`, `∛x`), reciprocal (`1/x`), absolute (`|x|`), exponential (`eˣ`), and factorial (`n!`).
- 🔄 **Angle Modes**: Toggle between **DEG** (Degrees) and **RAD** (Radians).
- 📜 **Calculation History Drawer**:
  - Slide-in side drawer recording all calculations with timestamps.
  - Click any past calculation to instantly reload the result into the display.
  - Persistent storage using `localStorage`.
- 🧠 **Memory Operations**: Full memory toolbar (`MC`, `MR`, `M+`, `M-`, `MS`) with on-display indicator status.
- 📋 **One-Click Copy**: Copy calculation results directly to your clipboard with animated tooltip feedback.
- ⌨️ **Full Keyboard Support**: Seamless keyboard operation with real-time visual button press highlight feedback.
- 📱 **Fully Responsive**: Flawless layout on desktop, tablet, and mobile displays.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `0` – `9` | Input Number |
| `.` | Decimal point |
| `+`, `-`, `*`, `/` | Basic Operators (`+`, `−`, `×`, `÷`) |
| `Enter` or `=` | Calculate Result |
| `Backspace` | Delete last digit |
| `Escape` | Clear All (`AC`) |
| `Delete` | Clear Current Entry (`C`) |
| `(` and `)` | Parentheses |
| `%` | Percentage |
| `^` | Power (`xʸ`) |

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/Nitin-Ni03/calculator.git

# Navigate to the project directory
cd calculator

# Open index.html directly or serve with any static server
# (e.g. using Python, Live Server, or double-click index.html)
npx serve .
```

---

## 🛠️ Built With

- **HTML5**: Semantic tags, accessibility (ARIA), and SEO metadata.
- **Vanilla CSS3**: CSS Custom Properties (Variables), Flexbox & Grid layouts, Glassmorphism, Keyframe animations.
- **Modern JavaScript (ES6+)**: Shunting-Yard algorithm & Reverse Polish Notation (RPN) for mathematical evaluation, Web Audio API, and `localStorage`.

---

## 📄 License

This project is licensed under the MIT License.
