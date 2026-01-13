import { Box } from "@mui/material";
import SmallEventSkeleton from "./SmallEventSkeleton/SmallEventSkeleton";

export default function EventListSkeleton({
  className,
}: {
  className?: string;
}) {
  const skeletonItems = Array.from({ length: 5 }, (_, index) => (
    <SmallEventSkeleton key={index} />
  ));

  return <Box className={className}>{skeletonItems}</Box>;
}
