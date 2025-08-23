"use client";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";

export default function Navbar() {
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
      <Toolbar className="container mx-auto flex gap-2">
        <Link href="/" className="font-semibold mr-auto">
          RS-SHOP
        </Link>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="outlined">Register</Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
