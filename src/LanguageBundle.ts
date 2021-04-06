import { ReactNode } from "react";

export type LanguageBundleFunctionValue = (...args: any[]) => ReactNode;
export type LanguageBundleValue = ReactNode | LanguageBundleFunctionValue;

export type LanguageBundle = {
  [key: string]: LanguageBundleValue;
};

export type LanguageBundleSet = {
  [key: string]: LanguageBundle
};
