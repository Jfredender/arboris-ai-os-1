
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Leaf,
  Home,
  Camera,
  MessageCircle,
  Settings,
  LogOut,
  User,
  Menu,
  X
} from "lucide-react";

interface NavigationHeaderProps {
  user: any;
  onSignOut: () => void;
}

export default function NavigationHeader({ user, onSignOut }: NavigationHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Camera, label: "Plant Analysis", href: "/dashboard/analyze" },
    { icon: MessageCircle, label: "AI Chat", href: "/dashboard/chat" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full backdrop-blur-md bg-[var(--negro-vacuo)]/80 border-b border-[var(--azul-genese)]/20"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 rounded-lg bg-gradient-to-r from-[var(--azul-genese)] to-[var(--verde-simbionte)] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Leaf className="w-6 h-6 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-[var(--branco-estelar)]">
                ARBORIS AI OS 1
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (item.href === "/dashboard/analyze") {
                    document.getElementById("plant-analysis-card")?.scrollIntoView({ behavior: "smooth" });
                  } else if (item.href === "/dashboard/chat") {
                    document.getElementById("chat-interface-card")?.scrollIntoView({ behavior: "smooth" });
                  } else if (item.href === "/dashboard/settings") {
                    alert("Settings feature coming soon!");
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  item.active
                    ? "bg-[var(--azul-genese)]/20 text-[var(--azul-genese)] border border-[var(--azul-genese)]/30"
                    : "text-[var(--cinza-tatico-claro)] hover:text-[var(--branco-estelar)] hover:bg-[var(--azul-genese)]/10"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  aria-label="Open user menu"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    // Ensure the dropdown opens
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="relative h-10 w-10 rounded-full ring-2 ring-[var(--azul-genese)]/30 hover:ring-[var(--azul-genese)]/60 transition-all duration-200 cursor-pointer"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={user?.image || ""} 
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-[var(--azul-genese)] text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-[var(--negro-vacuo)]/95 backdrop-blur-md border border-[var(--azul-genese)]/30"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-[var(--branco-estelar)]">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-[var(--cinza-tatico-claro)]">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[var(--cinza-tatico-escuro)]/50" />
                <DropdownMenuItem 
                  className="text-[var(--cinza-tatico-claro)] hover:text-[var(--branco-estelar)] hover:bg-[var(--azul-genese)]/10 focus:bg-[var(--azul-genese)]/10 focus:text-[var(--branco-estelar)] cursor-pointer"
                  onClick={() => alert("Profile feature coming soon!")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-[var(--cinza-tatico-claro)] hover:text-[var(--branco-estelar)] hover:bg-[var(--azul-genese)]/10 focus:bg-[var(--azul-genese)]/10 focus:text-[var(--branco-estelar)] cursor-pointer"
                  onClick={() => alert("Settings feature coming soon!")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--cinza-tatico-escuro)]/50" />
                <DropdownMenuItem
                  className="text-[var(--vermelho-apice)] hover:text-[var(--vermelho-apice)] hover:bg-[var(--vermelho-apice)]/10 focus:bg-[var(--vermelho-apice)]/10 focus:text-[var(--vermelho-apice)]"
                  onClick={onSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-[var(--cinza-tatico-claro)] hover:text-[var(--branco-estelar)]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden py-4 border-t border-[var(--azul-genese)]/20"
          >
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (item.href === "/dashboard/analyze") {
                      document.getElementById("plant-analysis-card")?.scrollIntoView({ behavior: "smooth" });
                    } else if (item.href === "/dashboard/chat") {
                      document.getElementById("chat-interface-card")?.scrollIntoView({ behavior: "smooth" });
                    } else if (item.href === "/dashboard/settings") {
                      alert("Settings feature coming soon!");
                    }
                  }}
                  className={`w-full justify-start flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    item.active
                      ? "bg-[var(--azul-genese)]/20 text-[var(--azul-genese)] border border-[var(--azul-genese)]/30"
                      : "text-[var(--cinza-tatico-claro)] hover:text-[var(--branco-estelar)] hover:bg-[var(--azul-genese)]/10"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
