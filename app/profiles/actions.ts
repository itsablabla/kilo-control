"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { kilo } from "@/lib/kilo";

export async function createProfile(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) throw new Error("Name is required");
  const profile = await kilo.profiles.create({
    name,
    description: description || undefined,
  });
  revalidatePath("/profiles");
  redirect(`/profiles/${profile.id}`);
}

export async function updateProfile(formData: FormData) {
  const profileId = String(formData.get("profileId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  await kilo.profiles.update({
    profileId,
    name: name || undefined,
    description: description || undefined,
  });
  revalidatePath("/profiles");
  revalidatePath(`/profiles/${profileId}`);
}

export async function deleteProfile(formData: FormData) {
  const profileId = String(formData.get("profileId") ?? "");
  await kilo.profiles.delete(profileId);
  revalidatePath("/profiles");
  redirect("/profiles");
}

export async function setDefaultProfile(formData: FormData) {
  const profileId = String(formData.get("profileId") ?? "");
  await kilo.profiles.setAsDefault(profileId);
  revalidatePath("/profiles");
  revalidatePath(`/profiles/${profileId}`);
}

export async function saveCommands(formData: FormData) {
  const profileId = String(formData.get("profileId") ?? "");
  const raw = String(formData.get("commands") ?? "");
  const commands = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const offenders = commands.filter((c) => c.length > 500);
  if (offenders.length) {
    throw new Error(
      `${offenders.length} command(s) exceed 500 chars (Kilo limit). Split them into smaller lines.`
    );
  }
  await kilo.profiles.setCommands(profileId, commands);
  revalidatePath(`/profiles/${profileId}`);
}
