type Color = (s: string) => string;

type BackgroundColors = {
  [K in keyof typeof colors as K extends `bg${infer Name}`
    ? Uncapitalize<Name>
    : never]: Color;
};

type ForegroundColors = {
  [K in keyof typeof colors as K extends `bg${string}` | "reset"
    ? never
    : K]: Color;
};

type Colors = ForegroundColors & {
  bold: Color;
  gray: Color;
  bg: BackgroundColors;
};

export const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

export const colorize = (text: string, ...color_codes: string[]): string => {
  return `${color_codes.join("")}${text}${colors.reset}`;
};

const wrap = (code: string) => (text: string) => colorize(text, code);
const create = () => {
  const fg: Record<string, (s: string) => string> = {};
  const bg: Record<string, (s: string) => string> = {};

  for (const [key, value] of Object.entries(colors)) {
    if (key === "reset") continue;

    if (key.startsWith("bg")) {
      const name = key.slice(2);
      const normalized = name.charAt(0).toLowerCase() + name.slice(1);

      bg[normalized] = wrap(value);
      continue;
    }

    fg[key] = wrap(value);
  }

  return {
    ...fg,
    bold: fg.bright,
    gray: fg.dim,
    bg,
  };
};

export const color = create() as Colors;
