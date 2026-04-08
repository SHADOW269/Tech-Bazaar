
"use client";

import Link from "next/link";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { doc } from "firebase/firestore";
import { 
  Plus, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard,
  Smartphone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => user ? doc(firestore, "users", user.uid) : null, [firestore, user]);
  const { data: profile } = useDoc(profileRef);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Smartphone className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold tracking-tight">Tech Bazaar</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/listings/create" passHref>
            <Button variant="default" size="sm" className="hidden sm:flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post Listing
            </Button>
            <Button variant="default" size="icon" className="sm:hidden">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.profileImage} alt={profile?.name} />
                    <AvatarFallback>{profile?.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {profile?.name && <p className="font-medium">{profile.name}</p>}
                    {user.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-listings" className="flex items-center cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>My Listings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
