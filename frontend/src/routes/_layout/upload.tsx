import { 
  Box, 
  Button, 
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { ApiError, SensorDataService, TDataSensorDataDashboardFetch, TDataSensorDataFetchMode } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils"

export const Route = createFileRoute("/_layout/upload")({
  component: Upload,
})


function Upload() {
  const [file, setFile] = useState()
  const inputFile = useRef<any>(null);
  const showToast = useCustomToast()

  const mutation = useMutation({
    mutationFn: (data: any) =>
      SensorDataService.importSensorDataCsv({ data: data }),
    onSuccess: (response) => {
      if(response.count_fail == 0)
        showToast(
          "Success!", 
          `All rows (${response.count_success}) imported successfully!`, 
          "success"
        )
      else if(response.count_success == 0)
        showToast(
          "Fail", 
          `All rows (${response.count_fail}) failed to be imported. Please verify your csv file.`, 
          "error"
        )
      else
        showToast(
          "Warning", 
          `Upload finished. ${response.count_success} rows imported, but ${response.count_fail} was not possible.`, 
          "warning"
        )
      setFile(undefined)
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      if (inputFile.current) {
        inputFile.current.value = "";
        inputFile.current.type = "text";
        inputFile.current.type = "file";
      }
    }
  })

  const onSubmit = async () => {
    if(!file)
      showToast(
        "Warning", 
        `Please upload a csv file...`, 
        "warning"
      )
    else
      mutation.mutate(file)
  }


  return (
    <>
      <TableContainer width="100%">
        <Table size={{ base: "sm", md: "md" }} width="100%">
        <Box pt={12} m={4}>
          <Text fontSize="2xl">
            Import data from csv
          </Text>
          <Text>You can add missing data from sensors by uploading a csv file.</Text>
          <>
            <Container
              maxWidth="100%"
              as="form"
            >
              <Container
                maxWidth={1600}
                pt={12} 
                display="flex"
                flexDirection="row"
                gap={4}
              >
                <FormControl id="fetch_mode">
                  <FormLabel>File</FormLabel>
                  <Input 
                    placeholder='Select a csv file' 
                    size='md' 
                    type='file'
                    onChange={(e:any) => setFile(e.target.files[0])}
                    ref={inputFile}
                  />
                </FormControl>
                <Button 
                  mt="32px"
                  variant="primary" 
                  onClick={()=> onSubmit()} 
                  isDisabled={mutation.isPending} >
                  {mutation.isPending ? "Uploading..." : "Upload data"}
                </Button>
              </Container>
            </Container>
          </>
          
        </Box>
        </Table>
      </TableContainer>
    </>
  )
}
