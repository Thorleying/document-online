import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * 门禁分三组：
 * 1. 代码体量，对应 CODE_STYLE_STANDARDS 的硬性阈值。
 * 2. 依赖方向，把 AGENTS.md「架构约束」里的单向依赖变成可机械执行的规则。
 * 3. 配置来源，强制 process.env 只在 src/config 读取。
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    name: "project/code-size",
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // 800 行为硬上限；600 行起进入设计审查，该阈值由人工审查把关。
      "max-lines": [
        "error",
        { max: 800, skipBlankLines: true, skipComments: true },
      ],
      // 80 行是自检阈值，120 行是硬上限，此处只机械拦截硬上限。
      "max-lines-per-function": [
        "error",
        { max: 120, skipBlankLines: true, skipComments: true },
      ],
      "max-depth": ["error", 4],
      "max-params": ["warn", 5],
    },
  },

  {
    name: "project/layering-lib-config",
    files: ["src/lib/**/*.{ts,tsx}", "src/config/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*", "@/server"],
              message:
                "依赖方向为 app -> server -> db。lib 与 config 位于底层，不得反向依赖 server。",
            },
            {
              group: ["@/app/*", "@/app"],
              message: "lib 与 config 不得依赖路由层 app。",
            },
          ],
        },
      ],
    },
  },

  {
    name: "project/layering-server",
    files: ["src/server/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/app"],
              message:
                "依赖方向为 app -> server。server 是被调用方，不得反向依赖路由层。",
            },
          ],
        },
      ],
    },
  },

  {
    name: "project/config-single-source",
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/config/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "环境变量的唯一读取点是 src/config。请从那里导出经 zod 校验的类型化配置。",
        },
      ],
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
    ".agents/**",
    "design-system/**",
  ]),
]);

export default eslintConfig;
