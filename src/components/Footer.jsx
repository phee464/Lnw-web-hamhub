import Link from "next/link";
export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto py-4 px-4 text-sm text-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-x-10 gap-y-2">
          <Link
            href="/legal"
            className="underline underline-offset-4 decoration-gray-400 hover:decoration-black hover:text-black"
          >
            เอกสารทางกฎหมาย
          </Link>
          <Link
            href="/data-protection"
            className="underline underline-offset-4 decoration-gray-400 hover:decoration-black hover:text-black"
          >
            ประกาศการคุ้มครองข้อมูล
          </Link>
          <Link
            href="/privacy-policy"
            className="underline underline-offset-4 decoration-gray-400 hover:decoration-black hover:text-black"
          >
            นโยบายความเป็นส่วนตัว
          </Link>
          <Link
            href="/aml-policy"
            className="underline underline-offset-4 decoration-gray-400 hover:decoration-black hover:text-black"
          >
            นโยบายต่อต้านการฟอกเงิน
          </Link>
        </nav>

        <div className="ml-auto text-gray-600">
          ลิขสิทธิ์ © {new Date().getFullYear()} Vantage สงวนลิขสิทธิ์
        </div>
      </div>
    </footer>
  );
  // ... existing code ...
}