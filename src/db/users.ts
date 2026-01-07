import { z } from "zod";
import { getSupabase } from "../shared/supabase";
import { Role, createUserSchema, type UserResponse } from "../schemas/user";

type CreateUserInput = z.input<typeof createUserSchema> & {
  firebase_uid: string;
};

export async function findUserByFirebaseUid(
  uid: string,
): Promise<UserResponse | null> {
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

  return data as UserResponse;
}

export async function createUser(
  input: CreateUserInput,
): Promise<UserResponse> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("users")
    .insert({
      firebase_uid: input.firebase_uid,
      name: input.name,
      email: input.email,
      roles: input.roles ?? [Role.PUBLIC],
    })
    .select()
    .single<UserResponse>();

  if (error) {
    throw error;
  }

  return data;
}

export async function setUserRoles(
  userId: string,
  roles: Role[],
): Promise<Role[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("users")
    .update({ roles })
    .eq("id", userId)
    .select("roles")
    .single<{ roles: Role[] }>();

  if (error) {
    throw error;
  }

  return data.roles;
}

export async function updateUserProfile(
  userId: string,
  input: { name?: string; email?: string },
): Promise<UserResponse> {
  const supabase = getSupabase();

  const updates: Partial<Pick<UserResponse, "name" | "email" | "roles">> = {};
  if (typeof input.name === "string") updates.name = input.name;
  if (typeof input.email === "string") updates.email = input.email;

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single<UserResponse>();

  if (error) {
    throw error;
  }

  return data;
}
