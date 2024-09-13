import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { FiBriefcase, FiHome, FiSettings, FiUsers } from "react-icons/fi"
import { MdOutlineSensors } from "react-icons/md";
import { VscGraph } from "react-icons/vsc";
import { BsFiletypeCsv } from "react-icons/bs";

import type { UserPublic } from "../../client"

const items = [
  { index: 1, icon: FiHome, title: "Home", path: "/" },
  { index: 2, icon: VscGraph, title: "Dashboard", path: "/dashboard" },
  { index: 3, icon: MdOutlineSensors, title: "Sensors", path: "/sensors" },
  { index: 5, icon: FiSettings, title: "User Settings", path: "/settings" },
]

const superuser_items = [
  { index: 4, icon: BsFiletypeCsv, title: "Upload", path: "/upload" },
  { index: 6, icon: FiUsers, title: "Admin", path: "/admin" }
]

interface SidebarItemsProps {
  onClose?: () => void
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const textColor = useColorModeValue("ui.main", "ui.light")
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568")
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])

  const finalItems = currentUser?.is_superuser
    ? [...items, ...superuser_items]
    : items

  const listItems = finalItems
    .sort((a, b) => a.index - b.index)
    .map(({ icon, title, path }) => (
    <Flex
      as={Link}
      to={path}
      w="100%"
      p={2}
      key={title}
      activeProps={{
        style: {
          background: bgActive,
          borderRadius: "12px",
        },
      }}
      color={textColor}
      onClick={onClose}
    >
      <Icon as={icon} alignSelf="center" />
      <Text ml={2}>{title}</Text>
    </Flex>
  ))

  return (
    <>
      <Box>{listItems}</Box>
    </>
  )
}

export default SidebarItems
