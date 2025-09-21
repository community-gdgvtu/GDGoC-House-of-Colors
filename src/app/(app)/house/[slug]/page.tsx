
import { notFound } from "next/navigation";
import { HousePageClient } from "./house-page-client";
import { type House } from "@/lib/data";
import { adminDb } from "@/lib/firebase-admin";

async function getHouseFromFirestore(id: string): Promise<House | null> {
    const docRef = adminDb.collection("houses").doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as House;
    } else {
        return null;
    }
}


export default async function HousePage({ params }: { params: { slug: string } }) {
  const house = await getHouseFromFirestore(params.slug);

  if (!house) {
    notFound();
  }

  return <HousePageClient house={house} />;
}
