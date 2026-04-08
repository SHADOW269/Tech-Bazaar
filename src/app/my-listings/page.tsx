
"use client";

import { Navbar } from "@/components/navbar";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Edit, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { formatINR } from "@/lib/formatters";

export default function MyListings() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const myListingsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, "listings"), where("userId", "==", user.uid));
  }, [firestore, user]);

  const { data: listings, isLoading: isListingsLoading } = useCollection(myListingsQuery);

  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    
    const listingRef = doc(firestore, "listings", listingId);
    deleteDocumentNonBlocking(listingRef);
    toast({ title: "Listing deleted" });
  };

  if (isUserLoading || isListingsLoading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-8 animate-pulse">
        <div className="h-12 bg-muted rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-[300px] bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to see your listings</h1>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-headline font-bold">My Listings</h1>
          <Button asChild>
            <Link href="/listings/create" className="gap-2">
              <Plus className="h-4 w-4" />
              New Listing
            </Link>
          </Button>
        </div>

        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden group">
                <div className="relative aspect-video">
                  <Image 
                    src={listing.images[0] || `https://picsum.photos/seed/${listing.id}/600/400`} 
                    alt={listing.title} 
                    fill 
                    className="object-cover" 
                    data-ai-hint="tech item"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md" asChild>
                      <Link href={`/listings/${listing.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
                    <span className="font-bold text-primary">{formatINR(listing.price)}</span>
                  </div>
                </CardHeader>
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                    <Link href={`/listings/${listing.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleDelete(listing.id)}
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-card p-12 rounded-xl text-center border">
            <p className="text-muted-foreground mb-6">You haven't posted any tech items yet.</p>
            <Button size="lg" asChild>
              <Link href="/listings/create">Sell Your First Item</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
