import React from "react";
interface PageProps {
  params: Promise<{ userId: string }>;
}
const ViewProfilePage = async ({ params }: PageProps) => {
  const { userId } = await params;
  return <div>ViewProfilePage for user: {userId}</div>;
};

export default ViewProfilePage;
