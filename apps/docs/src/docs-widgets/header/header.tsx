import { Lucide, Modal } from "@kunai-consulting/qwik";
import { Navbar } from "@kunai-consulting/qwik";
import { component$, useStyles$ } from "@qwik.dev/core";
import componentsImg from "~/assets/decor/components.webp";
import compositionImg from "~/assets/decor/composition.webp";
import contributingImg from "~/assets/decor/contributing.webp";
import guidesImg from "~/assets/decor/guides.webp";
import iconsImg from "~/assets/decor/icons.webp";
import introductionImg from "~/assets/decor/introduction.webp";
import utilitiesImg from "~/assets/decor/utilities.webp";
import { Action } from "../action/action";
import styles from "./header.css?inline";

export const Header = component$(() => {
  useStyles$(styles);

  return (
    <>
      <header class="z-[99999] relative flex justify-center">
        <MobileNav />
        <DesktopNav />
      </header>
      <div
        class="fixed inset-0 opacity-0 transition-all duration-[500ms] ease pointer-events-none z-[99998] bg-light-950/85"
        data-navbar-backdrop
      />
    </>
  );
});

const DesktopNav = component$(() => {
  type NavLink = {
    href: string;
    label: string;
    description: string | undefined;
    image: string | undefined;
    fullColumn?: boolean;
    halfHeight?: boolean;
  };

  const getImageObjectPosition = (link: NavLink) => {
    if (link.label === "Icons") return "center 80%";
    if (link.label === "Composition") return "70% 90%";
    if (link.halfHeight) return "center 75%";
    return "center bottom";
  };

  const getGradientBackground = (link: NavLink) => {
    if (link.halfHeight) {
      return "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 35%, transparent 70%)";
    }
    return `linear-gradient(180deg, transparent 0%, transparent 75%, var(--color-light-950) 90%),
            radial-gradient(ellipse 180% 120% at 10% 90%, var(--color-light-950) 0%, transparent 40%)`;
  };

  const getGridStyles = (item: { label: string }, link: NavLink) => {
    if (item.label !== "Tools") return {};

    return {
      gridRow: link.fullColumn ? "1 / 3" : link.halfHeight ? "span 1" : "auto",
      gridColumn: link.halfHeight ? "2" : "auto"
    };
  };

  const getContentGridTemplate = (label: string) => {
    const hasMultipleColumns = ["UI", "Tools", "Learn"].includes(label);
    return {
      gridTemplateColumns: hasMultipleColumns ? "1fr 1fr" : "1fr",
      gridTemplateRows: label === "Tools" ? "1fr 1fr" : "auto"
    };
  };

  const navData = [
    {
      href: "/",
      label: "QDS",
      icon: <QwikLogo />
    },
    {
      label: "UI",
      links: [
        {
          href: "/wip",
          label: "Introduction",
          description: "Getting started with QDS",
          image: introductionImg
        },
        {
          href: "/wip",
          label: "Components",
          description: "Browse the component library",
          image: componentsImg
        }
      ]
    },
    {
      label: "Tools",
      links: [
        {
          href: "/wip",
          label: "Utils",
          description: "Utilities for building design systems",
          image: utilitiesImg,
          fullColumn: true
        },
        {
          href: "/wip",
          label: "Icons",
          description: "Over 200 icon packs you can use",
          image: iconsImg,
          halfHeight: true
        },
        {
          href: "/wip",
          label: "Composition",
          description: "Using the asChild pattern",
          image: compositionImg,
          halfHeight: true
        }
      ]
    },
    {
      label: "Learn",
      links: [
        {
          href: "/wip",
          label: "Guides",
          description: "Best practices and patterns",
          image: guidesImg
        },
        {
          href: "/wip",
          label: "Contributing",
          description: "Get involved in QDS development",
          image: contributingImg
        }
      ]
    }
  ];

  const firstItem = navData[0];
  const restOfItems = navData.slice(1);

  return (
    <Navbar.Root class="hidden lg:block px-6 bg-white fixed top-6 w-full rounded-2xl border-[1.6px] border-blue-300 max-w-[600px] shadow-[6px_6px_0_0px_var(--color-blue-200)]">
      <Navbar.List class="flex items-center justify-between">
        <Navbar.Item>
          <Navbar.ItemLink href={firstItem.href} class="flex items-center gap-2">
            {firstItem.icon}
            <span class="font-arcade text-xl ">{firstItem.label}</span>
          </Navbar.ItemLink>
        </Navbar.Item>
        <li>
          <ul class="flex items-center">
            {restOfItems.map((item) => (
              <Navbar.Item key={item.label} class="relative" data-navbar-item>
                {/* "bridge" to make hover possible between the gap */}
                <div
                  aria-hidden="true"
                  class="absolute top-15 h-10 w-full z-99999 cursor-pointer"
                />
                <Navbar.ItemTrigger
                  class="w-fit flex items-center gap-2 group data-open:text-blue-600 transition-colors duration-200 px-5 h-[76px]"
                  data-mega-collapsible
                >
                  <span>{item.label}</span>
                </Navbar.ItemTrigger>
                <Navbar.ItemContent
                  class="open:grid gap-4 max-w-[600px] w-full shadow-[6px_6px_0_0px_var(--color-blue-200)] rounded-2xl p-4 border-[1.6px] border-blue-300 transition-discrete duration-[325ms] ease-in-out open:animate-fade-in not-open:animate-fade-out"
                  style={getContentGridTemplate(item.label)}
                  data-mega-popover
                >
                  {item.links?.map((link) => {
                    const navLink = link as NavLink;
                    const imageHeight = navLink.halfHeight ? "h-35" : "h-70";
                    const imageClasses = `w-full ${imageHeight} object-cover group-hover:scale-105 focus-visible:scale-105 transition-transform duration-300 will-change-transform`;

                    return (
                      <Navbar.ItemLink
                        key={link.label}
                        href={link.href}
                        class="flex flex-col gap-2 relative rounded-lg overflow-hidden border-2 border-[#94B0E4] group"
                        style={getGridStyles(item, navLink)}
                      >
                        {link.image && (
                          <img
                            src={link.image}
                            alt=""
                            class={imageClasses}
                            style={{ objectPosition: getImageObjectPosition(navLink) }}
                          />
                        )}
                        <div
                          class="absolute inset-0 pointer-events-none"
                          style={{ background: getGradientBackground(navLink) }}
                        />
                        <div class="flex flex-col p-2 absolute bottom-0 w-full">
                          <span class="font-semibold text-white">{link.label}</span>
                          {link.description && (
                            <span class="text-sm text-light-300">{link.description}</span>
                          )}
                        </div>
                      </Navbar.ItemLink>
                    );
                  })}
                </Navbar.ItemContent>
              </Navbar.Item>
            ))}
          </ul>
        </li>
        <Navbar.Item>
          <Action as="a" variant="primary" href="/wip">
            <span>Get Started</span>
            <Lucide.ArrowRight class="size-4" />
          </Action>
        </Navbar.Item>
      </Navbar.List>
    </Navbar.Root>
  );
});

