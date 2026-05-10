import { persistedAppDataSchema } from "@/lib/schemas";
import { PersistedAppData } from "@/types";

import { getBrowserSupabaseClient } from "@/lib/supabase/client";

import type { CloudStorageAdapter } from "./storage-adapter";

const TABLE_NAME = "user_hifz_snapshots";

export const supabaseStorageAdapter: CloudStorageAdapter = {
  async load(userId) {
    const supabase = getBrowserSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("payload")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.payload) {
      return null;
    }

    return persistedAppDataSchema.parse(data.payload);
  },
  async save(userId, payload) {
    const supabase = getBrowserSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert(
        {
          user_id: userId,
          payload,
          payload_version: payload.version,
        },
        {
          onConflict: "user_id",
        },
      )
      .select("updated_at")
      .single();

    if (error) {
      throw error;
    }

    return data?.updated_at;
  },
  async clear(userId) {
    const supabase = getBrowserSupabaseClient();
    const { error } = await supabase.from(TABLE_NAME).delete().eq("user_id", userId);

    if (error) {
      throw error;
    }
  },
};

export function clonePersistedPayload(payload: PersistedAppData) {
  return persistedAppDataSchema.parse(JSON.parse(JSON.stringify(payload)));
}
