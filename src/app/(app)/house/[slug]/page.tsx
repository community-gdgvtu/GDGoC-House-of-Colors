
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HousePageClient } from "./house-page-client";
import { type House } from "@/lib/data";

async function getHouseFromFirestore(id: string): Promise<House | null> {
    const docRef = doc(db, "houses", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
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
