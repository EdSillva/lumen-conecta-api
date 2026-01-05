import { getSupabase } from "../shared/supabase";
import { Role } from "../types/role";

export type User = {
  id: string;
  firebase_uid: string;
  email: string | null;
  roles: Role[];
};

export async function findUserByFirebaseUid(uid: string): Promise<User | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("firebase_uid", uid)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data;
}

export async function createUser(input: {
  firebase_uid: string;
  email?: string;
  roles?: Role[];
}): Promise<User> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("users")
    .insert({
      firebase_uid: input.firebase_uid,
      email: input.email ?? null,
      roles: input.roles ?? ["PUBLIC"],
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function setUserRoles(
  userId: string,
  roles: Role[]
): Promise<Role[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("users")
    .update({ roles })
    .eq("id", userId)
    .select("roles")
    .single();

  if (error) {
    throw error;
  }

  return data.roles;
}
