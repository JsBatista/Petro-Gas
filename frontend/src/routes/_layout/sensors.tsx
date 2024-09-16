import {
  Button,
  Container,
  Flex,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"
import { format } from "date-fns";

import { SensorDataService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddSensorData from "../../components/SensorData/AddSensorData"

const sensorDataSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/sensors")({
  component: SensorData,
  validateSearch: (search: any) => sensorDataSearchSchema.parse(search),
})

const PER_PAGE = 5

function getSensorDataQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      SensorDataService.readSensorsData({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["sensors", { page }],
  }
}

function SensorDataTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: any) => ({ ...prev, page }) })

  const {
    data: sensorsData,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getSensorDataQueryOptions({ page }),
    placeholderData: (prevData: any) => prevData,
  })

  const hasNextPage = !isPlaceholderData && sensorsData?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getSensorDataQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>Equipment ID</Th>
              <Th>Timestamp</Th>
              <Th>Value</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(4).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {sensorsData?.data.map((sensorData) => (
                <Tr key={sensorData.id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td isTruncated maxWidth="150px">
                    {sensorData.equipment_id}
                  </Td>
                  <Td isTruncated maxWidth="150px">
                    {format(sensorData.timestamp, "dd/MM/yyyy HH:mm:ss")}
                  </Td>
                  <Td isTruncated maxWidth="150px">
                    {sensorData.value}
                  </Td>
                  <Td>
                    <ActionsMenu type={"Sensor Data"} value={sensorData} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <Flex
        gap={4}
        alignItems="center"
        mt={4}
        direction="row"
        justifyContent="flex-end"
      >
        <Button onClick={() => setPage(page - 1)} isDisabled={!hasPreviousPage}>
          Previous
        </Button>
        <span>Page {page}</span>
        <Button isDisabled={!hasNextPage} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </Flex>
    </>
  )
}

function SensorData() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Sensor Data Management
      </Heading>

      <Navbar type={"Sensor Data"} addModalAs={AddSensorData} />
      <SensorDataTable />
    </Container>
  )
}
