declare module 'gatsby-plugin-express' {
  interface Options {
    publicDir?: string;
    template?: string;
    redirectSlashes?: boolean;
  }

  export default function gatsbyExpress(routes: string, options?: Options): any;
}
