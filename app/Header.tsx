"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  function handleSearch() {
    if (search.trim()) {
      router.push(`/posts?title=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header className="w-full bg-white shadow-md py-4 px-8">
      <nav className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            大阪
          </Link>
          <div className="flex items-center">
            <div className="relative mr-2" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="bg-blue-500 text-white font-bold rounded-lg px-4 py-2 shadow hover:bg-blue-600 focus:outline-none transition flex items-center"
                aria-label="Open menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 8h16M4 16h16"
                  />
                </svg>
                <span className="ml-2 font-semibold"></span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10">
                  <Link
                    href="/posts"
                    className="block px-4 py-2 text-blue-700 font-semibold hover:bg-blue-50 rounded-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    Posts
                  </Link>
                  <Link
                    href="/posts/new"
                    className="block px-4 py-2 text-blue-700 font-semibold hover:bg-blue-50 rounded-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    New Post
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/users/new"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Register
            </Link>
          </div>
        </div>
        <div className="flex w-full items-center mt-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-32 md:min-w-48 max-w-md border rounded-l px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600 transition h-full"
            onClick={handleSearch}
          >
            搜索
          </button>
        </div>
      </nav>
    </header>
  );
}
