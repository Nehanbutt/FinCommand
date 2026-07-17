import DottedBackground from "@/components/landing/DottedBackground";

export default function EtherealBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-gloss-accent/25 blur-[120px] animate-drift1" />
      <div className="absolute -right-32 top-6 h-[420px] w-[420px] rounded-full bg-gloss-accent2/20 blur-[110px] animate-drift2" />
      <div className="absolute bottom-[-160px] left-1/3 h-[480px] w-[480px] rounded-full bg-[#c08bff]/15 blur-[130px] animate-drift3" />
      <DottedBackground />
    </div>
  );
}
