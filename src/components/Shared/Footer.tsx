import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router";
import { Image } from "@/components/Shared/UI";
import { DEFAULT_AVATAR } from "@/data/constants";
import formatAddress from "@/helpers/formatAddress";
import sanitizeDStorageUrl from "@/helpers/sanitizeDStorageUrl";
import { useHeyAppStore } from "@/store/persisted/useHeyAppStore";

const currentYear = new Date().getFullYear();

const links = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/guidelines", label: "Guidelines" },
  { href: "https://hey.xyz/discord", label: "Discord" },
  { href: "/u/hey", label: "Hey" },
  { href: "https://github.com/bigint/hey", label: "GitHub" },
  { href: "/support", label: "Support" },
  { href: "https://hey.xyz/status", label: "Status" }
];

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

const Footer = () => {
  const { selectedApp } = useHeyAppStore();

  const { data } = useQuery(APP_QUERY, {
    skip: !selectedApp,
    variables: {
      request: { app: selectedApp }
    }
  });

  console.log('DEBUG: data')
  console.log(data);

  const appLogo = data?.app?.metadata?.logo
    ? sanitizeDStorageUrl(data.app.metadata.logo)
    : DEFAULT_AVATAR;

  return (
    <footer className="flex flex-wrap gap-x-[12px] gap-y-2 px-3 text-sm lg:px-0">
      <span className="font-bold text-gray-500 dark:text-gray-200">
        &copy; {currentYear} Hey.xyz
      </span>
      {links.map(({ href, label }) => (
        <Link
          className="outline-offset-4"
          key={href}
          rel="noreferrer noopener"
          target={href.startsWith("http") ? "_blank" : undefined}
          to={href}
        >
          {label}
        </Link>
      ))}
      <Link
        className="flex items-center gap-1 outline-offset-4"
        to={`https://lenscan.io/app/${selectedApp}`}
        rel="noreferrer noopener"
        target="_blank"
      >
        <Image
          alt={data?.app?.metadata?.name || "App"}
          className="size-4 rounded"
          height={16}
          src={appLogo}
          width={16}
        />
        {formatAddress(selectedApp)}
      </Link>
    </footer>
  );
};

export default Footer;
