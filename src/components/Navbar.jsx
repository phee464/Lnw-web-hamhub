"use client";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const navItems = [
    { label: "เวลาที่ควรออกเดินทาง", href: "/best-time" },
    { label: "เส้นทางพื้นฐาน", href: "/routes" },
    { label: "ประเมินความเสี่ยงรถติด/ฝน", href: "/risk" },
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: "white",
        color: "black",
        borderBottom: "1px solid #eee",
      }}
    >
      <Toolbar className="container mx-auto flex items-center gap-2">
        <Link href="/" className="font-semibold mr-auto">
          Lnw Web HamHub
        </Link>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "contained" : "text"}
                  color={active ? "primary" : "inherit"}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: active ? 700 : 500,
                    px: 2,
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </Box>

        <Button
          component="a"
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          color="primary"
          sx={{ ml: 1, borderRadius: 999, textTransform: "none" }}
        >
          เปิด Google Maps
        </Button>

        <Link href="/login">
          <Button sx={{ ml: 1 }}>Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="outlined" sx={{ ml: 0.5 }}>
            Register
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
}