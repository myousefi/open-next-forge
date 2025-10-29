"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import type {
  ClientOptions,
  IUserInfo,
  ResolveUsersArgs,
} from "@liveblocks/client";
import type { ReactNode } from "react";

type LiveblocksUserInfo = IUserInfo & { color: string };

type LiveblocksUserMeta = {
  id?: string;
  info?: LiveblocksUserInfo;
};

type RoomProps = Omit<
  ClientOptions<LiveblocksUserMeta>,
  "authEndpoint" | "publicApiKey" | "resolveUsers"
> & {
  id: string;
  children: ReactNode;
  authEndpoint: string;
  fallback: ReactNode;
  resolveUsers?: (
    args: ResolveUsersArgs
  ) => Promise<LiveblocksUserInfo[] | undefined>;
};

export const Room = ({
  id,
  children,
  authEndpoint,
  fallback,
  resolveUsers,
  ...clientOptions
}: RoomProps) => {
  const providerOptions: ClientOptions<LiveblocksUserMeta> = {
    authEndpoint,
    ...clientOptions,
  };

  if (resolveUsers) {
    providerOptions.resolveUsers = async (args) => resolveUsers(args);
  }

  return (
    <LiveblocksProvider {...providerOptions}>
      <RoomProvider id={id} initialPresence={{ cursor: null }}>
        <ClientSideSuspense fallback={fallback}>{children}</ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};
