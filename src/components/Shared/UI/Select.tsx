import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition
} from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { Fragment, memo, type ReactNode, useEffect, useRef, useState } from "react";
import Loader from "@/components/Shared/Loader";
import { Input } from "@/components/Shared/UI";
import cn from "@/helpers/cn";

interface SelectProps {
  className?: string;
  defaultValue?: string;
  emptyMessage?: string;
  iconClassName?: string;
  loading?: boolean;
  onChange: (value: any) => any;
  onOpen?: () => void;
  onSearch?: (query: string) => void;
  options?: {
    disabled?: boolean;
    helper?: string;
    icon?: string;
    label: string;
    htmlLabel?: ReactNode;
    selected?: boolean;
    value: number | string;
  }[];
  showSearch?: boolean;
}

const Select = ({
  className,
  defaultValue,
  emptyMessage = "No results found",
  iconClassName,
  loading = false,
  onChange,
  onOpen,
  onSearch,
  options,
  showSearch = false
}: SelectProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const hasCalledOnOpen = useRef(false);
  const selected = options?.find((option) => option.selected) || options?.[0];

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  useEffect(() => {
    if (isOpen && onOpen && !hasCalledOnOpen.current) {
      onOpen();
      hasCalledOnOpen.current = true;
    }
    if (!isOpen) {
      hasCalledOnOpen.current = false;
    }
  }, [isOpen, onOpen]);

  return (
    <Listbox onChange={onChange} value={defaultValue || selected?.value}>
      <div className="relative">
        <ListboxButton
          onClick={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          className={cn(
            "flex w-full items-center justify-between space-x-3 rounded-xl border border-gray-300 bg-white px-3 py-2 text-left outline-hidden focus:border-gray-500 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800",
            className
          )}
        >
          <span className="flex items-center space-x-2">
            {selected?.icon && (
              <img
                alt={selected?.label}
                className={iconClassName}
                src={selected?.icon}
              />
            )}
            <span>{selected?.htmlLabel || selected?.label}</span>
          </span>
          <ChevronDownIcon className="mr-1 size-5 text-gray-400" />
        </ListboxButton>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <ListboxOptions className="no-scrollbar absolute z-[5] mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xs focus:outline-hidden dark:border-gray-700 dark:bg-gray-900">
            {showSearch ? (
              <div className="mx-4 mt-4">
                <Input
                  className="w-full"
                  iconLeft={<MagnifyingGlassIcon />}
                  onChange={(event) => {
                    handleSearchChange(event.target.value);
                  }}
                  placeholder="Search"
                  type="text"
                  value={searchValue}
                />
              </div>
            ) : null}
            {loading ? (
              <div className="py-4">
                <Loader className="my-2" message="Searching apps..." small />
              </div>
            ) : (
              <>
                {options
                  ?.filter((option) =>
                    option.label.toLowerCase().includes(searchValue.toLowerCase())
                  )
                  .map((option, id) => (
                    <ListboxOption
                      className={({ focus }: { focus: boolean }) =>
                        cn(
                          { "dropdown-active": focus },
                          "m-2 cursor-pointer rounded-lg"
                        )
                      }
                      disabled={option.disabled}
                      key={id}
                      value={option.value}
                    >
                      {({ selected }) => (
                        <div className="mx-2 flex flex-col space-y-0 py-1.5">
                          <span className="flex w-full items-center justify-between space-x-3 text-gray-700 dark:text-gray-200">
                            <span className="flex items-center space-x-2">
                              {option.icon && (
                                <img
                                  alt={option.label}
                                  className={iconClassName}
                                  src={option.icon}
                                />
                              )}
                              <span className="block truncate">
                                {option.htmlLabel || option.label}
                              </span>
                            </span>
                            {selected ? (
                              <CheckCircleIcon className="size-5" />
                            ) : null}
                          </span>
                          {option.helper ? (
                            <span className="text-gray-500 text-xs dark:text-gray-200">
                              {option.helper}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </ListboxOption>
                  ))}
                {!loading &&
                options &&
                options.filter((option) =>
                  option.label.toLowerCase().includes(searchValue.toLowerCase())
                ).length === 0 ? (
                  <div className="px-4 py-4 text-center text-gray-500 text-sm dark:text-gray-400">
                    {emptyMessage}
                  </div>
                ) : null}
              </>
            )}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  );
};

export default memo(Select);
