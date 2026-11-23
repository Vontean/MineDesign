/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var isDirectiveElement: Dynamic;
var directiveParent: Dynamic;
var ModelDomTextSubscribers: Dynamic;
var ModelDomTextSplitValue: Dynamic;
var fontInheritanceProperties: Dynamic;
var ModelDomTextH1H2H3Config: Dynamic;
var ModelDomTextButtonInputPattern: Dynamic;
var ModelDomTextRegistry: Dynamic;
function editorAssert(
  condition?: Dynamic,
  message?: Dynamic,
  ...details: Dynamic[]
): Dynamic {
  condition || console.error(`[dc-editor] ${message}`, ...details);
}
function hasOnlyDirectText(element?: Dynamic): Dynamic {
  let hasText: Dynamic = false;
  for (let childNode of element.childNodes as Dynamic) {
    if (childNode.nodeType === Node.ELEMENT_NODE) return false;
    childNode.nodeType === Node.TEXT_NODE &&
      (childNode.nodeValue ?? "").trim().length > 0 &&
      (hasText = true);
  }
  return hasText;
}
function elementTextPreview(element?: Dynamic, maxLength: Dynamic = 40): Dynamic {
  let text: Dynamic = "",
    collectPreview: Dynamic = (parent?: Dynamic): Dynamic => {
      for (let childNode of parent.childNodes as Dynamic) {
        if (text.length >= maxLength) return;
        if (childNode.nodeType === Node.TEXT_NODE) {
          let trimmedText: Dynamic = (childNode.nodeValue ?? "").trim();
          trimmedText && (text += (text ? " " : "") + trimmedText);
        } else
          childNode.nodeType === Node.ELEMENT_NODE &&
            !/^(style|script|template|sc-helmet)$/i.test(childNode.tagName) &&
            collectPreview(childNode);
      }
    };
  collectPreview(element);
  return text;
}
function siblingsSeparatedOnlyByWhitespace(
  startNode?: Dynamic,
  endNode?: Dynamic,
): Dynamic {
  let nextSibling: Dynamic = startNode.nextSibling;
  for (; nextSibling && nextSibling !== endNode; ) {
    if (
      nextSibling.nodeType !== Node.TEXT_NODE ||
      (nextSibling.nodeValue ?? "").trim().length > 0
    )
      return false;
    nextSibling = nextSibling.nextSibling;
  }
  return nextSibling === endNode;
}
function nextDirectiveSibling(node?: Dynamic): Dynamic {
  let cursor: Dynamic = node;
  for (;;) {
    for (; !cursor.nextSibling && isDirectiveElement(cursor.parentNode); )
      cursor = cursor.parentNode;
    let nextSibling: Dynamic = cursor.nextSibling;
    for (; isDirectiveElement(nextSibling) && nextSibling.firstChild; )
      nextSibling = nextSibling.firstChild;
    if (!isDirectiveElement(nextSibling)) return nextSibling;
    cursor = nextSibling;
  }
}
function directiveSiblingsAdjacent(
  startNode?: Dynamic,
  endNode?: Dynamic,
): Dynamic {
  let cursor: Dynamic = nextDirectiveSibling(startNode);
  for (; cursor && cursor !== endNode; ) {
    if (
      cursor.nodeType !== Node.TEXT_NODE ||
      (cursor.nodeValue ?? "").trim().length > 0
    )
      return false;
    cursor = nextDirectiveSibling(cursor);
  }
  return cursor === endNode;
}
function containsTemplateText(node?: Dynamic): Dynamic {
  if (node.nodeType === Node.TEXT_NODE)
    return (node.nodeValue ?? "").includes("{{");
  for (let childNode of node.childNodes as Dynamic)
    if (containsTemplateText(childNode)) return true;
  return false;
}
export {
  containsTemplateText,
  directiveParent,
  directiveSiblingsAdjacent,
  editorAssert,
  elementTextPreview,
  hasOnlyDirectText,
  isDirectiveElement,
  ModelDomTextButtonInputPattern,
  ModelDomTextH1H2H3Config,
  ModelDomTextRegistry,
  ModelDomTextSplitValue,
  fontInheritanceProperties,
  ModelDomTextSubscribers,
  nextDirectiveSibling,
  siblingsSeparatedOnlyByWhitespace,
};
export function installEditorModelDomText(): () => void {
  return () => {
    isDirectiveElement = (node?: Dynamic): Dynamic =>
      node?.nodeType === Node.ELEMENT_NODE &&
      /^(sc-if|sc-for)$/i.test(node.tagName);
    directiveParent = (node?: Dynamic): Dynamic => {
      let parentNode: Dynamic = node.parentNode;
      for (; isDirectiveElement(parentNode); )
        parentNode = parentNode.parentNode;
      return parentNode;
    };
    ModelDomTextSubscribers = new Set(
      "p h1 h2 h3 h4 h5 h6 span a li dt dd td th blockquote q cite label button figcaption caption code pre em strong b i u s small mark sub sup".split(
        " ",
      ),
    );
    ModelDomTextSplitValue =
      "font font-family font-size font-weight font-style line-height letter-spacing color text-align text-transform".split(
        " ",
      );
    fontInheritanceProperties =
      "font-family font-size font-weight font-style line-height".split(" ");
    ModelDomTextH1H2H3Config = {
      h1: "font-size font-weight",
      h2: "font-size font-weight",
      h3: "font-size font-weight",
      h4: "font-size font-weight",
      h5: "font-size font-weight",
      h6: "font-size font-weight",
      b: "font-weight",
      strong: "font-weight",
      th: "font-weight text-align",
      caption: "text-align",
      center: "text-align",
      em: "font-style",
      i: "font-style",
      cite: "font-style",
      address: "font-style",
      dfn: "font-style",
      var: "font-style",
      code: "font-family",
      pre: "font-family",
      kbd: "font-family",
      samp: "font-family",
      tt: "font-family",
      small: "font-size",
      big: "font-size",
      sub: "font-size",
      sup: "font-size",
      rt: "font-size",
      mark: "color",
      dialog: "color",
    };
    ModelDomTextButtonInputPattern = /^(button|input|select|textarea)$/;
    ModelDomTextRegistry = {
      section: "Section",
      article: "Article",
      header: "Header",
      footer: "Footer",
      nav: "Nav",
      aside: "Aside",
      main: "Main",
      form: "Form",
      ul: "List",
      ol: "List",
      li: "List item",
      table: "Table",
      thead: "Table head",
      tbody: "Table body",
      tfoot: "Table foot",
      tr: "Table row",
      td: "Table cell",
      th: "Table cell",
      p: "Paragraph",
      h1: "Heading",
      h2: "Heading",
      h3: "Heading",
      h4: "Heading",
      h5: "Heading",
      h6: "Heading",
      a: "Link",
      img: "Image",
      picture: "Image",
      video: "Video",
      audio: "Audio",
      svg: "Graphic",
      canvas: "Canvas",
      iframe: "Embed",
      button: "Button",
      input: "Input",
      textarea: "Text area",
      select: "Select",
      figure: "Figure",
      figcaption: "Caption",
      caption: "Caption",
      blockquote: "Quote",
      hr: "Divider",
      rect: "Rectangle",
      circle: "Oval",
      ellipse: "Oval",
      line: "Line",
      polyline: "Path",
      polygon: "Polygon",
      path: "Path",
      text: "Text",
      tspan: "Text",
      textpath: "Text",
      image: "Image",
      symbol: "Symbol",
      use: "Linked copy",
      defs: "Definitions",
      marker: "Marker",
      clippath: "Clip path",
      mask: "Mask",
      lineargradient: "Gradient",
      radialgradient: "Gradient",
      stop: "Gradient stop",
      pattern: "Pattern",
      filter: "Filter",
      feblend: "Filter effect",
      fecolormatrix: "Filter effect",
      fecomponenttransfer: "Filter effect",
      fecomposite: "Filter effect",
      feconvolvematrix: "Filter effect",
      fediffuselighting: "Filter effect",
      fedisplacementmap: "Filter effect",
      fedistantlight: "Filter effect",
      fedropshadow: "Filter effect",
      feflood: "Filter effect",
      fefunca: "Filter effect",
      fefuncb: "Filter effect",
      fefuncg: "Filter effect",
      fefuncr: "Filter effect",
      fegaussianblur: "Filter effect",
      feimage: "Filter effect",
      femerge: "Filter effect",
      femergenode: "Filter effect",
      femorphology: "Filter effect",
      feoffset: "Filter effect",
      fepointlight: "Filter effect",
      fespecularlighting: "Filter effect",
      fespotlight: "Filter effect",
      fetile: "Filter effect",
      feturbulence: "Filter effect",
      animate: "Animation",
      animatemotion: "Animation",
      animatetransform: "Animation",
      set: "Animation",
      discard: "Animation",
      mpath: "Motion path",
      foreignobject: "Embedded HTML",
      desc: "Description",
      metadata: "Metadata",
      view: "View",
    };
  };
}
