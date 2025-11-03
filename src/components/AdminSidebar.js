// components/Sidebar.js
"use client";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  HomeIcon,
  PowerIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { name: "Users", href: "/admin/users/get-users", icon: UserGroupIcon },
  { name: "Create User", href: "/admin/create-user", icon: UserGroupIcon },
  { name: "Sections", href: "/admin/sections", icon: UserGroupIcon },
];

export default function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const isActive = (path) => router.pathname === path;

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include", // important to send cookies
      });

      // Optional: clear client-side state (e.g. Redux, Context, etc.)

      // Redirect to login
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {/* Modern Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 text-white p-2 shadow-md transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-6 w-6 transition-transform duration-200" />
        </button>
      </div>


      {/* Mobile Sidebar */}
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="lg:hidden relative z-50" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 flex justify-end">
            <Dialog.Panel className="relative w-64 bg-white p-6 shadow-xl flex flex-col justify-between">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 tracking-tight">Admin Panel</h2>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive(item.href)
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Logout */}
              <button
                onClick={() => router.push("/user/login")}
                className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-100 rounded-lg"
              >
                <PowerIcon className="h-5 w-5" />
                Logout
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Sidebar */}
      <aside className="sticky top-0 z-50 hidden lg:flex lg:w-64 flex-col h-screen bg-white border-r p-6 shadow-sm">
        {/* Header */}
        <div className="text-xl font-bold text-gray-800 mb-6">Admin Panel</div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive(item.href)
                ? "bg-emerald-50 text-emerald-600"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-100 rounded-lg"
          >
            <PowerIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>

  );
}
