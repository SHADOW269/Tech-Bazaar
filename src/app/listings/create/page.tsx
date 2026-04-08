
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, X, Loader2, Info } from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navbar } from "@/components/navbar";

const CATEGORIES = ["Keyboard", "Mouse", "GPU", "Laptop", "CPU", "Monitor", "Other"];

/**
 * Resizes an image file locally to optimize upload size and speed.
 */
async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          if (width > height && width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          }, 'image/jpeg', 0.8);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Image element load failed"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}

export default function CreateListing() {
  const { firestore, storage, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Auth Required", description: "Please log in." });
      return;
    }

    if (!category) {
      toast({ variant: "destructive", title: "Category missing", description: "Select a category." });
      return;
    }

    if (images.length === 0) {
      toast({ variant: "destructive", title: "No photos", description: "Add at least one photo." });
      return;
    }

    setLoading(true);
    setStatus("Starting process...");
    console.log("Submit started for:", title);
    
    try {
      const imageUrls: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        setStatus(`Optimizing photo ${i + 1}/${images.length}...`);
        console.log(`Optimizing: ${image.name}`);
        
        let uploadBlob: Blob;
        try {
          uploadBlob = await resizeImage(image);
        } catch (resizeErr) {
          console.warn("Local optimization failed, using original file.", resizeErr);
          uploadBlob = image;
        }

        setStatus(`Uploading photo ${i + 1}/${images.length}...`);
        const filename = `${Date.now()}_${i}.jpg`;
        const storagePath = `listings/${user.uid}/${filename}`;
        const storageRef = ref(storage, storagePath);
        
        console.log(`Uploading to Firebase Storage: ${storagePath}`);
        const uploadResult = await uploadBytes(storageRef, uploadBlob);
        console.log(`Upload successful for: ${storagePath}`);
        
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        imageUrls.push(downloadUrl);
      }

      setStatus("Saving listing details...");
      console.log("Saving to Firestore...");
      const listingsRef = collection(firestore, "listings");
      
      const docRef = await addDoc(listingsRef, {
        userId: user.uid,
        title,
        description,
        price: parseFloat(price),
        category,
        city,
        state,
        images: imageUrls,
        createdAt: serverTimestamp(),
      });

      console.log("Firestore document created with ID:", docRef.id);
      toast({ title: "Success!", description: "Listing posted successfully." });
      
      // Navigate to my listings
      router.push("/my-listings");
    } catch (error: any) {
      console.error("Critical error during listing creation:", error);
      toast({ 
        variant: "destructive", 
        title: "Submission Failed", 
        description: error.message || "An unexpected error occurred. Please check your connection." 
      });
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="text-3xl font-headline font-bold">Post a New Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Listing Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Mechanical Keyboard" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required 
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={setCategory} disabled={loading} value={category}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="5000" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required 
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      placeholder="e.g. Mumbai" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required 
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Details about condition, age, etc." 
                    className="min-h-[120px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required 
                    disabled={loading}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Product Images</Label>
                  <Alert className="bg-primary/5 border-primary/20">
                    <Info className="h-4 w-4" />
                    <AlertTitle className="text-sm">Local Optimization</AlertTitle>
                    <AlertDescription className="text-xs">
                      Your photos will be optimized locally before upload to ensure the fastest processing time.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {previews.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                        <Image src={src} alt="Preview" fill className="object-cover" />
                        {!loading && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {!loading && (
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground uppercase font-bold text-center px-2">Add Photo</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-6 bg-muted/30 rounded-lg">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                      <p className="text-sm font-bold animate-pulse">{status}</p>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" type="button" onClick={() => router.back()}>
                        Cancel
                      </Button>
                      <Button type="submit" size="lg" className="px-10">
                        Post Listing
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
