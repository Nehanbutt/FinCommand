// Ambient, dynamic backdrop for the onboarding page. Unlike the marketing
// pages, this deliberately has NO mouse-tracking / cursor-reactive layer —
// only slow, self-playing motion (CSS keyframes), so focus stays on the form.
export default function OnboardingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#3B5BFF]/20 blur-[130px] animate-drift1" />
      <div className="absolute -right-32 top-10 h-[440px] w-[440px] rounded-full bg-[#7C9BFF]/16 blur-[120px] animate-drift2" />
      <div className="absolute bottom-[-180px] left-1/3 h-[480px] w-[480px] rounded-full bg-[#c08bff]/12 blur-[140px] animate-drift3" />
    </div>
  );
}
