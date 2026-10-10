import type { CSSProperties } from 'react';

/**
 * LIMINAL · VARIANTS ENGINE (cva pattern with inline CSSProperties)
 * "هندسه چندوجهی بر مدار استایل‌های لیمینال"
 *
 * Implements the class-variance-authority (cva) design pattern specifically for
 * mathematical inline styles and design tokens.
 */

export type VariantsSchema = Record<string, Record<string, CSSProperties>>;

export type VariantSelection<V extends VariantsSchema> = {
  [K in keyof V]?: keyof V[K] extends 'true' | 'false' ? boolean | keyof V[K] : keyof V[K];
};

export type CompoundVariant<V extends VariantsSchema> = {
  [K in keyof V]?: keyof V[K] extends 'true' | 'false' ? boolean | keyof V[K] : keyof V[K];
} & {
  style: CSSProperties;
};

export interface VariantsConfig<V extends VariantsSchema> {
  base?: CSSProperties;
  variants?: V;
  compoundVariants?: CompoundVariant<V>[];
  defaultVariants?: VariantSelection<V>;
}

export type VariantProps<T extends (...args: any) => any> = NonNullable<Parameters<T>[0]>;

export function createVariants<V extends VariantsSchema>(config: VariantsConfig<V>) {
  return function getVariantStyles(
    props?: VariantSelection<V> & { style?: CSSProperties }
  ): CSSProperties {
    const selected: Record<string, any> = {
      ...(config.defaultVariants || {}),
      ...(props || {}),
    };

    let result: CSSProperties = {
      ...(config.base || {}),
    };

    // 1. Resolve standard variants
    if (config.variants) {
      for (const variantKey of Object.keys(config.variants)) {
        const val = selected[variantKey];
        if (val !== undefined && val !== null) {
          const group = config.variants[variantKey];
          const keyString = String(val);
          const styleForVal = group[keyString];
          if (styleForVal) {
            result = { ...result, ...styleForVal };
          }
        }
      }
    }

    // 2. Resolve compound variants
    if (config.compoundVariants) {
      for (const compound of config.compoundVariants) {
        const { style: compoundStyle, ...conditions } = compound;
        let isMatch = true;

        for (const [cKey, cVal] of Object.entries(conditions)) {
          const currentVal = selected[cKey];
          if (currentVal === undefined) {
            isMatch = false;
            break;
          }
          if (currentVal !== cVal && String(currentVal) !== String(cVal)) {
            isMatch = false;
            break;
          }
        }

        if (isMatch && compoundStyle) {
          result = { ...result, ...compoundStyle };
        }
      }
    }

    // 3. User overrides passed via style prop
    if (props?.style) {
      result = { ...result, ...props.style };
    }

    return result;
  };
}

export default createVariants;
