import NextDocument, { Html, Head, Main, NextScript } from 'next/document';

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <FontPreloads />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/svg+xml"
            href="/favicon.svg"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="48x48"
            href="/favicon-48x48.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link
            rel="manifest"
            href="/site.webmanifest"
          />
          <meta
            name="msapplication-TileColor"
            content="#1e2236"
          />
          <meta
            name="theme-color"
            content="#1e2236"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

function FontPreloads() {
  const fonts = [
    'Mundial-Regular',
    'Mundial-Bold',
    'Mundial-DemiBold',
    'SourceCodePro-Regular',
    'SourceCodePro-Medium'
  ];

  return (
    <>
      {fonts.map((font, index) => (
        <link
          key={index}
          rel="preload"
          href={`/fonts/${font}.woff2`}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        ></link>
      ))}
    </>
  );
}
