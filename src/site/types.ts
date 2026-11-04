export type Lang = "vi" | "en";

export interface DocPropRow {
  name: string;
  type: string;
  defaultVal: string;
  desc: string;
}

export interface DocStepCard {
  badge: string;
  title: string;
  body: string;
}

export interface DocCodeExample {
  title: string;
  filename: string;
  code: string;
}

export interface DocSection {
  id: string;
  category: "getting-started" | "components" | "subsystems";
  badge: string;
  title: string;
  summary: string;
  steps?: DocStepCard[];
  codeExamples: DocCodeExample[];
  propsTable?: {
    title: string;
    rows: DocPropRow[];
  };
  sandbox?: "3d" | "image";
}

export interface DocsUI {
  nav: {
    subtitle: string;
    docsMode: string;
    artboardMode: string;
    replayBtn: string;
    replayTooltip: string;
  };
  hero: {
    tag: string;
    title: string;
    lead: string;
    ctaStart: string;
    stats: Array<{ title: string; subtitle: string }>;
  };
  sidebar: {
    gettingStarted: string;
    components: string;
    subsystems: string;
  };
  table: {
    nameCol: string;
    typeCol: string;
    defaultCol: string;
    descCol: string;
    copyBtn: string;
    copiedBtn: string;
  };
  sandbox: {
    threeTitle: string;
    imageTitle: string;
    pause: string;
    play: string;
  };
  footer: {
    title: string;
    subtitle: string;
  };
}

export interface DocsLocaleBundle {
  lang: Lang;
  ui: DocsUI;
  gettingStarted: DocSection[];
  components: DocSection[];
  subsystems: DocSection[];
}
