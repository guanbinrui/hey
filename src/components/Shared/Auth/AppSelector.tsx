import { gql, useLazyQuery } from "@apollo/client";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_AVATAR, HEY_APP } from "@/data/constants";
import formatAddress from "@/helpers/formatAddress";
import sanitizeDStorageUrl from "@/helpers/sanitizeDStorageUrl";
import { AppsOrderBy, PageSize, type App } from "@/indexer/generated";
import { Select } from "@/components/Shared/UI";

const APPS_QUERY = gql`
  query Apps($request: AppsRequest!) {
    apps(request: $request) {
      items {
        address
        metadata {
          name
          logo
          description
          url
        }
      }
      pageInfo {
        ...PaginatedResultInfo
      }
    }
  }

  fragment PaginatedResultInfo on PaginatedResultInfo {
    next
    prev
  }
`;

const APP_QUERY = gql`
  query App($request: AppRequest!) {
    app(request: $request) {
      address
      metadata {
        name
        logo
      }
    }
  }
`;

interface AppSelectorProps {
  defaultValue?: string;
  onChange: (value: string) => void;
}

const AppSelector = ({ defaultValue, onChange }: AppSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [hasLoaded, setHasLoaded] = useState(false);
  const selectedApp = defaultValue || HEY_APP;

  const [fetchApps, { data, loading }] = useLazyQuery(APPS_QUERY, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true
  });
  const [fetchHeyApp, { data: heyAppQueryData }] = useLazyQuery(APP_QUERY);

  const remoteApps: App[] = data?.apps?.items || [];

  useEffect(() => {
    if (!hasLoaded) {
      fetchApps({
        variables: {
          request: {
            orderBy: AppsOrderBy.LatestFirst,
            pageSize: PageSize.Fifty
          }
        }
      });
      fetchHeyApp({
        variables: {
          request: { app: HEY_APP }
        }
      });
      setHasLoaded(true);
    } else if (debouncedSearchQuery.trim().length > 0) {
      fetchApps({
        variables: {
          request: {
            filter: { searchQuery: debouncedSearchQuery },
            orderBy: AppsOrderBy.LatestFirst,
            pageSize: PageSize.Fifty
          }
        }
      });
    } else {
      fetchApps({
        variables: {
          request: {
            orderBy: AppsOrderBy.LatestFirst,
            pageSize: PageSize.Fifty
          }
        }
      });
    }
  }, [debouncedSearchQuery, fetchApps, fetchHeyApp, hasLoaded]);
  const heyApp: App | null = heyAppQueryData?.app || null;
  
  const allApps = useMemo(() => {
    const appMap = new Map<string, string>();

    appMap.set(HEY_APP.toLowerCase(), HEY_APP);

    remoteApps.forEach((app: App) => {
      if (app?.address) {
        appMap.set(app.address.toLowerCase(), app.address);
      }
    });

    return Array.from(appMap.values());
  }, [remoteApps]);

  const appOptions = useMemo(() => {
    return allApps.map((app) => {
      const isHeyApp = app.toLowerCase() === HEY_APP.toLowerCase();
      const remoteApp = isHeyApp && heyApp
        ? heyApp
        : remoteApps.find(
            (r: App) => r.address.toLowerCase() === app.toLowerCase()
          );
      const appLogo = remoteApp?.metadata?.logo
        ? sanitizeDStorageUrl(remoteApp.metadata.logo)
        : DEFAULT_AVATAR;
      const appName = remoteApp?.metadata?.name || formatAddress(app);
      const appAddress = formatAddress(app);

      return {
        icon: appLogo,
        htmlLabel: (
          <span className="flex items-center gap-2">
            <span>{appName}</span>
            <span className="text-gray-500 text-xs dark:text-gray-400">
              {appAddress}
            </span>
          </span>
        ),
        label: `${appName} ${appAddress}`,
        selected: app.toLowerCase() === selectedApp.toLowerCase(),
        value: app
      };
    });
  }, [allApps, remoteApps, heyApp, selectedApp]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleOpen = () => {
    if (!hasLoaded) {
      fetchApps({
        variables: {
          request: {
            orderBy: AppsOrderBy.LatestFirst,
            pageSize: PageSize.Fifty
          }
        }
      });
      setHasLoaded(true);
    }
  };

  const isSearching = loading && (debouncedSearchQuery.trim().length > 0 || !hasLoaded);
  const emptyMessage = debouncedSearchQuery.trim().length > 0
    ? `No apps found for "${debouncedSearchQuery}"`
    : "No apps available";

  return (
    <Select
      className="w-full"
      defaultValue={selectedApp}
      emptyMessage={emptyMessage}
      iconClassName="size-5 rounded"
      loading={isSearching}
      onChange={onChange}
      onOpen={handleOpen}
      onSearch={handleSearch}
      options={appOptions}
      showSearch
    />
  );
};

export default AppSelector;

