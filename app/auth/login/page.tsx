import { AuthCard } from "@/components/AuthCard";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue managing your SaaS business."
      footerText="New here?"
      footerLinkLabel="Create an account"
      footerLinkHref="/auth/signup"
    >
      <LoginForm />
    </AuthCard>
  );
}
