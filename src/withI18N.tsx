import React, {forwardRef} from 'react';
import {useI18N} from "./I18NProvider";
import {transform} from "./Markdown";

export type I18NProperty = {
  [key: string]: string | any[] | undefined;
  args?: any[];
};

export type I18NComponentProps = {
  i18n?: string | I18NProperty | I18NProperty[];
};

//TODO fix typings
export function withI18N<P extends I18NComponentProps>(Component: React.FC<P>): React.FC<P> {
  return forwardRef<HTMLElement, P>((props, ref) => {
    const next = rewriteI18NProps(props);
    // @ts-ignore
    return <Component {...next} ref={ref} />;
  }) as unknown as React.FC<P>
};

const rewriteI18NProps = (props: I18NComponentProps) => {
  let { i18n = '', ...rest } = props;
  if (!i18n) return props;
  const { bundles, lang, markdownRules} = useI18N();
  if (!lang || !bundles) {
    const names = bundles ? Object.keys(bundles).join(", ") : "undefined";
    throw new Error(`Unable to find bundle: lang=${lang} and bundles=${names}`)
  }
  const bundle = bundles[lang];
  toArray(i18n).forEach((property) => {
    const { args = [], ...other } = property;
    const key = Object.keys(other)[0];
    const value = bundle[(property as any)[key]];
    if (value) {
      if (typeof value === 'string') {
        (rest as any)[key] = transform(value, markdownRules);
      } else {
        (rest as any)[key] = transform((value as Function)(...args), markdownRules);
      }
    }
  });
  return rest;
};

const toArray = (
  i18n?: string | I18NProperty | I18NProperty[]
): I18NProperty[] => {
  if (typeof i18n === 'string') {
    return [{ children: i18n }];
  } else if (Array.isArray(i18n)) {
    return i18n;
  } else {
    return [i18n as I18NProperty];
  }
};
