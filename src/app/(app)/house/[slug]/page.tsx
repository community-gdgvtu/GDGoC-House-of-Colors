
import { notFound } from "next/navigation";
import { HousePageClient } from "./house-page-client";
import { type House, type User } from "@/lib/data";
import { adminDb } from "@/lib/firebase-admin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

async function getHouseAndMembers(slug: string): Promise<{house: House | null, members: User[]}> {
    const housesRef = adminDb.collection("houses");
    const allHousesSnapshot = await housesRef.get();

    let foundHouse: House | null = null;
    allHousesSnapshot.forEach(doc => {
        const houseData = doc.data() as Omit<House, 'id'>;
        if (slugify(houseData.name) === slug) {
            foundHouse = { id: doc.id, ...houseData } as House;
        }
    });

    if (!foundHouse) {
        return { house: null, members: [] };
    }

    const usersRef = adminDb.collection("users");
    const usersSnap = await usersRef.where("houseId", "==", foundHouse.id).get();
    
    const members = usersSnap.docs.map(doc => doc.data() as User);
    
    // Sort members by points descending in code
    members.sort((a, b) => b.points - a.points);

    return { house: foundHouse, members };
}


export default async function HousePage({ params }: { params: { slug: string } }) {
  const { house, members } = await getHouseAndMembers(params.slug);

  if (!house) {
    notFound();
  }

  return <HousePageClient house={house} initialMembers={members} />;
}
