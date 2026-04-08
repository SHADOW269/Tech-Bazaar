
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Smartphone, MessageCircle, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/firebase";
import { formatINR, formatDateIST, cleanPhoneForWhatsApp } from "@/lib/formatters";

export default function ListingDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const listingRef = useMemoFirebase(() => id ? doc(firestore, "listings", id as string) : null, [firestore, id]);
  const { data: listing, isLoading: isListingLoading } = useDoc(listingRef);
  
  const [seller, setSeller] = useState<any>(null);
  const [isSellerLoading, setIsSellerLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchSeller() {
      if (listing?.userId) {
        setIsSellerLoading(true);
        try {
          const sellerDoc = await getDoc(doc(firestore, "users", listing.userId));
          if (sellerDoc.exists()) {
            setSeller(sellerDoc.data());
          }
        } catch (e) {
          console.error("Error fetching seller:", e);
        }
        setIsSellerLoading(false);
      }
    }
    fetchSeller();
  }, [firestore, listing?.userId]);

  if (isListingLoading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-8 animate-pulse">
        <div className="h-96 bg-muted rounded-xl mb-8"></div>
        <div className="h-12 bg-muted rounded-lg w-1/2 mb-4"></div>
        <div className="h-6 bg-muted rounded w-1/4"></div>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <Button onClick={() => router.push("/")} className="mt-4">Back to home</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-6 -ml-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-2xl overflow-hidden border shadow-sm bg-muted/30">
              <Image 
                src={listing.images[activeImage] || `https://picsum.photos/seed/${listing.id}/800/600`} 
                alt={listing.title} 
                fill 
                className="object-contain"
                data-ai-hint="product image"
              />
            </div>
            
            {listing.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {listing.images.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImage === i ? "border-primary" : "border-transparent"}`}
                  >
                    <Image src={img} alt={`${listing.title} ${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="text-3xl font-headline font-bold">{listing.title}</h1>
                <div className="text-3xl font-bold text-primary">{formatINR(listing.price)}</div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.city}{listing.state ? `, ${listing.state}` : ''}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Listed {formatDateIST(listing.createdAt)}
                </div>
                <Badge variant="secondary">{listing.category}</Badge>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-3">Description</h3>
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="shadow-md">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl overflow-hidden relative border">
                    {seller?.profileImage ? (
                      <Image src={seller.profileImage} alt={seller.name} fill className="object-cover" />
                    ) : (
                      seller?.name?.charAt(0).toUpperCase() || "S"
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{seller?.name || "Seller Info"}</h3>
                    <p className="text-sm text-muted-foreground">Active since {seller?.createdAt ? formatDateIST(seller.createdAt).split('/')[2] : '2024'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {seller?.phone && (
                    <Button className="w-full gap-2 h-12 text-lg" asChild>
                      <a href={`tel:${seller.phone}`}>
                        <Smartphone className="h-5 w-5" />
                        Call Seller
                      </a>
                    </Button>
                  )}
                  {seller?.phone && (
                    <Button variant="outline" className="w-full gap-2 h-12 text-lg border-green-500 text-green-600 hover:bg-green-50" asChild>
                      <a 
                        href={`https://wa.me/${cleanPhoneForWhatsApp(seller.phone)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-5 w-5" />
                        WhatsApp Seller
                      </a>
                    </Button>
                  )}
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Safety Tip: Always meet in a public place and verify the item before paying.
                </p>
              </CardContent>
            </Card>

            {user?.uid === listing.userId && (
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => router.push(`/listings/${listing.id}/edit`)}
              >
                Edit Your Listing
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
