"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import DiscordLogin from "../auth/DiscordLogin";
import MenuButton from "./menu-button";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Features", href: "/#features" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Commands", href: "/commands" },
    { name: "Docs", href: "/docs" },
    { name: "Support", href: "https://discord.com/invite/2rjCRKZsBb", external: true },
  ];

  return (
    <header
      className={`fixed top-2 left-4 right-4 z-50  transition-all duration-300 ${
        isScrolled ? "bg-slate-700/20 backdrop-blur-lg border border-slate-600/50 rounded-lg" : ""
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image alt="log" width={40} height={40} src={"/boticon.png"} />

            <span className="text-xl font-bold">SkyHelper</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="text-slate-300 hover:text-white transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <DiscordLogin size="sm" variant="button" />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <MenuButton open={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="border-t border-slate-600/50"></div>
          <div className={`px-4 py-4 space-y-4 ${isScrolled ? "" : "bg-slate-700/20 backdrop-blur-lg"}`}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="block text-slate-300 hover:text-white transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <DiscordLogin btnTitle="Login with Discord" size="md" variant="button" />
          </div>
        </div>
      )}
    </header>
  );
}