const MobileNav = component$(() => {
  return (
    <div class="flex items-center justify-between w-full h-16 lg:hidden bg-white border-b-2 border-lavender-200">
      <a href="/" class="p-4 flex items-center gap-2" aria-label="QDS Home">
        <QwikLogo />
        <span class="font-arcade text-xl ">QDS</span>
      </a>

      <Modal.Root>
        <Modal.Trigger class="p-4" type="button">
          <Lucide.Menu class="size-6" />
        </Modal.Trigger>

        <Modal.Content class="w-full h-full">
          <Modal.Close class="p-4 absolute top-1 right-0">
            <Lucide.X class="size-6" />
          </Modal.Close>
          <p>Navigation</p>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
});

const QwikLogo = component$(() => {
  return (
    <div>
      <svg
        width="26"
        height="28"
        viewBox="0 0 26 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M22.4581 28L17.587 23.1565L17.5125 23.1671V23.114L7.1535 12.8853L9.70603 10.421L8.20642 1.81744L1.09123 10.6335C-0.121222 11.855 -0.344567 13.8412 0.527548 15.307L4.97321 22.6785C5.65388 23.815 6.88761 24.4948 8.21705 24.4842L10.4186 24.463L22.4581 28Z"
          fill="#18B6F6"
        />
        <path
          d="M25.117 10.4635L24.1385 8.65779L23.628 7.7337L23.4259 7.37256L23.4047 7.3938L20.7245 2.75211C20.0545 1.58372 18.7995 0.861444 17.4381 0.872066L15.0877 0.935793L8.07884 0.957038C6.7494 0.96766 5.53694 1.6687 4.8669 2.80522L0.602051 11.2601L8.22774 1.79616L18.2252 12.779L16.449 14.5741L17.5126 23.1671L17.5232 23.1458V23.1671H17.5019L17.5232 23.1883L18.3528 23.9956L22.3837 27.9362C22.5538 28.0956 22.8304 27.9044 22.7134 27.7025L20.2246 22.8059L24.5639 14.7865L24.7022 14.6272C24.7554 14.5635 24.8086 14.4997 24.8511 14.436C25.702 13.2782 25.8189 11.7275 25.117 10.4635Z"
          fill="#AC7EF4"
        />
        <path
          d="M18.2571 12.7366L8.22776 1.80681L9.65292 10.3679L7.10039 12.8428L17.4913 23.1565L16.5554 14.5954L18.2571 12.7366Z"
          fill="white"
        />
      </svg>
    </div>
  );
});
