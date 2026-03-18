import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#fff", padding: 24 }}>
      <SignUp />
    </div>
  );
}

