'use client';

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import Image from 'next/image';
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // router.push(`?channel=${searchInput}`);
      window.location.href = `?channel=${searchInput}`;
    }
  };

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <a href="/" className="flex items-center space-x-2">
            <Image
              src="/apple-touch-icon.png"
              width={20}
              height={20}
              alt="smiling frog face indicating happiness"
            />
            <span className="inline-block font-bold">FeelsMoodMan</span>
          </a>
          <form onSubmit={handleSearchSubmit} className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Stream..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </form>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <a
              href="https://github.com/janphilippkiel/FeelsMoodMan"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Icons.gitHub className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
