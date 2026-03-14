import "../styles/globals.css";

export const metadata = { title: "StudSWAP", description: "Student token DEX MVP" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100">
        {children}
      </body>
    </html>
  );
}
