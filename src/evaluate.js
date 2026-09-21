// Recursive-descent parser: brackets > unary minus > % > * / > + -
// Grammar:
//   expr    = term (("+" | "-") term)*
//   term    = unary (("*" | "/") unary)*
//   unary   = ("-" | "+") unary | postfix
//   postfix = primary "%"*
//   primary = number | "(" expr ")"

const OPS = { "×": "*", "÷": "/", "−": "-", "x": "*", "X": "*" };

function tokenize(input) {
  const src = input.replace(/\s+/g, "");
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = OPS[src[i]] ?? src[i];
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < src.length && /[0-9.]/.test(src[i])) num += src[i++];
      if ((num.match(/\./g) || []).length > 1 || num === ".")
        throw new Error("Invalid number");
      tokens.push({ type: "num", value: parseFloat(num) });
    } else if ("+-*/()%".includes(ch)) {
      tokens.push({ type: ch });
      i++;
    } else {
      throw new Error(`Unexpected character "${src[i]}"`);
    }
  }
  return tokens;
}

export function evaluate(input) {
  const tokens = tokenize(input);
  if (!tokens.length) throw new Error("Enter an expression");
  let pos = 0;
  const peek = () => tokens[pos]?.type;

  function expr() {
    let left = term();
    while (peek() === "+" || peek() === "-") {
      const op = tokens[pos++].type;
      const right = term();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }
  function term() {
    let left = unary();
    while (peek() === "*" || peek() === "/") {
      const op = tokens[pos++].type;
      const right = unary();
      if (op === "/" && right === 0) throw new Error("Cannot divide by zero");
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }
  function unary() {
    if (peek() === "-") { pos++; return -unary(); }
    if (peek() === "+") { pos++; return unary(); }
    return postfix();
  }
  function postfix() {
    let v = primary();
    while (peek() === "%") { pos++; v = v / 100; }
    return v;
  }
  function primary() {
    const t = tokens[pos];
    if (!t) throw new Error("Incomplete expression");
    if (t.type === "num") { pos++; return t.value; }
    if (t.type === "(") {
      pos++;
      const v = expr();
      if (peek() !== ")") throw new Error("Missing closing bracket");
      pos++;
      return v;
    }
    if (t.type === ")") throw new Error("Unexpected closing bracket");
    throw new Error("Invalid expression");
  }

  const result = expr();
  if (pos < tokens.length) throw new Error("Invalid expression");
  if (!Number.isFinite(result)) throw new Error("Result is too large");
  return parseFloat(result.toPrecision(12)); // hides 0.1 + 0.2 float noise
}
