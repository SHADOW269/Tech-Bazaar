
"use client";

import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Smartphone, Mail, Calendar, User, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { formatDateIST } from "@/lib/formatters";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, "users", user.uid) : null, [firestore, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  if (isUserLoading || isProfileLoading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-8 animate-pulse">
        <div className="max-w-2xl mx-auto">
          <div className="h-64 bg-muted rounded-xl mb-8"></div>
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="shadow-lg overflow-hidden">
            <div className="h-32 bg-primary/10 w-full" />
            <div className="px-8 pb-8 -mt-12 relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage src={profile?.profileImage} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold font-headline">{profile?.name || "Anonymous User"}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/my-listings">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Manage Listings
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> Full Name
                  </Label>
                  <Input value={profile?.name || ""} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email Address
                  </Label>
                  <Input value={user.email || ""} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> Phone Number
                  </Label>
                  <Input value={profile?.phone || "Not provided"} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Joined On
                  </Label>
                  <Input value={profile?.createdAt ? formatDateIST(profile.createdAt) : "Recently"} readOnly className="bg-muted/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
