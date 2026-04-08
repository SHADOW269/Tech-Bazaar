
"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatINR, formatDateIST } from "@/lib/formatters";

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  city: string;
  images: string[];
  createdAt: any;
}

const CATEGORIES = ["All", "Keyboard", "Mouse", "GPU", "Laptop", "CPU", "Monitor", "Other"];

export default function Home() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const listingsQuery = useMemoFirebase(() => {
    let q = query(collection(firestore, "listings"), orderBy("createdAt", "desc"));
    if (selectedCategory !== "All") {
      q = query(q, where("category", "==", selectedCategory));
    }
    return q;
  }, [firestore, selectedCategory]);

  const { data: listings, isLoading } = useCollection<Listing>(listingsQuery);

  const filteredListings = listings?.filter((listing) =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-headline font-bold mb-4">Find Your Next Tech Upgrade</h1>
          <p className="text-muted-foreground text-lg mb-8">India's most trusted marketplace for used technology gear.</p>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search keyboards, mice, laptops..."
              className="pl-10 h-12 text-lg shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />
            ))
          ) : filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <Link href={`/listings/${listing.id}`} key={listing.id} className="group">
                <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={listing.images?.[0] || `https://picsum.photos/seed/${listing.id}/600/400`}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      data-ai-hint="tech product"
                    />
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="font-normal">
                        {listing.category}
                      </Badge>
                      <span className="text-xl font-bold text-primary">
                        {formatINR(listing.price)}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {listing.title}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 text-sm text-muted-foreground flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {listing.city}
                    </div>
                    <span>{formatDateIST(listing.createdAt)}</span>
                  </CardFooter>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl text-muted-foreground">No listings found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Tech Bazaar India. Built with Firebase and Next.js.</p>
        </div>
      </footer>
    </div>
  );
}
