
import { notFound } from "next/navigation";
import { getHouseById } from "@/lib/data";
import { HousePageClient } from "./house-page-client";

export default function HousePage({ params }: { params: { slug: string } }) {
  const house = getHouseById(params.slug);

  if (!house) {
    notFound();
  }

  return <HousePageClient house={house} />;
}
