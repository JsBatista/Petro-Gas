import { 
  Box, 
  Button,
  Container, 
  Flex,
  FormControl, 
  FormLabel, 
  Input, 
  Select,
  SkeletonText, 
  Table, 
  TableContainer, 
  Tbody, 
  Td, 
  Th,
  Thead,
  Text, 
  Tr 
} from "@chakra-ui/react"

import {
  Select as MultiSelect,
} from "chakra-react-select";
import { type SubmitHandler, useForm } from "react-hook-form"
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, Rectangle, Tooltip, ResponsiveContainer } from "recharts"
import { SensorDataService, TDataSensorDataDashboardFetch, TDataSensorDataFetchMode } from "../../client";

export const Route = createFileRoute("/_layout/dashboard")({
  component: Dashboard,
})

function Dashboard() {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
  } = useForm<TDataSensorDataDashboardFetch>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      fetch_mode: TDataSensorDataFetchMode.LAST_24H,
      begin_custom_date: null,
      end_custom_date: null,
      page: 0,
      limit: 5,
      equipment_ids: []
    },
  })

  const {
    data: sensorsData,
    isPending: isPendingSensors,
    isPlaceholderData,
  } = useQuery({
    ...getSensorDataQueryOptions({
      skip: (getValues("page")??0)*5,
      limit: 5,
      fetch_mode: getValues("fetch_mode"),
      begin_custom_date: getValues("begin_custom_date"),
      end_custom_date: getValues("end_custom_date"),
      equipment_ids: getValues("equipment_ids")
    }),
    placeholderData: (prevData) => prevData,
  })

  const {
    data: equipmentOptions,
    isPending: isPendingEquipmentOptions,
  } = useQuery({
    ...getEquipmentOptionsQueryOptions(),
    placeholderData: (prevData) => prevData,
  })

  function getSensorDataQueryOptions(data: TDataSensorDataDashboardFetch) {
    return {
      queryFn: () =>
        SensorDataService.readSensorDataDashboardBarChart(data),
      queryKey: ["sensor-bar-chart"],
    }
  }

  function getEquipmentOptionsQueryOptions() {
    return {
      queryFn: () =>
        SensorDataService.readEquipmentOptions(),
      queryKey: ["equipment_options"],
    }
  }

  useEffect(() => {
    watch((value) => {
      let data = {
        page: value['page']??0,
        skip: (value['page']??0)*5,
        limit: Math.max((value['equipment_ids'] || []).length, 5),
        fetch_mode: +(value['fetch_mode'] || TDataSensorDataFetchMode.LAST_24H),
        begin_custom_date: value['begin_custom_date'],
        end_custom_date: value['end_custom_date'],
        equipment_ids: value['equipment_ids'] || []
      }

      queryClient.prefetchQuery(getSensorDataQueryOptions(data))
    })
  }, [queryClient, watch]);

  const onSubmit: SubmitHandler<TDataSensorDataDashboardFetch> = async (data) => {
    return
  }

  const fetchMode = watch('fetch_mode');
  const page = watch('page');
  const equipment_ids = watch('equipment_ids');

  const hasNextPage = !isPlaceholderData && 
    sensorsData?.data.length === Math.max((equipment_ids??[]).length, 5)
  const hasPreviousPage = (page??0) > 0

  const isLoading = isPendingSensors && isPendingEquipmentOptions

  return (
    <>
      <TableContainer width="100%">
        <Table size={{ base: "sm", md: "md" }} width="100%">
        <Box pt={12} m={4}>
          <Text fontSize="2xl">
            Dashboard
          </Text>
          { isLoading &&
            <Tbody>
              <Tr>
                {new Array(4).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          }
          {
            !isLoading && 
            <>
              <Container
                maxWidth="100%"
                as="form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Container
                  maxWidth={1600}
                  pt={12} 
                  display="flex"
                  flexDirection="row"
                  gap={4}
                >
                  <FormControl id="fetch_mode">
                    <FormLabel>Period</FormLabel>
                    <Select 
                      id="fetch_mode"
                      {...register("fetch_mode", {
                        required: "Fetch period is required"
                      })}
                      >
                      <option value={TDataSensorDataFetchMode.LAST_24H}>Last 24h</option>
                      <option value={TDataSensorDataFetchMode.LAST_48H}>Last 48h</option>
                      <option value={TDataSensorDataFetchMode.LAST_WEEK}>Last week</option>
                      <option value={TDataSensorDataFetchMode.LAST_MONTH}>Last month</option>
                      <option value={TDataSensorDataFetchMode.CUSTOM}>Custom</option>
                      <option value={TDataSensorDataFetchMode.ALL_TIME}>All time</option>
                    </Select>
                  </FormControl>
                  <FormControl id="equipment_ids">
                    <FormLabel>
                      Equipments
                    </FormLabel>
                    <MultiSelect
                      isMulti
                      name="colors"
                      options={equipmentOptions?.data}
                      placeholder="Select one or more equipments..."
                      variant="outline"
                      onChange={(e: any) => {
                        setValue("equipment_ids", e.map((x: any) => x.value))
                      }}
                    />
                  </FormControl>
                </Container>
                {fetchMode == TDataSensorDataFetchMode.CUSTOM &&
                  <Container
                    maxWidth={1600}
                    pt={4} 
                    display="flex"
                    flexDirection="row"
                    gap={4}
                  >
                    <FormControl id="begin_custom_date">
                      <FormLabel>
                        Start
                      </FormLabel>
                      <Input 
                        placeholder='Start' 
                        size='md' 
                        type='datetime-local'
                        {...register("begin_custom_date", {
                          required: "Timerange start is required"
                        })} />
                    </FormControl>
                    <FormControl id="end_custom_date">
                      <FormLabel>
                        End
                      </FormLabel>
                      <Input 
                        placeholder='End' 
                        size='md' 
                        type='datetime-local' 
                        {...register("end_custom_date")}/>
                    </FormControl>
                  </Container>}
              </Container>
              {
                (sensorsData?.count??0) > 0 &&
                <Container
                  maxWidth={1600}
                  height={400}
                  mt={4}
                  display="flex"
                  flexDirection="row"
                  gap={4}
                >
                  <ResponsiveContainer width="50%" heigth={800}>
                    <BarChart
                        width={1600}
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
                  </ResponsiveContainer>
                  <Container>
                  <TableContainer>
                    <Table size={{ base: "sm", md: "md" }}>
                      <Thead>
                        <Tr>
                          <Th>Equipment ID</Th>
                          <Th>Average</Th>
                        </Tr>
                      </Thead>
                      {isPendingSensors ? (
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
                            <Tr key={sensorData.equipment_id} opacity={isPlaceholderData ? 0.5 : 1}>
                              <Td isTruncated maxWidth="150px">
                                {sensorData.equipment_id}
                              </Td>
                              <Td isTruncated maxWidth="150px">
                                {sensorData.avg}
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
                    <Button onClick={() => setValue("page", (page??0) - 1)} isDisabled={!hasPreviousPage}>
                      Previous
                    </Button>
                    <span>Page {(page??0)+1}</span>
                    <Button isDisabled={!hasNextPage} onClick={() => setValue("page", (page??0) + 1)}>
                      Next
                    </Button>
                  </Flex>
                  </Container>
                </Container>
              }
              {
                sensorsData?.count == 0 &&
                <Container
                  maxWidth="100%"
                  as="form"
                  mt={10}
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Text align="center" fontSize="2xl">
                    There were no entries for the data period selected.
                  </Text>
                </Container>
              }
            </>
          }
        </Box>
        </Table>
      </TableContainer>
    </>
  )
}
