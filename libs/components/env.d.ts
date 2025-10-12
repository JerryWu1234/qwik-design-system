/// <reference types="@qwik.dev/core" />

// CSS inline imports
declare module "*.css?inline" {
  const content: string;
  export default content;
}
