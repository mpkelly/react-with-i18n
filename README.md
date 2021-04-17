# React with I18N

Easily add lightweight yet powerful I18N support to your component library components. This library does not ship with any special `Translate` / `I18NText` component or helper functions. Instead, you pass your existing components to a HOC to have them ehanced. This way the I18N library doesn't takeover your codebase, as most of them tend to do. 

## Quick start



```typescript jsx
import {withI18N, I18NComponentProps, I18NProvider} from "react-with-i18n";
import {Text as _Text, TextProps} from "./my-awesome-library/Text"

// Do this for each library component that needs I18N support. You can (and should) 
// I18Nize ARIA properties, like role etc, so you will typically need to use this 
// HOC on more than just text components
const Text = withI18N<TextProps & I18NComponentProps>(_Text);

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
  <Text i18n="login.userName"/>  
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

You can nest `I18NProviders` and the child will automatically merge its bundles in with its parents. This 
is useful for code-splitting. Rather than just one large bundle for a given language, you should 
create a common/root language bundle and then make bundles for each feature/page/screen. 

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

The syntax support is as follows

```javascript
const Languages = {
  en: {
    bold1: "Some **bold** text",
    bold2: "Some __bold__ text",
    italic1: "Some *italic* text",
    italic2: "Some _italic_ text",
    strikethrough: "Some ~~strikethrough~~ text",
    code: "Some `code` text",
    link: "A [link](url)"
  }
  //...
}
```

You can easily define your own rules. The tiny markdown engine is just a regex replacement loop. Here's
the strikethrough rule

```typescript
export const StrikethroughRule: MarkdownRule = {
  pattern: /~~(.*?)~~/,
  onMatch: (match) => `<del>${match[1]}</del>`
};
```

The `I18NProvider` supports a `markdownRules` property which is an array of `MarkdownRule`s. If no value
is provided then the `I18NProvider` defaults to `DefaultMarkdownRules`. 

If you want to add additional rules you can do so like

```typescript jsx
import {I18NProvider, DefaultMarkdownRules} from "react-with-i18n"
   
const QuoteRule: MarkdownRule = {
  pattern: /\:\"(.*?)\"\:/,
  onMatch: (match) => `<q>${match[1]}</q>`
};

const rules = DefaultMarkdownRules.concat([QuoteRule]);

<I18NProvider lang="..." bundles="..." markdownRules={rules}>
  //...
</I18NProvider>

```

## Dynamically loading bundles / React Suspense

There is no need to load each language into memory. Instead, you can just use dynamic imports to 
fetch only the bundles you need. Here's how you can do it.

```typescript jsx

const App = async () => {
  const [lang, setLang] = useState("en");
  const current = await import(`./path/Translations-${lang}.ts`);
  return (
    <I18NProvider lang={lang} bundles={current}>
      {/** **/}
    </I18NProvider>
  );
};

```
If you don't want to block your whole app and want to use `React.Suspense` then you need a way to 
convert the promise returned by `import(...)` into a `Resource` which `Suspense` can interface 
with. You can use the `wrapPromise` function from the 
[official docs](https://reactjs.org/docs/concurrent-mode-suspense.html) example code 
[here](https://codesandbox.io/s/frosty-hermann-bztrp?file=/src/fakeApi.js). Then you can do something 
like this in your app.

```typescript jsx
const App = () => {
  return (
    <Suspense fallback={<span>...</span>}>
      <Root />
    </Suspense>
  );
};

const Root = () => {
  const [lang, setLang] = useState("en");
  const current = wrapPromise(import(`./path/Translations-${lang}.ts`));
  // Calling read() will mean the promise gets thrown while the promise is pending.
  // The Suspense component above catches this promise and shows the fallback
  return (
    <I18NProvider lang={lang} bundles={current.read()}> 
      {/** **/}
    </I18NProvider>
  );
};

```

### Formatting text

The library allows you to use whatever string formatting library you like but does export a 
few utilities. These are just light wrappers around JavaScript's native `Intl` object and 
so don't add much bulk to the library. 

```typescript jsx
import {pluralize, formatCurrency, formatDate} from "react-with-i18n";

const Bundle = {
  en: {
    key1: (count:number) => pluralize(count, "order", "orders"), 
    key2: (amount:number, currency:string) => `Total amount: ${formatCurrency(amount, currency)}`, 
    key3: (date:Date) => formatDate(date), 
  }
}

```
You can pass in additional params for `Intl` options and `locale`. See the API [here](src/Formatting.tsx). 
