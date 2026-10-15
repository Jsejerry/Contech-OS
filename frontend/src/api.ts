const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

export type WaitlistResult = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  position: number;
  already_joined: boolean;
};

export async function joinWaitlist(body: { name: string; email: string; role?: string | null }): Promise<WaitlistResult> {
  const res = await fetch(`${BASE}/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 422) throw new Error("Please check your name and email.");
    throw new Error("Something went wrong. Please try again.");
  }
  return res.json();
}

export async function getWaitlistCount(): Promise<number> {
  const res = await fetch(`${BASE}/waitlist/count`);
  if (!res.ok) throw new Error("count failed");
  const data = await res.json();
  return data.count;
}
