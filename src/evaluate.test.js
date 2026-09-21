import { evaluate } from "./evaluate.js";

const cases = [
  ["2+3×4", 14], ["(2+3)×4", 20], ["10÷4", 2.5], ["0.1+0.2", 0.3],
  ["-5+2", -3], ["2×-3", -6], ["--4", 4], ["50%", 0.5], ["200×10%", 20],
  ["((1+2)×(3+4))÷7", 3], ["2−3−4", -5],
];
const errors = ["5÷0", "5÷(2−2)", "2+", "(2+3", "2+3)", "1.2.3", "abc", ""];

let failed = 0;
for (const [expr, want] of cases) {
  const got = evaluate(expr);
  if (got !== want) { failed++; console.error(`FAIL ${expr}: got ${got}, want ${want}`); }
}
for (const expr of errors) {
  try { evaluate(expr); failed++; console.error(`FAIL ${expr}: expected an error`); } catch {}
}
console.log(failed ? `${failed} test(s) failed` : "All tests passed");
process.exit(failed ? 1 : 0);
