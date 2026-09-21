import { useCallback, useEffect, useState } from "react";
import { evaluate } from "./evaluate.js";

const OPERATORS = ["+", "−", "×", "÷"];
const KEYS = [
  { l: "C", a: "clear", c: "fn" }, { l: "( )", a: "bracket", c: "fn" },
  { l: "%", a: "%", c: "fn" }, { l: "÷", a: "÷", c: "op" },
  { l: "7" }, { l: "8" }, { l: "9" }, { l: "×", a: "×", c: "op" },
  { l: "4" }, { l: "5" }, { l: "6" }, { l: "−", a: "−", c: "op" },
  { l: "1" }, { l: "2" }, { l: "3" }, { l: "+", a: "+", c: "op" },
  { l: "±", a: "negate", c: "fn" }, { l: "0" }, { l: ".", a: "." }, { l: "=", a: "equals", c: "eq" },
];

const lastChar = (s) => s[s.length - 1] ?? "";
const currentNumber = (s) => s.match(/[0-9.]*$/)[0];
const count = (s, ch) => s.split(ch).length - 1;

export default function App() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState(null); // last evaluated result
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const preview = (() => {
    if (!expr || error) return "";
    try {
      const v = evaluate(closeBrackets(expr));
      return String(v);
    } catch { return ""; }
  })();

  function closeBrackets(s) {
    return s + ")".repeat(Math.max(0, count(s, "(") - count(s, ")")));
  }

  const press = useCallback((action) => {
    setError("");
    setExpr((prev) => {
      // Start fresh after "=" when typing a number; keep result when typing an operator
      let s = prev;
      const last = lastChar(s);

      if (/^[0-9]$/.test(action)) {
        if (last === ")" || last === "%") return s; // needs an operator first
        if (currentNumber(s) === "0") return s.slice(0, -1) + action; // no leading zeros
        if (currentNumber(s).length >= 15) return s;
        return s + action;
      }
      if (action === ".") {
        if (last === ")" || last === "%") return s;
        const n = currentNumber(s);
        if (n.includes(".")) return s;
        return s + (n === "" ? "0." : ".");
      }
      if (OPERATORS.includes(action)) {
        if (s === "" || last === "(") return action === "−" ? s + "−" : s; // only minus can lead
        if (last === ".") return s;
        if (OPERATORS.includes(last)) {
          if (action === "−" && last !== "−" && OPERATORS.includes(last) && !OPERATORS.includes(s.slice(-2, -1)))
            return s + "−"; // allow 5×−3
          return s.replace(/[+−×÷]+$/, action); // replace trailing operator
        }
        return s + action;
      }
      if (action === "%") {
        if (/[0-9)]$/.test(s)) return s + "%";
        return s;
      }
      if (action === "bracket") {
        const open = count(s, "(") - count(s, ")");
        if (/[0-9)%]$/.test(s) && open > 0) return s + ")";
        if (/[0-9)%]$/.test(s)) return s + "×(";
        return s + "(";
      }
      if (action === "negate") {
        const m = s.match(/(^|[+×÷(])(−?)([0-9.]+%?)$/) || s.match(/(^|[+×÷(−])()$/);
        const match = s.match(/^(.*?)(−?)([0-9.]+%?)$/);
        if (!match) return s;
        const [, head, neg, num] = match;
        if (head && /[0-9)%]$/.test(head)) return head + (neg ? "+" : "−") + num; // a−5 ↔ a+5
        return head + (neg ? "" : "−") + num;
      }
      if (action === "backspace") return s.slice(0, -1);
      if (action === "clear") { setResult(null); return ""; }
      return s;
    });
  }, []);

  const equals = useCallback(() => {
    setExpr((prev) => {
      if (!prev) return prev;
      try {
        const closed = closeBrackets(prev);
        const value = String(evaluate(closed));
        setHistory((h) => [{ id: Date.now(), expr: closed, value }, ...h].slice(0, 50));
        setResult(value);
        return value.replace("-", "−");
      } catch (e) {
        setError(e.message);
        return prev;
      }
    });
  }, []);

  const handleKey = useCallback((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    const map = { "*": "×", "x": "×", "X": "×", "/": "÷", "-": "−", "+": "+", "%": "%", ".": ".", ",": "." };
    if (/^[0-9]$/.test(k)) press(k);
    else if (map[k]) { e.preventDefault(); press(map[k]); }
    else if (k === "(" || k === ")") press("bracket");
    else if (k === "Enter" || k === "=") { e.preventDefault(); equals(); }
    else if (k === "Backspace") press("backspace");
    else if (k === "Escape" || k === "Delete") press("clear");
  }, [press, equals]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const onKey = (k) => (k.a === "equals" ? equals() : press(k.a ?? k.l));

  return (
    <main className="app">
      <section className="calc" aria-label="Calculator">
        <div className="display" role="status" aria-live="polite">
          <div className={`expr ${expr.length > 16 ? "small" : ""}`}>{expr || "0"}</div>
          <div className={`sub ${error ? "err" : ""}`}>
            {error || (preview && preview !== expr.replace("−", "-") ? `= ${preview.replace("-", "−")}` : "\u00A0")}
          </div>
        </div>
        <div className="toolbar">
          <button className="ghost" onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory}>
            History{history.length ? ` (${history.length})` : ""}
          </button>
          <button className="ghost" onClick={() => press("backspace")} aria-label="Backspace">⌫ Backspace</button>
        </div>
        <div className="keys">
          {KEYS.map((k) => (
            <button key={k.l} className={`key ${k.c ?? "num"}`} onClick={() => onKey(k)}>
              {k.l}
            </button>
          ))}
        </div>
      </section>

      <aside className={`history ${showHistory ? "open" : ""}`} aria-label="Calculation history">
        <header>
          <h2>History</h2>
          <button className="ghost" onClick={() => setHistory([])} disabled={!history.length}>Clear history</button>
        </header>
        {history.length === 0 ? (
          <p className="empty">Results you calculate will be listed here. Press = to save one.</p>
        ) : (
          <ul>
            {history.map((h) => (
              <li key={h.id}>
                <button onClick={() => { setExpr(h.value.replace("-", "−")); setError(""); setShowHistory(false); }}>
                  <span className="h-expr">{h.expr}</span>
                  <span className="h-val">= {h.value.replace("-", "−")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </main>
  );
}
