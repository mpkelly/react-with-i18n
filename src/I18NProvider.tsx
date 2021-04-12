import React, {FC, ReactNode} from "react";
import {LanguageBundle, LanguageBundleSet} from "./LanguageBundle";
import {DefaultMarkdownRules, MarkdownRule} from "./Markdown";

type Value = {
  bundles: LanguageBundleSet;
  markdownRules: MarkdownRule[];
  lang?: string;
};

const Context = React.createContext<Value | undefined>(undefined);
export const useI18N = () => React.useContext(Context) as Value;

type Props = {
  /**
   * The React `children` to render.
   */
  children: ReactNode;
  /**
   * The `LanguageBundleSet` to use. As `react-i18n` supports a
   * hierarchy of `I18NProviders`, this is optional and will be inherited from
   * the parent `I18NProvider` if not set. In any case, the parent's `LanguageBundle`
   * for the current `lang` is merged into this provider's bundle internally.
   */
  bundles?: LanguageBundleSet;

  /**
   * The current language. This should be a key on this provider's `bundles` property
   * or on a parent bundle.
   */
  lang?: string;

  /**
   * `LanguageBundle` strings support markdown by default. You can disable this
   *  by passing an empty array and also replace the default rules (bold, italic, inline code,
   *  strikethrough and links) by passing a non-empty array.
   * )
   */
  markdownRules?: MarkdownRule[];
};

/**
 *
 * A `Context.Provider` which makes `LanguageBundles` available to child components
 * via the `useI18N` hook or the `withI18N` higher order component.
 *
 * @param props see `Props`
 */
export const I18NProvider: FC<Props> = (
  props
) => {
  let { bundles = {}, children, markdownRules = DefaultMarkdownRules, lang} = props;

  const parentBundles = useI18N()?.bundles || {};

  const flat:LanguageBundleSet = {};
  Object.keys(bundles).forEach(name => {
    const bundle = flatten(bundles[name]);
    const parent = parentBundles[name] || {};
    flat[name] = {...parent, ...bundle};
  })

  const parentLang = useI18N()?.lang;
  lang = lang || parentLang;

  if (!lang) {
    throw Error('No lang specified')
  }
  const current = flat[lang];
  if (!current) {
    const names = bundles ? Object.keys(bundles).join(", ") : "undefined";
    throw new Error(`Unable to find bundle: lang=${lang} and bundles=${names}`)
  }

  const value = {
    lang,
    bundles:flat,
    markdownRules
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

const flatten = (object:any) => {
  const result:LanguageBundle = {};

  for (let property in object) {
    if (!object.hasOwnProperty(property)) continue;
    if ((typeof object[property]) == 'object' && object[property] !== null) {
      const flat = flatten(object[property]);
      for (let x in flat) {
        if (!flat.hasOwnProperty(x)) continue;
        result[property + '.' + x] = flat[x];
      }
    } else {
      result[property] = object[property];
    }
  }
  return result;
}