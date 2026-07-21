import { getGatewayRealtimeProtocols } from "@ai-sdk/gateway";
import type { Experimental_RealtimeModel as RealtimeModel } from "ai";

const REALTIME_MODEL_ID = "openai/gpt-realtime-2";

/**
 * Browser-safe Gateway realtime codec.
 *
 * `gateway.experimental_realtime()` currently throws in the browser (server-only
 * assert in the canary provider). The hook only needs WebSocket config + event
 * codec methods — auth stays on the short-lived token from the setup endpoint.
 */
export function createGatewayBrowserRealtimeModel(
  modelId: string = REALTIME_MODEL_ID,
): RealtimeModel {
  return {
    specificationVersion: "v4",
    provider: "gateway.realtime",
    modelId,
    async doCreateClientSecret() {
      throw new Error(
        "Client secrets must be created on the server via /api/realtime/session",
      );
    },
    getWebSocketConfig(options: { token: string; url: string }) {
      return {
        url: options.url,
        protocols: getGatewayRealtimeProtocols(options.token),
      };
    },
    parseServerEvent(raw: unknown) {
      return raw as ReturnType<RealtimeModel["parseServerEvent"]>;
    },
    serializeClientEvent(event: Parameters<RealtimeModel["serializeClientEvent"]>[0]) {
      return event;
    },
    buildSessionConfig(config: Parameters<RealtimeModel["buildSessionConfig"]>[0]) {
      return config;
    },
  };
}

export { REALTIME_MODEL_ID };
