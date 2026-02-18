import { supabase } from "../config/superbase.js";

class UserService {
  async createUser(data) {
    const payload = {
      ...data,
      created_at: new Date().toISOString(),
      status: 1,
    };

    const { data: result, error } = await supabase
      .from("user")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return result;
  }

  async updateUser(id, data) {
    const { data: result, error } = await supabase
      .from("user")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !result) return undefined;

    return result;
  }

  async getAllUsers() {
    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("status", 1);

    if (error) throw error;

    return data || [];
  }
}

export const userService = new UserService();
