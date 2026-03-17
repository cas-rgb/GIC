export default function TestPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-rose-500 text-white font-black text-4xl uppercase">
      Server Connection Verified: {new Date().toLocaleTimeString()}
    </div>
  );
}
