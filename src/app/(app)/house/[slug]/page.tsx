
import { notFound } from "next/navigation";
import { HousePageClient } from "./house-page-client";
import { type House, type User } from "@/lib/data";
import { adminDb } from "@/lib/firebase-admin";

async function getHouseAndMembers(slug: string): Promise<{house: House | null, members: User[]}> {
    const houseRef = adminDb.collection("houses").doc(slug);
    const usersRef = adminDb.collection("users");

    // Fetch house and members in parallel
    const [houseSnap, usersSnap] = await Promise.all([
        houseRef.get(),
        usersRef.where("houseId", "==", slug).orderBy("points", "desc").get()
    ]);

    let house: House | null = null;
    if (houseSnap.exists) {
        house = { id: houseSnap.id, ...houseSnap.data() } as House;
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
