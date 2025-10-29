declare module "@arcjet/transport/workerd.js" {
  import type { Transport } from "@connectrpc/connect";

  export function createTransport(baseUrl: string): Transport;
}
