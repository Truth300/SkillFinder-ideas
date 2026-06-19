import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <SignIn routing="hash" />
    </div>
  );
}
