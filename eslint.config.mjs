import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // Disable the overly strict set-state-in-effect rule
      // These are valid patterns for client-side detection and initial state setting
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
