
import { notFound } from "next/navigation";
import { HousePageClient } from "./house-page-client";
import { type House, type User } from "@/lib/data";
import { adminDb } from "@/lib/firebase-admin";

async function getHouseAndMembers(houseId: string): Promise<{house: House | null, members: User[]}> {
    const docRef = adminDb.collection("houses").doc(houseId);
    const usersRef = adminDb.collection("users");

    // Fetch house and members in parallel
    const [docSnap, usersSnap] = await Promise.all([
        docRef.get(),
        usersRef.where("houseId", "==", houseId).orderBy("points", "desc").get()
    ]);

    let house: House | null = null;
    if (docSnap.exists) {
        house = { id: docSnap.id, ...docSnap.data() } as House;
    }

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
