// src/pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta
            name="description"
            content="A mental health journaling app to track your mood and find peace."
          />
          <meta name="application-name" content="Soloura" />
          <meta name="theme-color" content="#F0FBF4" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167x167.png" />

          {/* ✅ Manually added Google Fonts link */}
          <link
            href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="font-body antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
