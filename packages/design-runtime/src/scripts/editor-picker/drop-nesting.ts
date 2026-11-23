const nonContainerTags: Record<string, boolean> = {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
  canvas: true,
  iframe: true,
  option: true,
  script: true,
  select: true,
  style: true,
  textarea: true,
  title: true,
  video: true,
  audio: true,
  path: true,
  circle: true,
  rect: true,
  line: true,
  ellipse: true,
  polygon: true,
  polyline: true,
  use: true,
};
export const forbiddenInParagraph: Record<string, boolean> = {
  address: true,
  article: true,
  aside: true,
  blockquote: true,
  details: true,
  div: true,
  dl: true,
  fieldset: true,
  figcaption: true,
  figure: true,
  footer: true,
  form: true,
  h1: true,
  h2: true,
  h3: true,
  h4: true,
  h5: true,
  h6: true,
  header: true,
  hgroup: true,
  hr: true,
  main: true,
  menu: true,
  nav: true,
  ol: true,
  p: true,
  pre: true,
  section: true,
  table: true,
  ul: true,
};
const headingTags: Record<string, boolean> = {
  h1: true,
  h2: true,
  h3: true,
  h4: true,
  h5: true,
  h6: true,
};
const requiredTableParents: Record<string, Record<string, boolean>> = {
  tr: {
    thead: true,
    tbody: true,
    tfoot: true,
    table: true,
  },
  td: {
    tr: true,
  },
  th: {
    tr: true,
  },
  thead: {
    table: true,
  },
  tbody: {
    table: true,
  },
  tfoot: {
    table: true,
  },
  caption: {
    table: true,
  },
  colgroup: {
    table: true,
  },
  col: {
    colgroup: true,
  },
};
export const allowedTableChildren: Record<string, Record<string, boolean>> = {
  table: {
    caption: true,
    colgroup: true,
    thead: true,
    tbody: true,
    tfoot: true,
    tr: true,
  },
  thead: {
    tr: true,
  },
  tbody: {
    tr: true,
  },
  tfoot: {
    tr: true,
  },
  tr: {
    td: true,
    th: true,
  },
  colgroup: {
    col: true,
  },
};
const phrasingContainers: Record<string, boolean> = {
  span: true,
  a: true,
  b: true,
  i: true,
  em: true,
  strong: true,
  u: true,
  s: true,
  small: true,
  sub: true,
  sup: true,
  code: true,
  label: true,
  button: true,
  abbr: true,
  cite: true,
  q: true,
  mark: true,
  time: true,
  kbd: true,
  samp: true,
  var: true,
  h1: true,
  h2: true,
  h3: true,
  h4: true,
  h5: true,
  h6: true,
};
const blockTags: Record<string, boolean> = {
  address: true,
  article: true,
  aside: true,
  blockquote: true,
  details: true,
  div: true,
  dl: true,
  fieldset: true,
  figcaption: true,
  figure: true,
  footer: true,
  form: true,
  h1: true,
  h2: true,
  h3: true,
  h4: true,
  h5: true,
  h6: true,
  header: true,
  hgroup: true,
  hr: true,
  main: true,
  menu: true,
  nav: true,
  ol: true,
  p: true,
  pre: true,
  section: true,
  table: true,
  ul: true,
  li: true,
  dt: true,
  dd: true,
};

export function canContainElements(element: Element) {
  return !nonContainerTags[(element.tagName || "").toLowerCase()];
}

export function permitsElementNesting(parent?: string | null, child?: string | null) {
  const container = (parent || "").toLowerCase();
  const content = (child || "").toLowerCase();
  const requiredParents = requiredTableParents[content];
  const allowedChildren = allowedTableChildren[container];
  return !(
    nonContainerTags[container] ||
    (container === "p" && forbiddenInParagraph[content]) ||
    (phrasingContainers[container] && blockTags[content]) ||
    (headingTags[container] && headingTags[content]) ||
    (container === content && ["a", "form", "button", "label"].includes(container)) ||
    (requiredParents && !requiredParents[container]) ||
    (allowedChildren && !allowedChildren[content])
  );
}
