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
export function withI18N<P extends I18NComponentProps>(Component: React.ComponentType<P>) {
  return forwardRef<HTMLElement, P>((props, ref) => {
    const next = assignI18NValues(props);
    // @ts-ignore
    return <Component {...next} ref={ref} />;
  })
};

const assignI18NValues = (props: I18NComponentProps) => {
  let { i18n = '', ...rest } = props;
  if (!i18n) return props;
  const { bundles, lang,  markdownRules} = useI18N();

  const current = bundles[lang as string];

  toArray(i18n).forEach((property) => {
    const { args = [], ...other } = property;
    const key = Object.keys(other)[0];
    const value = current[(property as any)[key]];
    if (value) {
      let result:any;
      if (typeof value === 'string') {
        result = transform(value, markdownRules);
      } else {
        result = transform((value as Function)(...args), markdownRules);
      }
      if (key === "children") {
        (rest as any)["dangerouslySetInnerHTML"] = { __html:result}
      } else {
        (rest as any)[key] = result;
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
