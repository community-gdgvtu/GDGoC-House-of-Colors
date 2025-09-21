
import { notFound } from "next/navigation";
import { HousePageClient } from "./house-page-client";
import { type House, type User } from "@/lib/data";
import { adminDb } from "@/lib/firebase-admin";

async function getHouseAndMembers(slug: string): Promise<{house: House | null, members: User[]}> {
    const houseDoc = await adminDb.collection("houses").doc(slug).get();

    if (!houseDoc.exists) {
         // Try finding by slugified name as a fallback
        const housesSnapshot = await adminDb.collection("houses").get();
        const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-');
        for (const doc of housesSnapshot.docs) {
            const houseData = { id: doc.id, ...doc.data() } as House;
            if (slugify(houseData.name) === slug) {
                const usersRef = adminDb.collection("users");
                const usersSnap = await usersRef.where("houseId", "==", houseData.id).orderBy("points", "desc").limit(1000).get();
                const members = usersSnap.docs.map(doc => doc.data() as User);
                return { house: houseData, members };
            }
        }
        return { house: null, members: [] };
    }
    
    const house = { id: houseDoc.id, ...houseDoc.data() } as House;
    
    const usersRef = adminDb.collection("users");
    // Explicitly set a high limit on the server to ensure all members are fetched.
    const usersSnap = await usersRef.where("houseId", "==", house.id).orderBy("points", "desc").limit(1000).get();
    
    const members = usersSnap.docs.map(doc => doc.data() as User);

    return { house, members };
}


export default async function HousePage({ params }: { params: { slug: string } }) {
  const { house, members } = await getHouseAndMembers(params.slug);

  if (!house) {
    notFound();
  }

  return <HousePageClient house={house} initialMembers={members} />;
}
