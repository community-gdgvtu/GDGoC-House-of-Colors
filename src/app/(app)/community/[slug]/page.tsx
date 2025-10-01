
import { notFound } from "next/navigation";
import { CommunityPageClient } from "./community-page-client";
import { type Community, type User } from "@/lib/data";
import { adminDb } from "@/lib/firebase-admin";

async function getCommunityAndMembers(slug: string): Promise<{community: Community | null, members: User[]}> {
    const communityDoc = await adminDb.collection("communities").doc(slug).get();

    if (!communityDoc.exists) {
        return { community: null, members: [] };
    }
    
    const community = { id: communityDoc.id, ...communityDoc.data() } as Community;
    
    const usersRef = adminDb.collection("users");
    const usersSnap = await usersRef.where("communityId", "==", community.id).orderBy("points", "desc").limit(1000).get();
    
    const members = usersSnap.docs.map(doc => doc.data() as User);

    return { community, members };
}


export default async function CommunityPage({ params }: { params: { slug: string } }) {
  const { community, members } = await getCommunityAndMembers(params.slug);

  if (!community) {
    notFound();
  }

  return <CommunityPageClient community={community} initialMembers={members} />;
}
