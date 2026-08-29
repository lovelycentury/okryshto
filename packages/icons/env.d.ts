declare module "*.svg?raw" {
  const content: string;
  export default content;
}

declare module "./assets/*.svg?raw" {
  const content: string;
  export default content;
}
