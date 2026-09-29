/**
 * NovaCalc — Next-Generation Web Calculator
 * Features:
 * - Standard & Scientific modes with DEG/RAD support
 * - Web Audio API synthesized tactile feedback
 * - Memory operations (MC, MR, M+, M-, MS)
 * - Calculation History with localStorage persistence
 * - 5 Sleek Glassmorphism Themes
 * - Full Keyboard navigation & visual keypress indicators
 * - Accurate floating-point rounding & safe evaluation
 */

(function () {
  'use strict';

  // ==========================================
  // DOM Elements
  // ==========================================
  const displayResult = document.getElementById('calc-result');
  const displayExpression = document.getElementById('calc-expression');
  const memoryIndicator = document.getElementById('memory-indicator');
  const copyBtn = document.getElementById('copy-btn');
  const copyTooltip = document.getElementById('copy-tooltip');

  const mainContainer = document.getElementById('main-container');
  const standardGrid = document.getElementById('standard-grid');
  const scientificGrid = document.getElementById('scientific-grid');
  const tabStandard = document.getElementById('tab-standard');
  const tabScientific = document.getElementById('tab-scientific');
  const modePillContainer = document.querySelector('.mode-pill-container');
  const angleModeIndicator = document.getElementById('angle-mode-indicator');
  const btnDegRad = document.getElementById('btn-deg-rad');

  const themeBtn = document.getElementById('theme-btn');
  const themeMenu = document.getElementById('theme-menu');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundOnIcon = document.querySelector('.sound-on-icon');
  const soundOffIcon = document.querySelector('.sound-off-icon');

  const historyToggleBtn = document.getElementById('history-toggle-btn');
  const historyDrawer = document.getElementById('history-drawer');
  const closeHistoryBtn = document.getElementById('close-history-btn');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const historyList = document.getElementById('history-list');
  const emptyHistory = document.getElementById('empty-history');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const historyBadge = document.getElementById('history-badge');

  // ==========================================
  // Application State
  // ==========================================
  let currentInput = '0';
  let expressionTokens = [];
  let isResultCalculated = false;
  let memoryValue = 0;
  let angleMode = 'DEG'; // 'DEG' | 'RAD'
  let soundEnabled = true;
  let currentTheme = 'cyber-dark';
  let history = [];

  // ==========================================
  // Audio Synthesizer (Web Audio API)
  // ==========================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(type) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'num') {
        // High-tech subtle tap
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'op') {
        // Soft click with slightly higher frequency
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(740, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'equals') {
        // Uplifting harmonic double chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'clear') {
        // Gentle descending tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'error') {
        // Low error buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      // Audio fallback silent fail
    }
  }

  // ==========================================
  // Display & Formatting Helpers
  // ==========================================
  function formatNumber(numStr) {
    if (numStr === 'Error' || numStr === 'Infinity' || numStr === '-Infinity' || numStr === 'NaN') {
      return numStr;
    }
    const parts = numStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Format integer part with locale commas
    const formattedInteger = Number(integerPart).toLocaleString('en-US');
    if (decimalPart !== undefined) {
      return `${formattedInteger}.${decimalPart}`;
    }
    return formattedInteger;
  }

  function adjustDisplayFontSize() {
    const len = displayResult.textContent.length;
    displayResult.classList.remove('shrunk', 'very-shrunk');
    if (len > 14) {
      displayResult.classList.add('very-shrunk');
    } else if (len > 9) {
      displayResult.classList.add('shrunk');
    }
  }

  function updateDisplay() {
    displayResult.textContent = formatNumber(currentInput);
    adjustDisplayFontSize();

    // Expression display
    let exprText = expressionTokens.map(tok => {
      if (tok === '*') return '×';
      if (tok === '/') return '÷';
      if (tok === '-') return '−';
      if (tok === '+') return '+';
      return tok;
    }).join(' ');

    displayExpression.textContent = exprText;
  }

  function triggerError(msg = 'Error') {
    currentInput = msg;
    displayResult.textContent = msg;
    displayResult.classList.add('error-shake');
    playTone('error');
    setTimeout(() => {
      displayResult.classList.remove('error-shake');
    }, 400);
    isResultCalculated = true;
  }

  // Clean precision issue (e.g. 0.1 + 0.2 = 0.30000000000000004 -> 0.3)
  function cleanFloat(num) {
    if (!isFinite(num)) return num.toString();
    const rounded = parseFloat(num.toPrecision(12));
    return Number(rounded.toString()).toString();
  }

  // Factorial helper
  function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 170) return Infinity; // JS Max precision overflow limit
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  // ==========================================
  // Core Calculator Operations
  // ==========================================
  function inputDigit(digit) {
    playTone('num');
    if (isResultCalculated) {
      currentInput = digit;
      expressionTokens = [];
      isResultCalculated = false;
    } else {
      if (currentInput === '0' || currentInput === '-0') {
        currentInput = (currentInput === '-0' ? '-' : '') + digit;
      } else {
        if (currentInput.replace('-', '').length >= 16) return; // Prevent unreasonable overflow
        currentInput += digit;
      }
    }
    updateDisplay();
  }

  function inputDecimal() {
    playTone('num');
    if (isResultCalculated) {
      currentInput = '0.';
      expressionTokens = [];
      isResultCalculated = false;
    } else {
      if (!currentInput.includes('.')) {
        currentInput += '.';
      }
    }
    updateDisplay();
  }

  function toggleSign() {
    playTone('num');
    if (currentInput === '0' || currentInput === 'Error') return;
    if (currentInput.startsWith('-')) {
      currentInput = currentInput.slice(1);
    } else {
      currentInput = '-' + currentInput;
    }
    updateDisplay();
  }

  function inputPercent() {
    playTone('op');
    const val = parseFloat(currentInput);
    if (!isNaN(val)) {
      currentInput = cleanFloat(val / 100);
      updateDisplay();
    }
  }

  function backspace() {
    playTone('num');
    if (isResultCalculated || currentInput === 'Error') {
      currentInput = '0';
      isResultCalculated = false;
    } else {
      if (currentInput.length > 1) {
        if (currentInput.length === 2 && currentInput.startsWith('-')) {
          currentInput = '0';
        } else {
          currentInput = currentInput.slice(0, -1);
        }
      } else {
        currentInput = '0';
      }
    }
    updateDisplay();
  }

  function clearEntry() {
    playTone('clear');
    currentInput = '0';
    updateDisplay();
  }

  function clearAll() {
    playTone('clear');
    currentInput = '0';
    expressionTokens = [];
    isResultCalculated = false;
    updateDisplay();
  }

  function handleOperator(op) {
    playTone('op');
    if (currentInput === 'Error') return;

    if (isResultCalculated) {
      expressionTokens = [currentInput, op];
      isResultCalculated = false;
      currentInput = '0';
    } else {
      // If we haven't typed a new number, replace previous operator
      if (currentInput === '0' && expressionTokens.length > 0 && ['+', '-', '*', '/', '^'].includes(expressionTokens[expressionTokens.length - 1])) {
        expressionTokens[expressionTokens.length - 1] = op;
      } else {
        expressionTokens.push(currentInput);
        expressionTokens.push(op);
        currentInput = '0';
      }
    }
    updateDisplay();
  }

  function handleBracket(type) {
    playTone('op');
    if (type === '(') {
      if (currentInput !== '0' && !isResultCalculated) {
        expressionTokens.push(currentInput);
        expressionTokens.push('*');
      }
      expressionTokens.push('(');
      currentInput = '0';
      isResultCalculated = false;
    } else if (type === ')') {
      if (currentInput !== '0' || expressionTokens.length > 0) {
        if (currentInput !== '0') {
          expressionTokens.push(currentInput);
        }
        expressionTokens.push(')');
        currentInput = '0';
      }
    }
    updateDisplay();
  }

  // ==========================================
  // Scientific Math Functions
  // ==========================================
  function applyScientificFunction(action) {
    playTone('op');
    let val = parseFloat(currentInput);
    if (isNaN(val)) return;

    let res = null;
    let toRad = (angleMode === 'DEG') ? (Math.PI / 180) : 1;
    let fromRad = (angleMode === 'DEG') ? (180 / Math.PI) : 1;

    switch (action) {
      case 'deg-rad':
        angleMode = (angleMode === 'DEG') ? 'RAD' : 'DEG';
        angleModeIndicator.textContent = angleMode;
        btnDegRad.textContent = angleMode;
        return;
      case 'sin':
        res = Math.sin(val * toRad);
        break;
      case 'cos':
        res = Math.cos(val * toRad);
        // Clean close to 0 precision issue like cos(90 deg)
        if (Math.abs(res) < 1e-15) res = 0;
        break;
      case 'tan':
        if (angleMode === 'DEG' && Math.abs(val % 180) === 90) {
          triggerError('Undefined');
          return;
        }
        res = Math.tan(val * toRad);
        break;
      case 'asin':
        if (val < -1 || val > 1) {
          triggerError('Invalid Input');
          return;
        }
        res = Math.asin(val) * fromRad;
        break;
      case 'acos':
        if (val < -1 || val > 1) {
          triggerError('Invalid Input');
          return;
        }
        res = Math.acos(val) * fromRad;
        break;
      case 'atan':
        res = Math.atan(val) * fromRad;
        break;
      case 'ln':
        if (val <= 0) {
          triggerError('Invalid Input');
          return;
        }
        res = Math.log(val);
        break;
      case 'log':
        if (val <= 0) {
          triggerError('Invalid Input');
          return;
        }
        res = Math.log10(val);
        break;
      case 'pi':
        currentInput = cleanFloat(Math.PI);
        updateDisplay();
        return;
      case 'e':
        currentInput = cleanFloat(Math.E);
        updateDisplay();
        return;
      case 'factorial':
        if (val < 0 || !Number.isInteger(val)) {
          triggerError('Invalid Input');
          return;
        }
        res = factorial(val);
        break;
      case 'pow':
        handleOperator('^');
        return;
      case 'square':
        res = Math.pow(val, 2);
        break;
      case 'cube':
        res = Math.pow(val, 3);
        break;
      case 'sqrt':
        if (val < 0) {
          triggerError('Invalid Input');
          return;
        }
        res = Math.sqrt(val);
        break;
      case 'cbrt':
        res = Math.cbrt(val);
        break;
      case 'inv':
        if (val === 0) {
          triggerError('Cannot divide by 0');
          return;
        }
        res = 1 / val;
        break;
      case 'abs':
        res = Math.abs(val);
        break;
      case 'exp':
        res = Math.exp(val);
        break;
      default:
        return;
    }

    if (res !== null) {
      if (isNaN(res) || !isFinite(res)) {
        triggerError('Error');
      } else {
        currentInput = cleanFloat(res);
        isResultCalculated = true;
        updateDisplay();
      }
    }
  }

  // ==========================================
  // Safe Mathematical Expression Parser
  // Shunting-Yard Algorithm & RPN Evaluator
  // ==========================================
  function evaluateExpression() {
    if (currentInput === 'Error') return;

    let tokens = [...expressionTokens];
    if (!isResultCalculated || tokens.length === 0) {
      tokens.push(currentInput);
    }

    if (tokens.length === 0) return;

    // Remove dangling operators at the end
    while (tokens.length > 0 && ['+', '-', '*', '/', '^'].includes(tokens[tokens.length - 1])) {
      tokens.pop();
    }

    if (tokens.length === 0) return;

    const originalExprString = tokens.map(t => {
      if (t === '*') return '×';
      if (t === '/') return '÷';
      if (t === '-') return '−';
      return t;
    }).join(' ');

    try {
      const resultVal = computeRPN(convertToRPN(tokens));
      if (isNaN(resultVal) || !isFinite(resultVal)) {
        triggerError(resultVal === Infinity || resultVal === -Infinity ? 'Cannot divide by 0' : 'Error');
        return;
      }

      playTone('equals');
      const finalResultStr = cleanFloat(resultVal);

      // Save to History
      addHistoryItem(originalExprString, finalResultStr);

      displayExpression.textContent = `${originalExprString} =`;
      currentInput = finalResultStr;
      expressionTokens = [];
      isResultCalculated = true;
      adjustDisplayFontSize();
      displayResult.textContent = formatNumber(finalResultStr);
    } catch (e) {
      triggerError('Invalid Expression');
    }
  }

  function getPrecedence(op) {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    if (op === '^') return 3;
    return 0;
  }

  function convertToRPN(tokens) {
    const outputQueue = [];
    const opStack = [];

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      if (!isNaN(parseFloat(tok))) {
        outputQueue.push(parseFloat(tok));
      } else if (tok === '(') {
        opStack.push(tok);
      } else if (tok === ')') {
        while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
          outputQueue.push(opStack.pop());
        }
        if (opStack.length > 0 && opStack[opStack.length - 1] === '(') {
          opStack.pop();
        }
      } else if (['+', '-', '*', '/', '^'].includes(tok)) {
        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1] !== '(' &&
          (getPrecedence(opStack[opStack.length - 1]) > getPrecedence(tok) ||
            (getPrecedence(opStack[opStack.length - 1]) === getPrecedence(tok) && tok !== '^'))
        ) {
          outputQueue.push(opStack.pop());
        }
        opStack.push(tok);
      }
    }

    while (opStack.length > 0) {
      const op = opStack.pop();
      if (op !== '(' && op !== ')') {
        outputQueue.push(op);
      }
    }

    return outputQueue;
  }

  function computeRPN(rpn) {
    const stack = [];
    for (let i = 0; i < rpn.length; i++) {
      const item = rpn[i];
      if (typeof item === 'number') {
        stack.push(item);
      } else {
        const b = stack.pop();
        const a = stack.pop();
        if (a === undefined || b === undefined) {
          throw new Error('Malformed Expression');
        }
        let res = 0;
        switch (item) {
          case '+': res = a + b; break;
          case '-': res = a - b; break;
          case '*': res = a * b; break;
          case '/':
            if (b === 0) throw new Error('Division by zero');
            res = a / b;
            break;
          case '^': res = Math.pow(a, b); break;
          default: throw new Error('Unknown operator');
        }
        stack.push(res);
      }
    }
    if (stack.length !== 1) throw new Error('Malformed Expression');
    return stack[0];
  }

  // ==========================================
  // Memory Management
  // ==========================================
  function handleMemory(action) {
    playTone('op');
    const val = parseFloat(currentInput);
    switch (action) {
      case 'MC':
        memoryValue = 0;
        memoryIndicator.classList.remove('active');
        break;
      case 'MR':
        currentInput = cleanFloat(memoryValue);
        isResultCalculated = true;
        updateDisplay();
        break;
      case 'M+':
        if (!isNaN(val)) {
          memoryValue += val;
          memoryIndicator.classList.add('active');
        }
        break;
      case 'M-':
        if (!isNaN(val)) {
          memoryValue -= val;
          memoryIndicator.classList.add('active');
        }
        break;
      case 'MS':
        if (!isNaN(val)) {
          memoryValue = val;
          memoryIndicator.classList.add('active');
        }
        break;
    }
  }

  // ==========================================
  // History Drawer & Persistence
  // ==========================================
  function loadHistory() {
    try {
      const saved = localStorage.getItem('novacalc_history');
      if (saved) {
        history = JSON.parse(saved);
        renderHistory();
      }
    } catch (e) {
      history = [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem('novacalc_history', JSON.stringify(history));
    } catch (e) {}
  }

  function addHistoryItem(expr, res) {
    const item = {
      id: Date.now().toString(),
      expression: expr,
      result: res,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    history.unshift(item);
    if (history.length > 50) history.pop(); // Max 50 items
    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      emptyHistory.style.display = 'flex';
      historyBadge.classList.add('hidden');
      historyList.innerHTML = '';
      historyList.appendChild(emptyHistory);
      return;
    }

    emptyHistory.style.display = 'none';
    historyBadge.textContent = history.length;
    historyBadge.classList.remove('hidden');

    historyList.innerHTML = '';
    history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-item';
      card.innerHTML = `
        <div class="history-item-top">
          <span class="history-expr">${escapeHTML(item.expression)} =</span>
          <span class="history-timestamp">${item.time}</span>
        </div>
        <div class="history-res">${escapeHTML(formatNumber(item.result))}</div>
      `;
      card.addEventListener('click', () => {
        playTone('num');
        currentInput = item.result;
        isResultCalculated = true;
        updateDisplay();
        closeHistoryDrawer();
      });
      historyList.appendChild(card);
    });
  }

  function clearAllHistory() {
    playTone('clear');
    history = [];
    saveHistory();
    renderHistory();
  }

  function openHistoryDrawer() {
    historyDrawer.classList.add('open');
    historyDrawer.setAttribute('aria-hidden', 'false');
    drawerOverlay.classList.add('active');
  }

  function closeHistoryDrawer() {
    historyDrawer.classList.remove('open');
    historyDrawer.setAttribute('aria-hidden', 'true');
    drawerOverlay.classList.remove('active');
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // ==========================================
  // Clipboard Copy Functionality
  // ==========================================
  function copyToClipboard() {
    const textToCopy = displayResult.textContent.replace(/,/g, '');
    navigator.clipboard.writeText(textToCopy).then(() => {
      playTone('equals');
      copyTooltip.classList.add('show');
      setTimeout(() => {
        copyTooltip.classList.remove('show');
      }, 1600);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyTooltip.classList.add('show');
      setTimeout(() => copyTooltip.classList.remove('show'), 1600);
    });
  }

  // ==========================================
  // Theme Switcher & Settings
  // ==========================================
  function setTheme(theme) {
    currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('novacalc_theme', theme);
    } catch (e) {}

    // Update active check in menu
    document.querySelectorAll('.theme-opt').forEach(opt => {
      if (opt.getAttribute('data-set-theme') === theme) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  function loadSettings() {
    try {
      const savedTheme = localStorage.getItem('novacalc_theme');
      if (savedTheme) setTheme(savedTheme);

      const savedSound = localStorage.getItem('novacalc_sound');
      if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
        updateSoundIcons();
      }
    } catch (e) {}
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    try {
      localStorage.setItem('novacalc_sound', soundEnabled.toString());
    } catch (e) {}
    updateSoundIcons();
    if (soundEnabled) playTone('num');
  }

  function updateSoundIcons() {
    if (soundEnabled) {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
    } else {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
    }
  }

  // ==========================================
  // Mode Switcher (Standard vs Scientific)
  // ==========================================
  function setMode(mode) {
    playTone('num');
    if (mode === 'scientific') {
      mainContainer.classList.add('expanded');
      scientificGrid.classList.remove('hidden');
      modePillContainer.classList.add('scientific-active');
      tabScientific.classList.add('active');
      tabStandard.classList.remove('active');
    } else {
      mainContainer.classList.remove('expanded');
      scientificGrid.classList.add('hidden');
      modePillContainer.classList.remove('scientific-active');
      tabStandard.classList.add('active');
      tabScientific.classList.remove('active');
    }
  }

  // ==========================================
  // Event Delegation & Click Handlers
  // ==========================================
  function setupEventListeners() {
    // Mode tabs
    tabStandard.addEventListener('click', () => setMode('standard'));
    tabScientific.addEventListener('click', () => setMode('scientific'));

    // Sound toggle
    soundToggleBtn.addEventListener('click', toggleSound);

    // Theme dropdown
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.theme-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(btn.getAttribute('data-set-theme'));
        themeMenu.classList.add('hidden');
      });
    });

    document.addEventListener('click', (e) => {
      if (!themeMenu.contains(e.target) && e.target !== themeBtn) {
        themeMenu.classList.add('hidden');
      }
    });

    // History controls
    historyToggleBtn.addEventListener('click', openHistoryDrawer);
    closeHistoryBtn.addEventListener('click', closeHistoryDrawer);
    drawerOverlay.addEventListener('click', closeHistoryDrawer);
    clearHistoryBtn.addEventListener('click', clearAllHistory);

    // Copy result
    copyBtn.addEventListener('click', copyToClipboard);

    // Memory toolbar buttons
    document.querySelectorAll('.mem-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        handleMemory(btn.getAttribute('data-mem'));
      });
    });

    // Keypad Clicks
    document.getElementById('calculator-card').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const num = btn.getAttribute('data-num');
      const op = btn.getAttribute('data-op');
      const action = btn.getAttribute('data-action');

      if (num !== null) {
        inputDigit(num);
      } else if (op !== null) {
        handleOperator(op);
      } else if (action !== null) {
        switch (action) {
          case 'decimal': inputDecimal(); break;
          case 'negate': toggleSign(); break;
          case 'percent': inputPercent(); break;
          case 'backspace': backspace(); break;
          case 'clear-entry': clearEntry(); break;
          case 'clear-all': clearAll(); break;
          case 'calculate': evaluateExpression(); break;
          case 'bracket-open': handleBracket('('); break;
          case 'bracket-close': handleBracket(')'); break;
          default:
            // Scientific function action
            applyScientificFunction(action);
            break;
        }
      }
    });

    // ==========================================
    // Keyboard Event Listener
    // ==========================================
    window.addEventListener('keydown', (e) => {
      // Don't trigger if user is in an input or modal
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key;
      let targetBtn = null;

      if (key >= '0' && key <= '9') {
        inputDigit(key);
        targetBtn = document.getElementById(`btn-${key}`);
      } else if (key === '.') {
        inputDecimal();
        targetBtn = document.getElementById('btn-decimal');
      } else if (key === '+') {
        handleOperator('+');
        targetBtn = document.getElementById('btn-add');
      } else if (key === '-') {
        handleOperator('-');
        targetBtn = document.getElementById('btn-subtract');
      } else if (key === '*' || key === 'x') {
        handleOperator('*');
        targetBtn = document.getElementById('btn-multiply');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('/');
        targetBtn = document.getElementById('btn-divide');
      } else if (key === '%') {
        inputPercent();
        targetBtn = document.getElementById('btn-percent');
      } else if (key === '(') {
        handleBracket('(');
        targetBtn = document.getElementById('btn-open-bracket');
      } else if (key === ')') {
        handleBracket(')');
        targetBtn = document.getElementById('btn-close-bracket');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        evaluateExpression();
        targetBtn = document.getElementById('btn-equals');
      } else if (key === 'Backspace') {
        backspace();
        targetBtn = document.getElementById('btn-backspace');
      } else if (key === 'Escape') {
        clearAll();
        targetBtn = document.getElementById('btn-clear-all');
      } else if (key === 'Delete') {
        clearEntry();
        targetBtn = document.getElementById('btn-clear-entry');
      } else if (key === '^') {
        handleOperator('^');
      }

      // Add visual active state on keypress
      if (targetBtn) {
        targetBtn.classList.add('pressed');
        setTimeout(() => targetBtn.classList.remove('pressed'), 120);
      }
    });
  }

  // ==========================================
  // Initialization
  // ==========================================
  function init() {
    loadSettings();
    loadHistory();
    setupEventListeners();
    updateDisplay();
  }

  init();
})();
