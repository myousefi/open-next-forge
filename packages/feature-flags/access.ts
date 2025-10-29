import { NextResponse, type NextRequest } from "next/server";
import { getRegisteredFlags } from "./lib/create-flag";
import { keys } from "./keys";

type DefinitionsResponse = {
  readonly definitions: Record<
    string,
    {
      readonly origin?: string;
      readonly description?: string;
      readonly options?: readonly string[];
      readonly defaultValue: boolean;
    }
  >;
};

const fetchRemoteDefinitions = async () => {
  const { FLAGS_SERVICE_URL, FLAGS_SERVICE_ADMIN_TOKEN } = keys();

  if (!FLAGS_SERVICE_URL || !FLAGS_SERVICE_ADMIN_TOKEN) {
    return null;
  }

  try {
    const response = await fetch(`${FLAGS_SERVICE_URL}/definitions`, {
      headers: {
        Authorization: `Bearer ${FLAGS_SERVICE_ADMIN_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as DefinitionsResponse;
  } catch (error) {
    console.error("Failed to load remote flag definitions", { error });

    return null;
  }
};

export const getFlags = async (request: NextRequest) => {
  const { FLAGS_SECRET } = keys();

  if (!FLAGS_SECRET) {
    return NextResponse.json(null, { status: 404 });
  }

  const token = request.headers.get("Authorization");

  if (token !== `Bearer ${FLAGS_SECRET}`) {
    return NextResponse.json(null, { status: 401 });
  }

  const localDefinitions: DefinitionsResponse["definitions"] = Object.fromEntries(
    getRegisteredFlags().map((flag) => [
      flag.key,
      {
        origin: flag.origin,
        description: flag.description,
        options: flag.options,
        defaultValue: flag.defaultValue,
      },
    ])
  );

  const remoteDefinitions = await fetchRemoteDefinitions();

  if (!remoteDefinitions) {
    return NextResponse.json<DefinitionsResponse>({
      definitions: localDefinitions,
    });
  }

  return NextResponse.json<DefinitionsResponse>({
    definitions: {
      ...localDefinitions,
      ...remoteDefinitions.definitions,
    },
  });
};
