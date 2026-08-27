/**
 * Safe arithmetic evaluator. No eval(), no Function(), no identifiers
 * except a small constant/function allowlist.
 */

const MAX_EXPRESSION_LENGTH = 200;
const MAX_NODES = 64;

export type CalculatorOutcome =
  | { ok: true; value: number }
  | { ok: false; message: string };

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const FUNCTIONS: Record<string, (...values: number[]) => number> = {
  abs: (value) => Math.abs(value),
  sqrt: (value) => Math.sqrt(value),
  round: (value) => Math.round(value),
  floor: (value) => Math.floor(value),
  ceil: (value) => Math.ceil(value),
  min: (...values) => Math.min(...values),
  max: (...values) => Math.max(...values),
};

type Token =
  | { type: "number"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" };

function tokenize(input: string): Token[] | CalculatorOutcome {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    if (char === " " || char === "\t" || char === "\n") {
      index += 1;
      continue;
    }

    if (char >= "0" && char <= "9") {
      let end = index;
      while (end < input.length && /[0-9.]/.test(input[end])) {
        end += 1;
      }
      const raw = input.slice(index, end);
      if ((raw.match(/\./g) ?? []).length > 1) {
        return { ok: false, message: "Invalid number." };
      }
      const value = Number(raw);
      if (!Number.isFinite(value)) {
        return { ok: false, message: "Invalid number." };
      }
      tokens.push({ type: "number", value });
      index = end;
      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      let end = index;
      while (end < input.length && /[a-zA-Z]/.test(input[end])) {
        end += 1;
      }
      tokens.push({
        type: "ident",
        value: input.slice(index, end).toLowerCase(),
      });
      index = end;
      continue;
    }

    if ("+-*/%^".includes(char)) {
      tokens.push({ type: "op", value: char });
      index += 1;
      continue;
    }

    if (char === "(") {
      tokens.push({ type: "lparen" });
      index += 1;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: "rparen" });
      index += 1;
      continue;
    }

    if (char === ",") {
      tokens.push({ type: "comma" });
      index += 1;
      continue;
    }

    return { ok: false, message: "Unsupported character in expression." };
  }

  return tokens;
}

class Parser {
  private index = 0;
  private nodes = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): CalculatorOutcome {
    try {
      const value = this.expr();
      if (this.index !== this.tokens.length) {
        return { ok: false, message: "Unexpected extra input." };
      }
      if (!Number.isFinite(value)) {
        return { ok: false, message: "Result is not a finite number." };
      }
      return { ok: true, value };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error ? error.message : "Invalid expression.",
      };
    }
  }

  private bump() {
    this.nodes += 1;
    if (this.nodes > MAX_NODES) {
      throw new Error("Expression is too complex.");
    }
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private eat(): Token {
    const token = this.tokens[this.index];
    if (!token) {
      throw new Error("Unexpected end of expression.");
    }
    this.index += 1;
    return token;
  }

  private peekOp(): string | undefined {
    const token = this.peek();
    return token?.type === "op" ? token.value : undefined;
  }

  private eatOp(): string {
    const token = this.eat();
    if (token.type !== "op") {
      throw new Error("Expected operator.");
    }
    return token.value;
  }

  private expr(): number {
    this.bump();
    let value = this.term();
    while (this.peekOp() === "+" || this.peekOp() === "-") {
      const op = this.eatOp();
      const right = this.term();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  private term(): number {
    this.bump();
    let value = this.power();
    while (
      this.peekOp() === "*" ||
      this.peekOp() === "/" ||
      this.peekOp() === "%"
    ) {
      const op = this.eatOp();
      const right = this.power();
      if (op === "/" && right === 0) {
        throw new Error("Division by zero.");
      }
      if (op === "%" && right === 0) {
        throw new Error("Division by zero.");
      }
      value = op === "*" ? value * right : op === "/" ? value / right : value % right;
    }
    return value;
  }

  private power(): number {
    this.bump();
    const value = this.unary();
    if (this.peekOp() === "^") {
      this.eatOp();
      const exponent = this.power();
      return value ** exponent;
    }
    return value;
  }

  private unary(): number {
    this.bump();
    if (this.peekOp() === "-") {
      this.eatOp();
      return -this.unary();
    }
    if (this.peekOp() === "+") {
      this.eatOp();
      return this.unary();
    }
    return this.primary();
  }

  private primary(): number {
    this.bump();
    const token = this.peek();

    if (!token) {
      throw new Error("Unexpected end of expression.");
    }

    if (token.type === "number") {
      this.eat();
      return token.value;
    }

    if (token.type === "ident") {
      this.eat();
      if (token.value in CONSTANTS && this.peek()?.type !== "lparen") {
        return CONSTANTS[token.value];
      }

      const fn = FUNCTIONS[token.value];
      if (!fn) {
        throw new Error("Unknown identifier.");
      }

      if (this.peek()?.type !== "lparen") {
        throw new Error("Expected '(' after function name.");
      }
      this.eat();
      const args: number[] = [];
      if (this.peek()?.type !== "rparen") {
        args.push(this.expr());
        while (this.peek()?.type === "comma") {
          this.eat();
          args.push(this.expr());
        }
      }
      if (this.peek()?.type !== "rparen") {
        throw new Error("Expected ')'.");
      }
      this.eat();

      if (
        (token.value === "min" || token.value === "max") &&
        args.length < 2
      ) {
        throw new Error("min/max require at least two arguments.");
      }
      if (token.value !== "min" && token.value !== "max" && args.length !== 1) {
        throw new Error("Function expects one argument.");
      }

      const result = fn(...args);
      if (token.value === "sqrt" && args[0] < 0) {
        throw new Error("Square root of a negative number.");
      }
      return result;
    }

    if (token.type === "lparen") {
      this.eat();
      const value = this.expr();
      if (this.peek()?.type !== "rparen") {
        throw new Error("Expected ')'.");
      }
      this.eat();
      return value;
    }

    throw new Error("Invalid expression.");
  }
}

export function evaluateExpression(raw: string): CalculatorOutcome {
  const expression = raw.trim();

  if (!expression) {
    return { ok: false, message: "Expression is empty." };
  }

  if (expression.length > MAX_EXPRESSION_LENGTH) {
    return { ok: false, message: "Expression is too long." };
  }

  const tokens = tokenize(expression);
  if (!Array.isArray(tokens)) {
    return tokens;
  }

  if (tokens.length === 0) {
    return { ok: false, message: "Expression is empty." };
  }

  return new Parser(tokens).parse();
}
