"use client";

import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface TableSubscription {
  table: string;
  filter?: string;
}

// Subscribes to Postgres Changes for the given tables and invalidates the
// React Query cache on any change — merges into existing cache via refetch
// instead of a hard window.location.reload().
export function useRealtimeInvalidate(
  channelName: string,
  subscriptions: TableSubscription[],
  queryKey: QueryKey,
) {
  const queryClient = useQueryClient();
  const subscriptionsKey = JSON.stringify(subscriptions);
  const queryKeyString = JSON.stringify(queryKey);

  useEffect(() => {
    const supabase = createClient();
    let channel = supabase.channel(channelName);

    for (const { table, filter } of subscriptions) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
        () => {
          queryClient.invalidateQueries({ queryKey });
        },
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, subscriptionsKey, queryKeyString]);
}
