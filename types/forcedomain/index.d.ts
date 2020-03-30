declare module 'forcedomain' {
  interface Options {
    hostname: string;
    protocol: string;
    port?: number;
    excludeRule?: RegExp;
    type?: string;
  }

  export default function forceDomain(options: Options): any;
}
