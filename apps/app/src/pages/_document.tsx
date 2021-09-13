// This code prevents a Flash Of Unstyled Content (FOUC)
// on load. Without it, the styles are only added once
// react loads on the frontend

import Document, { DocumentContext } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
        });
      const initialProps = await Document.getInitialProps(ctx);

      return {
        ...initialProps,
        styles: (
          <>
            <title>Learn to Code - for Free | practice.dev</title>
            <link rel="shortcut icon" href="/favicon.png" />
            <link
              rel="stylesheet"
              href="https://rsms.me/inter/inter.css"
            ></link>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }
}
