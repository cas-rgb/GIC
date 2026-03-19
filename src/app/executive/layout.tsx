import OmniFilterToolbar from "@/components/ui/OmniFilterToolbar";
export default function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-full">
      <OmniFilterToolbar />
      <div className="flex-1 w-full max-w-[1600px] mx-auto">
        {children}
      </div>
    </div>
  );
}
