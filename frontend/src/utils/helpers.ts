export const formatCount = (count: number, label: string) => {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
};
