'use client';
import Link from "next/link";
import { useDarkMode } from "@/lib/DarkModeContext";

export default function Footer() {
  const { isDarkMode } = useDarkMode();
  
  return (
    <footer className={`border-t transition-colors duration-300 backdrop-blur-md ${
      isDarkMode 
        ? 'border-gray-700/50' 
        : 'border-gray-200/50'
    }`} style={{ backgroundColor: 'transparent' }}>
      <div className={`container mx-auto py-4 px-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors duration-300 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <nav className="flex flex-wrap items-center gap-x-10 gap-y-2">
          <Link
            href="/legal"
            className={`underline underline-offset-4 transition-colors duration-300 ${
              isDarkMode 
                ? 'decoration-gray-500 hover:decoration-white hover:text-white' 
                : 'decoration-gray-400 hover:decoration-black hover:text-black'
            }`}
          >
            เอกสารทางกฎหมาย
          </Link>
          <Link
            href="/data-protection"
            className={`underline underline-offset-4 transition-colors duration-300 ${
              isDarkMode 
                ? 'decoration-gray-500 hover:decoration-white hover:text-white' 
                : 'decoration-gray-400 hover:decoration-black hover:text-black'
            }`}
          >
            ประกาศการคุ้มครองข้อมูล
          </Link>
          <Link
            href="/privacy-policy"
            className={`underline underline-offset-4 transition-colors duration-300 ${
              isDarkMode 
                ? 'decoration-gray-500 hover:decoration-white hover:text-white' 
                : 'decoration-gray-400 hover:decoration-black hover:text-black'
            }`}
          >
            นโยบายความเป็นส่วนตัว
          </Link>
          <Link
            href="/aml-policy"
            className={`underline underline-offset-4 transition-colors duration-300 ${
              isDarkMode 
                ? 'decoration-gray-500 hover:decoration-white hover:text-white' 
                : 'decoration-gray-400 hover:decoration-black hover:text-black'
            }`}
          >
            นโยบายต่อต้านการฟอกเงิน
          </Link>
        </nav>

        <div className={`ml-auto transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          ลิขสิทธิ์ © {new Date().getFullYear()} Thailand Flood สงวนลิขสิทธิ์
        </div>
      </div>
    </footer>
  );
}