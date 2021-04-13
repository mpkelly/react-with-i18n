# React with I18N

Easily add lightweight yet powerful I18N support to your component library components. 

## Quick start



```typescript jsx
import {withI18N, I18NComponentProps, I18NProvider} from "react-with-i18n";
import {Text, TextProps} from "./my-awesome-library/Text"

// Do this for each library component that needs I18N support. You can (and should) 
// I18Nize ARIA properties, like role etc, so you will typically need to use this 
// HOC on more than just text components
const I18NText = withI18N<TextProps & I18NComponentProps>(Text);

// In your app elsewhere

const Languages = {
  en: {
    login: {
      userName:"Username",
      password:"Password",
    }
  }
  //...
}

<I18NProvider lang={"en"} bundles={Languages}>
  <I18NText i18n="login.userName"/>  
</I18NProvider>
```

## Features at a glance

- Tiny (the smallest?) library at only  1.26 kB gzipped. 
- The cleanest way to add I18N support for React - no special components and just one extra prop for your library components
- Support for language bundle nesting and inheritance (think code splitting)
- Support any properties on target components, including ARIA properties
- Supports markdown e.g. a value of `Hello, **world**` becomes `Hello <strong>world</world>`
- The `i18n` property supports multiple props and also args for dynamic output
- Package includes totally optional formatting utils for plurals, dates and currencies

## The `i18n` property

Components enhanced with `withI18N` will support the `i18n` prop which is defined as follows

```typescript jsx
export type I18NProperty = {
  [key: string]: string | any[] | undefined;
  args?: any[];
};

export type I18NComponentProps = {
  i18n?: string | I18NProperty | I18NProperty[];
};
```

So this means you can use the property as follows. By default the key's value will be 
set as the React `children` property, which is the standard use-case.

````typescript jsx
<Text i18n={"key"}/>
````

However, you can set specify the target property youserlf

````typescript jsx
//Same as above
<Text i18n={{children:"key"}}/>
````

Target the title property

````typescript jsx
<Text i18n={{title:"key"}}/> 
````

Target multiple properties
````typescript jsx
<Text i18n={[
  {children:"key1"},
  {title:"key2"},
  {role:"key3"},
]}/>
````

The above would produce a DOM element like so
````typescript jsx
<span title="..." role="...">...</span>
````

You can also specify arguments 

````typescript jsx
<Text i18n={{children:"key", args:[1, "Mike"]}}/>
````
For the above your language bundle entry would look something like
````typescript jsx
const Languages = {
  en: {
    key: (count, name)=> `The count is ${count} and the name is ${name}`
  }
  //...
}
````

## The `useI18N` hook

You should be aiming to add native support to all of your library components. However, non-trivial
apps will normally have some hard-to-reach places that need I18N support. For these, you can use the hook

```typescript jsx
const Component = () => {
  const {lang, bundles} = useI18N();
  const current = bundles[lang];
  const i18nValue = current["key"];
  //...
}
```

## Nesting bundles

You can nest `I18NProviders` and the child will automatically merge its bundles in with its parents. 

```typescript jsx
// RootLanguagees might contain common stuff like brandName etc
<I18NProvider lang={"en"} bundles={RootLanguages}>
  {/** Each page/screen/feature can provide its own bundle which can easily 
   be code-splitted. Note how lang is inherited too **/}
  <I18NProvider bundles={PageLanguages}>
    //...
  </I18NProvider>    
</I18NProvider>
```

## Markdown

I18N values can support markdown. Only bold, italic, strikethrough, code and links are supported
by default, but you can easily add your own. See the [tests](test/I18NProvider.test.tsx) for examples.

