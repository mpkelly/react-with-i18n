

export type MarkdownRule = {
  pattern: RegExp;
  onMatch(match: RegExpMatchArray): string
};

export const transform = (text: string, rules: MarkdownRule[]): string => {

  rules.forEach((rule) => {
    let match: RegExpExecArray | null;
    const globalSearch = new RegExp(rule.pattern, "g");
    while ((match = globalSearch.exec(text)) !== null) {
      const replacement = rule.onMatch(match);
      text = text.replace(match[0], replacement)
    }
  });

  return text;
}

export const BoldRule: MarkdownRule = {
  pattern: /(\*\*|__)([^_*]*)\1/,
  onMatch: (match) => `<strong>${match[2]}</strong>`
};

export const ItalicRule: MarkdownRule = {
  pattern: /(\*|_)([^_*]*)\1/,
  onMatch: (match) => `<em>${match[2]}</em>`
};

export const StrikethroughRule: MarkdownRule = {
  pattern: /~~(.*?)~~/,
  onMatch: (match) => `<del>${match[1]}</del>`
};

export const InlineCodeRule: MarkdownRule = {
  pattern: /`(.*?)`/,
  onMatch: (match) => `<code>${match[1]}</code>`
};

export const LinkRule: MarkdownRule = {
  // eslint-disable-next-line no-useless-escape
  pattern: /\[([^\[]+)\]\(([^\)]+)\)/,
  onMatch: (match) => `<a href=${match[2]}>${match[1]}</a>`

};

export const DefaultMarkdownRules = [
  BoldRule,
  ItalicRule,
  InlineCodeRule,
  StrikethroughRule,
  LinkRule
];
