import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import {
  loadAccount,
  saveAccount,
  type FailureKind,
} from "../api/accountClient";
import { AccountInfoScreen } from "./AccountInfoScreen";
import { getPushAvailability } from "./pushAvailability";
import type { AccountInfo } from "./types";

type State =
  | { status: "loading" }
  | { status: "ready"; account: AccountInfo }
  | { status: "error"; kind: FailureKind };

export function AccountInfoContainer({
  onUnauthorized,
  getPushAvailability: resolvePushAvailability = getPushAvailability,
}: {
  onUnauthorized: () => void;
  getPushAvailability?: () => Promise<AccountInfo["pushAvailability"]>;
}) {
  const [state, setState] = useState<State>({ status: "loading" });
  const unauthorizedRef = useRef(onUnauthorized);
  unauthorizedRef.current = onUnauthorized;
  const resolvePushAvailabilityRef = useRef(resolvePushAvailability);
  resolvePushAvailabilityRef.current = resolvePushAvailability;
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState({ status: "loading" });

    try {
      const result = await loadAccount();
      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      if (result.ok) {
        let pushAvailability: AccountInfo["pushAvailability"] = "unavailable";
        try {
          pushAvailability = await resolvePushAvailabilityRef.current();
        } catch {
          // A capability check must not prevent account data from loading.
        }
        if (!mountedRef.current || requestId !== requestIdRef.current) return;
        setState({
          status: "ready",
          account: { ...result.data, pushAvailability },
        });
      } else if (result.failure.kind === "unauthorized") {
        unauthorizedRef.current();
      } else {
        setState({ status: "error", kind: result.failure.kind });
      }
    } catch {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setState({ status: "error", kind: "network" });
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void load();
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [load]);

  const handleSave = useCallback(async (next: AccountInfo) => {
    await saveAccount(next);
    if (mountedRef.current) setState({ status: "ready", account: next });
  }, []);

  if (state.status === "loading") {
    return <ActivityIndicator accessibilityLabel="Loading account" />;
  }

  if (state.status === "error") {
    return (
      <View>
        <Text>
          {state.kind === "network"
            ? "Unable to connect. Try again."
            : "We couldn't load your account. Try again."}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => void load()}>
          <Text>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return <AccountInfoScreen account={state.account} onSave={handleSave} />;
}
