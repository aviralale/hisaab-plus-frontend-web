import { BusinessCreationForm } from "@/components/business-register-form";

export default function BusinessRegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <BusinessCreationForm />
      </div>
    </div>
  );
}
