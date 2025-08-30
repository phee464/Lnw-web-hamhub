import './styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClickSpark from '@/components/ClickSpark';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-4">{children}</main>
        <Footer />
        <ClickSpark particleCount={12} colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']} />
      </body>
    </html>
  );
}