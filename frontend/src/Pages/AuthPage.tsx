import { createClient } from "@/lib/client";

const supabase = createClient();

export default function AuthPage() {
  async function login(provider: "github" | "google") {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
    });

    if (error) {
      alert("Error while signing in");
    }
  }
  return (
    <div>
      <button onClick={() => login("google")}>Login with Google</button>
      <br />
      <br />
      <button onClick={() => login("github")}>Login with Github</button>
    </div>
  );
}
