import { AuthCard } from "@/components/AuthCard";
import { SignupForm } from "@/components/forms/SignupForm";

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Start your free trial and launch faster."
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerLinkHref="/auth/login"
    >
      <SignupForm />
    </AuthCard>
  );
}
