import { 
  Box, 
  Container, 
  FormControl, 
  FormLabel, 
  Input, 
  Select,
  SkeletonText, 
  Table, 
  TableContainer, 
  Tbody, 
  Td, 
  Text, 
  Tr 
} from "@chakra-ui/react"
import {
  Select as MultiSelect,
} from "chakra-react-select";
import { type SubmitHandler, useForm } from "react-hook-form"
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
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
      equipment_ids: []
    },
  })

  const {
    data: sensorsData,
    isPending: isPendingSensors,
  } = useQuery({
    ...getSensorDataQueryOptions({
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
        fetch_mode:  +(value['fetch_mode'] || TDataSensorDataFetchMode.LAST_24H),
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

  return (
    <>
      <TableContainer width="100%">
        <Table size={{ base: "sm", md: "md" }} width="100%">
        <Box pt={12} m={4}>
          <Text fontSize="2xl">
            Dashboard
          </Text>
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
          ) :(
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
              <Container
                maxWidth={1600}
                height={400}
                mt={4}
              >
                <ResponsiveContainer width="100%" heigth={800}>
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
              </Container>
            </>
          )}
        </Box>
        </Table>
      </TableContainer>
    </>
  )
}
