import { Box, Container, Text } from "@chakra-ui/react"
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router"
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, Rectangle, Tooltip } from "recharts"
import { SensorDataService, TDataSensorDataDashboardFetch, TDataSensorDataFetchMode } from "../../client";

export const Route = createFileRoute("/_layout/dashboard")({
  component: Dashboard,
})


function Dashboard() {
  const queryClient = useQueryClient()

  const {
    data: sensorsData,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getSensorDataQueryOptions(),
    placeholderData: (prevData) => prevData,
  })

  function getSensorDataQueryOptions() {
    let data: TDataSensorDataDashboardFetch = {
      fetch_mode: TDataSensorDataFetchMode.CUSTOM,
      begin_custom_date: new Date(Date.parse("2023-02-15T00:00:00.000Z")),
      end_custom_date: new Date(Date.parse("2023-02-16T00:00:00.000Z"))
    }
    return {
      queryFn: () =>
        SensorDataService.readSensorDataDashboardBarChart(data),
      queryKey: ["sensor-bar-chart"],
    }
  }

  return (
    <>
      <Container maxW="full">
        <Box pt={12} m={4}>
          <Text fontSize="2xl">
            Dashboard
          </Text>
          <BarChart
              width={500}
              height={300}
              data={sensorsData?.data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="equipment_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg" fill="#3474eb" activeBar={<Rectangle fill="#14c741" />} />
            </BarChart>
        </Box>
      </Container>
    </>
  )
}
