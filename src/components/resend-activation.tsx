import LogoIcon from "@/assets/images/favicon-white.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function ResendActivation() {
  return (
    <section className="flex min-h-screen px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        action=""
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link to="/" aria-label="go home" className="mx-auto block w-fit">
              <img src={LogoIcon} alt="Hisaab Plus Logo" className="size-16" />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Resend Activation Mail
            </h1>
            <p className="text-sm">
              Enter your email to receive a activation link
            </p>
          </div>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                placeholder="name@example.com"
              />
            </div>

            <Button className="w-full">Send Activation Mail</Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              We'll send you a link to activate your account.
            </p>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Already activated?
            <Button asChild variant="link" className="px-2">
              <Link to="/login">Log in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
