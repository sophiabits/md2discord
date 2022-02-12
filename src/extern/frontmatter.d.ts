declare module 'frontmatter' {
  interface Frontmatter {
    data: any;
    content: string;
  }

  function parse(text: string): Frontmatter;

  export = parse;
}
