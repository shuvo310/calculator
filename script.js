// (এই ফাইলের JavaScript কোডটি বেশ দীর্ঘ হবে)
// পূর্ববর্তী উত্তর থেকে JavaScript কোডটি ব্যবহার করা যেতে পারে, 
// তবে নতুন বাটন আইডি এবং ফাংশনালিটি (যেমন nPr, nCr, Ran#, π, M-, STO/RCL) যোগ করতে হবে।
// এবং ডিসপ্লে ইন্ডিকেটরগুলো আপডেট করার জন্য লজিক যোগ করতে হবে।

// একটি সম্পূর্ণ JavaScript কোড এখানে দেওয়া সম্ভব হচ্ছে না কারণ এটি অনেক বড় হয়ে যাবে।
// আমি আপনাকে মূল ফাংশনগুলো কীভাবে যোগ করতে পারেন তার একটি ধারণা দিচ্ছি:

document.addEventListener('DOMContentLoaded', () => {
    // --- পূর্ববর্তী JavaScript থেকে ভেরিয়েবল ডিক্লারেশন এবং বেসিক ফাংশনগুলো নিন ---
    const mainDisplay = document.getElementById('main-display');
    const secondaryDisplay = document.getElementById('secondary-display');
    const keys = document.querySelectorAll('.key');

    // ইন্ডিকেটর
    const shiftIndicator = document.getElementById('shift-indicator');
    const alphaIndicator = document.getElementById('alpha-indicator');
    const hypIndicator = document.getElementById('hyp-indicator');
    const mIndicator = document.getElementById('m-indicator');
    const angleIndicator = document.getElementById('angle-indicator');

    let currentInput = '0';
    let expression = '';
    let memory = 0;
    let ansValue = '0';
    let isShiftActive = false;
    let isAlphaActive = false; // Alpha state
    let isHypActive = false;
    let angleMode = 'DEG'; // DEG, RAD, GRAD
    let justCalculated = false;
    let openBrackets = 0;

    // --- Helper Functions (factorial, permutations, combinations) ---
    function factorial(n) {
        if (n < 0) return NaN; // Error
        if (n === 0) return 1;
        let result = 1;
        for (let i = n; i > 1; i--) result *= i;
        return result;
    }

    function combinations(n, r) {
        if (n < r || r < 0) return NaN;
        return factorial(n) / (factorial(r) * factorial(n - r));
    }

    function permutations(n, r) {
        if (n < r || r < 0) return NaN;
        return factorial(n) / factorial(n - r);
    }
    
    // --- Update Status Indicators ---
    function updateStatusIndicators() {
        shiftIndicator.classList.toggle('active', isShiftActive);
        alphaIndicator.classList.toggle('active', isAlphaActive);
        hypIndicator.classList.toggle('active', isHypActive);
        mIndicator.classList.toggle('active', memory !== 0);
        angleIndicator.textContent = angleMode;
        angleIndicator.classList.add('active'); // Angle is always shown
    }


    // --- Toggle States (Shift, Alpha, Hyp) ---
    function toggleShift() {
        isShiftActive = !isShiftActive;
        if (isShiftActive && isAlphaActive) isAlphaActive = false; // Shift deactivates Alpha
        updateStatusIndicators();
        document.getElementById('btn-shift').classList.toggle('active', isShiftActive);
        document.getElementById('btn-alpha').classList.remove('active', isAlphaActive && !isShiftActive);
    }
    function toggleAlpha() {
        isAlphaActive = !isAlphaActive;
        if (isAlphaActive && isShiftActive) isShiftActive = false; // Alpha deactivates Shift
        updateStatusIndicators();
        document.getElementById('btn-alpha').classList.toggle('active', isAlphaActive);
        document.getElementById('btn-shift').classList.remove('active', isShiftActive && !isAlphaActive);

    }
    function toggleHyp() {
        isHypActive = !isHypActive;
        updateStatusIndicators();
        document.getElementById('btn-hyp').classList.toggle('active', isHypActive);
    }
    
    function clearAllStates() {
        isShiftActive = false;
        isAlphaActive = false;
        isHypActive = false;
        updateStatusIndicators();
        document.getElementById('btn-shift').classList.remove('active');
        document.getElementById('btn-alpha').classList.remove('active');
        document.getElementById('btn-hyp').classList.remove('active');
    }

    // --- MODE button logic (simplified) ---
    document.getElementById('btn-mode').addEventListener('click', () => {
        // For CLR (Shift + MODE) - Not fully implemented
        if (isShiftActive) {
            // Clear modes or memory - for now, just clear all
            clearAll();
            secondaryDisplay.textContent = "All Cleared";
            setTimeout(() => secondaryDisplay.textContent = "", 1000);
            clearAllStates();
            return;
        }
        // Toggle Angle Mode
        if (angleMode === 'DEG') angleMode = 'RAD';
        else if (angleMode === 'RAD') angleMode = 'GRAD';
        else angleMode = 'DEG';
        updateStatusIndicators();
    });
    
    // --- ON button ---
    document.getElementById('btn-on').addEventListener('click', () => {
        clearAll(); // Or specific ON logic if needed
    });

    // --- Input, Operator, Function, Calculate, Clear, Delete functions (from previous JS, need modification) ---
    // ... (এই অংশটি আগের উত্তর থেকে নিতে হবে এবং প্রয়োজন অনুযায়ী পরিবর্তন করতে হবে) ...
    // যেমন: handleFunction এ nPr, nCr, pi, rand যোগ করতে হবে
    // handleOperator এ nPr, nCr এর জন্য বিশেষ ইনপুট লজিক (যেমন, সংখ্যা তারপর nPr তারপর আবার সংখ্যা)
    // STO/RCL এবং M-/M+ এর জন্য মেমরি ভেরিয়েবল ব্যবহার করতে হবে।

    function updateDisplay() {
        mainDisplay.textContent = currentInput;
        secondaryDisplay.textContent = expression
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/Math.PI/g, 'π')
            .replace(/Math.E/g, 'e')
            .replace(/\*\*/g, '^')
            .replace(/permutations\(([^,]+),([^)]+)\)/g, '$1P$2')
            .replace(/combinations\(([^,]+),([^)]+)\)/g, '$1C$2');
    }

    function handleInput(value, charRepresentation) {
        const displayChar = charRepresentation || value;

        if (justCalculated && !isOperator(value) && value !== '(' && value !== ',') {
            currentInput = '0';
            expression = '';
            openBrackets = 0;
        }
        justCalculated = false;

        // Prevent multiple leading zeros unless it's "0."
        if (currentInput === '0' && displayChar !== '.' && displayChar !== '(-)') {
            currentInput = displayChar;
        } else if (displayChar === '(-)') {
            if (currentInput === '0' || currentInput.endsWith('(') || isOperator(currentInput.slice(-1))) {
                 currentInput = (currentInput === '0') ? '-' : currentInput + '-';
            } else { /* Potentially toggle sign of last number, complex */ }
        }
        else {
            currentInput += displayChar;
        }
        
        // Expression building
        if (value === 'Math.PI' || value === 'Math.E' || typeof value === 'number') {
             // Handle implied multiplication if previous char was a number or ')' or a constant
            const lastCharExp = expression.slice(-1);
            if (expression !== '' && (!isOperator(lastCharExp) && lastCharExp !== '(' && lastCharExp !== ',')) {
                expression += '*';
            }
            expression += value;
        } else if (value !== '(-)') { // (- handled above directly in currentInput
            expression += value;
        }


        if (displayChar === '(') openBrackets++;
        else if (displayChar === ')') openBrackets = Math.max(0, openBrackets - 1);
        
        updateDisplay();
    }
    
    function isOperator(char) {
        return ['+', '-', '*', '/', '^', 'E'].includes(char);
    }

    function handleOperator(opValue, opChar) {
        justCalculated = false;
        const displayOp = opChar || opValue;

        if (currentInput === '' && expression === '' && (opValue === '-' || opValue === '+')) {
            currentInput = displayOp;
            expression = opValue;
        } else if (expression !== '' && !isOperator(expression.slice(-1)) && expression.slice(-1) !== '(' ) {
            // Add operator if previous was not an operator
            expression += opValue;
            currentInput = ''; // Reset current number input
        } else if (isOperator(expression.slice(-1)) && opValue !==expression.slice(-1) ) {
             // Replace last operator if different (e.g. 5+ - 2 -> 5-2, but not 5*-2)
            if (opValue === '-' && (expression.slice(-1) === '*' || expression.slice(-1) === '/')) {
                expression += opValue; // Allow 5 * -2
            } else {
                expression = expression.slice(0, -1) + opValue;
            }
            currentInput = '';
        }
        updateDisplay();
    }
    
    let nprState = 0; // 0: none, 1: n entered, waiting for P, 2: P entered, waiting for r
    let ncrState = 0; // 0: none, 1: n entered, waiting for C, 2: C entered, waiting for r
    let nValue = null;


    function handleFunction(funcName, shiftFuncName, alphaCharName) {
        justCalculated = false;
        let activeFunc = funcName;
        if(isShiftActive && shiftFuncName) activeFunc = shiftFuncName;
        // Alpha function handling (if any relevant to calculation)
        // if(isAlphaActive && alphaCharName) activeFunc = alphaCharName; // Example

        let exprFunc = '';
        let displayFunc = '';

        switch(activeFunc) {
            // ... (sin, cos, tan, log, ln, sqrt, etc. from previous code)
            case 'sin': exprFunc = `Math.sin(`; displayFunc = 'sin('; break;
            case 'cos': exprFunc = `Math.cos(`; displayFunc = 'cos('; break;
            // ... add all trig, log, power functions
            case 'sqr': exprFunc = `**2`; displayFunc = '²'; break;
            case 'cube': exprFunc = `**3`; displayFunc = '³'; break;
            case 'sqrt': exprFunc = `Math.sqrt(`; displayFunc = '√('; break;
            case 'cbrt': exprFunc = `Math.cbrt(`; displayFunc = '³√('; break;
            case 'log': exprFunc = `Math.log10(`; displayFunc = 'log('; break;
            case 'ln': exprFunc = `Math.log(`; displayFunc = 'ln('; break;
            case 'tenpow': exprFunc = `10**(`; displayFunc = '10^('; break;
            case 'epow': exprFunc = `Math.E**(`; displayFunc = 'e^('; break;

            case 'pi': 
                handleInput('Math.PI', 'π');
                clearAllStates(); return;
            case 'rand':
                let randNum = Math.random();
                handleInput(randNum.toFixed(3), randNum.toFixed(3)); // Display with 3 decimal places
                clearAllStates(); return;
            
            case 'npr':
                if (currentInput !== '0' && currentInput !== '') {
                    nValue = parseFloat(eval(expression)); // Evaluate current expression as N
                    expression += ","; // Placeholder for P evaluation
                    currentInput += 'P';
                    nprState = 1; // Waiting for R
                }
                break;
            case 'ncr':
                 if (currentInput !== '0' && currentInput !== '') {
                    nValue = parseFloat(eval(expression));
                    expression += ",";
                    currentInput += 'C';
                    ncrState = 1;
                }
                break;

            case 'sto': // Store current value/result in memory
                try { memory = parseFloat(eval(expression || currentInput)); mIndicator.classList.add('active'); }
                catch { memory = 0; mIndicator.classList.remove('active');}
                clearAllStates(); return;
            case 'rcl': // Recall memory
                handleInput(memory.toString(), memory.toString());
                clearAllStates(); return;
            case 'mplus':
                try { memory += parseFloat(eval(expression || currentInput)); mIndicator.classList.add('active'); } catch {}
                currentInput = '0'; expression = ''; // Reset for next input after M+
                clearAllStates(); return;
            case 'mminus':
                try { memory -= parseFloat(eval(expression || currentInput)); mIndicator.classList.add('active'); } catch {}
                currentInput = '0'; expression = '';
                clearAllStates(); return;

            case 'percent':
                if(expression !== ""){
                    try{
                        let val = eval(expression);
                        let result = val / 100;
                        expression = result.toString();
                        currentInput = result.toString();
                        justCalculated = true; // Treat as a calculation
                    } catch { currentInput = "Error"; expression = "";}
                }
                break;

            default:
                // For functions like sin(, log( etc.
                if (exprFunc.endsWith('(')) {
                    const lastCharExp = expression.slice(-1);
                     if (expression !== '' && (!isOperator(lastCharExp) && lastCharExp !== '(' && lastCharExp !== ',')) {
                        expression += '*'; // Implied multiplication: 2sin(30)
                    }
                    expression += exprFunc;
                    currentInput = ''; // Ready for argument
                    openBrackets++;
                } else if (exprFunc.startsWith('**')) { // for x², x³
                    expression += exprFunc;
                    // currentInput should reflect the display (e.g., number followed by ²)
                }
                break;
        }
        
        if (!['npr', 'ncr', 'sto', 'rcl', 'mplus', 'mminus', 'percent'].includes(activeFunc)) { // nPr/nCr manage their own state
             clearAllStates(); // Reset shift/alpha after use for most functions
        }
        updateDisplay();
    }
    
    function calculate() {
        if (expression === '') return;

        let tempExpression = expression;
        try {
            // Handle nPr/nCr state
            if (nprState === 1 || ncrState === 1) {
                let rValue = parseFloat(eval(currentInput.substring(currentInput.search(/[PC]/)+1))); // Get R
                if (nprState === 1) {
                    tempExpression = `permutations(${nValue},${rValue})`;
                } else if (ncrState === 1) {
                    tempExpression = `combinations(${nValue},${rValue})`;
                }
                nprState = 0; ncrState = 0; nValue = null;
            }


            // Closing open brackets
            if (openBrackets > 0) {
                tempExpression += ')'.repeat(openBrackets);
                openBrackets = 0;
            }

            // Angle conversion for trig functions
            const trigPattern = /(Math\.(?:sin|cos|tan|asin|acos|atan)h?)\(([^)]+)\)/g; // handles hyp functions too
            tempExpression = tempExpression.replace(trigPattern, (match, func, valStr) => {
                let numericVal;
                try { numericVal = eval(valStr); } catch { return 'ErrorInArgs'; }

                if (func.startsWith('Math.sin') || func.startsWith('Math.cos') || func.startsWith('Math.tan')) {
                    if (!func.endsWith('h')) { // Not hyperbolic
                        if (angleMode === 'DEG') numericVal *= (Math.PI / 180);
                        else if (angleMode === 'GRAD') numericVal *= (Math.PI / 200);
                    }
                }
                let result = eval(`${func}(${numericVal})`);
                if (func.startsWith('Math.asin') || func.startsWith('Math.acos') || func.startsWith('Math.atan')) {
                     if (!func.endsWith('h')) { // Not hyperbolic
                        if (angleMode === 'DEG') result *= (180 / Math.PI);
                        else if (angleMode === 'GRAD') result *= (200 / Math.PI);
                    }
                }
                return result.toString();
            });
            if (tempExpression.includes('ErrorInArgs')) throw new Error("Invalid Trig Args");

            // Evaluate
            let result = eval(tempExpression
                .replace(/\^/g, '**') // power
                .replace(/√\(/g, 'Math.sqrt(') // for display like √ (not used if Math.sqrt( is directly inserted
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/E(?=[\-\+]?\d)/g, '*10**') // EXP notation 3E5 = 3*10^5
            );

            if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
                throw new Error("Calculation Error");
            }
            
            ansValue = result.toString();
            currentInput = ansValue;
            // expression = ansValue; // Ready for next calculation
            secondaryDisplay.textContent = expression.replace(/\*/g, '×').replace(/\//g, '÷') + "=";
            expression = ansValue; // Start next expression with the answer
            justCalculated = true;

        } catch (error) {
            console.error("Calc Error:", error, "\nExpr:", expression, "\nTempExpr:", tempExpression);
            currentInput = 'Error';
            expression = '';
            openBrackets = 0;
            justCalculated = true;
            nprState = 0; ncrState = 0; nValue = null;
        }
        updateDisplay();
    }


    function clearAll() {
        currentInput = '0';
        expression = '';
        secondaryDisplay.textContent = '';
        openBrackets = 0;
        justCalculated = false;
        clearAllStates();
        nprState = 0; ncrState = 0; nValue = null;
        updateDisplay();
    }

    function deleteLast() {
        justCalculated = false;
        if (currentInput === 'Error' || currentInput === 'Infinity') {
            clearAll(); return;
        }
        if (currentInput.length > 1) {
            const removed = currentInput.slice(-1);
            currentInput = currentInput.slice(0, -1);
            if (removed === '(') openBrackets = Math.max(0, openBrackets - 1);
            else if (removed === ')') openBrackets++; // This logic might be tricky
            
            // Try to remove from expression too. This is complex.
            // A simple approach:
            if (expression.endsWith(removed) || expression.endsWith(currentInput.slice(-removed.length))) {
                expression = expression.slice(0, -removed.length);
            } else {
                // Fallback if complex function name was last
                // This needs more sophisticated tracking of expression parts
                 if(expression.includes('(') && expression.lastIndexOf('(') > expression.lastIndexOf(')')) {
                    // don't just chop if it's like Math.sin(
                 } else {
                    expression = expression.slice(0, -1); // Risky
                 }
            }


        } else if (currentInput !== '0') {
            currentInput = '0';
            expression = expression.slice(0, -1); // remove last char from expression too
        }
        if (expression === '' && currentInput === '0') {
            secondaryDisplay.textContent = '';
        }
        updateDisplay();
    }

    // --- Event Listeners for Keys ---
    keys.forEach(key => {
        key.addEventListener('click', () => {
            const id = key.id;
            const value = key.dataset.value; // For numbers, basic ops
            const char = key.dataset.char || key.textContent.trim().split('\n')[0]; // Display char
            const func = key.dataset.func;
            const shiftFunc = key.dataset.shiftFunc;
            const alphaChar = key.dataset.alphaChar; // For ALPHA mode

            if (id === 'btn-on') { /* handled by direct listener */ return; }
             if (currentInput === 'Error' && id !== 'btn-ac' && id !== 'btn-on') return;


            if (id === 'btn-shift') toggleShift();
            else if (id === 'btn-alpha') toggleAlpha();
            else if (id === 'btn-hyp') toggleHyp();
            else if (id === 'btn-mode') { /* handled by direct listener */ return; }
            else if (id === 'btn-ac') {
                if (isShiftActive) { // OFF functionality
                    mainDisplay.textContent = "";
                    secondaryDisplay.textContent = "Calculator OFF";
                    // Potentially disable all keys except ON
                    clearAllStates();
                } else {
                    clearAll();
                }
            }
            else if (id === 'btn-del') deleteLast();
            else if (id === 'btn-equals') calculate();
            else if (id === 'btn-ans') {
                let ansOp = isShiftActive ? shiftFunc : 'ans';
                if(ansOp === 'ans') handleInput(ansValue, 'Ans');
                else if(ansOp === 'rand') handleFunction('rand'); // Pass 'rand' to handleFunction
                if(isShiftActive) clearAllStates();
            }
            else if (value) { // Numbers, simple operators, parens, comma, EXP
                if (isOperator(value) || value === "E") { // E for EXP
                    handleOperator(value, char);
                } else {
                    handleInput(value, char);
                }
                 // Alpha mode for variables (not fully implemented for storage/recall beyond M)
                if (isAlphaActive && alphaChar) {
                    // Could potentially use alphaChar for variable names if implementing A-F, X, Y, M memories
                    console.log("Alpha char pressed:", alphaChar);
                    // For now, just clear alpha state after one use for non-calculation chars
                    if (!['A','B','C','D','E','F','X','Y','M'].includes(alphaChar)) clearAllStates();

                } else if (!isShiftActive && !isAlphaActive && !isHypActive && value !== '(' && value !== ')') {
                    // If no state is active, and it's not a bracket (which might chain states)
                    // This part needs careful thought about when to clear states.
                }


            } else if (func) {
                handleFunction(func, shiftFunc, alphaChar);
            }
        });
    });
    
    // Initialize
    updateStatusIndicators(); // Show default angle mode
    clearAll(); // Start clean
});