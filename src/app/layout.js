export const metadata = {
  title: 'The Office English Study',
  description: 'The Office 스크립트로 영어 공부하기',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d0d14" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0d0d14' }}>
        {children}
      </body>
    </html>
  )
}
