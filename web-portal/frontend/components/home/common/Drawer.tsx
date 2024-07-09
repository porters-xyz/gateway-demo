import { Drawer, Stack, Title } from "@mantine/core"
import NavLinks from "./NavLinks"

export default function NavDrawer({opened, close}: {
  opened: any,
  close: any
}){
  return (
    <Drawer opened={opened} onClose={close} size="100%">
        <Stack align="center" justify="space-evenly" color="cream.0">
           <NavLinks size={24}/>
        </Stack>
    </Drawer>
  )
}
