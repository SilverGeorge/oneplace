import { AuthCard } from "@/components/AuthCard";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your email and we will send a reset link."
      footerText="Remembered your password?"
      footerLinkLabel="Back to login"
      footerLinkHref="/auth/login"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
