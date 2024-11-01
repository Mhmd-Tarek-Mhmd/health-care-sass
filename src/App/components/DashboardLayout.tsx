import React from "react";
import { useAppStore } from "@store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDisclosure, useColorModeValue } from "@chakra-ui/react";

import { LinkItemProps } from "@types";
import { BoxProps } from "@chakra-ui/react";

import {
  Box,
  Flex,
  Icon,
  Link,
  Text,
  Menu,
  Drawer,
  HStack,
  VStack,
  Avatar,
  MenuItem,
  MenuList,
  MenuButton,
  IconButton,
  CloseButton,
  DrawerContent,
  VisuallyHidden,
} from "@chakra-ui/react";
import Logo from "./Logo";
import ThemeToggler from "./ThemeToggler";
import LanguageSelect from "./LanguageSelect";
import { NavLink, Outlet } from "react-router-dom";
import { FiMenu, FiChevronDown } from "react-icons/fi";

const ASIDE_WIDTH = 240;
const MAIN_PADDING = 4;

interface DashboardProps {
  links: Array<LinkItemProps>;
}

const Dashboard = ({ links }: DashboardProps) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    if (window.location.pathname === "/dashboard") {
      navigate(links[0].to);
    }
  }, []);

  return (
    <Box
      sx={{
        minH: "100vh",
        display: "grid",
        gridTemplateRows: "80px 1fr",
        gridTemplateColumns: { base: "1fr", md: `${ASIDE_WIDTH}px 1fr` },
        gridTemplateAreas: {
          base: `"header" "main" "main"`,
          md: `"aside header" "aside main" "aside main"`,
        },
        ".desktop-aside": { display: { base: "none", md: "block" } },
        ".header": { gridArea: "header" },
        ".aside": { gridArea: "aside" },
        ".main": {
          gridArea: "main",
          minWidth: "100%",
          width: {
            base: "100vw",
            md: `calc(100vw - ${ASIDE_WIDTH}px - var(--chakra-space-${MAIN_PADDING}))`,
          },
        },
      }}
    >
      {/* Desktop Sidebar */}
      <SidebarContent links={links} onClose={() => onClose} />

      {/* Mobile Sidebar */}
      <Drawer
        size="full"
        isOpen={isOpen}
        autoFocus={false}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
      >
        <DrawerContent>
          <SidebarContent isMobile onClose={onClose} links={links} />
        </DrawerContent>
      </Drawer>

      {/* Header */}
      <Header onOpen={onOpen} />

      {/* Main */}
      <Box as="main" p={MAIN_PADDING} className="main">
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;

/**
 *
 *  SidebarContent
 *
 */

interface SidebarProps extends BoxProps {
  isMobile?: boolean;
  onClose: () => void;
  links: Array<LinkItemProps>;
}

const SidebarContent = ({ onClose, links, isMobile }: SidebarProps) => {
  return (
    <Box
      as="aside"
      height="100%"
      transition="3s ease"
      borderInlineStart="1px"
      bg={useColorModeValue("teal.500", "gray.900")}
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      className={`aside ${isMobile ? "mobile-aside" : "desktop-aside"}`}
    >
      <Flex h={20} alignItems="center" mx={8} justifyContent="space-between">
        <Logo />
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>

      {links.map((link) => (
        <NavItem key={link.label} {...link} />
      ))}
    </Box>
  );
};

/**
 *
 *  NavItem
 *
 */

interface NavItemProps extends LinkItemProps {}

const NavItem = ({ icon, to, label }: NavItemProps) => {
  const { t } = useTranslation();

  return (
    <Link
      to={to}
      as={NavLink}
      _focus={{ boxShadow: "none" }}
      style={{ textDecoration: "none" }}
      sx={{ "&.active .group": { bg: "teal.600" } }}
    >
      <Flex
        p={4}
        mx={4}
        mb={1}
        gap={4}
        role="group"
        color="white"
        align="center"
        cursor="pointer"
        className="group"
        borderRadius="lg"
        _hover={{ bg: "teal.600" }}
      >
        <Icon as={icon} fontSize="16" _groupHover={{ color: "white" }} />
        {t(label)}
      </Flex>
    </Link>
  );
};

/**
 *
 *  Header
 *
 */

interface HeaderProps {
  onOpen: () => void;
}

const Header = ({ onOpen }: HeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAppStore((state) => state.logout);
  const user = useAppStore((state) => state.auth?.user);

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Flex
      as="header"
      className="header"
      alignItems="center"
      px={{ base: 4, md: 4 }}
      borderBottomWidth="1px"
      bg={useColorModeValue("white", "gray.900")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
    >
      <VisuallyHidden as="h1">HealthCare</VisuallyHidden>
      <IconButton
        onClick={onOpen}
        icon={<FiMenu />}
        variant="outline"
        aria-label="open menu"
        display={{ base: "flex", md: "none" }}
      />

      <HStack spacing={2}>
        <LanguageSelect />
        <ThemeToggler isDarkOnly={false} />

        <Flex alignItems="center">
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              <HStack>
                <Avatar size="sm" src={user?.photoURL} />
                <VStack
                  ml="2"
                  spacing="1px"
                  alignItems="flex-start"
                  display={{ base: "none", md: "flex" }}
                >
                  <Text fontSize="sm">{user?.name}</Text>
                  <Text
                    fontSize="xs"
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    {user?.type}
                  </Text>
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue("white", "gray.900")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <MenuItem onClick={onLogout}>
                {t("actions.logout-btn-label")}
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};
