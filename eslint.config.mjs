import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // 1️⃣ Base JS
  js.configs.recommended,

  // 2️⃣ TypeScript (recomendado + type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  // 3️⃣ Prettier (desliga regras conflitantes)
  prettier,

  // 4️⃣ Configuração do projeto
  {
    languageOptions: {
      parserOptions: {
        project: true, // usa tsconfig.json
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.node,
    },

    rules: {
      // boas práticas para backend
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/explicit-function-return-type": "off",

      // Fastify / Node
      "no-console": "off",
    },
  }
);
