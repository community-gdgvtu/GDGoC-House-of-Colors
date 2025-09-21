
import { notFound } from "next/navigation";
import { HousePageClient } from "./house-page-client";
import { type House, type User } from "@/lib/data";
import { adminDb } from "@/lib/firebase-admin";

async function getHouseAndMembers(slug: string): Promise<{house: House | null, members: User[]}> {
    const houseRef = adminDb.collection("houses").doc(slug);
    const houseDoc = await houseRef.get();

    if (!houseDoc.exists) {
        return { house: null, members: [] };
    }
    
    const house = { id: houseDoc.id, ...houseDoc.data() } as House;

    const usersRef = adminDb.collection("users");
    const usersSnap = await usersRef.where("houseId", "==", house.id).orderBy("points", "desc").get();
    
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
