import * as React from 'react';
import {render} from '@testing-library/react';
import {I18NComponentProps, I18NProvider, LanguageBundleSet, withI18N} from "../src";

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

const Text = (props: Props) => {
  return <span {...props}/>
}

const I18NText = withI18N<Props & I18NComponentProps>(Text);

const RootLanguages:LanguageBundleSet = {
  en: {
    hello: "Hello.1",
    role: "Role.1",
    args: (arg1:any, arg2:any) => `Has ${arg1} and ${arg2}`,
    bold: "Some **bold** text",
    italic: "Some *italic* text",
    strikethrough: "Some ~~strikethrough~~ text",
    code: "Some `code` text",
    link: "A [link](url) here",
    mixed: "Some ***bold italic*** `code` [link](url) ~~strikethrough~~ here",
  },
  other: {
    hello: "Hello.2",
    role: "Role.2"
  }
}

const NestedLanguages:LanguageBundleSet = {
  en: {
    hello: "Hello.nested.1",
  },
  other: {
    hello: "Hello.nested.2",
  }
}

describe('it', () => {
  it('renders to children by default', () => {
      const dom = render(
        <I18NProvider bundles={RootLanguages} lang={"en"}>
          <I18NText i18n={"hello"}/>
        </I18NProvider>
      );
    dom.getByText("Hello.1");
  });

  it('renders to children explicitly', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NText i18n={{children:"hello"}}/>
      </I18NProvider>
    );
    dom.getByText("Hello.1");
  });

  it('renders multiple properties', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NText i18n={[
          {children:"hello"},
          {role:"role"}
        ]}/>
      </I18NProvider>
    );
    dom.getByText("Hello.1");
    dom.getByRole("Role.1");
  });

  it('supports args', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NText i18n={{children:"args", args:[1, "abc"]}}/>
      </I18NProvider>
    );
    dom.getByText("Has 1 and abc");
  });

  it('supports nested bundles and inherits lang', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NProvider bundles={NestedLanguages}>
          <I18NText i18n={[
            {children:"hello"},
            {role:"role"}
          ]}/>
        </I18NProvider>
      </I18NProvider>
    );
    dom.getByText("Hello.nested.1");
    dom.getByRole("Role.1");
  });

  it('supports nested bundles and overrides lang', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NProvider bundles={NestedLanguages} lang={"other"}>
          <I18NText i18n={[
            {children:"hello"},
            {role:"role"}
          ]}/>
        </I18NProvider>
      </I18NProvider>
    );
    dom.getByText("Hello.nested.2");
    dom.getByRole("Role.2");
  });

  it('supports bold markdown', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NText i18n={"bold"}/>
      </I18NProvider>
    );
    // @ts-ignore
    dom.getByText(( content, element) => {
      return element?.innerHTML === "Some <strong>bold</strong> text"
    });
  });

  it('supports italic markdown', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NText i18n={"italic"}/>
      </I18NProvider>
    );
    // @ts-ignore
    dom.getByText(( content, element) => {
      return element?.innerHTML === "Some <em>italic</em> text"
    });
  });

  it('supports strikethrough markdown', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NText i18n={"strikethrough"}/>
      </I18NProvider>
    );
    // @ts-ignore
    dom.getByText(( content, element) => {
      return element?.innerHTML === "Some <del>strikethrough</del> text"
    });
  });

  it('supports code markdown', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NText i18n={"code"}/>
      </I18NProvider>
    );
    // @ts-ignore
    dom.getByText(( content, element) => {
      return element?.innerHTML === "Some <code>code</code> text"
    });
  });

  it('supports link markdown', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NText i18n={"link"}/>
      </I18NProvider>
    );
    // @ts-ignore
    dom.getByText(( content, element) => {
      return element?.innerHTML === 'A <a href="url">link</a> here'
    });
  });

  it('supports mixed markdown', () => {
    const dom = render(
      <I18NProvider bundles={RootLanguages} lang={"en"}>
        <I18NText i18n={"mixed"}/>
      </I18NProvider>
    );
    const html = `Some <em><strong>bold italic</strong></em> <code>code</code> <a href="url">link</a> <del>strikethrough</del> here`;
    // @ts-ignore
    dom.getByText(( content, element) => {
      return element?.innerHTML.replace(/(\r?\n)/g, " ") === html
    });
  });

});
