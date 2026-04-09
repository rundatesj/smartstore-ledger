export const metadata = {
  title: "스마트스토어 장부 자동화",
  description: "스마트스토어 주문/정산 장부",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
